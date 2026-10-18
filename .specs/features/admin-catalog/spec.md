# Admin RJ Caixas Specification

## Problem Statement
A vitrine React é estática. O usuário quer o comportamento do admin de Greed9797/lp-originally, preservando a apresentação da RJ Caixas.

## Goals
- Editar produtos, categorias, banners, informações e WhatsApp com persistência no Supabase.
- Manter medidas, fontes, cores, animações e assets da vitrine.

## Out of Scope
| Feature | Reason |
| --- | --- |
| Checkout, pagamentos, pedidos, importação Mercos, métricas de contatos | Não solicitados para esta landing de atacado |
| Alterar Originally ou implantar remotamente | Requer autorização específica após revisão local |

## Assumptions & Open Questions
| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Banco | Recursos RJ separados e prefixados rj_ | Impedir mistura com Originally | Decisão de projeto Supabase pendente |
| Preços/condições | Valores atuais como amostra, editáveis; preço vazio é sob consulta | Não inventar regra comercial | Sim, visual existente |
| Publicação | Novo produto começa como rascunho | Administrador escolhe quando publicar | Padrão da referência |
| Imagens | PNG/JPEG/WebP, até 5 MB por arquivo, URLs HTTPS ou assets locais | Upload seguro e leve | Técnico |
| Admin | Supabase Auth com perfil ativo, sem cadastro público | Reutiliza modelo da referência | Técnico |
| Persistência remota | Depende de projeto Supabase escolhido e configurado | Não aplicar migrações em banco alheio | Pendente |

## User Stories
### P1: Administrar catálogo
1. WHEN um administrador ativo entra com email e senha THEN o sistema SHALL mostrar o painel de edição (ADMIN-01).
2. IF o visitante está sem autenticação ou sem perfil ativo THEN o banco SHALL negar inserção, atualização e exclusão de conteúdo (ADMIN-02).
3. WHEN um administrador salva produto válido THEN o sistema SHALL persistir nome, descrição, preço em centavos ou nulo, categoria, pacote, imagem, disponibilidade e status (ADMIN-03).
4. WHEN o administrador exclui um produto após confirmação THEN o sistema SHALL removê-lo do catálogo (ADMIN-04).
5. WHILE um produto está em rascunho o catálogo público SHALL ocultá-lo (ADMIN-05).
6. WHEN o administrador salva categorias, banners e configurações THEN uma nova leitura pública SHALL exibir os valores salvos (ADMIN-06).
7. IF dados são inválidos, links usam protocolos inseguros ou arquivos excedem limites THEN o sistema SHALL rejeitar a alteração com mensagem e preservar o formulário (ADMIN-07).
8. IF uma edição usa uma versão anterior à versão salva THEN o sistema SHALL rejeitar a gravação com conflito, sem sobrescrever a edição mais recente (ADMIN-08).
9. IF o banco configurado falha THEN a vitrine SHALL informar falha com opção de tentar novamente, sem ressuscitar amostras removidas (ADMIN-09).
10. IF não existe configuração Supabase THEN o admin SHALL informar a configuração pendente e não simular login ou gravação (ADMIN-10).
11. WHEN a página é aberta em desktop ou celular THEN a vitrine SHALL preservar sua estrutura e não transbordar horizontalmente (ADMIN-11).
12. WHEN o administrador envia uma imagem permitida THEN o sistema SHALL armazená-la no bucket RJ e permitir associá-la ao conteúdo (ADMIN-12).

## Edge Cases
- Sessão expirada ou perfil revogado: toda gravação continua protegida no banco.
- Catálogo vazio: mostrar estado vazio, sem reposição silenciosa de amostras.
- Categoria vinculada: exclusão bloqueada até reatribuir os produtos.
- Reenvio: identificador estável em novos registros; restrição de chave impede duplicatas.
- Concorrência: versão numérica incrementada pelo banco.
- Texto é renderizado por React, sem HTML arbitrário.
- Falhas são mostradas no admin; não registrar senhas ou tokens.
- Rate limits de autenticação: Supabase Auth; sem endpoint de senha próprio.
- Expiração: sessão gerenciada pelo SDK Supabase; sem expiração inventada dos produtos.

## Requirement Traceability
| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| ADMIN-01 | P1 | Implementação | Verified locally |
| ADMIN-02 | P1 | Implementação | Verified locally |
| ADMIN-03 | P1 | Implementação | Verified locally |
| ADMIN-04 | P1 | Implementação | Verified locally |
| ADMIN-05 | P1 | Implementação | Verified locally |
| ADMIN-06 | P1 | Implementação | Verified locally |
| ADMIN-07 | P1 | Implementação | Verified locally |
| ADMIN-08 | P1 | Implementação | Verified locally |
| ADMIN-09 | P1 | Implementação | Verified locally |
| ADMIN-10 | P1 | Implementação | Verified locally |
| ADMIN-11 | P1 | Implementação | Verified locally |
| ADMIN-12 | P1 | Implementação | Verified locally |

## Success Criteria
- Login/admin e operações verificados em browser quando o backend estiver configurado.
- Regras RLS e contratos exercitados em banco de teste local.
- Build React aprovado.
