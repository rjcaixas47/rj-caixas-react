# Admin Tasks
## Execution Protocol
Executar com tlc-spec-driven, sequencialmente. Solicitação atual autoriza implementação local. Testes escolhidos conforme stack existente e necessidade de segurança.
## Test Coverage Matrix
| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Contratos | unit | Limites e dados inválidos ADMIN-03/07 | tests/model.test.js | npm test |
| Banco | integration | Visitante, usuário, admin, revogação e concorrência | tests/database.test.js | npm run test:db |
| React/SDK | e2e | Edição/publicação/configurações/erros | output/playwright | Playwright CLI |
## Gate Check Commands
| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Contratos | npm test |
| Full | Banco | npm test && npm run test:db |
| Build | Integração final | npm run verify |
## Execution Plan
### Phase 1: Catálogo
T1 → T2 → T3 → T4 → T5 → T6
## Task Breakdown

### T1: Contratos e catálogo inicial
**What**: Contratos e catálogo inicial
**Where**: `src/catalog/model.js`
**Depends on**: None
**Requirement**: ADMIN-03, ADMIN-07
**Tests**: unit
**Gate**: quick
**Done when**:
- [x] Valores atuais extraídos e entradas inválidas rejeitadas.

### T2: Persistência e permissões SQL
**What**: Persistência e permissões SQL
**Where**: `supabase/migrations/202609050001_rj_catalog.sql`
**Depends on**: T1
**Requirement**: ADMIN-02, ADMIN-05, ADMIN-08
**Tests**: integration
**Gate**: full
**Done when**:
- [x] RLS permite apenas administradores ativos, dados válidos e versões atuais.

### T3: Cliente de dados e autenticação
**What**: Cliente de dados e autenticação
**Where**: `src/catalog/repository.js`
**Depends on**: T2
**Requirement**: ADMIN-01, ADMIN-09, ADMIN-10, ADMIN-12
**Tests**: e2e
**Gate**: build
**Done when**:
- [x] SDK comunica erros e não simula gravação sem configuração.

### T4: Painel administrativo
**What**: Painel administrativo
**Where**: `src/admin/Admin.jsx`
**Depends on**: T3
**Requirement**: ADMIN-01, ADMIN-03, ADMIN-04, ADMIN-06, ADMIN-07
**Tests**: e2e
**Gate**: build
**Done when**:
- [x] Editor oferece CRUD, mídia e configurações com estados de erro e confirmação.

### T5: Vitrine conectada
**What**: Vitrine conectada
**Where**: `src/Storefront.jsx`
**Depends on**: T4
**Requirement**: ADMIN-05, ADMIN-06, ADMIN-11
**Tests**: e2e
**Gate**: build
**Done when**:
- [x] Todos os campos editáveis aparecem sem alterar a estrutura visual.

### T6: Configuração e verificação final
**What**: Configuração e verificação final
**Where**: `README.md`
**Depends on**: T5
**Requirement**: ADMIN-01, ADMIN-02, ADMIN-10, ADMIN-11
**Tests**: e2e
**Gate**: build
**Done when**:
- [x] Comandos e limitações documentados; revisão independente concluída.

## Conclusão local
Seis tarefas implementadas e verificadas localmente. Ativação Supabase/Vercel depende do destino escolhido; nenhuma gravação remota autorizada ou executada.
