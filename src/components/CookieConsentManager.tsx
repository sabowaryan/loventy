import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

interface CookieConsentContextType {
  preferences: CookiePreferences;
  updatePreferences: (newPreferences: Partial<CookiePreferences>) => void;
  hasConsented: boolean;
  resetConsent: () => void;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true
  functional: false,
  analytics: false,
  advertising: false,
};

const CookieConsentContext = createContext<CookieConsentContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
  hasConsented: false,
  resetConsent: () => {},
});

export const useCookieConsent = () => useContext(CookieConsentContext);

interface CookieConsentProviderProps {
  children: ReactNode;
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  useEffect(() => {
    // Load saved preferences on mount
    const savedConsent = Cookies.get('loventy_cookie_consent');
    if (savedConsent) {
      try {
        const savedPreferences = JSON.parse(savedConsent);
        setPreferences(savedPreferences);
        setHasConsented(true);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    const updatedPreferences = {
      ...preferences,
      ...newPreferences,
      necessary: true, // Always keep necessary cookies enabled
    };

    setPreferences(updatedPreferences);
    setHasConsented(true);

    // Save to cookie
    Cookies.set('loventy_cookie_consent', JSON.stringify(updatedPreferences), { expires: 365 });

    // Apply the preferences
    applyPreferences(updatedPreferences);
  };

  const resetConsent = () => {
    Cookies.remove('loventy_cookie_consent');
    setPreferences(defaultPreferences);
    setHasConsented(false);
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    // This is where you would implement the actual cookie management
    // For example, enabling/disabling Google Analytics based on analytics preference
    
    if (prefs.analytics) {
      // Enable analytics cookies
      console.log('Analytics cookies enabled');
      // Example: window.gtag('consent', 'update', { analytics_storage: 'granted' });
    } else {
      // Disable analytics cookies
      console.log('Analytics cookies disabled');
      // Example: window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    
    if (prefs.advertising) {
      // Enable advertising cookies
      console.log('Advertising cookies enabled');
      // Example: window.gtag('consent', 'update', { ad_storage: 'granted' });
    } else {
      // Disable advertising cookies
      console.log('Advertising cookies disabled');
      // Example: window.gtag('consent', 'update', { ad_storage: 'denied' });
    }
  };

  return (
    <CookieConsentContext.Provider value={{ preferences, updatePreferences, hasConsented, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export default CookieConsentProvider;