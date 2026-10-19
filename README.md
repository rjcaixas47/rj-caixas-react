# RJ Caixas e Tabuleiros — React

Base do Open Design convertida em React + Vite, preservando o CSS, fontes, cards e imagens de catálogo da referência. Identidade em verde, com atendimento de atacado por WhatsApp.

## Executar

```bash
cd 'C:/Users/Altamir da Luz/OneDrive/Área de Trabalho/zed.codes/sites/rj-caixas-react'
npm ci # necessário apenas se node_modules não estiver instalado
npm run dev -- --port 5173
```

Prévia de desenvolvimento: http://127.0.0.1:5173/

```bash
npm run verify             # testes de validação/concorrência e build
npm run preview -- --port 4173
```

Prévia do build: http://127.0.0.1:4173/

## Alterações

- Cores da RJ, logotipo oficial e banners adaptados.
- Faixa “Caixas de Papelão” em HTML/SVG próprio, com caixa abrindo ao entrar na tela. Respeita redução de movimento.
- Botão de WhatsApp na faixa, em cada um dos 40 cards, nos detalhes e fixo na tela.
- Busca, detalhes, seleção para orçamento e carrosséis locais em React.
- WhatsApp oficial: https://wa.me/message/6AHUVBGYX2XHM1 (obtido em https://linktr.ee/rjcaixasetabuleiros).

## Edição

- `src/Wholesale.jsx`: faixa, ilustração, contato e botões de atacado.
- `src/brand.css`: identidade visual e estilos dos componentes.
- `src/Storefront.jsx`: estrutura original convertida em JSX.
- `src/App.jsx`: busca, detalhes e seleção para orçamento.
- `public/assets`: imagens, estilos e fontes locais.

## Verificação realizada

Build de produção aprovado. Testado no navegador em 1280 px e 390 px: faixa, abertura da caixa, detalhes de produto, 40 links de WhatsApp, ausência de links aninhados e de rolagem horizontal no celular. Os destinos foram verificados sem enviar mensagens.

## Limites desta prévia

Os produtos, preços, disponibilidade, formas de pagamento e demais textos comerciais herdados são referência visual e precisam ser confirmados pela RJ. Não há checkout ou cobrança. O admin e a integração Supabase estão implementados; login e persistência remota dependem da configuração descrita abaixo. Quantidades mínimas e descontos de atacado não foram inventados. A seleção de produtos fica apenas neste navegador; não é enviada automaticamente ao WhatsApp. Os banners principais no celular usam provisoriamente a arte de desktop, como informado na prévia anterior.

O HTML original permanece em `RECON/original-source.html`.

Ícones de WhatsApp: `siWhatsapp` da biblioteca Simple Icons, importado diretamente sem redesenhar o símbolo. Dimensões dos botões e ícones preservadas.

## Admin e backend RJ Caixas

Adaptado do repositório `Greed9797/lp-originally`, commit `de972def0ba34b8acb82855e7faa0d2b24419edc`, confirmado nos metadados do deploy Vercel `dpl_9pPLgvNfwvyi5spToyhL6tNUAnQf`. A referência usa Next.js; esta landing mantém React/Vite e usa o mesmo serviço de backend: Supabase Auth, Postgres e Storage.

- `/admin`: login e painel de produtos, categorias, banners e configurações.
- Produtos: nome, descrição, preços em centavos, categoria, imagem, pacote, texto por unidade, condição comercial, selo, disponibilidade, posição e rascunho/publicação.
- Categorias e banners: cadastro, edição, exclusão, ordem e visibilidade. Banners permitem imagem desktop/celular e link.
- Configurações: logo, marca, avisos, títulos, benefícios, contato, redes, WhatsApp, rodapé e textos institucionais.
- As gravações dependem de administrador ativo no banco. Sem Supabase configurado, a vitrine mostra a referência local e o admin informa a configuração pendente. Não há login fictício nem gravação em localStorage.
- Ao configurar um banco vazio, o catálogo fica vazio. O admin pode importar os dados iniciais pelo botão de importação; a operação preserva registros existentes e permite repetir após falha parcial. São dados da referência visual, não preços comerciais confirmados da RJ.

### Conectar um Supabase da RJ

1. Usar um projeto Supabase exclusivo da RJ. Aplicar **somente** as migrations deste repositório, nesta ordem: `202609050001_rj_catalog.sql` (tabelas `rj_*`, regras RLS e bucket `rj-media`), `202610160001_rj_tracking.sql` (tabela `rj_tracking`) e `20261019130129_rj_tracking_options.sql` (opções, HTML e validação). Os arquivos estão em `supabase/migrations/`. O banco compartilhado W3 Geral não é um destino aprovado: uma política existente permite a qualquer usuário autenticado ler anexos internos. Não criar a conta do cliente nele nem alterar políticas de outros sistemas.
2. Copiar `.env.example` para `.env.local` e preencher `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com a URL e chave publicável/anon desse projeto. Nunca usar `service_role` ou `sb_secret_` no Vite.
3. Criar o usuário administrativo pelo painel Supabase → Authentication → Users. Definir a senha por canal seguro. Desabilitar cadastro público se o projeto for dedicado à RJ.
4. Atribuir o UUID desse usuário no SQL Editor:

```sql
insert into public.rj_admin_profiles (id, active)
values ('UUID-DO-USUARIO-CRIADO', true);
```

5. Reiniciar `npm run dev` e acessar `/admin`. O painel exige login real. Atribuição/revogação de administradores acontece no banco, sem possibilidade de autopromoção pelo navegador.

Na Vercel, as mesmas duas variáveis `VITE_*` precisam estar em Production (e Preview, se quiser testar lá). Elas entram no build: depois de criar ou mudar, é preciso publicar de novo.

### Rastreamento (GTM, GA4, Google Ads e Pixel da Meta) — 19/10/2026

Aba **Rastreamento** no `/admin` para o cliente colar os IDs sozinho. Guia de uso em `docs/GUIA-DO-PAINEL.md`.

- Banco: tabela `rj_tracking` (linha única `site`) com `gtm_id`, `ga4_id`, `google_ads_id`, `meta_pixel_id` e `options`. Os formatos dos IDs e das opções são validados no cliente e no banco. Leitura pública (inclusive o conteúdo dos códigos), gravação só para admin ativo, sem exclusão. A versão numérica impede sobrescrever edição concorrente.
- Integrações: IDs digitados ou extraídos de snippets oficiais sem executar o código no painel. Cada integração pode ser pausada sem perder seu ID. O ID do Pixel é público; tokens privados da API de Conversões não devem ser inseridos.
- HTML personalizado: até 10 códigos, nomeados, de até 12.000 caracteres, com categoria Análise ou Marketing e ativação individual. Executam apenas após consentimento, em um iframe com origem isolada, sem acesso ao DOM, cookies ou sessão da página principal. Códigos que dependem desse acesso devem usar a integração oficial ou GTM. O documento isolado tem sua própria CSP; a CSP da loja e do painel continua estrita. Não inserir segredos.
- Conversões do WhatsApp: `whatsapp_click` no GA4/GTM, `Contact` no Pixel e conversão no Ads quando há ID e rótulo da ação. Cada evento respeita sua categoria de consentimento. Clique não comprova mensagem enviada, lead ou venda.
- Consentimento (RGPD/LGPD): `src/tracking/CookieConsent.jsx` mostra o aviso só quando há algum ID preenchido. Nada carrega antes da escolha. Google Consent Mode v2 começa com tudo `denied` e recebe `update` conforme a escolha (Análise → `analytics_storage`; Marketing → `ad_storage`, `ad_user_data`, `ad_personalization` e o Pixel). O GTM carrega com qualquer categoria aceita e recebe o evento `rj_consent_update` para usar em gatilhos. Ao retirar uma permissão já concedida, a página recarrega sem as tags. A escolha fica em `localStorage` (`rj-consent`), e o link “Preferências de cookies” no rodapé reabre o aviso.
- A vitrine é uma página única, sem troca de rota. Por isso o `page_view` automático do carregamento basta, e não há disparo manual por rota. O `/admin` nunca carrega tags.
- CSP (`vercel.json`): liberados só os domínios do Google (Tag Manager, Analytics, Ads) e da Meta, incluindo o modo de visualização do GTM. Continua sem `unsafe-inline`/`unsafe-eval`; por isso, tags de “HTML personalizado” e variáveis de JavaScript personalizado do GTM não funcionam. Se o cliente precisar delas, a CSP tem de ser revista.
- Testes: `tests/tracking.test.js` (validação, repositório, plano de tags e consentimento) entra no `npm test`. `tests/database.test.js` ganhou o caso TRACK-07 (RLS e formatos da `rj_tracking`).

### Execução e verificação

```bash
npm install
npm run dev -- --port 5173
npm run verify
npm run test:db
npm run preview -- --port 4173
```

`verify` roda os 19 testes de validação e o build. `test:db` executa as migrations e 5 testes de permissões em PostgreSQL temporário via PGlite, em memória, sem banco remoto. `test:db:postgres` mantém o roteiro original para um PostgreSQL instalado, com `PG_BIN` apontando para seus binários. `test:browser` usa Chrome/Edge e API simulada; cobre login, salvar/recarregar, erros, pausar, HTML, consentimento, revogação, conversões, isolamento e logout em 1440/390. As capturas e `resultado.json` ficam em `output/tracking/`.

O destino novo na Vercel é `rj-caixas` (`prj_8xlM8KcOO8xJMqx5RJ6tYWxsIpRi`), da equipe RJ Caixas (`team_fcQFYgUFEOU5ptCQMGbD7QHN`, slug `rj-caixas`), com preset Vite, `npm ci`, `npm run build` e saída `dist`. As duas variáveis públicas foram configuradas em Production, Preview e Development, e a cópia de Preview foi conferida. `vercel.json` inclui rotas SPA e cabeçalhos; um domínio Supabase personalizado requer ajuste do `connect-src` no CSP. O projeto antigo `b57bdfd9-ac23-412d-b09d-1537e1beeca0` é apenas a origem da migração e não deve receber esta publicação.

Endereço novo: `https://rj-caixas-pied.vercel.app`; painel: `/admin`. O primeiro deploy, `dpl_3XB2PZ8T4T4pH8UqSncTQKbtttac`, foi classificado automaticamente como Production pela Vercel, embora o comando não tenha usado `--prod`. Nenhum domínio da loja antiga foi transferido. O build remoto passou; `/`, `/admin`, `/tracking-sandbox.html` e `/tracking-sandbox.js` retornaram HTTP 200 com conteúdo e CSP esperados, inclusive a permissão de iframe exclusiva do sandbox.

### Segurança e operação

Sessão administrativa fica no sessionStorage e expira conforme Supabase Auth. RLS verifica o perfil a cada operação. Visitantes só leem produtos publicados e categorias/banners ativos. Versões numéricas detectam edição concorrente. Falhas de gravação preservam o formulário; falhas de leitura remota são exibidas sem restaurar amostras excluídas. A vitrine atualiza ao recarregar ou voltar à aba.

O bucket é de mídia pública, inclusive imagens enviadas antes da publicação de um produto. Use somente material destinado à vitrine; não envie documentos privados. O upload aceita JPEG/PNG/WebP até 5 MB, nome aleatório e validação de assinatura no cliente mais limite/MIME no Storage. A exclusão de um cadastro preserva o arquivo de mídia para evitar quebrar imagens compartilhadas.

Os textos institucionais em branco direcionam para atendimento até serem preenchidos. Preço por unidade e condição comercial são textos explícitos, não calculados automaticamente; revisar junto com o preço principal. Não foram adicionadas regras de quantidade mínima, descontos ou checkout.

### Reversão local

O estado recuperado antes da retomada permanece em `C:/Users/Altamir da Luz/Sites/rj-caixas-react`. A cópia de trabalho atual fica em `zed.codes/sites/rj-caixas-react`, na branch `feat-tracking-admin`. A conversa original, o patch e o manifesto SHA-256 foram preservados em `zed.codes/backups/rj-caixas-recuperacao-20261019-132825/`; os 344 arquivos de código e assets foram comparados antes das novas alterações. Para desligar a integração local, remova as variáveis públicas de `.env.local` e reinicie o servidor. Isso não apaga dados remotos.

### Ponto de continuidade — 19/10/2026

As novas contas do cliente usam `rjcaixas47@gmail.com`. O código foi enviado ao repositório privado `https://github.com/rjcaixas47/rj-caixas-react`, branch `main`. No checkout recuperado, o remoto `cliente` aponta para esse repositório; `origin` ainda identifica o repositório antigo da empresa. As autenticações das CLIs estão isoladas em `output/credenciais-cli/`, fora do Git e do deploy. Não publicar essa pasta nem arquivos de ambiente.

Supabase exclusivo: organização RJ Caixas (`dyfxnqlyffjovgqffbmy`), projeto `rj-caixas` (`gjwzhmzxsapyuqjkohgx`), plano Free e região São Paulo. As três migrations foram aplicadas pelo SQL Editor, com seis tabelas protegidas por RLS. O catálogo recuperado foi importado sem sobrescrever registros: 40 produtos, 6 categorias e 4 banners. A API real confirmou leitura pública do catálogo e rejeição de leitura de perfis/gravação de rastreamento sem autenticação. Não conectar o cliente ao W3 Geral nem alterar os serviços antigos da empresa.

A implementação local foi retomada após o fechamento do editor. Foram corrigidos o host/origem da API simulada e o seletor da aba com contagem no teste de navegador. Confirmados: 19 testes de lógica, 5 testes SQL em banco temporário, build e roteiro completo no Chrome em 1440/390, sem erros de JavaScript. A vitrine também foi aberta com o banco real, sem erros de JavaScript. Os serviços externos de anúncios foram simulados; o recebimento real de eventos depende dos IDs do cliente.

O usuário do painel `rjcaixas47@gmail.com` foi criado e confirmado pelo responsável. Seu perfil administrativo foi ativado com autorização e conferido no banco. Cadastros públicos foram desabilitados, o login por email continua ativo e o Site URL aponta para o endereço Vercel novo. A API confirmou essas configurações e repetiu com sucesso as verificações de leitura do catálogo e bloqueio de operações anônimas.

Próxima etapa: o responsável entrar na aba do painel com sua senha para verificar salvamento e recarga no Supabase real. Essa verificação autenticada e o upload real ainda não foram concluídos; os testes anteriores desses fluxos usaram API simulada. Não registrar senhas nem copiar a sessão do navegador para scripts.

O Security Advisor indicou 0 erros e 5 avisos: execução de funções SECURITY DEFINER por visitantes/autenticados (`rj_is_admin` e `rls_auto_enable`) e proteção contra senhas vazadas desativada. `rj_is_admin` usa `auth.uid()`, caminho de busca vazio e retorna apenas o estado administrativo do próprio usuário; ela é utilizada pelas políticas de leitura e escrita. `rls_auto_enable` foi criada pela configuração de RLS automático do projeto. Não alterar permissões dessas funções sem validar as políticas e o mecanismo da plataforma.

A equipe Vercel nova está no plano Hobby. A documentação consultada em 19/10/2026 restringe Hobby a uso pessoal não comercial; Pro começa em US$ 20/mês, além de uso/impostos aplicáveis. Decidir o plano/destino antes de divulgar a loja para uso comercial. Nenhuma assinatura paga foi contratada. Preservar a loja existente até a validação do novo destino.

### Resultado da validação do admin

7 testes de contratos/repositório e 7 testes SQL passaram. O painel foi exercitado no navegador com API simulada: login inválido/válido, cadastro, preço, rascunho, publicação, recarga, erro preservando formulário, configurações, WhatsApp, categorias, banners, exclusão e logout. Desktop e celular sem transbordamento da página. Uma segunda verificação confirmou atualização de modal após edição/despublicação e rotação dos avisos. Os roteiros estão em `tests/browser-check.js` e `tests/browser-refresh-check.js`, para Playwright CLI. Eles usam uma instância isolada na porta 5174, com URL `https://rj-test.invalid` e chave fictícia; não apontar esses testes para um Supabase real.

A revisão independente detectou e corrigiu três problemas de UI; a revisão de segurança e seus testes de mutação detectaram 12 alterações incorretas de comportamento. Os relatórios estão em `.specs/features/admin-catalog/`. Autenticação, upload e persistência nos serviços gerenciados ainda precisam ser verificados após conectar o Supabase escolhido.

### Usabilidade do painel — 06/09/2026

Guia para quem vai operar a loja: [Como cuidar da loja](docs/GUIA-DO-PAINEL.md).

O painel agora inclui guia rápido, busca sem acentos, filtros com contagens, cartões no celular, formulário organizado com prévia, escolha de foto em destaque e campos opcionais recolhidos. Configurações agrupadas por assunto preservam a edição ao trocar de grupo. Avisos explicam rascunho/publicação e salvamento; confirmações acessíveis protegem exclusões e alterações não salvas. O layout público e os ícones oficiais de WhatsApp foram preservados.

Validação desta atualização: 7 testes de contratos/repositório e build aprovados; os 7 testes SQL também passaram na verificação de base. Roteiro de navegador ampliado para busca, upload válido/inválido, foco dos erros, prévia, confirmação/escape, saída sem salvar e preservação dos grupos. Evidências em `output/playwright/admin-ux-20260906/` e revisão em `.specs/features/admin-catalog/usability-validation.md`. Os testes de navegador continuam usando API simulada, sem conexão com um banco remoto.
