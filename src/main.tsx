import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import CookieConsentProvider from './components/CookieConsentManager.tsx';
import { HelmetProvider } from 'react-helmet-async';
import { DevCycleContextProvider } from './contexts/DevCycleContext.tsx';
import { AuthProvider } from './contexts/AuthContext';
import StripeProvider from './components/StripeProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <StripeProvider>
          <AuthProvider>
            <CookieConsentProvider>
              <DevCycleContextProvider>
                <App />
              </DevCycleContextProvider>
            </CookieConsentProvider>
          </AuthProvider>
        </StripeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);