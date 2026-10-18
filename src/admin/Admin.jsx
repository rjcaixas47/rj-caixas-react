import React, {useEffect, useState} from 'react';
import {adminClient, adminRepository, configured} from '../catalog/repository.js';
import {currentAdmin, signIn, signOut} from './session.js';
import {formatPrice} from '../catalog/model.js';
import {Field, ConfirmDialog, ErrorNotice} from './ui.jsx';
import {RecordEditor, SettingsEditor, TrackingEditor} from './Editors.jsx';
import './admin.css';

const names = {products:'Produtos', categories:'Categorias', banners:'Banners', settings:'Configurações', tracking:'Rastreamento'};
const singular = {products:'produto', categories:'categoria', banners:'banner'};
const descriptions = {products:'Cuide do que seus clientes encontram na loja.', categories:'Organize seus produtos em grupos fáceis de encontrar.', banners:'Troque as imagens de destaque da página inicial.', settings:'Atualize os textos e os contatos da sua empresa.', tracking:'Conecte o Google e a Meta para medir visitas e anúncios.'};
const formTabs = ['settings', 'tracking'];
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function Login({onLogin}) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [showPassword, setShowPassword] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {onLogin(await signIn(String(form.get('email')), String(form.get('password'))));}
    catch(err) {setError(err.message);}
    finally {setBusy(false);}
  }
  return <main className="rj-admin-login">
    <a href="/" className="rj-admin-brand"><img src="/assets/rj-logo.png" alt=""/>RJ Caixas</a>
    <div className="rj-admin-login-card"><span className="rj-admin-eyebrow">PAINEL DA LOJA</span><h1>Vamos cuidar da sua loja?</h1><p>Entre com o email e a senha que você recebeu para administrar a RJ Caixas.</p>
      <form onSubmit={submit}><fieldset disabled={busy}>
        <Field label="Email" name="email" type="email" autoComplete="username" placeholder="Seu email de acesso" required/>
        <Field label="Senha" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required/>
        <button className="rj-admin-text-button rj-admin-show-password" type="button" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</button>
      </fieldset><ErrorNotice message={error} hint=""/><button className="rj-admin-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar no painel'}</button></form>
      <details className="rj-admin-login-help"><summary>Precisa de ajuda para entrar?</summary><p>Use o email cadastrado para administrar a loja. Se não lembrar sua senha ou ainda não tiver acesso, peça ajuda à pessoa responsável pela configuração do site.</p></details>
      <a href="/">← Voltar à loja</a>
    </div>
  </main>;
}
function Setup() {
  return <main className="rj-admin-login"><a href="/" className="rj-admin-brand"><img src="/assets/rj-logo.png" alt=""/>RJ Caixas</a><div className="rj-admin-login-card rj-admin-setup"><span className="rj-admin-eyebrow">FALTA SÓ A ATIVAÇÃO</span><h1>Seu painel está quase pronto</h1><p>A conexão que guarda os produtos e as alterações ainda precisa ser ativada pela equipe responsável pelo site.</p><div className="rj-admin-setup-note"><strong>Você não precisa mexer em configurações técnicas.</strong><p>Depois da ativação, basta entrar com seu email e senha para começar.</p></div><a className="rj-admin-primary" href="/">Ver minha loja</a><details className="rj-admin-setup-details"><summary>Instruções para o responsável técnico</summary><ol><li>Aplicar a migração RJ no projeto Supabase escolhido.</li><li>Configurar URL e chave publicável em <code>.env.local</code>.</li><li>Criar o usuário e atribuir seu perfil administrativo.</li></ol><p>O passo a passo está no README do projeto. Use somente a chave publicável no frontend.</p></details></div></main>;
}
function QuickGuide() {
  return <details className="rj-admin-quick-guide"><summary><span>Primeira vez por aqui?</span> Veja como cuidar da sua loja</summary><ol><li><strong>1. Adicione um produto</strong><p>Preencha o nome, o preço e escolha uma foto do seu dispositivo.</p></li><li><strong>2. Confira a prévia</strong><p>Você pode guardar como rascunho e continuar mais tarde.</p></li><li><strong>3. Publique quando estiver pronto</strong><p>Escolha “Publicado”, salve e use “Abrir loja” para conferir.</p></li></ol></details>;
}

export default function Admin() {
  const [user, setUser] = useState(null), [checking, setChecking] = useState(true), [catalog, setCatalog] = useState(null);
  const [settingsGroup, setSettingsGroup] = useState(0);
  const [tab, setTab] = useState('products'), [edit, setEdit] = useState(null), [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState(''), [filter, setFilter] = useState('all'), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [working, setWorking] = useState(false), [confirmation, setConfirmation] = useState(null);
  useEffect(() => {
    if (!configured) {setChecking(false); return;}
    let alive = true;
    currentAdmin().then(u => {if(alive)setUser(u);}).catch(e => {if(alive)setError(e.message);}).finally(() => {if(alive)setChecking(false);});
    const {data:{subscription}} = adminClient.auth.onAuthStateChange(event => {if(event === 'SIGNED_OUT'){setUser(null);setCatalog(null);setEdit(null);setDirty(false);setConfirmation(null);}});
    return () => {alive=false; subscription.unsubscribe();};
  }, []);
  async function load() {
    // Rastreamento carrega à parte: se a migração dele faltar, o restante do painel continua funcionando.
    const [data, tracking] = await Promise.all([adminRepository.load(), adminRepository.loadTracking().catch(e => ({error:e.message}))]);
    const next = {...data, tracking}; setCatalog(next); return next;
  }
  useEffect(() => {if(user)load().catch(e => setError(e.message));}, [user]);
  useEffect(() => {const leave=event => {if(dirty){event.preventDefault();event.returnValue='';}}; window.addEventListener('beforeunload',leave);return () => window.removeEventListener('beforeunload',leave);}, [dirty]);
  function guardChanges(action) {
    if (working) return;
    if (!dirty) {action(); return;}
    setConfirmation({title:'Sair sem salvar?', message:'Você alterou algumas informações. Se continuar, essas alterações serão descartadas.', confirm:'Descartar alterações', cancel:'Continuar editando', action});
  }
  function navigate(next) {guardChanges(() => {setTab(next);setEdit(null);setDirty(false);setQuery('');setFilter('all');setNotice('');setError('');});}
  async function reloadAfterSave(success) {
    setNotice(success);
    try {await load(); setError('');}
    catch (e) {setError(`A alteração foi salva, mas não conseguimos atualizar a lista. Use “Atualizar lista”. ${e.message}`);}
  }
  async function save(record) {
    await adminRepository.save(tab, record);
    setDirty(false); setEdit(null);
    await reloadAfterSave(tab === 'products' ? record.status === 'draft' ? 'Alterações salvas. O produto está guardado como rascunho e ainda não aparece na loja.' : 'Alterações salvas. O produto está publicado. Abra a loja para conferir.' : tab === 'tracking' ? 'Rastreamento salvo. As tags carregam para quem aceitar os cookies na loja.' : 'Alterações salvas. Abra a loja para conferir.');
  }
  function remove(record) {
    setConfirmation({title:`Excluir ${singular[tab]}?`, message:`“${record.name}” será removido do catálogo. ${tab === 'products' ? 'Para apenas tirar da loja, edite e escolha Rascunho.' : 'Para apenas ocultar, edite e desmarque Exibir na loja.'}`, confirm:`Excluir ${singular[tab]}`, danger:true, action:async () => {
      await adminRepository.remove(tab, record);
      await reloadAfterSave('Cadastro excluído. Os demais itens continuam na loja.');
    }});
  }
  function importInitial() {
    setConfirmation({title:'Usar o catálogo de exemplo?', message:'Serão adicionados os 40 produtos e as imagens da referência visual. Revise os preços e as condições antes de usá-los na RJ. Os cadastros existentes serão mantidos.', confirm:'Adicionar exemplos', action:async () => {await adminRepository.importInitial();await reloadAfterSave('Exemplos adicionados. Revise os preços e as condições da RJ antes de divulgar.');}});
  }
  function logout() {guardChanges(async () => {try{await signOut();setUser(null);setCatalog(null);}catch(e){setError(e.message);}});}
  function startNew() {
    setEdit({id:crypto.randomUUID(),name:'',description:'',image:'',status:'draft',available:true,active:true,section:'boxes',sort_order:catalog[tab].length});setDirty(false);setNotice('');setError('');
  }
  if (!configured) return <div className="rj-admin"><Setup/></div>;
  if (checking) return <div className="rj-admin"><main className="rj-admin-login"><p role="status">Preparando seu painel…</p></main></div>;
  if (!user) return <div className="rj-admin"><ErrorNotice message={error} hint=""/><Login onLogin={u => {setError('');setUser(u);}}/></div>;
  const rows = (formTabs.includes(tab) ? [] : catalog?.[tab] || []).filter(row => normalize(row.name).includes(normalize(query)) && (filter === 'all' || row.status === filter));
  const filtered = Boolean(query || filter !== 'all');
  const published = catalog?.products.filter(p => p.status === 'published').length || 0;
  const clearFilters = () => {setQuery('');setFilter('all');};
  return <div className="rj-admin">
    <a className="sf-skip-link" href="#rj-admin-content">Ir para o conteúdo do painel</a>
    <aside className="rj-admin-sidebar"><a href="/" className="rj-admin-brand"><img src="/assets/rj-logo.png" alt=""/><span>RJ Caixas<small>Painel da loja</small></span></a>
      <nav aria-label="Administração">{Object.entries(names).map(([key,label]) => <button key={key} disabled={working} aria-current={key === tab ? 'page' : undefined} onClick={() => navigate(key)}>{label}{!formTabs.includes(key) && <span>{catalog?.[key]?.length ?? '—'}</span>}</button>)}</nav>
      <a className="rj-admin-view" href="/" target="_blank" rel="noopener noreferrer">Abrir loja ↗</a>
      <p className="rj-admin-sidebar-note">As mudanças aparecem na loja depois de salvar.</p>
      <div className="rj-admin-user"><small>{user.email}</small><button disabled={working} onClick={logout}>Sair da conta</button></div>
    </aside>
    <main className="rj-admin-main" id="rj-admin-content"><header className="rj-admin-header"><div><span className="rj-admin-eyebrow">SUA LOJA, DO SEU JEITO</span><h1>{names[tab]}</h1><p>{descriptions[tab]}</p></div>{!formTabs.includes(tab) && !edit && catalog && <button className="rj-admin-primary" disabled={working} onClick={startNew}>+ Adicionar {singular[tab]}</button>}</header>
      {error && <div className="rj-admin-error" role="alert">{error}<button disabled={working} onClick={() => guardChanges(() => load().then(() => {setError('');setEdit(null);setDirty(false);}).catch(e => setError(e.message)))}>Atualizar lista</button></div>}
      {notice && <div className="rj-admin-success" role="status"><span>{notice}</span><a href="/" target="_blank" rel="noopener noreferrer">Conferir na loja ↗</a></div>}
      {!catalog ? <p role="status">{error ? 'Tente atualizar a lista para continuar.' : 'Carregando seus produtos…'}</p> : tab === 'settings' ? <SettingsEditor group={settingsGroup} onGroupChange={setSettingsGroup} key={catalog.settingsVersion} data={catalog.settings} version={catalog.settingsVersion} onSave={save} dirty={dirty} onDirty={() => setDirty(true)} onWorking={setWorking}/> : tab === 'tracking' ? <TrackingEditor key={catalog.tracking.version ?? 'novo'} tracking={catalog.tracking} onSave={save} dirty={dirty} onDirty={() => setDirty(true)} onWorking={setWorking}/> : edit ? <RecordEditor key={edit.id} kind={tab} record={edit} categories={catalog.categories} onSave={save} onCancel={() => guardChanges(() => {setEdit(null);setDirty(false);})} dirty={dirty} onDirty={() => setDirty(true)} onWorking={setWorking}/> : <>
        {tab === 'products' && <><QuickGuide/><div className="rj-admin-overview" aria-label="Resumo dos produtos">{[['all',catalog.products.length,'Produtos no painel'],['published',published,'Publicados na loja'],['draft',catalog.products.length-published,'Rascunhos']].map(([key,count,label]) => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}><strong>{count}</strong><span>{label}</span></button>)}</div></>}
        <div className="rj-admin-toolbar"><Field label={`Buscar ${singular[tab]}`} type="search" value={query} placeholder="Digite o nome…" onChange={e => setQuery(e.target.value)}/>{tab === 'products' && <Field label="Publicação"><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Todos os produtos</option><option value="published">Publicados</option><option value="draft">Rascunhos</option></select></Field>}{filtered && <button type="button" className="rj-admin-text-button" onClick={clearFilters}>Limpar filtros</button>}</div>
        <p className="rj-admin-results-count">{rows.length} {rows.length === 1 ? 'item encontrado' : 'itens encontrados'}</p>
        <div className="rj-admin-table-wrap"><table><thead><tr><th scope="col">{names[tab]}</th>{tab === 'products' && <th scope="col">Preço</th>}<th scope="col">Na loja</th><th scope="col">Posição</th><th scope="col">Ações</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}>
          <td><div className="rj-admin-row-name"><img src={row.image} alt=""/><strong>{row.name}</strong></div></td>
          {tab === 'products' && <td data-label="Preço">{formatPrice(row.price_cents)}</td>}
          <td data-label="Na loja"><span className={`rj-admin-badge${row.status === 'published' || row.active ? ' is-live' : ''}`}>{tab === 'products' ? row.status === 'published' ? 'Publicado' : 'Rascunho' : row.active ? 'Visível' : 'Oculto'}</span></td>
          <td className="rj-admin-order-cell" data-label="Posição">{row.sort_order}</td>
          <td className="rj-admin-actions-cell"><div className="rj-admin-actions"><button onClick={() => {setEdit(row);setNotice('');setError('');}} aria-label={`Editar ${row.name}`}>Editar</button><button className="rj-admin-danger" onClick={() => remove(row)} aria-label={`Excluir ${row.name}`}>Excluir</button></div></td>
        </tr>)}</tbody></table>
          {!rows.length && <div className="rj-admin-empty"><h2>{filtered ? 'Nenhum item com esse filtro' : `Adicione ${tab === 'categories' ? 'sua primeira categoria' : 'seu primeiro '+singular[tab]}`}</h2><p>{filtered ? 'Tente outro nome ou limpe os filtros para ver todos os itens.' : `Comece com um nome e uma imagem. Você pode ajustar os detalhes depois.`}</p>{filtered ? <button onClick={clearFilters}>Limpar filtros</button> : <button className="rj-admin-primary" onClick={startNew}>Adicionar {singular[tab]}</button>}{!filtered && tab === 'products' && !catalog.products.length && <details className="rj-admin-import"><summary>Prefere começar com exemplos?</summary><p>Revise os preços e as condições antes de usar o catálogo de referência.</p><button onClick={importInitial}>Adicionar catálogo de exemplo</button></details>}</div>}
        </div>
      </>}
    </main>
    {confirmation && <ConfirmDialog request={confirmation} onClose={() => setConfirmation(null)}/>}
  </div>;
}
