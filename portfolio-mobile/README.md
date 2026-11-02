# Portfolio Mobile • Alexandre Vitor

Aplicativo React Native + Expo com Expo Router e TypeScript. Cinco telas: Home, Experiência Acadêmica (Formação), Experiência Profissional (Carreira), Projetos e Sobre. Interface escura com verde, áreas seguras e atualização ao puxar a tela.

**Extras:** favoritos persistentes no dispositivo, filtro de favoritos, busca por projeto/tecnologia e compartilhamento nativo do currículo. A tela Sobre explica os módulos utilizados.

## Executar

Na pasta deste projeto:

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Abra o QR no Expo Go compatível com o SDK 57. Computador e celular precisam estar na mesma rede. Alternativa: `npx expo start --tunnel`. Android com emulador aberto: `npm run android`.

Sem credenciais, o app exibe **Demonstração** com dados de exemplo. A formação de exemplo usa o portfólio web existente como referência; revise todos os dados antes da entrega. Com as duas credenciais preenchidas, o app consulta exclusivamente as quatro classes abaixo; falhas aparecem com botão para tentar novamente, preservando a última carga da sessão ou os exemplos. Apenas favoritos persistem entre sessões.

## Back4App

1. Crie um app no Back4App e abra Database. Crie as classes `Profile`, `Education`, `Experience` e `Project` (nomes exatos, respeitando maiúsculas).
2. Cadastre os campos conforme a tabela. `objectId` é gerado pelo Parse. `order` é Number e ordena os registros (1, 2, 3...). Arrays devem conter strings.
3. Em **Class Level Permissions**, permita `Find` e `Get` públicos nessas classes de currículo. Mantenha `Create`, `Update`, `Delete` e `Add Field` restritos. ACL de cada registro deve permitir leitura pública. Edite pelo dashboard.
4. Em App Settings → Security & Keys, copie **Application ID** e **REST API Key** para `.env`. Nunca use a Master Key no aplicativo.

| Classe | Campos String | Campos Array | Campo Number |
| --- | --- | --- | --- |
| Profile | name, role, bio, location, email (opcional), github (opcional) | skills | order |
| Education | title, organization, period, description | technologies | order |
| Experience | title, organization, period, description | technologies | order |
| Project | title, description, url (opcional, https) | technologies | order |

Cadastre um perfil. As experiências e os projetos podem ter vários registros. `backend/seed.json` contém exemplos agrupados por classe para cadastro; não importe o arquivo inteiro como uma única classe. Preencha seus dados reais, e-mail e URL do GitHub. Listas vazias têm mensagens próprias. A consulta lê até 1.000 registros por classe.

```dotenv
EXPO_PUBLIC_BACK4APP_APP_ID=seu_application_id
EXPO_PUBLIC_BACK4APP_REST_API_KEY=sua_rest_api_key
EXPO_PUBLIC_BACK4APP_SERVER_URL=https://parseapi.back4app.com
EXPO_OWNER=slug-da-organizacao-do-professor
EXPO_PUBLIC_EAS_PROJECT_ID=uuid-do-projeto-expo
```

As variáveis `EXPO_PUBLIC_*` são incorporadas ao app e são visíveis no cliente. A proteção das escritas deve estar nas permissões do Back4App. `.env` está no `.gitignore`. Reinicie com `npx expo start --clear` após alterar as variáveis.

## Verificação

```powershell
npm run typecheck
npm test
npm run check
npx expo export --platform android
```

No celular: navegue pelas cinco abas; pesquise `React`; marque um projeto; filtre favoritos; feche e reabra para conferir persistência; desmarque; teste um termo inexistente; teste compartilhar; configure Back4App, confirme o indicador `Back4App` e altere um registro no dashboard antes de puxar para atualizar. Teste credenciais inválidas para conferir o erro e a recuperação.

Verificado na criação: TypeScript, cinco testes de integração com respostas HTTP simuladas, compatibilidade das dependências pelo Expo e exportação do bundle Android passaram. Não houve execução em celular/emulador nem conexão real com Back4App por falta de credenciais. `npm audit` identificou 16 alertas na árvore do SDK 57 (5 altos); algumas correções propostas exigem migração para SDK 58. Não foi aplicada atualização forçada que misture versões incompatíveis do Expo.

## Entrega: GitHub, Expo e vídeo

### GitHub

Este projeto está dentro do repositório `PDmobile2026`. Na raiz dele, revise `git status`, adicione somente `portfolio-mobile` e faça commit/push no seu repositório. Entregue o link da pasta no GitHub. Não envie `node_modules`, `.env` ou `dist`.

### Expo / OTA

1. Preencha `EXPO_OWNER` com o **slug da organização** que convidou o professor. Execute `npx eas-cli@latest login` e `npx eas-cli@latest init` nesta pasta, selecionando/criando o projeto nessa organização.
2. Copie o project ID retornado para `EXPO_PUBLIC_EAS_PROJECT_ID`. A configuração base está em `app.json` (owner `anacsilvabrs-team`); `app.config.js` complementa os valores usando o `.env`. Use o ID próprio do portfólio, nunca o do jogo de dados.
3. Execute `npx expo install expo-updates` e `npx eas-cli@latest update:configure`. Confira owner, projectId, updates.url e a política `sdkVersion` já preparada no config.
4. No dashboard EAS, cadastre as variáveis `EXPO_PUBLIC_BACK4APP_*` no ambiente **preview**, além de `EXPO_PUBLIC_EAS_PROJECT_ID` e `EXPO_OWNER` com os mesmos valores locais. As variáveis usadas no bundle devem existir no ambiente de publicação.
5. Publique: `npx eas-cli@latest update --branch preview --message "Entrega portfolio mobile" --environment preview`.
6. Abra a atualização no dashboard Expo e use Preview para obter o link/QR. **Abra esse QR no Expo Go do celular e confirme o funcionamento antes de enviar.** O QR do `npm start` depende do computador ligado e não substitui o link publicado da entrega. Verifique a compatibilidade da versão do Expo Go com SDK 57 em https://expo.dev/go.

O projeto ainda precisa de credenciais, vínculo com a organização e publicação para ter um link real de entrega. Um APK interno pode ser criado com `npx eas-cli@latest build --profile preview --platform android`, mas não substitui o QR do Expo Go pedido na atividade.

Referências: [Expo Router](https://docs.expo.dev/router/installation/), [Back4App APIs](https://www.back4app.com/features/apis), [EAS Update](https://docs.expo.dev/eas-update/getting-started/), [compatibilidade Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

### Vídeo no YouTube (até 1 minuto)

- 0–10 s: Home no celular/emulador e apresentação.
- 10–25 s: Formação, Carreira e Sobre.
- 25–45 s: Projetos, busca, marcar favorito e filtrar.
- 45–55 s: fechar/reabrir e mostrar favorito persistido.
- 55–60 s: indicador Back4App e encerramento.

Grave o celular ou emulador, nunca web. Publique no YouTube como público ou não listado. Envie na atividade três links: código no GitHub, atualização Expo com QR validado e vídeo do YouTube. Não anexe o vídeo diretamente.
