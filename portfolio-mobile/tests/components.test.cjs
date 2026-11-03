const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const ts=require('typescript');const React=require('react');const {create,act}=require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const originalError=console.error;console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))originalError(...args);};
function harness({stored='[]',storageFailure=false,configured=false}={}){
 const values=new Map([['portfolio:favorites',stored]]); const calls={share:[],links:[],alerts:[],routes:[],fetch:0};const cache=new Map();let state;let fetcher;
 const native={StyleSheet:{create:x=>x},Alert:{alert:(...args)=>calls.alerts.push(args)},Linking:{openURL:async url=>calls.links.push(url)},Share:{share:async message=>{calls.share.push(message);}}};
 for(const name of ['View','Text','Pressable','TextInput','ScrollView','RefreshControl','ActivityIndicator'])native[name]=name;
 const storage={getItem:async key=>{if(storageFailure)throw Error('storage');return values.get(key)||null;},setItem:async(key,value)=>{values.set(key,value);}};
 const router={push:href=>calls.routes.push(href),replace:href=>calls.routes.push(href)};
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
  const module={exports:{}};cache.set(file,module);
  const requireMock=id=>{
   if(id==='react-native')return native;
   if(id==='react-native-safe-area-context')return {SafeAreaView:'SafeAreaView'};
   if(id==='@react-native-async-storage/async-storage')return storage;
   if(id==='expo-router')return {useRouter:()=>router};
   if(id.startsWith('.')){let target=path.resolve(path.dirname(file),id);if(target.endsWith('/api')||target.endsWith('\\api'))return {configured,fetchPortfolio:async()=>{calls.fetch++;return fetcher();}};target=['.tsx','.ts'].map(ext=>target+ext).find(fs.existsSync);return load(target);}
   return require(id);
  };
  const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(js,{require:requireMock,module,exports:module.exports,console,process,setTimeout,clearTimeout,URL,Error});return module.exports;
 }
 const store=load('src/store.tsx');const data=load('src/data.ts').demo;fetcher=async()=>data;
 function Probe(){state=store.usePortfolio();return null;}
 return {load,calls,values,data,setFetcher:fn=>fetcher=fn,get state(){return state;},async mount(Component){let tree;await act(async()=>{tree=create(React.createElement(store.Provider,null,React.createElement(Probe),Component?React.createElement(Component):null));});return tree;}};
}
const visible=tree=>tree.root.findAll(n=>n.type==='Text').flatMap(n=>n.children.filter(c=>typeof c==='string')).join(' ');
function button(tree,title){return tree.root.findAll(n=>n.type==='Pressable').find(n=>n.findAll(c=>c.type==='Text').some(c=>c.children.filter(x=>typeof x==='string').join('').includes(title)));}
async function dispose(tree){await act(async()=>tree.unmount());}
test('favoritos: hidrata, alterna, salva e restaura ao reabrir',async()=>{
 const h=harness({stored:'["demo-portfolio"]'});let tree=await h.mount();assert.equal(h.state.favorites[0],'demo-portfolio');
 await act(async()=>h.state.toggle('demo-dice'));assert.equal(JSON.parse(h.values.get('portfolio:favorites')).length,2);
 await act(async()=>{h.state.toggle('demo-dice');h.state.toggle('demo-api');h.state.toggle('demo-api');});
 assert.equal(JSON.stringify(h.state.favorites),'["demo-portfolio"]');await dispose(tree);tree=await h.mount();assert.equal(h.state.favorites[0],'demo-portfolio');await dispose(tree);
});
test('falha ao ler favoritos mostra erro e mantém o app utilizável',async()=>{
 const h=harness({storageFailure:true});const tree=await h.mount();assert.match(h.state.error,/ler os favoritos/);await act(async()=>h.state.toggle('demo-dice'));assert.equal(h.state.favorites[0],'demo-dice');await dispose(tree);
});
test('JSON de favoritos corrompido é tratado sem derrubar a tela',async()=>{
 const h=harness({stored:'JSON inválido'});const tree=await h.mount();assert.match(h.state.error,/ler os favoritos/);assert.equal(h.state.favorites.length,0);await dispose(tree);
});
test('atualização com falha preserva o currículo remoto anterior e permite recuperação',async()=>{
 const h=harness({configured:true});const fresh={...h.data,profile:{...h.data.profile,name:'Nome do back-end'}};h.setFetcher(async()=>fresh);const tree=await h.mount();assert.equal(h.state.source,'Back4App');assert.equal(h.state.data.profile.name,'Nome do back-end');
 h.setFetcher(async()=>{throw Error('Sem rede');});await act(async()=>h.state.refresh());assert.equal(h.state.error,'Sem rede');assert.equal(h.state.data.profile.name,'Nome do back-end');assert.equal(h.state.loading,false);
 h.setFetcher(async()=>fresh);await act(async()=>h.state.refresh());assert.equal(h.state.error,'');await dispose(tree);
});
test('Projetos: busca sem acentos, estado vazio, limpar filtro e favoritos',async()=>{
 const h=harness();const tree=await h.mount(h.load('app/projetos.tsx').default);
 const input=()=>tree.root.findByType('TextInput');await act(async()=>input().props.onChangeText('SERVICOS'));assert.match(visible(tree),/API de serviços/);assert.doesNotMatch(visible(tree),/Jogo de dados/);
 await act(async()=>input().props.onChangeText('inexistente'));assert.match(visible(tree),/Nada por aqui ainda/);
 await act(async()=>button(tree,'Ver todos os projetos').props.onPress());assert.match(visible(tree),/Jogo de dados/);
 await act(async()=>tree.root.findAll(n=>n.type==='Pressable'&&n.props.accessibilityLabel==='Adicionar aos favoritos: Portfolio Mobile')[0].props.onPress());
 await act(async()=>button(tree,'Apenas favoritos').props.onPress());assert.match(visible(tree),/Portfolio Mobile/);assert.doesNotMatch(visible(tree),/Jogo de dados/);
 await act(async()=>tree.root.findAll(n=>n.type==='Pressable'&&n.props.accessibilityLabel==='Remover dos favoritos: Portfolio Mobile')[0].props.onPress());assert.match(visible(tree),/Nada por aqui ainda/);await dispose(tree);
});
test('Home: CTA navega e compartilhar recebe nome, cargo e apresentação',async()=>{
 const h=harness();const tree=await h.mount(h.load('app/index.tsx').default);
 await act(async()=>button(tree,'Explorar meus projetos').props.onPress());assert.equal(h.calls.routes[0],'/projetos');
 await act(async()=>button(tree,'Compartilhar currículo').props.onPress());assert.match(h.calls.share[0].message,/Alexandre Vitor/);assert.match(h.calls.share[0].message,/Desenvolvedor Full Stack/);await dispose(tree);
});
test('links: abre https e e-mail; bloqueia protocolos inválidos',async()=>{
 const h=harness();const ui=h.load('src/ui.tsx');await ui.openUrl('https://github.com/exemplo');await ui.openUrl('mailto:dev@example.com');await ui.openUrl('javascript:alert(1)');assert.equal(h.calls.links.length,2);assert.equal(h.calls.alerts.length,1);
});
test('Sobre documenta módulos, Expo Updates e funcionalidade extra',async()=>{
 const h=harness();const tree=await h.mount(h.load('app/sobre.tsx').default);const content=visible(tree);for(const required of ['Expo Router','AsyncStorage','Expo Updates','Back4App','React Native','favoritos'])assert.ok(content.includes(required),required);await dispose(tree);
});
test('telas de formação e carreira renderizam e tratam listas vazias',async()=>{
 const h=harness({configured:true});h.setFetcher(async()=>({...h.data,education:[],experience:[]}));
 for(const file of ['app/academica.tsx','app/profissional.tsx']){const tree=await h.mount(h.load(file).default);assert.match(visible(tree),/Nenhuma experiência cadastrada/);await dispose(tree);}
});
