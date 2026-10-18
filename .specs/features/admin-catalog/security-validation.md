# Validação independente de segurança — Admin RJ Caixas

Data: 2026-09-05
Verificador: subagente independente security_verification (autor ≠ verificador)
Projeto: `/Users/vitormiguelgoedertdaluz/Projetos/Open-design/b57bdfd9-ac23-412d-b09d-1537e1beeca0`
Escopo: migration SQL, contratos de dados, repositório Supabase, sessão administrativa e testes model/database. UI validada por outro verificador.

## Veredito final do escopo de segurança: PASS

A implementação revisada usa corretamente filtros de versão e RLS. Não foi identificado bypass de escrita para usuários públicos/comuns. A lacuna inicial do ADMIN-08 foi corrigida com um teste que importa a factory real de `src/catalog/repository-core.js`. Na revalidação independente, remover o filtro da edição ou da exclusão provoca falha no teste e o código sem mutação passa 7/7. Não há achados prioritários pendentes neste escopo.

### Achado inicial resolvido na revalidação

**[P2] Testar o filtro de versão da chamada real do repositório** — `src/catalog/repository.js:46`, `tests/database.test.js:34`.

A remoção de `.eq('version',record.version)` da atualização no repositório faz uma edição obsoleta sobrescrever a atual, mas os 4 testes de domínio e os 7 testes SQL continuam passando. O teste SQL monta sua própria consulta `where ... and version=1`, sem exercitar `createRepository().save()`. Assim, não garante que o cliente envie a versão. Criar um teste de contrato do repositório que simule duas edições e exija erro/estado preservado na segunda; cobrir também exclusão com versão antiga. O teste precisa falhar quando o filtro de versão for removido. Não era um bypass no código; era lacuna de cobertura empiricamente comprovada. **RESOLVIDO:** `tests/repository.test.js:19-25` agora exige rejeição da versão velha, preservação do nome/versão atuais, exclusão negada para versão antiga e sucesso da edição/exclusão com versão atual. Mutações independentes em `repository-core.js:33` e `:38` foram detectadas.

## Evidência por critério dentro do escopo

| Critério | Evidência de implementação e teste | Resultado |
| --- | --- | --- |
| ADMIN-02 negar escrita sem admin ativo | SQL:7-15 e 96-110; `tests/database.test.js:22-24` assert.throws anon insert/update/delete; :27-30 nega autopromoção e escrita comum; :57 nega gravação após revogação | PASS local |
| ADMIN-03 persistir nome, descrição e centavos | `src/catalog/model.js:45-47`; `tests/model.test.js:6-8` assert.equal(3150/draft); `tests/database.test.js:35` assert.match(Caixa editada/Descrição nova/5200/2) | PASS dos campos exercitados; restantes dependem revisão UI/SDK |
| ADMIN-04 exclusão | SQL permissões e FK; `tests/database.test.js:35` assert.match(DELETE 1/0) | PASS SQL; confirmação depende UI |
| ADMIN-05 ocultar rascunhos | SQL:103; `tests/database.test.js:21` assert.doesNotMatch(read,/draft/) | PASS |
| ADMIN-06 categorias/banners/configurações | SQL:104-110; `tests/database.test.js:39-40` nega usuário comum e permite admin | PASS permissões; nova leitura UI fora deste escopo |
| ADMIN-07 preço/URL/dados inválidos | SQL:17-34 e checks de tabelas; `tests/model.test.js:11-14` assert.throws inválidos; `tests/database.test.js:44-46` assert.throws URL/preço/status/categoria vinculada | PASS dos limites exercitados |
| ADMIN-08 conflito de versões | SQL:85-94; `tests/database.test.js:35` assert.match(UPDATE 0); `tests/repository.test.js:19` assert.rejects(save versão 1,/versão mais recente/), :20 assert.equal(nome atual/versão 2), :21 assert.rejects(remove versão 1), :22 assert.equal(length,1), :24 assert.equal(saved.version,3) e preço 9900, :25 exclusão versão 3 | PASS; M10 edição e M12 exclusão detectados |
| ADMIN-12 mídia permitida e bucket RJ | `src/catalog/model.js:59-67`, `repository-core.js:40-43`, SQL:113-117; `tests/model.test.js:24-27` MIME/tamanho/cabeçalho; `tests/database.test.js:49-54` permissões, bucket, extensão e 5242880 | PASS do contrato local |

ADMIN-01/09/10/11 dependem do fluxo de navegador e estão sob verificação do outro agente/orquestrador. `src/admin/session.js:4-14` verifica usuário remoto e perfil ativo e encerra sessão local se não autorizado; o banco revalida privilégios em cada comando. Cliente público não persiste nem herda sessão administrativa (`src/catalog/repository.js:13-14`).

## Gates

- `npm test`: inicialmente 4/4; após a correção, reexecução independente da suíte em cópia isolada: **7/7 aprovados**, 0 ignorados.
- `npm run test:db`: 7/7 aprovados, 0 ignorados; PostgreSQL 18 local temporário.
- A primeira tentativa no sandbox falhou no `initdb` por `shmget: Operation not permitted`; a reexecução autorizada fora desse limite passou. Não é defeito do produto.
- Gate de build `npm run verify`: PASS na rodada inicial, 4 testes aprovados e build Vite aprovado (484 ms); nenhum erro. Build/DB após extração do core serão repetidos pelo orquestrador no gate integrado.
- Sem repositório Git neste diretório. Isolamento verificado por SHA-256 dos 8 arquivos copiados, antes/depois iguais. Nenhum arquivo real foi modificado pelo sensor. Código/testes adicionais de outros agentes não foram revertidos.

## Discrimination sensor

Rodada inicial: 11 mutações, 10 detectadas e 1 sobrevivente. Após correção: a mutação sobrevivente de edição foi detectada; também foi detectada a remoção do filtro da exclusão. **Resultado final: 12 comportamentos distintos discriminados, 0 sobreviventes pendentes (13 execuções incluindo a repetição).** Todas em cópias isoladas `/tmp`, com PostgreSQL local descartável quando necessário; nenhuma migração remota.

| Mutação | Arquivo:linha | Comportamento injetado | Resultado |
| --- | --- | --- | --- |
| M1-public-drafts | `supabase/migrations/202609050001_rj_catalog.sql:103` | Public draft leak | KILLED |
| M2-open-admin | `supabase/migrations/202609050001_rj_catalog.sql:12` | Nonadmin allowed to write | KILLED |
| M3-no-revocation | `supabase/migrations/202609050001_rj_catalog.sql:12` | Revoked profile retains write access | KILLED |
| M4-no-version-bump | `supabase/migrations/202609050001_rj_catalog.sql:89` | Stale version remains current | KILLED |
| M5-category-cascade | `supabase/migrations/202609050001_rj_catalog.sql:56` | Linked category deletion accepted | KILLED |
| M6-cross-bucket | `supabase/migrations/202609050001_rj_catalog.sql:115` | Admin may upload into another bucket | KILLED |
| M7-negative-integer | `src/catalog/model.js:29` | Negative price/order accepted | KILLED |
| M8-no-size-limit | `src/catalog/model.js:60` | Oversized media accepted | KILLED |
| M9-no-magic-check | `src/catalog/model.js:65` | Fake PNG accepted | KILLED |
| M10-no-repo-cas | `src/catalog/repository.js:46` → `src/catalog/repository-core.js:33` | Repository forgets expected version filter | SURVIVED inicial → KILLED após correção |
| M11-ignore-product-admin-policy | `supabase/migrations/202609050001_rj_catalog.sql:107` | Authenticated user gains all product writes | KILLED |
| M12-delete-CAS | `src/catalog/repository-core.js:38` | Remover filtro de versão da exclusão | KILLED |

### Evidência da revalidação

- `tests/repository.test.js:3` importa `createRepository` do módulo de produção real. O backend simulado aplica os filtros recebidos; a proteção não é inserida pelo teste.
- Baseline: 7 passed, 0 failed. Mutação da edição: 6 passed, 1 failed. Mutação da exclusão: 6 passed, 1 failed. Ambas falham em ADMIN-08 por rejeição esperada não ocorrer.
- Hashes SHA-256 de package/model/core e dois arquivos de teste iguais antes/depois. Nenhuma alteração na árvore real.
- Logs da revalidação: `/tmp/rj-security-reverify-nb505pip/`.
- ADMIN-09/10 têm evidência adicional em `tests/repository.test.js:36-38`: `assert.rejects` para ausência de cliente e erro de leitura `Banco indisponível`. ADMIN-05 também em :29: `assert.deepEqual(ids,['p1'])` exclui o rascunho.

## Limites e configuração

A suíte de banco usa PostgreSQL real e tabelas auxiliares locais que representam os schemas `auth` e `storage`. Confirma a execução SQL e RLS, mas não testa o serviço hospedado de Auth/Storage, quotas, envio HTTP ou uma instância Supabase remota. Não foram lidas credenciais nem alterados recursos remotos. A validação completa em produção depende da escolha/configuração do backend pelo usuário.

A verificação de mídia checa tamanho, MIME e assinatura inicial; não decodifica integralmente a imagem. O bucket aceita apenas PNG/JPEG/WebP e é público por projeto. Isso não constitui validação de documentos privados.

## Correção concluída e lição para relatório integrado

O teste de contrato foi adicionado e as duas mutações foram detectadas. Registrar a lição no relatório integrado: testes SQL de consultas escritas pelo teste não substituem teste da construção da consulta pelo cliente.
