import { Portfolio, Profile, Entry } from './data';
const appId = process.env.EXPO_PUBLIC_BACK4APP_APP_ID;
const masterKey = process.env.EXPO_PUBLIC_BACK4APP_MASTER_KEY;
const key = process.env.EXPO_PUBLIC_BACK4APP_REST_API_KEY;
const server = process.env.EXPO_PUBLIC_BACK4APP_SERVER_URL || 'https://parseapi.back4app.com';
export const configured = Boolean(appId && (masterKey || key));
type Row = Record<string, unknown>;
async function query(name: string, where: Row = {}, limit = 100, skip = 0): Promise<Row[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  const params = `where=${encodeURIComponent(JSON.stringify(where))}&order=createdAt,objectId&limit=${limit}&skip=${skip}`;
  try {
    const response = await fetch(`${server.replace(/\/$/, '')}/classes/${name}?${params}`, {
      headers: { 'X-Parse-Application-Id': appId!, ...(masterKey ? { 'X-Parse-Master-Key': masterKey } : { 'X-Parse-REST-API-Key': key! }) }, signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Back4App respondeu ${response.status} ao ler ${name}. Confira o Application ID e a chave configurada para este aplicativo.`);
    const data = await response.json();
    if (!Array.isArray(data.results) || data.results.some((r: unknown) => !r || typeof r !== 'object' || Array.isArray(r))) throw new Error(`Resposta inválida do Back4App para ${name}.`);
    return data.results;
  } finally { clearTimeout(timer); }
}
async function related(name: string, id: string): Promise<Row[]> {
  const rows: Row[] = [];
  const where = { pessoa: { __type: 'Pointer', className: 'Person', objectId: id } };
  for (let skip = 0; skip < 10000; skip += 100) {
    const page = await query(name, where, 100, skip); rows.push(...page);
    if (page.length < 100) return rows;
  }
  throw new Error(`A classe ${name} ultrapassou o limite de 10.000 registros por currículo.`);
}
function text(value: unknown): string { return typeof value === 'string' ? value : ''; }
function required(row: Row, field: string): string {
  const value = text(row[field]);
  if (!value.trim()) throw new Error(`Registro incompleto no Back4App: campo ${field} ausente.`);
  return value;
}
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && Boolean(v.trim())) : []; }
function date(value: unknown): string {
  const raw = typeof value === 'object' && value !== null && 'iso' in value ? text(value.iso) : text(value);
  const match = raw.match(/^(\d{4})-(\d{2})/);
  return match ? `${match[2]}/${match[1]}` : raw;
}
function period(row: Row): string { const start = date(row.inicio); const end = date(row.fim); return start ? `${start} — ${end || 'Atual'}` : end; }
function recent(rows: Row[]): Row[] { return [...rows].sort((a,b) => text(b.inicio).localeCompare(text(a.inicio))); }
function education(rows: Row[]): Entry[] {
  return recent(rows).map(r => ({ objectId: required(r,'objectId'), title: required(r,'curso'), organization: required(r,'instituicao'), period: period(r), description: text(r.descricao), technologies: text(r.nivel) ? [text(r.nivel)] : [] }));
}
function experience(rows: Row[]): Entry[] {
  return recent(rows).map(r => ({ objectId: required(r,'objectId'), title: required(r,'cargo'), organization: required(r,'empresa'), period: period(r), description: text(r.descricao), technologies: [] }));
}
function projects(rows: Row[]): Entry[] {
  return rows.map(r => ({ objectId: required(r,'objectId'), title: required(r,'nome'), description: required(r,'descricao'), technologies: strings(r.tecnologias), url: text(r.url) || undefined }));
}
export async function fetchPortfolio(): Promise<Portfolio> {
  const people = await query('Person', {}, 1);
  if (!people.length) throw new Error('Nenhuma pessoa encontrada na tabela Person. Confira se o Application ID e a chave pertencem ao banco onde o currículo foi cadastrado.');
  const person = people[0]; const id = required(person,'objectId');
  const [academic, professional, work] = await Promise.all(['Education','Experience','Project'].map(name => related(name,id)));
  const projectEntries = projects(work); const jobEntries = experience(professional);
  const profile: Profile = {
    name: required(person,'nome'), role: jobEntries[0]?.title || 'Meu portfólio', bio: text(person.resumo),
    location: text(person.cidade), email: text(person.email) || undefined, github: text(person.github) || undefined,
    linkedin: text(person.linkedin) || undefined, phone: text(person.telefone) || undefined,
    skills: [...new Set(projectEntries.flatMap(project => project.technologies))],
  };
  return { profile, education: education(academic), experience: jobEntries, projects: projectEntries };
}
