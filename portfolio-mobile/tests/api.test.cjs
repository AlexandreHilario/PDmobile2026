const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('src/api.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const env={EXPO_PUBLIC_BACK4APP_APP_ID:'app-test',EXPO_PUBLIC_BACK4APP_REST_API_KEY:'rest-test'};
function load(fetch,vars=env){const context={exports:{},process:{env:vars},fetch,AbortController,setTimeout,clearTimeout};vm.runInNewContext(code,context);return context.exports;}
const rows={
 Person:[{objectId:'person-1',nome:'Alexandre',email:'dev@example.com',cidade:'Recife',resumo:'Apresentação',github:'https://github.com/exemplo',linkedin:'https://linkedin.com/in/exemplo',telefone:'123'}],
 Education:[{objectId:'edu-1',curso:'Sistemas para Internet',instituicao:'UNICAP',nivel:'Graduação',inicio:'2025-02-01',fim:'2027-12-01',descricao:'Formação'}],
 Experience:[{objectId:'exp-1',empresa:'Empresa',cargo:'Desenvolvedor',inicio:'2026-01-01',descricao:'Atuação'}],
 Project:[{objectId:'proj-1',nome:'App',descricao:'Projeto mobile',tecnologias:['React','Expo',null],url:'https://github.com/exemplo/app'}]
};
function response(data){return {ok:true,json:async()=>({results:data})};}
function mock(data=rows,requests=[]){return async(url,options)=>{requests.push({url,options});return response(data[new URL(url).pathname.split('/').pop()]||[]);};}
test('sem credenciais, conexão fica desabilitada',()=>assert.equal(load(()=>{},{}).configured,false));
test('lê tabelas da curriculum-api diretamente do Back4App e mapeia campos em português',async()=>{
 const requests=[];const data=await load(mock(rows,requests)).fetchPortfolio();
 assert.equal(requests.length,4);assert.equal(data.profile.name,'Alexandre');assert.equal(data.profile.role,'Desenvolvedor');assert.equal(data.profile.linkedin,rows.Person[0].linkedin);assert.equal(data.profile.phone,'123');
 assert.equal(data.education[0].title,'Sistemas para Internet');assert.equal(data.education[0].organization,'UNICAP');assert.equal(data.education[0].period,'02/2025 — 12/2027');assert.equal(data.experience[0].period,'01/2026 — Atual');assert.equal(data.projects[0].title,'App');assert.equal(JSON.stringify(data.profile.skills),'["React","Expo"]');
 for(const req of requests){assert.equal(req.options.headers['X-Parse-REST-API-Key'],'rest-test');assert.equal(req.options.headers['X-Parse-Application-Id'],'app-test');assert.ok(req.options.signal);assert.match(req.url,/parseapi.back4app.com\/classes\//);}
 for(const req of requests.slice(1)){assert.deepEqual(JSON.parse(new URL(req.url).searchParams.get('where')),{pessoa:{__type:'Pointer',className:'Person',objectId:'person-1'}});}
});
test('seleciona automaticamente a primeira pessoa sem exigir ID',async()=>{
 const api=load(mock({...rows,Person:[...rows.Person,{objectId:'person-2',nome:'Outra pessoa'}]}));
 const data=await api.fetchPortfolio();assert.equal(data.profile.name,'Alexandre');
});
test('Person ID antigo é ignorado e a consulta pede somente a primeira pessoa',async()=>{
 const requests=[];await load(mock(rows,requests),{...env,EXPO_PUBLIC_BACK4APP_PERSON_ID:'person-1'}).fetchPortfolio();
 assert.deepEqual(JSON.parse(new URL(requests[0].url).searchParams.get('where')),{});assert.equal(new URL(requests[0].url).searchParams.get('limit'),'1');
});
test('banco sem pessoa retorna erro explícito',async()=>{
 await assert.rejects(load(mock({...rows,Person:[]})).fetchPortfolio(),/Nenhuma pessoa encontrada/);
});
test('permissão de leitura negada produz erro explícito',async()=>{
 await assert.rejects(load(async()=>({ok:false,status:403})).fetchPortfolio(),/403/);
});
test('paginação carrega projetos além da primeira página',async()=>{
 const requests=[];const api=load(async(url,options)=>{
  const u=new URL(url);if(u.pathname.endsWith('/Project')){requests.push(u);const skip=Number(u.searchParams.get('skip'));return response(skip===0?Array.from({length:100},(_,i)=>({...rows.Project[0],objectId:`project-${i}`})):[{...rows.Project[0],objectId:'project-100'}]);}
  return mock()(url,options);
 });
 const data=await api.fetchPortfolio();assert.equal(data.projects.length,101);assert.equal(requests[1].searchParams.get('skip'),'100');
});
test('resposta inválida é rejeitada',async()=>{
 await assert.rejects(load(async()=>response(null)).fetchPortfolio(),/Resposta inválida/);
});
test('seções vazias funcionam sem inventar dados pessoais',async()=>{
 const data=await load(mock({Person:rows.Person})).fetchPortfolio();assert.equal(data.profile.role,'Meu portfólio');assert.equal(data.projects.length,0);assert.equal(data.profile.skills.length,0);
});

test('Master Key tem prioridade e é enviada apenas no header correto',async()=>{
 const requests=[];const api=load(mock(rows,requests),{...env,EXPO_PUBLIC_BACK4APP_MASTER_KEY:'master-test'});await api.fetchPortfolio();
 for(const request of requests){assert.equal(request.options.headers['X-Parse-Master-Key'],'master-test');assert.equal(request.options.headers['X-Parse-REST-API-Key'],undefined);assert.ok(!request.url.includes('master-test'));}
});
test('conexão com Master Key não exige REST API Key',()=>{assert.equal(load(()=>{},{EXPO_PUBLIC_BACK4APP_APP_ID:'app-test',EXPO_PUBLIC_BACK4APP_MASTER_KEY:'master-test'}).configured,true);});
