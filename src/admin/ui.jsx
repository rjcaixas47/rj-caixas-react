import React, {useEffect, useId, useRef, useState} from 'react';
import {adminRepository} from '../catalog/repository.js';

export function Field({label, hint, children, ...props}) {
  const id = useId();
  const accessibility = {'aria-labelledby': id, 'aria-describedby': hint ? `${id}-hint` : undefined};
  return <label className="rj-admin-field">
    <span><span id={id}>{label}</span>{props.required && <small aria-hidden="true" className="rj-admin-required">Obrigatório</small>}</span>
    {children ? React.cloneElement(children, accessibility) : <input {...accessibility} {...props}/>}
    {hint && <small id={`${id}-hint`} className="rj-admin-hint">{hint}</small>}
  </label>;
}

export function ErrorNotice({message, hint='Suas alterações continuam aqui. Confira as informações e tente novamente.'}) {
  const ref = useRef(null);
  useEffect(() => { if (message) ref.current?.focus(); }, [message]);
  return message ? <div ref={ref} tabIndex={-1} role="alert" className="rj-admin-error"><strong>Não foi possível concluir.</strong><p>{message}</p>{hint && <small>{hint}</small>}</div> : null;
}

export function MediaField({label, value, onChange, onBusy, onError}) {
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [value]);
  async function upload(event) {
    const input = event.currentTarget;
    const file = input.files[0];
    if (!file) return;
    setUploading(true); onBusy(true); onError('');
    try { onChange(await adminRepository.upload(file)); }
    catch (error) { onError(error.message); }
    finally { setUploading(false); onBusy(false); input.value = ''; }
  }
  return <div className="rj-admin-media">
    <span className="rj-admin-media-label">{label}</span>
    <div className={`rj-admin-image-area${value && !broken ? ' has-image' : ''}`}>
      {value && !broken ? <img src={value} alt={`Prévia: ${label}`} onError={() => setBroken(true)}/> : <span>{broken ? 'Não conseguimos mostrar esta imagem. Escolha outra foto ou confira o link.' : 'Sua imagem aparece aqui'}</span>}
    </div>
    <label className="rj-admin-upload">
      {uploading ? 'Enviando imagem…' : value ? 'Trocar imagem' : 'Escolher imagem'}
      <input aria-label={`Enviar ${label.toLowerCase()}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={uploading}/>
    </label>
    <small>Escolha uma foto do celular ou computador. PNG, JPEG ou WebP, até 5 MB.</small>
    <details className="rj-admin-image-link"><summary>Já tem um link de imagem?</summary><Field label={label} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Cole o link da imagem" hint="Use um link que comece com https://. Imagens locais da loja também são aceitas."/></details>
  </div>;
}

export function ConfirmDialog({request, onClose}) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const id = useId();
  useEffect(() => { const element=ref.current; element.showModal(); return () => element.close(); }, []);
  async function confirm() {
    setBusy(true); setError('');
    try { await request.action(); onClose(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <dialog ref={ref} className="rj-admin-confirm" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={event => {event.preventDefault(); if (!busy) onClose();}}>
    <span className="rj-admin-eyebrow">{request.danger ? 'CONFIRMAR EXCLUSÃO' : 'ANTES DE CONTINUAR'}</span>
    <h2 id={`${id}-title`}>{request.title}</h2><p id={`${id}-description`}>{request.message}</p>
    <ErrorNotice message={error} hint="Confira o aviso acima e tente novamente."/>
    <div className="rj-admin-confirm-actions"><button type="button" autoFocus disabled={busy} onClick={onClose}>{request.cancel || 'Cancelar'}</button><button type="button" className={request.danger ? 'rj-admin-delete' : 'rj-admin-primary'} disabled={busy} onClick={confirm}>{busy ? 'Aguarde…' : request.confirm}</button></div>
  </dialog>;
}
