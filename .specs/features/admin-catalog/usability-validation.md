# Usabilidade e verificação — 06/09/2026

## Escopo

Facilitar o uso do painel por pessoas sem experiência técnica, preservando identidade RJ e layout público. Alterações em Admin.jsx, admin.css, novos Editors.jsx/ui.jsx, roteiro browser-check.js e documentação. Sem mudança de Auth, RLS, migração, repositório ou regras comerciais.

## Testes

- Base: 7 testes de contratos/repositório e 7 testes SQL aprovados antes da edição. SQL não alterado nesta rodada.
- Final: `npm run verify` aprovado, 7 testes e build Vite (76 módulos).
- Navegador: `tests/browser-check.js` passou, sem erros JavaScript. Verificou login inválido/válido, 40 produtos iniciais, guia, busca sem acento, filtro vazio, cadastro, preços em centavos, prévia, rascunho oculto, recarga, publicação e reflexo na loja.
- Novos controles: foto obrigatória preserva campos e foca aviso; SVG rejeitado antes do envio; PNG selecionado, enviado e refletido na prévia. Campos opcionais recolhidos. Cancelar saída preserva edição; descartar restaura dados salvos. Falha de gravação mantém preço digitado. Configurações de grupos diferentes são salvas juntas e o grupo aberto é mantido. Sem alterações pendentes, salvar fica desabilitado.
- Exclusão: diálogo explica o efeito, inicia foco em Cancelar e aceita Escape; cancelar preserva registro e confirmar remove. Cadastro de categoria/banner e logout também aprovados.
- Responsividade: 1280×900 e 390×844; painel, editor e loja sem transbordamento horizontal. Lista vira cartões no celular.
- Integração da vitrine: `tests/browser-refresh-check.js` passou. Modal reflete edição ao voltar à aba, fecha após despublicação e segundo aviso superior aparece.

API de navegador simulada em instância isolada 5174, URL rj-test.invalid e chave fictícia. As capturas contêm dados de teste. A base SQL foi exercitada em PostgreSQL local temporário; isso não substitui teste de Supabase Auth/Storage real.

## Revisão em passada separada

Revisados fluxo de salvamento, travas durante upload/gravação, confirmações, foco, rótulos, estados de erro, agrupamento e CSS mobile. Corrigidos durante a verificação: texto “Obrigatório” interferindo no nome acessível do campo; grupo de configurações reiniciado após salvar; mensagem de edição inadequada no login; altura irregular dos inputs ao lado de dicas. Inspeção visual final das telas de cadastro, configurações, lista e confirmação aprovada. Sem achados bloqueadores locais.

CSS novo restrito a .rj-admin. A página pública e a biblioteca Simple Icons não foram modificadas nesta rodada. Inputs e arquivos continuam passando pelos validadores existentes; publicação depende das políticas do banco.

## Evidências e operação

Resultados JSON, build e capturas em `output/playwright/admin-ux-20260906/`. `docs/GUIA-DO-PAINEL.md` explica operação cotidiana. Servidor principal na porta 5173. A conexão Supabase ainda precisa ser ativada antes de login, envio de fotos e persistência remota reais.

Reversão local desta rodada: backup dos arquivos anteriores em `/tmp/rj-admin-ux-before`; restaurar Admin.jsx/admin.css e roteiro anterior retorna a UI anterior. Helpers novos ficam sem uso se Admin antigo for restaurado. Nenhuma reversão de banco é necessária. Não houve commit, push ou deploy.
