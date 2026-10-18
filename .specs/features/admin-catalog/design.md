# Admin RJ Caixas Design

React/Vite é preservado. Supabase Auth/Postgres/Storage fornece o backend, como na referência Next.js. O cliente utiliza somente a chave publicável; permissões são aplicadas por RLS e grants, nunca por condição de frontend. Tabelas prefixadas rj_ e bucket rj-media. Nenhum vínculo de deploy com Originally será criado.

Alternativas consideradas: migrar tudo para Next.js exigiria alterar a stack visual sem necessidade; criar API e autenticação próprias duplicaria Supabase. Escolha: SDK oficial e RLS.

## Components
- src/catalog/model.js: contratos, moeda, validação, defaults.
- src/catalog/repository.js: leitura e CRUD Supabase, versões e mídia.
- src/catalog/CatalogContext.jsx: dados públicos e atualizações ao voltar à aba.
- src/admin/: login, catálogo, editor de produtos, categorias, banners, configurações.
- src/Storefront.jsx, App.jsx, Wholesale.jsx: consumir catálogo preservando classes.
- supabase/migrations/: schema, RLS, validação, seed separado e sem usuários/senhas.

## Risks & Concerns
| Concern | Mitigation |
| --- | --- |
| Referência usa fallback de admin sem configuração | Admin fecha acesso quando configuração ausente |
| Perfil admin autogerenciável na referência | Somente operador do banco atribui administradores |
| Referência permite ler imagens de rascunho | Dados de imagens ficam no produto protegido; bucket contém somente mídia pública, sem documentos privados |
| Storefront com 40 cards fixos | Extrair card único mantendo marcação e dados iniciais |
| Perda de edição concorrente | Compare-and-swap com versão numérica |
| Assets em servidor externo | URLs HTTPS; nenhum fetch arbitrário no backend |

## Assumptions, files and verification
Modificar somente os arquivos acima, package.json/lock, Vite/Vercel configs, docs e testes do recurso. Testar validação com node:test, RLS com PostgreSQL local isolado e integração de formulário no browser. Credenciais e alterações remotas dependem do projeto escolhido.
