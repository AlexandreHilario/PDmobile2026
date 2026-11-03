// Somente GET: valida as credenciais locais e o mesmo adaptador utilizado pelo app.
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
if (fs.existsSync('.env')) process.loadEnvFile('.env');
const context = { exports: {}, process, fetch, AbortController, setTimeout, clearTimeout };
const code = ts.transpileModule(fs.readFileSync('src/api.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
vm.runInNewContext(code, context);
(async () => {
  if (!context.exports.configured) throw new Error('Preencha Application ID e Master Key (ou REST API Key) no .env.');
  const result = await context.exports.fetchPortfolio();
  console.log(JSON.stringify({
    success: true,
    hasName: Boolean(result.profile.name),
    hasBio: Boolean(result.profile.bio),
    education: result.education.length,
    experience: result.experience.length,
    projects: result.projects.length,
  }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ success: false, message: error.message }, null, 2));
  process.exitCode = 1;
});
