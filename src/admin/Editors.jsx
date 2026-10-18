import React, {useState} from 'react';
import {formatPrice, parsePrice, priceInput, settingsFields, safeUrl, trackingFields, trackingError} from '../catalog/model.js';
import {Field, MediaField, ErrorNotice} from './ui.jsx';
const singular = {products:'produto', categories:'categoria', banners:'banner'};

export function RecordEditor({kind, record, categories, onSave, onCancel, onDirty, dirty, onWorking}) {
  const [form, setForm] = useState({...record, price:priceInput(record.price_cents), comparePrice:priceInput(record.compare_at_cents)});
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false), [error, setError] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const set = (key, value) => {onDirty(); setForm(old => ({...old, [key]:value, ...(key === 'image' ? {image_srcset:''} : {})}));};
  const field = (key, label, props={}) => <Field label={label} value={form[key] ?? ''} onChange={e => set(key, e.target.value)} {...props}/>;
  const uploadingChanged = value => {setUploading(value); onWorking(value); if(value)onDirty();};
  const priceChanged = form.price !== priceInput(record.price_cents) && (form.unit_label || form.payment_note);
  let previewPrice = 'Confira o preço';
  try {previewPrice = formatPrice(parsePrice(form.price));} catch { /* A orientação completa aparece ao salvar. */ }
  async function submit(event) {
    event.preventDefault(); setBusy(true); onWorking(true); setError('');
    try {
      if (!form.image.trim()) throw Error(`Escolha uma imagem para ${kind === 'products' ? 'o produto' : 'este cadastro'} antes de salvar.`);
      safeUrl(form.image, {empty:false});
      const data = kind === 'products' ? {...form, price_cents:parsePrice(form.price), compare_at_cents:parsePrice(form.comparePrice)} : form;
      await onSave(data);
    } catch(err) {setError(err.message);}
    finally {setBusy(false); onWorking(false);}
  }
  return <form className="rj-admin-editor" onSubmit={submit}>
    <div className="rj-admin-editor-heading"><div><h2>{record.version ? `Editar ${singular[kind]}` : `Adicionar ${singular[kind]}`}</h2><p>Preencha as informações e confira antes de salvar.</p></div><button type="button" onClick={onCancel} disabled={busy || uploading}>← Voltar à lista</button></div>
    <ErrorNotice message={error}/>
    <fieldset disabled={busy || uploading}>
      <div className="rj-admin-form-grid">
        <div className="rj-admin-editor-sections">
          <section className="rj-admin-card"><h3><span className="rj-admin-step">1</span> {kind === 'products' ? 'Sobre o produto' : 'Informações principais'}</h3>
            {field('name', 'Nome', {required:true, maxLength:200, placeholder:kind === 'products' ? 'Ex.: Caixa de papelão 24 × 20 × 8 cm' : 'Digite um nome fácil de reconhecer', autoFocus:true})}
            {kind !== 'banners' && <Field label="Descrição" hint={kind === 'products' ? 'Conte as medidas, o material e para que o produto serve.' : 'Explique quais produtos pertencem a este grupo.'}><textarea value={form.description || ''} maxLength={6000} rows="4" onChange={e => set('description', e.target.value)}/></Field>}
            {kind === 'products' && <>
              {field('price', 'Preço (R$)', {inputMode:'decimal', placeholder:'Ex.: 31,50', hint:'Informe o valor do pacote. Deixe vazio para mostrar “Sob consulta”.'})}
              {field('pack', 'Pacote / quantidade', {placeholder:'Ex.: pacote com 25 unidades', hint:'Explique a quantidade incluída no preço acima.'})}
              {priceChanged && <div className="rj-admin-inline-tip">O preço mudou. Confira também o texto por unidade e a condição comercial em <button type="button" onClick={() => setAdvanced(true)}>Mais detalhes</button>.</div>}
              <Field label="Categoria" hint="Agrupe produtos semelhantes para facilitar a busca."><select value={form.category_id || ''} onChange={e => set('category_id', e.target.value || null)}><option value="">Sem categoria</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            </>}
            {kind === 'banners' && field('href', 'Link ao clicar', {placeholder:'Ex.: https://…', hint:'Opcional. Escolha a página que a pessoa verá ao tocar no banner.'})}
          </section>
          <section className="rj-admin-card"><h3><span className="rj-admin-step">2</span> Onde aparece na loja</h3>
            {kind === 'products' ? <>
              <Field label="Vitrine" hint="Escolha em qual faixa da página inicial o produto aparece."><select value={form.section} onChange={e => set('section', e.target.value)}><option value="boxes">Caixas</option><option value="envelopes">Envelopes</option></select></Field>
              <Field label="Publicação" hint="Rascunhos ficam guardados no painel. Publique quando estiver tudo pronto."><select value={form.status} onChange={e => set('status', e.target.value)}><option value="draft">Rascunho — ainda não aparece na loja</option><option value="published">Publicado — aparece na loja</option></select></Field>
              <label className="rj-admin-check"><input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)}/><span>Disponível para orçamento<small>Desmarque para mostrar que o produto está indisponível.</small></span></label>
            </> : <label className="rj-admin-check"><input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)}/><span>Exibir na loja<small>Desmarque para ocultar sem apagar o cadastro.</small></span></label>}
          </section>
          <details className="rj-admin-card rj-admin-advanced" open={advanced} onToggle={e => setAdvanced(e.currentTarget.open)}><summary>Mais detalhes <small>Opcional</small></summary><div>
            {kind === 'products' && <>
              {field('comparePrice', 'Preço anterior (R$)', {inputMode:'decimal', hint:'Use apenas se quiser exibir um preço anterior na vitrine.'})}
              {field('unit_label', 'Texto de preço por unidade', {placeholder:'Ex.: R$ 1,26 por unidade', hint:'Este texto não é calculado automaticamente. Confira ao mudar o preço.'})}
              {field('payment_note', 'Condição comercial', {placeholder:'Ex.: condições de pagamento confirmadas pela loja'})}
              {field('badge', 'Selo', {maxLength:80, placeholder:'Ex.: Sob medida', hint:'Uma pequena etiqueta de destaque no produto.'})}
            </>}
            <Field label="Ordem de exibição" hint="Números menores aparecem primeiro. Pode manter o valor sugerido." type="number" min="0" step="1" value={form.sort_order} onChange={e => set('sort_order', e.target.value === '' ? 0 : Number(e.target.value))}/>
          </div></details>
        </div>
        <aside className="rj-admin-editor-preview"><section className="rj-admin-card"><h3><span className="rj-admin-step">3</span> {kind === 'products' ? 'Foto e prévia' : 'Escolha a imagem'}</h3>
          <MediaField label={kind === 'banners' ? 'Imagem desktop' : 'Imagem'} value={form.image} onChange={v => set('image', v)} onBusy={uploadingChanged} onError={setError}/>
          {kind === 'products' && <div className="rj-admin-product-preview" aria-label="Prévia do produto"><span className={`rj-admin-badge${form.status === 'published' ? ' is-live' : ''}`}>{form.status === 'published' ? 'Vai aparecer na loja' : 'Apenas no painel'}</span><h4>{form.name || 'Nome do seu produto'}</h4><p>{form.description || 'A descrição que você escrever aparece aqui.'}</p><strong>{previewPrice}</strong><small>{form.pack || 'Quantidade por pacote'}</small><span className="rj-admin-preview-whatsapp">Orçar no WhatsApp</span><small>Prévia ilustrativa. Salve para aplicar suas alterações.</small></div>}
          {kind === 'banners' && <MediaField label="Imagem para celular (opcional)" value={form.mobile_image} onChange={v => set('mobile_image', v)} onBusy={uploadingChanged} onError={setError}/>}</section></aside>
      </div>
    </fieldset>
    <div className="rj-admin-savebar"><span className={dirty ? 'has-changes' : ''}>{dirty ? 'Você tem alterações para salvar' : record.version ? 'Nenhuma alteração pendente' : 'Este cadastro ainda não foi salvo'}<small>{kind === 'products' ? form.status === 'published' ? 'Depois de salvar, o produto aparece na loja.' : 'Depois de salvar, fica guardado como rascunho.' : 'Salve para aplicar as informações.'}</small></span><button className="rj-admin-primary" disabled={busy || uploading || (Boolean(record.version) && !dirty)}>{busy ? 'Salvando…' : uploading ? 'Enviando imagem…' : 'Salvar alterações'}</button></div>
  </form>;
}

const groups = [
  ['Empresa e contato', 'Os dados que ajudam seus clientes a encontrar a RJ.', ['brand_name','logo','phone','phone_label','address','footer_tagline','footer_description']],
  ['WhatsApp e redes', 'Escolha por onde seus clientes entram em contato.', ['whatsapp_url','whatsapp_label','header_whatsapp_label','whatsapp_message','instagram','instagram_label','facebook','linktree']],
  ['Página inicial', 'Edite as frases e os títulos que aparecem na sua loja.', ['announcement_1','announcement_2','announcement_3','categories_title','boxes_title','envelopes_title','benefit_1_title','benefit_1_text','benefit_2_title','benefit_2_text','benefit_3_title','benefit_3_text','payment_image']],
  ['Informações da loja', 'Escreva as orientações que seus clientes precisam conhecer.', ['about','terms','privacy','shipping','returns','faq']],
];
const longFields = ['about','terms','privacy','shipping','returns','faq','footer_description'];
const hints = {phone:'Ex.: +554799039545. Use o código do país e somente números.', phone_label:'Ex.: (47) 9903-9545. Assim o telefone aparece na loja.', whatsapp_url:'Cole o link de atendimento do seu WhatsApp, começando com https://wa.me/.', whatsapp_message:'Mensagem sugerida ao iniciar uma conversa. Links wa.me/message usam a mensagem configurada no próprio WhatsApp.', announcement_1:'Estes avisos se alternam no topo da página.', about:'Conte a história da empresa. Se ficar vazio, mostramos uma orientação para falar com a equipe.'};
export function SettingsEditor({data, version, onSave, onDirty, dirty, onWorking, group, onGroupChange}) {
  const [form, setForm] = useState(data);
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false), [error, setError] = useState('');
  const set = (key, value) => {onDirty(); setForm(old => ({...old, [key]:value}));};
  const uploadingChanged = value => {setUploading(value); onWorking(value); if(value)onDirty();};
  async function submit(event) {
    event.preventDefault(); setBusy(true); onWorking(true); setError('');
    try {await onSave({data:form, version});}
    catch(err) {setError(err.message);}
    finally {setBusy(false); onWorking(false);}
  }
  return <form onSubmit={submit}>
    <nav className="rj-admin-settings-nav" aria-label="Grupos de configurações">{groups.map(([title], index) => <button type="button" key={title} aria-pressed={group === index} onClick={() => onGroupChange(index)} disabled={busy || uploading}>{title}</button>)}</nav>
    <ErrorNotice message={error}/>
    <fieldset disabled={busy || uploading}><section className="rj-admin-card rj-admin-settings-panel"><h2>{groups[group][0]}</h2><p>{groups[group][1]}</p><div className="rj-admin-settings-fields">
      {groups[group][2].map(key => ['logo','payment_image'].includes(key) ? <MediaField key={key} label={settingsFields[key]} value={form[key]} onChange={v => set(key, v)} onBusy={uploadingChanged} onError={setError}/> : <Field key={key} label={settingsFields[key]} hint={hints[key]}>{longFields.includes(key) ? <textarea rows={4} value={form[key] || ''} onChange={e => set(key, e.target.value)}/> : <input value={form[key] || ''} onChange={e => set(key, e.target.value)}/>}</Field>)}
    </div></section></fieldset>
    <div className="rj-admin-savebar"><span className={dirty ? 'has-changes' : ''}>{dirty ? 'Você tem alterações para salvar' : 'Nenhuma alteração pendente'}<small>Pode trocar de grupo. Os campos preenchidos continuam aqui.</small></span><button className="rj-admin-primary" disabled={busy || uploading || (Boolean(version) && !dirty)}>{busy ? 'Salvando…' : uploading ? 'Enviando imagem…' : 'Salvar configurações'}</button></div>
  </form>;
}

const trackingHints = {
  gtm_id: 'No Google Tag Manager, aparece no topo da tela, ao lado do nome do contêiner.',
  ga4_id: 'No Google Analytics: Administrador → Fluxos de dados → seu site → ID da métrica.',
  google_ads_id: 'No Google Ads, aparece na Tag do Google da conta ou na instalação de uma conversão. Começa com AW-.',
  meta_pixel_id: 'No Gerenciador de Eventos da Meta, abaixo do nome do Pixel (conjunto de dados).',
};
export function TrackingEditor({tracking, onSave, onDirty, dirty, onWorking}) {
  const [form, setForm] = useState(tracking.data || {});
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [invalid, setInvalid] = useState([]);
  if (tracking.error) return <ErrorNotice message={tracking.error} hint="As outras áreas do painel continuam funcionando normalmente."/>;
  const set = (key, value) => {onDirty(); setForm(old => ({...old, [key]:value})); setInvalid(old => old.filter(item => item !== key));};
  const withGtm = Boolean(form.gtm_id?.trim()) && ['ga4_id','google_ads_id','meta_pixel_id'].some(key => form[key]?.trim());
  async function submit(event) {
    event.preventDefault(); setError('');
    const wrong = Object.keys(trackingFields).filter(key => trackingError(key, form[key]));
    if (wrong.length) {setInvalid(wrong); setError(wrong.map(key => trackingError(key, form[key])).join(' ')); return;}
    setBusy(true); onWorking(true);
    try {await onSave({data:form, version:tracking.version});}
    catch(err) {setError(err.message);}
    finally {setBusy(false); onWorking(false);}
  }
  return <form onSubmit={submit}>
    <ErrorNotice message={error}/>
    <section className="rj-admin-card rj-admin-settings-panel"><h2>Como funciona</h2>
      <p>Cole aqui só o código (ID) de cada ferramenta. O site instala as tags sozinho. Deixe vazio o que você não usa: campo vazio não carrega nada.</p>
      <p>Para respeitar a lei de proteção de dados (RGPD/LGPD), a loja mostra um aviso de cookies. As tags só funcionam para quem aceitar.</p>
      <p><strong>Usa o Google Tag Manager?</strong> Então preencha só o GTM e configure o Analytics, o Google Ads e o Pixel dentro dele, com os modelos oficiais. Tags de “HTML personalizado” são bloqueadas pela proteção do site.</p>
    </section>
    <fieldset disabled={busy}><section className="rj-admin-card rj-admin-settings-panel"><h2>Códigos das ferramentas</h2><div className="rj-admin-settings-fields">
      {Object.entries(trackingFields).map(([key, {label, example}]) => <Field key={key} label={label} hint={`${trackingHints[key]} Ex.: ${example}`} value={form[key] || ''} placeholder="Deixe vazio se não usar" autoComplete="off" spellCheck={false} aria-invalid={invalid.includes(key) || undefined} onChange={e => set(key, e.target.value)}/>)}
    </div>
    {withGtm && <div className="rj-admin-inline-tip" role="note">Você preencheu o Google Tag Manager e outros códigos. Se essas ferramentas também estiverem configuradas dentro do GTM, as visitas serão contadas em dobro. O ideal é deixar só o GTM.</div>}
    </section></fieldset>
    <div className="rj-admin-savebar"><span className={dirty ? 'has-changes' : ''}>{dirty ? 'Você tem alterações para salvar' : 'Nenhuma alteração pendente'}<small>Depois de salvar, abra a loja, aceite os cookies e confira com o Tag Assistant ou o Meta Pixel Helper.</small></span><button className="rj-admin-primary" disabled={busy || (Boolean(tracking.version) && !dirty)}>{busy ? 'Salvando…' : 'Salvar rastreamento'}</button></div>
  </form>;
}
