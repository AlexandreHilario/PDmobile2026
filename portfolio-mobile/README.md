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

Abra o QR no Expo Go compatível com o SDK 58. Computador e celular precisam estar na mesma rede. Alternativa: `npx expo start --tunnel`. Android com emulador aberto: `npm run android`.

Sem credenciais, o app exibe **Demonstração** com dados de exemplo. Com as credenciais preenchidas, consulta diretamente as tabelas do Back4App no mesmo formato do projeto `aos-2026-2/curriculum-api`, sem chamar essa API. Falhas preservam a última carga da sessão ou os exemplos e exibem um botão para tentar novamente. Apenas favoritos persistem entre sessões.

## Back4App: conexão direta com as tabelas existentes

O app usa a API REST do próprio Back4App, sem servidor intermediário. A pasta curriculum-api foi consultada somente como referência de schema e não foi alterada. Não execute o seed daquele projeto para configurar o mobile.

| Classe | Campos utilizados | Relação |
| --- | --- | --- |
| Person | nome, email, telefone, cidade, resumo, linkedin, github | objectId identifica o currículo |
| Education | instituicao, curso, nivel, inicio, fim, descricao | pessoa: Pointer para Person |
| Experience | empresa, cargo, inicio, fim, descricao | pessoa: Pointer para Person |
| Project | nome, descricao, url, tecnologias (Array de strings) | pessoa: Pointer para Person |

As datas inicio/fim no schema da API são textos AAAA-MM-DD; o mobile exibe MM/AAAA e considera fim ausente como Atual. O cargo da experiência mais recente aparece na Home. As habilidades são extraídas das tecnologias dos projetos. Formação usa nivel como etiqueta. Não são esperados campos ingleses como title, description ou skills no banco.

Preencha no .env o Application ID e EXPO_PUBLIC_BACK4APP_MASTER_KEY do mesmo app Back4App. A Master Key tem prioridade sobre a REST API Key. Essa configuração foi solicitada explicitamente para este trabalho: a chave administrativa é incorporada ao bundle e pode ser extraída de um aplicativo distribuído.

```dotenv
EXPO_PUBLIC_BACK4APP_APP_ID=seu_application_id
EXPO_PUBLIC_BACK4APP_MASTER_KEY=sua_master_key
EXPO_PUBLIC_BACK4APP_REST_API_KEY=sua_rest_api_key_opcional
EXPO_PUBLIC_BACK4APP_SERVER_URL=https://parseapi.back4app.com
EXPO_OWNER=anacsilvabrs-team
EXPO_PUBLIC_EAS_PROJECT_ID=uuid_do_portfolio
```

Não é necessário configurar Person ID. O app seleciona automaticamente a primeira Person por createdAt/objectId e usa o ID retornado para filtrar os registros relacionados. Havendo vários currículos, será exibido o primeiro cadastrado. As consultas dos filhos usam paginação de 100 registros, até 10.000 por seção.

**Permissões de leitura:** usando Master Key, o app consegue ler registros privados. Se a chave não estiver preenchida, usa REST API Key, que respeita as permissões de classe e ACL. O cliente faz somente GET; a Master Key, contudo, tem poderes administrativos além dessas leituras. Nenhuma permissão ou registro foi alterado por este projeto.

Os EXPO_PUBLIC_* são incorporados ao bundle. As escritas devem continuar restritas nas permissões do Back4App; este app faz somente GET. O arquivo backend/seed.json é apenas um exemplo do formato correto, não é executado automaticamente. Para relacionar registros manualmente, use um Pointer real para o objectId da Person; não crie um campo pessoaId String no lugar do Pointer pessoa.

Reinicie com `npx expo start --clear` após alterar o .env.

## Verificação

```powershell
npm run typecheck
npm test
npm run test:backend
npm run check
npx expo export --platform android
```

No celular: navegue pelas cinco abas; pesquise `React`; marque um projeto; filtre favoritos; feche e reabra para conferir persistência; desmarque; teste um termo inexistente; teste compartilhar; configure Back4App, confirme o indicador `Back4App` e altere um registro no dashboard antes de puxar para atualizar. Teste credenciais inválidas para conferir o erro e a recuperação.

A migração para SDK 58 atualiza Expo, React Native, React e módulos Expo em conjunto. Use Node.js 22.13+ (linha 22) ou 24.3+ (linha 24). Na revisão completa: TypeScript, 20 testes automatizados, Expo Doctor (20/20) e exportações Android/iOS/web passaram. `test:backend` faz somente leitura real, usa o .env e depende de rede; falha se nenhuma pessoa for encontrada. A instalação reportou 12 alertas moderados na árvore de dependências, sem alertas altos ou críticos. Consulte [o relatório de testes](TEST_REPORT.md) para resultados, interações realizadas e pendências reais.

Se o Metro estava aberto com o SDK anterior, encerre com `Ctrl+C` e execute `npx expo start --clear`. Escaneie o novo QR no Expo Go SDK 58. Atualizações OTA publicadas anteriormente precisam ser publicadas novamente com o novo SDK.

## Entrega: GitHub, Expo e vídeo

### GitHub

Este projeto está dentro do repositório `PDmobile2026`. Na raiz dele, revise `git status`, adicione somente `portfolio-mobile` e faça commit/push no seu repositório. Entregue o link da pasta no GitHub. Não envie `node_modules`, `.env` ou `dist`.

### Expo / OTA

1. Preencha `EXPO_OWNER` com o **slug da organização** que convidou o professor. Execute `npx eas-cli@latest login` e `npx eas-cli@latest init` nesta pasta, selecionando/criando o projeto nessa organização.
2. Copie o project ID retornado para `EXPO_PUBLIC_EAS_PROJECT_ID`. A configuração base está em `app.json` (owner `anacsilvabrs-team`); `app.config.js` complementa os valores usando o `.env`. Use o ID próprio do portfólio, nunca o do jogo de dados.
3. Execute `npx expo install expo-updates` e `npx eas-cli@latest update:configure`. Confira owner, projectId, updates.url e a política `sdkVersion` já preparada no config.
4. No dashboard EAS, cadastre as variáveis `EXPO_PUBLIC_BACK4APP_*` no ambiente **preview**, além de `EXPO_PUBLIC_EAS_PROJECT_ID` e `EXPO_OWNER` com os mesmos valores locais. As variáveis usadas no bundle devem existir no ambiente de publicação.
5. Publique: `npx eas-cli@latest update --branch preview --message "Entrega portfolio mobile" --environment preview`.
6. Abra a atualização no dashboard Expo e use Preview para obter o link/QR. **Abra esse QR no Expo Go do celular e confirme o funcionamento antes de enviar.** O QR do `npm start` depende do computador ligado e não substitui o link publicado da entrega. Verifique a compatibilidade da versão do Expo Go com SDK 58 em https://expo.dev/go.

O projeto ainda precisa de credenciais, vínculo com a organização e publicação para ter um link real de entrega. Um APK interno pode ser criado com `npx eas-cli@latest build --profile preview --platform android`, mas não substitui o QR do Expo Go pedido na atividade.

Referências: [Expo Router](https://docs.expo.dev/router/installation/), [Back4App APIs](https://www.back4app.com/features/apis), [EAS Update](https://docs.expo.dev/eas-update/getting-started/), [compatibilidade Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

### Vídeo no YouTube (até 1 minuto)

- 0–10 s: Home no celular/emulador e apresentação.
- 10–25 s: Formação, Carreira e Sobre.
- 25–45 s: Projetos, busca, marcar favorito e filtrar.
- 45–55 s: fechar/reabrir e mostrar favorito persistido.
- 55–60 s: indicador Back4App e encerramento.

Grave o celular ou emulador, nunca web. Publique no YouTube como público ou não listado. Envie na atividade três links: código no GitHub, atualização Expo com QR validado e vídeo do YouTube. Não anexe o vídeo diretamente.
