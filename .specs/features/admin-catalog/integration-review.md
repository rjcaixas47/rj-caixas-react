# Revisão independente da integração RJ Admin

Escopo: spec ADMIN-01..12; código React de administração, repositório Supabase, catálogo/contexto, cards, vitrine, modal, ícones/carrosséis e configuração Vercel. Somente leitura no projeto. Nenhuma credencial ou produção acessada. Revisão estática e execução de `node --test tests/model.test.js` (4/4 aprovados). As linhas abaixo correspondem à versão lida antes das correções do autor.

## Achados da primeira passada — todos corrigidos

### [P1] Configurações quebra ao abrir o painel
- Arquivo: `src/admin/Admin.jsx:48`.
- `const rows=(catalog?.[tab]||[]).filter(...)` também é executado quando `tab === 'settings'`, porém `catalog.settings` é um objeto. A aba dispara TypeError em vez de renderizar SettingsEditor.
- Impacto: ADMIN-06 fica bloqueado para todos os textos, contatos, logo e WhatsApp.
- Ajuste: calcular linhas apenas em abas de lista (ou usar lista vazia em Configurações); verificar abertura, alteração e gravação dessa aba no browser.

### [P2] Avisos 2 e 3 editáveis nunca aparecem na vitrine
- Arquivo: `src/Storefront.jsx:19-21`.
- A classe `is-active` está fixa no primeiro aviso. Não há efeito ou componente que altere a classe, enquanto o CSS original define `.sf-announcements__item { opacity:0; visibility:hidden }` e só exibe `.is-active`.
- Impacto: dois campos oferecidos pelo novo admin persistem, mas permanecem invisíveis ao visitante, contrariando ADMIN-06.
- Ajuste: controlar rotação em React e assegurar acesso aos avisos respeitando preferência de movimento reduzido.

### [P2] Detalhe aberto conserva preço e publicação anteriores
- Arquivos: `src/App.jsx:51`, `src/App.jsx:73`; atualização pública em `src/catalog/CatalogContext.jsx:15-17`.
- O modal mantém uma cópia de todo o produto em estado. Ao voltar à aba após editar preço/descrição ou retirar o produto de publicação, a leitura pública atualiza os cards, mas o modal continua exibindo o objeto antigo e permitindo selecioná-lo.
- Impacto: a mesma vitrine mostra valores diferentes e mantém visível um produto removido da leitura pública até fechar/reabrir o modal.
- Ajuste: guardar identificador e resolver o produto na coleção atual; fechar o detalhe ou mostrar indisponível se o identificador não estiver mais publicado.

## Evidências positivas e limites

- `src/catalog/repository.js:13-14` separa cliente de sessão administrativa do cliente de leitura pública.
- `src/catalog/repository.js:30-32` filtra publicação/ativação e pagina leitura.
- `src/catalog/repository.js:46-51` exige versão na edição/exclusão e detecta gravação sem linha retornada.
- `src/catalog/repository.js:60-65` preserva registros existentes na importação.
- `src/admin/Admin.jsx:23` preserva o formulário quando a gravação rejeita.
- `src/admin/Admin.jsx:42` confirma exclusão; `:39-40` protege navegação com alterações pendentes.
- `src/catalog/CatalogContext.jsx:20-21` apresenta erro/repetição em falha remota sem repor produtos de amostra.
- `src/Wholesale.jsx:2,8-9` mantém o ícone WhatsApp fornecido pela biblioteca Simple Icons.
- Não houve validação de persistência fim a fim em Supabase real: o projeto ainda depende de configuração e provisionamento autorizados. SQL/RLS estão sob revisão independente de outro agente. O autor executa a verificação visual no browser.

## Revalidação independente das correções

Resultado: **PASS da revisão estática dos três ajustes**, sem novo achado concreto nos trechos modificados. Persistência real/produção continua fora da validação desta revisão.

1. **Configurações — resolvido:** `src/admin/Admin.jsx:48` seleciona explicitamente `[]` quando `tab === 'settings'`. O filtro deixa de ser aplicado ao objeto; `:49` encaminha a aba ao SettingsEditor.
2. **Avisos — resolvido:** `src/Storefront.jsx:8-13` implementa Announcements com índice de estado, intervalo de 4 segundos, pausa por hover e limpeza do intervalo. Os avisos não vazios tornam-se ativos por vez, e `:26` usa o componente na vitrine. `src/brand.css:55` reduz a duração das transições quando o usuário solicita movimento reduzido.
3. **Modal — resolvido:** `src/App.jsx:25-26` deriva currentProduct da coleção atual e fecha detalhes se o produto sair dela; `:53` e `:76` guardam apenas productId; `:75` usa os dados atuais em nome, descrição, preço, seleção e WhatsApp. Não há mais cópia do produto persistida no modal.

A sessão Playwright do autor não foi acessada nesta revalidação. O teste `tests/browser-check.js` foi lido: ele contém a abertura e gravação de Configurações (`:81-87`), além de CRUD, publicação e fluxos de erro com API interceptada. A execução/resultados pertencem à validação do autor; nenhuma aprovação fim a fim em Supabase remoto é alegada aqui.
