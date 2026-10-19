// Importa somente identificadores. O HTML original nunca é avaliado.
export function extractTrackingSnippet(source) {
 if (typeof source !== 'string' || source.length > 30000) throw Error('Cole um código de até 30 mil caracteres.');
 const found = {};
 const patterns = {gtm_id:/\bGTM-[A-Z0-9]{4,12}\b/gi, ga4_id:/\bG-[A-Z0-9]{4,16}\b/gi, google_ads_id:/\bAW-\d{6,15}\b/gi, meta_pixel_id:/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d{15,16})['"]/gi};
 for (const [key, regex] of Object.entries(patterns)) {
  const values = [...new Set([...source.matchAll(regex)].map(match => (match[1] || match[0]).toUpperCase()))];
  if (values.length > 1) throw Error('Este trecho contém mais de um ID da mesma plataforma. Importe um de cada vez.');
  if (values.length) found[key] = values[0];
 }
 const conversion = source.match(/\bAW-\d{6,15}\/([A-Za-z0-9_-]{1,100})\b/i);
 if (conversion) found.google_ads_label = conversion[1];
 if (!Object.keys(found).length) throw Error('Não encontramos um ID de Meta Pixel, GA4, Google Ads ou GTM neste código. Para outros serviços, use HTML personalizado.');
 return found;
}
