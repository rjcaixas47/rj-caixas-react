import React, {useState} from 'react';
import {siMeta, siGoogleanalytics, siGoogleads, siGoogletagmanager} from 'simple-icons';
import {trackingFields, trackingError, validateTracking, validateTrackingOptions} from '../catalog/model.js';
import {extractTrackingSnippet} from '../tracking/snippets.js';
import {Field, ErrorNotice} from './ui.jsx';
import './tracking.css';

const providers = [
 ['meta_pixel_id',siMeta,'Meta Pixel','Facebook e Instagram','Meça visitas e cliques nos botões de WhatsApp.','ID do Pixel','Gerenciador de Eventos → Fontes de dados → Configurações.','https://business.facebook.com/events_manager2/'],
 ['ga4_id',siGoogleanalytics,'Google Analytics','Analytics 4','Acompanhe as visitas e os cliques de contato da página.','ID da métrica GA4','Administrador → Fluxos de dados → seu site.','https://analytics.google.com/'],
 ['google_ads_id',siGoogleads,'Google Ads','Campanhas e conversões','Conecte sua tag e meça contatos vindos dos anúncios.','ID da tag do Google Ads','Metas → Conversões → sua ação → Configuração da tag.','https://ads.google.com/'],
 ['gtm_id',siGoogletagmanager,'Google Tag Manager','Gerenciador de tags','Gerencie outras tags pelo seu próprio contêiner.','ID do contêiner GTM','O ID aparece no topo do seu contêiner.','https://tagmanager.google.com/'],
];

export default function TrackingEditor({tracking, onSave, onDirty, dirty, onWorking, onReset}) {
 const [form,setForm] = useState(() => ({...tracking.data,options:validateTrackingOptions(tracking.data?.options)}));
 const [busy,setBusy] = useState(false), [error,setError] = useState(''), [message,setMessage] = useState('');
 const [snippet,setSnippet] = useState(''), [importOpen,setImportOpen] = useState(false), [checked,setChecked] = useState(false);
 const [section,setSection] = useState('integrations');
 if (tracking.error) return <ErrorNotice message={tracking.error} hint="As outras áreas do painel continuam funcionando normalmente."/>;
 const options = form.options;
 const change = update => {onDirty();setChecked(false);setMessage('');setForm(old => typeof update === 'function' ? update(old) : ({...old,...update}));};
 const option = (key,value) => change(old => ({...old,options:{...old.options,[key]:value}}));
 const toggle = key => option('disabled',options.disabled.includes(key) ? options.disabled.filter(item => item !== key) : [...options.disabled,key]);
 const active = key => !options.disabled.includes(key) && Boolean(form[key]?.trim());
 const count = providers.filter(([key]) => active(key)).length;
 const mixed = active('gtm_id') && providers.some(([key]) => key !== 'gtm_id' && active(key));
 function validate() {
  try {validateTracking(form);if(options.google_ads_label && !form.google_ads_id?.trim())throw Error('Preencha o ID do Google Ads para usar o rótulo de conversão.');setError('');return true;}
  catch(err) {setError(err.message);return false;}
 }
 async function submit(event) {
  event.preventDefault();if(!validate())return;
  setBusy(true);onWorking(true);
  try {await onSave({data:form,version:tracking.version});}
  catch(err) {setError(err.message);}
  finally {setBusy(false);onWorking(false);}
 }
 function importCode() {
  try {
   const result = extractTrackingSnippet(snippet);
   const {google_ads_label,...ids} = result;
   change(old => ({...old,...ids,options:{...old.options,...(google_ads_label ? {google_ads_label} : {}),disabled:old.options.disabled.filter(key => !Object.hasOwn(ids,key))}}));
   setError('');setSnippet('');setImportOpen(false);setMessage('Código reconhecido. Confira os IDs abaixo e salve para aplicar.');
  } catch(err) {setError(err.message);}
 }
 function addCode() {
  option('custom_codes',[...options.custom_codes,{id:crypto.randomUUID(),name:'',code:'',category:'marketing',enabled:true}]);
 }
 function editCode(id,patch) {option('custom_codes',options.custom_codes.map(item => item.id === id ? {...item,...patch} : item));}
 function discard() {setForm({...tracking.data,options:validateTrackingOptions(tracking.data?.options)});setError('');setMessage('');setChecked(false);onReset();}
 return <form onSubmit={submit} className="rj-tracking">
  <div className="rj-track-banner"><div><span className="rj-admin-eyebrow">MARKETING & MENSURAÇÃO</span><h2>Suas campanhas, conectadas.</h2><p>Adicione seus códigos uma vez. Gerencie tudo por aqui.</p></div><span className="rj-track-summary"><strong>{count.toString().padStart(2,'0')}</strong> de 04 integrações configuradas</span></div>
  <div className="rj-track-tabs" role="group" aria-label="Áreas de rastreamento">{[['integrations','Integrações'],['custom','HTML personalizado'],['help','Como testar']].map(([key,label]) => <button key={key} type="button" aria-pressed={section === key} onClick={() => setSection(key)} disabled={busy}>{label}{key === 'custom' && options.custom_codes.length > 0 && <small>{options.custom_codes.length}</small>}</button>)}</div>
  <ErrorNotice message={error}/>
  {message && <div role="status" className="rj-admin-success">{message}</div>}
  <fieldset disabled={busy}>
   {section === 'integrations' && <>
    <div className="rj-track-section-heading"><div><h3>Conecte suas ferramentas</h3><p>Informe o ID ou importe o código de instalação.</p></div><button type="button" onClick={() => setImportOpen(value => !value)} aria-expanded={importOpen}>＋ Colar código de instalação</button></div>
    {importOpen && <section className="rj-admin-card rj-track-import"><Field label="Código de instalação" hint="Cole o trecho oficial da Meta, Google Analytics, Google Ads ou GTM. Extraímos os IDs sem executar o código."><textarea rows={6} value={snippet} onChange={event => setSnippet(event.target.value)} spellCheck={false} maxLength={30000} placeholder="<script>…</script>"/></Field><button type="button" className="rj-admin-primary" onClick={importCode} disabled={!snippet.trim()}>Identificar e preencher</button><button type="button" onClick={() => {setImportOpen(false);setSnippet('');}}>Cancelar</button></section>}
    {mixed && <div className="rj-admin-inline-tip" role="note">GTM e integrações diretas estão preenchidos. Se a mesma ferramenta estiver no GTM, desative sua integração direta para evitar eventos duplicados. No GTM, configure as verificações de consentimento de cada tag.</div>}
    <div className="rj-track-grid">{providers.map(([key,icon,title,subtitle,description,label,hint,url]) => <section className="rj-admin-card rj-track-provider" key={key}>
     <div className="rj-track-provider-heading"><span className={`rj-track-icon is-${key}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path}/></svg></span><div><h3>{title}</h3><p>{subtitle}</p></div><span className={`rj-track-state ${active(key) ? 'is-ready' : ''}`}>{options.disabled.includes(key) ? 'Pausado' : active(key) ? 'Configurado' : 'Não configurado'}</span></div>
     <p className="rj-track-description">{description}</p>
     <Field label={label} hint={hint} value={form[key] || ''} placeholder={trackingFields[key].example} onChange={event => change({[key]:event.target.value})} autoComplete="off" spellCheck={false} maxLength={100} aria-invalid={Boolean(form[key] && trackingError(key,form[key])) || undefined}/>
     {key === 'meta_pixel_id' && <p className="rj-track-note">Use o ID numérico do Pixel. O token privado da API de Conversões não é necessário e não deve ser colado aqui.</p>}
     {key === 'google_ads_id' && <Field label="Rótulo da conversão de WhatsApp (opcional)" hint="Em AW-123456789/AbC_deF, copie somente AbC_deF. Sem rótulo, a tag carrega sem disparar essa conversão." value={options.google_ads_label} onChange={event => option('google_ads_label',event.target.value)} placeholder="AbC_deF123" autoComplete="off" maxLength={100}/>}
     {key === 'gtm_id' && <p className="rj-track-note">Prefira os modelos oficiais. Tags que exigem JavaScript inline no site principal permanecem bloqueadas.</p>}
     <div className="rj-track-provider-footer"><a href={url} target="_blank" rel="noopener noreferrer">Abrir plataforma ↗</a><button type="button" role="switch" aria-checked={!options.disabled.includes(key)} aria-label={`Ativar ${title}`} onClick={() => toggle(key)}><span aria-hidden="true"/>{options.disabled.includes(key) ? 'Pausado' : 'Ativado'}</button></div>
    </section>)}</div>
   </>}
   {section === 'custom' && <>
    <div className="rj-track-section-heading"><div><h3>Códigos HTML personalizados</h3><p>Adicione, pause ou remova códigos sem chamar a equipe.</p></div><button type="button" onClick={addCode} disabled={options.custom_codes.length >= 10}>＋ Adicionar código</button></div>
    <div className="rj-admin-inline-tip">Use as integrações para Pixel, Analytics, Ads e GTM. Os outros códigos são executados em uma área isolada após o consentimento, sem acesso ao painel ou aos cookies da página principal. Scripts que dependem desses cookies devem ser configurados nas integrações ou no GTM. Nunca insira senhas ou tokens privados.</div>
    {!options.custom_codes.length && <div className="rj-admin-card rj-track-empty"><span aria-hidden="true">&lt;/&gt;</span><h3>Espaço para os seus códigos</h3><p>Organize cada integração por nome e categoria de consentimento.</p><button type="button" onClick={addCode}>Adicionar primeiro código</button></div>}
    {options.custom_codes.map((item,index) => <section className="rj-admin-card rj-track-custom" key={item.id}><div className="rj-track-section-heading"><h3>Código {String(index+1).padStart(2,'0')}</h3><button type="button" className="rj-admin-danger" onClick={() => option('custom_codes',options.custom_codes.filter(code => code.id !== item.id))} aria-label={`Remover código ${index+1}`}>Remover</button></div><div className="rj-track-grid"><Field label={`Nome do código ${index+1}`} value={item.name} placeholder="Ex.: Ferramenta de anúncios" maxLength={100} required onChange={event => editCode(item.id,{name:event.target.value})}/><Field label={`Consentimento do código ${index+1}`}><select value={item.category} onChange={event => editCode(item.id,{category:event.target.value})}><option value="marketing">Marketing</option><option value="analytics">Análise</option></select></Field></div><Field label={`HTML do código ${index+1}`} hint={`${item.code.length.toLocaleString('pt-BR')} / 12.000 caracteres. O código só executa na loja, depois de salvar e obter consentimento.`}><textarea rows={8} value={item.code} onChange={event => editCode(item.id,{code:event.target.value})} placeholder="<!-- Cole seu HTML e scripts aqui -->" spellCheck={false} maxLength={12000} required/></Field><label className="rj-track-checkbox"><input type="checkbox" checked={item.enabled} onChange={event => editCode(item.id,{enabled:event.target.checked})}/>Ativar este código</label></section>)}
   </>}
   {section === 'help' && <section className="rj-admin-card rj-track-help"><span className="rj-admin-eyebrow">DO PAINEL À SUA CAMPANHA</span><h3>Confira a instalação em três passos</h3><ol><li><strong>Confira e salve</strong><p>Use “Verificar configuração” para conferir os formatos. Depois salve. “Configurado” indica que o ID foi preenchido; não confirma o recebimento de eventos na plataforma.</p></li><li><strong>Abra a loja e aceite os cookies</strong><p>As tags ficam desativadas antes da escolha. Marketing libera Meta e Ads; Análise libera o Analytics. Use “Preferências de cookies” no rodapé para mudar a escolha.</p></li><li><strong>Confira nas suas ferramentas</strong><p>Use o Tag Assistant do Google e “Testar eventos” da Meta. A página envia PageView à Meta e page_view ao Analytics. Cliques no WhatsApp enviam Contact à Meta, whatsapp_click ao Analytics e ao GTM, e a conversão do Ads quando há rótulo.</p></li></ol><p>O clique indica intenção de contato; não confirma mensagem enviada, lead ou venda. Bloqueadores do navegador podem impedir as tags.</p><div className="rj-track-help-links"><a className="rj-admin-primary" href="/" target="_blank" rel="noopener noreferrer">Abrir loja ↗</a><a href="https://tagassistant.google.com/" target="_blank" rel="noopener noreferrer">Google Tag Assistant ↗</a><a href="https://business.facebook.com/events_manager2/" target="_blank" rel="noopener noreferrer">Testar eventos da Meta ↗</a></div></section>}
  </fieldset>
  <div className="rj-admin-savebar rj-track-savebar"><span className={dirty ? 'has-changes' : ''}>{dirty ? 'Alterações ainda não salvas' : 'Sua configuração está salva'}<small>{checked ? 'Formatos válidos. O recebimento dos eventos deve ser conferido nas plataformas.' : 'As mudanças entram em vigor após salvar e recarregar a loja.'}</small></span><div><button type="button" disabled={busy} onClick={() => {if(validate()){setChecked(true);setMessage('Formatos e campos conferidos. Salve para aplicar as alterações.');}}}>Verificar configuração</button>{dirty && <button type="button" onClick={discard} disabled={busy}>Descartar</button>}<button className="rj-admin-primary" disabled={busy || (Boolean(tracking.version) && !dirty)}>{busy ? 'Salvando…' : 'Salvar rastreamento'}</button></div></div>
 </form>;
}
