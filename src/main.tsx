import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import CookieConsentProvider from './components/CookieConsentManager.tsx';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <CookieConsentProvider>
          <App />
        </CookieConsentProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);