# State
## Decisions
AD-001 active: React/Vite e design atual preservados; Supabase com RLS como backend.
AD-002 active: Recursos RJ prefixados; banco remoto ainda depende de escolha do usuário.
## Handoff
Feature admin-catalog: implementação local concluída e revisada; integração com Supabase real pendente da escolha do usuário. Pergunta assíncrona enviada: projeto Supabase separado da RJ ou existente? Ainda sem resposta. Referência Git clonada somente para leitura em /tmp/rj-originally-reference. Runtime principal agora na pasta oficial, porta5173, sessão39487. Instância de testes5174 encerrada após validação. Arquivos alterados: src/admin, src/catalog, src/App.jsx, src/Storefront.jsx, src/Wholesale.jsx, src/components.jsx, src/main.jsx, src/brand.css, package.json/lock, .env.example, .gitignore, vercel.json, supabase/migrations, tests, README, .specs. Sem .git no projeto de destino, sem commit/push/deploy. Próximo passo: escolher Supabase RJ, revisar/aplicar migration autorizada, configurar chaves públicas e criar admin, verificar Auth/Storage real. Não usar credenciais/banco Originally por inferência.

## Atualização 06/09/2026 — usabilidade
Solicitação: executar testes básicos e facilitar o painel para leigos. Alterados src/admin/Admin.jsx e admin.css, criados Editors.jsx e ui.jsx; testes/browser-check.js ampliado e fixture de upload inválido adicionada. Guia em docs/GUIA-DO-PAINEL.md. Estilos públicos, Auth, repositório, validação e migração preservados. Testes e revisão local detalhados em usability-validation.md. Supabase remoto continua sem configuração; não foi criado modo de administração fictício. Backup anterior desta rodada em /tmp/rj-admin-ux-before. Runtime de teste5174 encerrado após validação; servidor principal5173 continua ativo.
