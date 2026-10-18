import React, {lazy, Suspense} from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
const Admin = lazy(() => import('./admin/Admin.jsx'));
import {CatalogProvider} from './catalog/CatalogContext.jsx';
import CookieConsent from './tracking/CookieConsent.jsx';
import './original-theme.css';
import './brand.css';

createRoot(document.getElementById('root')).render(<React.StrictMode>{window.location.pathname.startsWith('/admin') ? <Suspense fallback={<p>Carregando painel…</p>}><Admin/></Suspense> : <><CatalogProvider><App/></CatalogProvider><CookieConsent/></>}</React.StrictMode>);
