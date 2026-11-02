const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/api.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function load(fetch, env = { EXPO_PUBLIC_BACK4APP_APP_ID:'app-test', EXPO_PUBLIC_BACK4APP_REST_API_KEY:'rest-test' }) {
  const context = { exports:{}, process:{env}, fetch, AbortController, setTimeout, clearTimeout };
  vm.runInNewContext(code,context); return context.exports;
}
test('sem credenciais, modo remoto fica desabilitado', () => {
  assert.equal(load(() => {},{}).configured,false);
});
test('busca as quatro classes, envia headers e normaliza dados remotos', async () => {
  const requests=[];
  const api=load(async (url, options) => {
    requests.push({url,options});
    const row=url.includes('/Profile?') ? {name:'Pessoa real',role:'Dev',bio:'Bio remota',skills:['React',42]} : {objectId:'remote',title:'Título remoto',description:'Descrição',technologies:['Expo',null]};
    return {ok:true,json:async()=>({results:[row]})};
  });
  const data=await api.fetchPortfolio();
  assert.equal(requests.length,4);
  assert.equal(data.profile.name,'Pessoa real');
  assert.equal(data.projects[0].objectId,'remote');
  assert.equal(JSON.stringify(data.profile.skills),'["React"]');
  assert.equal(JSON.stringify(data.projects[0].technologies),'["Expo"]');
  for(const req of requests) {
    assert.equal(req.options.headers['X-Parse-Application-Id'],'app-test');
    assert.equal(req.options.headers['X-Parse-REST-API-Key'],'rest-test');
    assert.match(req.url,/order=order/);
    assert.ok(req.options.signal);
  }
});
test('credenciais inválidas produzem erro explícito',async()=>{
  const api=load(async()=>({ok:false,status:403}));
  await assert.rejects(api.fetchPortfolio(),/403/);
});
test('perfil ausente não é tratado como conexão bem-sucedida',async()=>{
  const api=load(async()=>({ok:true,json:async()=>({results:[]})}));
  await assert.rejects(api.fetchPortfolio(),/Cadastre um perfil/);
});
test('resposta de formato incorreto é rejeitada',async()=>{
  const api=load(async()=>({ok:true,json:async()=>({results:null})}));
  await assert.rejects(api.fetchPortfolio(),/Resposta inválida/);
});
