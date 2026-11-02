export type Entry = { objectId: string; title: string; organization?: string; period?: string; description: string; technologies: string[]; url?: string };
export type Profile = { name: string; role: string; bio: string; location: string; email?: string; github?: string; skills: string[] };
export type Portfolio = { profile: Profile; education: Entry[]; experience: Entry[]; projects: Entry[] };
export const demo: Portfolio = {
  profile: { name: 'Alexandre Vitor', role: 'Desenvolvedor Full Stack', bio: 'Transformando ideias em experiências digitais. Interesse em aplicações web, mobile e APIs bem construídas.', location: 'Brasil', skills: ['React Native', 'TypeScript', 'Java', 'React', 'APIs REST'] },
  education: [{ objectId: 'demo-education', title: 'Sistemas para Internet', organization: 'Universidade Católica de Pernambuco', period: '2025 — 2027', description: 'Exemplo de formação. Revise e cadastre seus dados reais no Back4App.', technologies: ['Desenvolvimento web', 'Mobile', 'Banco de dados'] }],
  experience: [{ objectId: 'demo-experience', title: 'Desenvolvimento de aplicações', organization: 'Projetos acadêmicos • exemplo', period: 'Em desenvolvimento', description: 'Descreva aqui sua atuação, responsabilidades e resultados. Substitua pelos seus dados reais no back-end.', technologies: ['React', 'Java', 'Git'] }],
  projects: [
    { objectId: 'demo-portfolio', title: 'Portfolio Mobile', description: 'Currículo interativo com navegação nativa, integração Back4App e projetos favoritos persistentes.', technologies: ['Expo', 'React Native', 'Back4App'] },
    { objectId: 'demo-dice', title: 'Jogo de dados', description: 'Exemplo de projeto acadêmico de programação para dispositivos móveis. Edite os detalhes no Back4App.', technologies: ['React Native', 'JavaScript'] },
    { objectId: 'demo-api', title: 'API de serviços', description: 'Exemplo de integração entre interfaces e serviços. Cadastre seu repositório para habilitar o link.', technologies: ['Java', 'REST'] }
  ]
};
