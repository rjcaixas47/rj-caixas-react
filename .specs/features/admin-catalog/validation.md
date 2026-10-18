# Admin RJ Caixas Validation

**Verdict: PASS na implementação e nos testes locais. Ativação remota pendente.**

**Date**: 2026-09-05
**Spec**: .specs/features/admin-catalog/spec.md
**Diff range**: comparação de arquivos com /tmp/rj-caixas-work; a pasta Open Design não era um repositório Git. Referência Git consultada: Greed9797/lp-originally@de972def0ba34b8acb82855e7faa0d2b24419edc.
**Verifier**: revisores independentes security_verification e integration_review; relatórios originais preservados junto deste arquivo. Consolidação de evidências pelo autor.

## Resultado

- Contratos/repositório: 7/7 aprovados; banco PostgreSQL local: 7/7 aprovados; 0 pulados.
- Build Vite aprovado. Admin separado em chunk carregado sob demanda.
- Revisão SQL: sem bypass identificado; 12 mutações de comportamento detectadas após reforçar o teste CAS.
- Browser com API interceptada: login inválido/válido, novo produto, preço em centavos, reload, rascunho oculto, publicação, falha preservando formulário, configurações, WhatsApp, categorias, banners, excluir e sair. Estado final confirmado em leitura independente: 40 produtos, 7 categorias, 5 banners e tela de login visível.
- 1280px: 40 cards e 45 ícones Simple Icons; faixa 74.796875px. 390px: faixa 64px e sem overflow. Painel mobile com tabela rolável contida.
- Regressões adicionais: detalhes atualizam preço/descrição ao voltar à aba; despublicação fecha modal; aviso 2 torna-se visível.

## Limites

Não foi escolhido/configurado Supabase da RJ. Nenhuma migração, usuário, upload, deploy ou alteração de dados foi efetuada remotamente. Auth/Storage no teste SQL são superfícies mínimas simuladas; o PostgreSQL e suas políticas são reais. Interface exercita SDK oficial contra API de teste interceptada. Verificação final nos serviços gerenciados depende da configuração e autorização do destino. Isso não é aprovação para produção.

## Evidências por requisito

| Requisito | Evidência | Resultado |
| --- | --- | --- |
| ADMIN-01 | tests/browser-check.js, login inválido/válido e 40 linhas; tests/database.test.js perfil | PASS local, Auth gerenciado pendente |
| ADMIN-02 | tests/database.test.js visitante, comum, autopromoção, revogação; security-validation.md | PASS SQL |
| ADMIN-03 | tests/repository.test.js e browser-check.js preço12345→15000 e novo registro | PASS local |
| ADMIN-04 | tests/repository.test.js CAS exclusão e browser-check.js confirmação | PASS local |
| ADMIN-05 | tests/database.test.js rascunho + browser-refresh-check.js remoção | PASS local |
| ADMIN-06 | browser-check.js configurações/categorias/banners e browser-refresh-check.js avisos | PASS local |
| ADMIN-07 | model.test.js, database.test.js e formulário após503 | PASS local |
| ADMIN-08 | repository.test.js:19-25, sensor save/remove em security-validation.md | PASS local |
| ADMIN-09 | repository.test.js falha sem fallback | PASS local |
| ADMIN-10 | browser-check.js:7 tela de configuração, repository.test.js sem cliente | PASS |
| ADMIN-11 | browser-check.js:94 e :98, screenshots output/playwright | PASS |
| ADMIN-12 | model.test.js assinatura/MIME/tamanho, database.test.js bucket/RLS | PASS contratos/SQL; upload gerenciado pendente |

## Asserções localizadas

| Arquivo:linha | Asserção (cada teste identifica o requisito correspondente) |
| --- | --- |
| `tests/model.test.js:6` | `assert.equal(parsePrice('31,50'),3150); assert.equal(parsePrice('1.250,99'),125099); assert.equal(parsePrice(''),null);` |
| `tests/model.test.js:7` | `for(const input of ['-1','12abc','1,234','Infinity','1.2.3']) assert.throws(()=>parsePrice(input));` |
| `tests/model.test.js:8` | `const row=validateRecord('products',product); assert.equal(row.price_cents,3150); assert.equal(row.status,'draft');` |
| `tests/model.test.js:11` | `for(const patch of [{name:''},{price_cents:-1},{price_cents:1.5},{section:'other'},{status:'admin'},{image:'javascript:alert(1)'},{image:'//host/x'},{sort_order:-1}]) assert.throws(()=>validateRecord('products',{...product,...patch}));` |
| `tests/model.test.js:12` | `assert.equal(validateRecord('products',{...product,role:'admin'}).role,undefined);` |
| `tests/model.test.js:13` | `assert.throws(()=>validateRecord('settings',{whatsapp_url:'https://evil.test'}));` |
| `tests/model.test.js:14` | `assert.throws(()=>validateRecord('banners',{id:'b',name:'Banner',image:'/assets/b.png',href:'javascript:alert(1)'}));` |
| `tests/model.test.js:17` | `assert.equal(whatsappLink({whatsapp_url:'https://wa.me/message/ABC',whatsapp_message:'oi'},'Caixa'),'https://wa.me/message/ABC');` |
| `tests/model.test.js:19` | `assert.equal(url.searchParams.get('text'),'Olá\nProduto: Caixa A');` |
| `tests/model.test.js:24` | `assert.equal(await validateImageFile(good),'png');` |
| `tests/model.test.js:25` | `await assert.rejects(()=>validateImageFile({...good,size:5*1024*1024+1}));` |
| `tests/model.test.js:26` | `await assert.rejects(()=>validateImageFile({...good,type:'image/svg+xml'}));` |
| `tests/model.test.js:27` | `await assert.rejects(()=>validateImageFile({...good,slice:()=>new Blob(['not an image'])}));` |
| `tests/repository.test.js:19` | `await assert.rejects(()=>repo.save('products',{...product,version:1,name:'Nome antigo'}),/versão mais recente/);` |
| `tests/repository.test.js:20` | `assert.equal(client.tables.rj_products[0].name,'Caixa atual');assert.equal(client.tables.rj_products[0].version,2);` |
| `tests/repository.test.js:21` | `await assert.rejects(()=>repo.remove('products',{id:'p1',version:1}),/versão mais recente/);` |
| `tests/repository.test.js:22` | `assert.equal(client.tables.rj_products.length,1);` |
| `tests/repository.test.js:24` | `assert.equal(saved.version,3);assert.equal(client.tables.rj_products[0].price_cents,9900);` |
| `tests/repository.test.js:25` | `await repo.remove('products',{id:'p1',version:3});assert.equal(client.tables.rj_products.length,0);` |
| `tests/repository.test.js:29` | `assert.deepEqual((await repo.load(true)).products.map(p=>p.id),['p1']);` |
| `tests/repository.test.js:31` | `assert.equal(saved.name,'Nova caixa');assert.equal(saved.price_cents,null);assert.equal(saved.version,1);` |
| `tests/repository.test.js:32` | `await assert.rejects(()=>repo.save('products',{...product,id:'new',version:undefined}),/já existe/);` |
| `tests/repository.test.js:33` | `assert.equal(client.tables.rj_products.filter(p=>p.id==='new').length,1);` |
| `tests/repository.test.js:36` | `const repo=createRepository(null,{});await assert.rejects(()=>repo.load(),/Conecte o Supabase/);await assert.rejects(()=>repo.save('products',product),/Conecte o Supabase/);` |
| `tests/repository.test.js:38` | `await assert.rejects(()=>createRepository(bad,{}).load(),/Banco indisponível/);` |
| `tests/database.test.js:21` | `const read=as('anon','','select string_agg(id,\',\') from rj_products');assert.match(read,/\npub\n/);assert.doesNotMatch(read,/draft/);` |
| `tests/database.test.js:22` | `assert.throws(()=>as('anon','',"insert into rj_products(id,name,image) values('x','X','/x.png')"));` |
| `tests/database.test.js:23` | `assert.throws(()=>as('anon','',"update rj_products set name='X' where id='pub'"));` |
| `tests/database.test.js:24` | `assert.throws(()=>as('anon','',"delete from rj_products where id='pub'"));` |
| `tests/database.test.js:27` | `assert.throws(()=>as('authenticated',normal,`insert into rj_admin_profiles values('${normal}',true)`));` |
| `tests/database.test.js:28` | `assert.throws(()=>as('authenticated',normal,"insert into rj_products(id,name,image) values('x','X','/x.png')"));` |
| `tests/database.test.js:29` | `assert.match(as('authenticated',normal,"update rj_products set name='X' where id='pub'; select name from rj_products where id='pub'"),/Publicado/);` |
| `tests/database.test.js:30` | `assert.match(as('authenticated',normal,"delete from rj_products where id='pub'; select count(*) from rj_products"),/\n1\n/);` |
| `tests/database.test.js:33` | `assert.match(as('authenticated',admin,"select count(*) from rj_products"),/\n2\n/);` |
| `tests/database.test.js:35` | `assert.match(out,/Caixa editada\/Descrição nova\/5200\/2/);assert.match(out,/UPDATE 0/);assert.match(out,/DELETE 1\n0/);` |
| `tests/database.test.js:39` | `assert.throws(()=>as('authenticated',normal,`insert into ${table}(${fields}) values(${values})`));` |
| `tests/database.test.js:40` | `assert.match(as('authenticated',admin,`insert into ${table}(${fields}) values(${values}); select count(*) from ${table}`),/INSERT 0 1\n1/);` |
| `tests/database.test.js:44` | `for(const change of ["price_cents=-1","image='javascript:alert(1)'","status='owner'"])assert.throws(()=>as('authenticated',admin,`update rj_products set ${change} where id='pub'`));` |
| `tests/database.test.js:45` | `assert.throws(()=>as('authenticated',admin,`insert into rj_settings(data) values('{"brand_name":"RJ","whatsapp_url":"https://evil.test"}')`));` |
| `tests/database.test.js:46` | `assert.throws(()=>as('authenticated',admin,"insert into rj_categories(id,name,image) values('cat','Categoria','/c.png'); update rj_products set category_id='cat' where id='pub'; delete from rj_categories where id='cat'"));` |
| `tests/database.test.js:49` | `assert.throws(()=>as('authenticated',normal,"insert into storage.objects(bucket_id,name) values('rj-media','abc.png')"));` |
| `tests/database.test.js:50` | `assert.throws(()=>as('authenticated',admin,"insert into storage.objects(bucket_id,name) values('other','abc.png')"));` |
| `tests/database.test.js:51` | `assert.throws(()=>as('authenticated',admin,"insert into storage.objects(bucket_id,name) values('rj-media','abc.svg')"));` |
| `tests/database.test.js:52` | `assert.match(as('authenticated',admin,"insert into storage.objects(bucket_id,name) values('rj-media','abc.png'); select count(*) from storage.objects"),/INSERT 0 1\n1/);` |
| `tests/database.test.js:53` | `assert.equal(sql("select file_size_limit from storage.buckets where id='rj-media'"),'5242880');` |
| `tests/database.test.js:57` | `assert.throws(()=>as('authenticated',admin,"insert into rj_products(id,name,image) values('x','X','/x.png')"));` |
| `tests/browser-check.js:7` | `assert(await page.getByRole('heading',{name:'Conecte o banco da loja'}).isVisible(),'ADMIN-10 configuração ausente deve fechar o painel');` |
| `tests/browser-check.js:56` | `assert(await page.locator('tbody tr').count()===40,'ADMIN-01 catálogo inicial no painel');` |
| `tests/browser-check.js:65` | `assert(created?.price_cents===12345&&created?.status==='draft','ADMIN-03 preço e rascunho persistidos');` |
| `tests/browser-check.js:68` | `assert(await page.locator(`[data-product-id="${savedProductId}"]`).count()===0,'ADMIN-05 rascunho oculto');` |
| `tests/browser-check.js:76` | `assert(await page.getByLabel('Preço (R$)',{exact:true}).inputValue()==='150,00','ADMIN-07 erro preserva formulário');` |
| `tests/browser-check.js:79` | `assert((await page.locator(`[data-product-id="${savedProductId}"]`).textContent()).includes('150,00'),'ADMIN-03 preço aparece na loja');` |
| `tests/browser-check.js:85` | `assert(state.settings.boxes_title==='Caixas RJ editadas','ADMIN-06 configurações gravadas');` |
| `tests/browser-check.js:87` | `assert((await page.locator('.rj-card-whatsapp').first().getAttribute('href')).startsWith('https://wa.me/554799039545?text='),'ADMIN-06 WhatsApp atualizado');` |
| `tests/browser-check.js:89` | `assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),'ADMIN-11 sem overflow mobile');` |
| `tests/browser-check.js:93` | `assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),'ADMIN-11 painel sem overflow mobile');` |
| `tests/browser-check.js:99` | `assert(!state.products.some(p=>p.id===savedProductId),'ADMIN-04 cadastro excluído');` |
| `tests/browser-check.js:105` | `assert(state.categories.some(c=>c.name==='Categoria de teste'&&c.active),'ADMIN-06 categoria persistida');` |
| `tests/browser-check.js:112` | `assert(state.banners.some(b=>b.name==='Banner de teste'&&b.href==='#rj-caixas-title'),'ADMIN-06 banner persistido');` |
| `tests/browser-check.js:114` | `assert(errors.length===0,'Erros JS: '+errors.join('; '));` |
| `tests/browser-refresh-check.js:10` | `assert((await page.locator('.rj-product').textContent()).includes('Descrição atualizada em outra aba'),'Detalhes devem usar os dados mais recentes');` |
| `tests/browser-refresh-check.js:13` | `assert(await page.locator(`[data-product-id="${id}"]`).count()===0,'Produto despublicado deve sair do catálogo e fechar detalhes');` |
| `tests/browser-refresh-check.js:15` | `assert(await page.locator('.sf-announcements__item.is-active').textContent()==='Caixas sob medida para seu negócio','Segundo aviso precisa ser alcançável');` |
