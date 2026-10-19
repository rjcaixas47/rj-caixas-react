import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
const config = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'));
// A prévia local usa a mesma proteção da Vercel, inclusive a origem isolada dos códigos livres.
function headers(server) {
 server.middlewares.use((req, res, next) => {
  const sandbox = req.url?.split('?')[0] === '/tracking-sandbox.html';
  const rules = config.headers.filter(rule => rule.source === '/(.*)' || (sandbox && rule.source === '/tracking-sandbox.html'));
  for (const rule of rules) for (const header of rule.headers) res.setHeader(header.key, header.value);
  next();
 });
}
export default defineConfig({plugins:[{name:'rj-security-headers',configureServer:headers,configurePreviewServer:headers}]});
