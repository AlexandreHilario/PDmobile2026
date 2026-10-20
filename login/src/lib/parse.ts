export type ParseUser = {
  objectId: string;
  username: string;
  email?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthenticatedUser = ParseUser & {
  sessionToken: string;
};

type ParseError = {
  code?: number;
  error?: string;
};

const sessionHeader = 'X-Parse-Session-Token';

function getConfig() {
  const serverUrl = process.env.EXPO_PUBLIC_PARSE_SERVER_URL?.trim();
  const applicationId = process.env.EXPO_PUBLIC_PARSE_APPLICATION_ID?.trim();
  const restApiKey = process.env.EXPO_PUBLIC_PARSE_REST_API_KEY?.trim();

  if (!serverUrl || !applicationId) {
    throw new Error('Configure o servidor e o Application ID do Parse no arquivo .env.');
  }

  return {
    baseUrl: `${serverUrl.replace(/\/+$/, '').replace(/\/1$/, '')}/1`,
    applicationId,
    restApiKey,
  };
}

export function isParseConfigured() {
  return Boolean(
    process.env.EXPO_PUBLIC_PARSE_SERVER_URL?.trim() &&
      process.env.EXPO_PUBLIC_PARSE_APPLICATION_ID?.trim(),
  );
}

function headers(sessionToken?: string) {
  const config = getConfig();
  return {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': config.applicationId,
    ...(config.restApiKey ? { 'X-Parse-REST-API-Key': config.restApiKey } : {}),
    ...(sessionToken ? { [sessionHeader]: sessionToken } : {}),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json()) as T | ParseError;

  if (!response.ok) {
    const error = result as ParseError;
    if (error.code === 101) {
      throw new Error('Usuário ou senha inválidos. Confira seus dados e tente novamente.');
    }
    if (error.code === 202) {
      throw new Error('Esse nome de usuário já está em uso.');
    }
    if (error.code === 203) {
      throw new Error('Esse e-mail já está cadastrado.');
    }
    throw new Error(error.error || 'Não foi possível concluir a solicitação. Tente novamente.');
  }

  return result as T;
}

export async function signUp(input: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<AuthenticatedUser> {
  const { baseUrl } = getConfig();
  const response = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  });
  return parseResponse<AuthenticatedUser>(response);
}

export async function logIn(username: string, password: string): Promise<AuthenticatedUser> {
  const { baseUrl } = getConfig();
  const query = new URLSearchParams({ username, password });
  const response = await fetch(`${baseUrl}/login?${query.toString()}`, {
    headers: headers(),
  });
  return parseResponse<AuthenticatedUser>(response);
}

export async function getCurrentUser(sessionToken: string): Promise<ParseUser> {
  const { baseUrl } = getConfig();
  const response = await fetch(`${baseUrl}/users/me`, {
    headers: headers(sessionToken),
  });
  return parseResponse<ParseUser>(response);
}

export async function logOut(sessionToken: string): Promise<void> {
  const { baseUrl } = getConfig();
  const response = await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers: headers(sessionToken),
  });
  await parseResponse<{ ok: boolean }>(response);
}