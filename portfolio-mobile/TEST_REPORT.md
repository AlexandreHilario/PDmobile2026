# Verificação do portfólio mobile — 02/11/2026

## Atualização: conexão com Master Key solicitada pelo usuário

A leitura real passou após configurar EXPO_PUBLIC_BACK4APP_MASTER_KEY no .env do mobile. Retornou nome, apresentação, uma formação, uma experiência e um projeto. O app não utiliza mais Person ID: carrega a primeira pessoa por ordem de cadastro. TypeScript e 20 testes automatizados passaram. A chave administrativa será incorporada ao app e fica acessível no bundle distribuído. Não houve alterações no banco nem na curriculum-api. Os resultados abaixo registram a revisão anterior, feita com REST API Key, e sua pendência de leitura foi resolvida com a configuração solicitada. A execução no aparelho continua pendente.

## Requisitos

| Requisito | Resultado | Evidência e limite |
| --- | --- | --- |
| Visual elaborado | Implementado; inspeção visual final pendente | Tema escuro, verde de destaque, cards, etiquetas, áreas seguras, estados de carregamento/erro e botões com área mínima de toque. Layout DOM sem rolagem horizontal nos testes de 320 e 390 px. A captura de screenshot do navegador falhou por timeout, portanto não foi possível aprovar a aparência por imagem. |
| Expo Router e cinco telas | Aprovado na navegação web | Home → Projetos pelo CTA e abas Home, Formação, Carreira, Projetos e Sobre abertas na interface real. Formação e Carreira exibem os títulos completos das experiências exigidas. |
| Sobre com tecnologias e extra | Aprovado | React Native, React, Expo, TypeScript, Router, Back4App REST, AsyncStorage, APIs nativas, Safe Area, Screens, módulos Expo, React DOM/Web e Expo Updates. O módulo Expo Updates foi acrescentado nesta revisão. Funcionalidade extra descrita na própria tela. |
| Dados do currículo no back-end | Implementado, mas teste real bloqueado pelos dados/permissões atuais | O adaptador lê diretamente Person, Education, Experience e Project, com campos em português e filtro Pointer pessoa. Com o .env atual, não há pessoa legível em Person. Não é possível aprovar o carregamento de currículo real enquanto isso persistir. |
| Funcionalidade extra | Aprovada nos testes de componentes e interface web | Favoritos, filtro, busca e compartilhamento. Persistência web confirmada após recarga. Abertura do menu de compartilhamento e persistência no armazenamento Android/iOS ainda precisam de validação no aparelho. |

## Verificações executadas

- `npm run typecheck`: aprovado.
- `npm test`: 18 testes aprovados, zero falhas.
- `npx expo-doctor`: 20/20 verificações aprovadas.
- `npx expo export --platform all`: bundles Android, iOS e web gerados.
- `npm run test:backend`: reprovado de forma explícita; nenhuma pessoa legível na tabela Person com as credenciais e filtro atuais. Não houve escrita no banco.
- `git diff --check`: sem erros de whitespace.

## Cobertura dos 18 testes automatizados

Os testes de API simulam respostas HTTP e verificam tabelas e campos reais, credenciais nos headers, filtro Pointer, seleção por PERSON_ID, múltiplas pessoas, ACL, paginação com 101 projetos, resposta inválida e seções vazias.

Os testes de componentes usam React Test Renderer com APIs nativas e armazenamento simulados. Cobrem restauração/remoção/persistência de favoritos, várias alterações seguidas, falha de leitura, JSON corrompido, atualização com falha preservando os dados anteriores, recuperação da conexão, busca sem acentos, estado vazio, limpar filtros, CTA da Home, conteúdo enviado ao Share, abertura e validação de links, conteúdo de Sobre e telas de experiências vazias. Não equivalem a testes de execução Android/iOS.

## Interações verificadas no aplicativo web em execução

1. Abrir Home e navegar pelo botão Explorar meus projetos.
2. Marcar Portfolio Mobile como favorito e filtrar: um resultado.
3. Recarregar a página: estrela permaneceu marcada.
4. Buscar SERVICOS: encontrou API de serviços, ignorando acentos e maiúsculas.
5. Buscar termo inexistente: exibiu zero resultados e mensagem adequada.
6. Usar Ver todos os projetos: recuperou a lista completa.
7. Abrir Formação, Carreira, Sobre e retornar à Home pelas abas.
8. Confirmar os módulos e a explicação da funcionalidade extra em Sobre.
9. Remover o favorito criado no teste e filtrar: zero resultados.
10. Verificar larguras de 320 e 390 px pelo layout DOM: sem overflow horizontal nos estados inspecionados de Home/Projetos e em Sobre a 390 px.

## Pendências para concluir a entrega

1. Resolver a leitura de Person: confirmar se Application ID/REST API Key apontam para o app correto, se o PERSON_ID corresponde a uma pessoa existente e se classe/ACL permitem a leitura esperada. Não usar a Master Key no bundle. Nenhuma tabela, ACL ou arquivo da curriculum-api foi alterado.
2. No celular com Expo Go SDK 58, executar `npx expo start --clear`, navegar nas cinco abas, marcar favorito, fechar/reabrir o app, confirmar persistência e abrir o menu nativo de compartilhamento. Não havia Android SDK/emulador disponível para essa validação neste ambiente.
3. Conferir visualmente todas as telas no aparelho. A captura automática do navegador não funcionou, apesar de a leitura da interface e as interações funcionarem.
4. Após os dados reais carregarem, publicar a atualização Expo, testar seu QR com o servidor local desligado e gravar o vídeo de até um minuto no celular/emulador.

O aplicativo possui os recursos solicitados, mas não deve ser considerado integralmente validado para entrega enquanto o currículo real não carregar e a execução no celular não for confirmada.
