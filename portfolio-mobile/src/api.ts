import { Portfolio, Profile, Entry } from './data';
const appId = process.env.EXPO_PUBLIC_BACK4APP_APP_ID;
const key = process.env.EXPO_PUBLIC_BACK4APP_REST_API_KEY;
const server = process.env.EXPO_PUBLIC_BACK4APP_SERVER_URL || 'https://parseapi.back4app.com';
export const configured = Boolean(appId && key);
async function query(name: string): Promise<Record<string, unknown>[]> {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${server.replace(/\/$/, '')}/classes/${name}?order=order&limit=1000`, { headers: { 'X-Parse-Application-Id': appId!, 'X-Parse-REST-API-Key': key! }, signal: controller.signal });
    if (!res.ok) throw new Error(`Back4App respondeu ${res.status}. Confira credenciais, classes e permissões de leitura.`);
    const data = await res.json(); if (!Array.isArray(data.results)) throw new Error('Resposta inválida do back-end.'); return data.results;
  } finally { clearTimeout(timer); }
}
function strings(v: unknown): string[] { return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []; }
function entries(rows: Record<string, unknown>[]): Entry[] {
  return rows.map(r => {
    if (typeof r.objectId !== 'string' || typeof r.title !== 'string' || typeof r.description !== 'string') throw new Error('Dados incompletos: verifique title e description.');
    return { objectId: r.objectId, title: r.title, description: r.description, technologies: strings(r.technologies), organization: typeof r.organization === 'string' ? r.organization : undefined, period: typeof r.period === 'string' ? r.period : undefined, url: typeof r.url === 'string' ? r.url : undefined };
  });
}
export async function fetchPortfolio(): Promise<Portfolio> {
  const [profiles, education, experience, projects] = await Promise.all(['Profile','Education','Experience','Project'].map(query));
  const p = profiles[0]; if (!p || typeof p.name !== 'string' || typeof p.role !== 'string' || typeof p.bio !== 'string') throw new Error('Cadastre um perfil com name, role e bio na classe Profile.');
  const profile: Profile = { name: p.name, role: p.role, bio: p.bio, location: typeof p.location === 'string' ? p.location : '', skills: strings(p.skills), email: typeof p.email === 'string' ? p.email : undefined, github: typeof p.github === 'string' ? p.github : undefined };
  return { profile, education: entries(education), experience: entries(experience), projects: entries(projects) };
}
