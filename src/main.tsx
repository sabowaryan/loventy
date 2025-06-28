import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import CookieConsentProvider from './components/CookieConsentManager.tsx';
import { HelmetProvider } from 'react-helmet-async';
import { DevCycleContextProvider } from './contexts/DevCycleContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <CookieConsentProvider>
          <DevCycleContextProvider>
            <App />
          </DevCycleContextProvider>
        </CookieConsentProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);