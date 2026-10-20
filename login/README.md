# Parse User Mobile

Aplicativo Expo para cadastro, login, consulta do usuário autenticado e logout usando a REST API do Parse Server/Back4App.

## Configuração

1. No painel do Back4App, copie o Application ID e, se sua aplicação exigir, a REST API Key.
2. Copie `.env.example` para `.env` e preencha os valores:

```env
EXPO_PUBLIC_PARSE_SERVER_URL=https://parseapi.back4app.com
EXPO_PUBLIC_PARSE_APPLICATION_ID=seu_application_id
EXPO_PUBLIC_PARSE_REST_API_KEY=sua_rest_api_key
```

O valor da REST API Key é opcional quando a configuração do servidor não exigir essa chave. Nunca use a Master Key no aplicativo; valores `EXPO_PUBLIC_` são incluídos no bundle mobile.

## Executar

```bash
npm install
npx expo start
```

Abra o projeto no Expo Go ou em um development build. Ao alterar o `.env`, reinicie o servidor Expo para carregar as novas variáveis.

## Fluxo

- Cadastro: `POST /1/users`, com nome, usuário, e-mail e senha.
- Login: `GET /1/login`, com usuário e senha.
- Perfil: `GET /1/users/me`, autenticado pelo session token armazenado no SecureStore do aparelho.
- Logout: `POST /1/logout` e remoção local do session token.