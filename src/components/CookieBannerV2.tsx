import React, { useState, useEffect } from 'react';
import { X, Cookie, Check, Settings, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useCookieConsent } from './CookieConsentManager';

const CookieBannerV2: React.FC = () => {
  const { preferences, updatePreferences, hasConsented, resetConsent } = useCookieConsent();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isTemporarilyClosed, setIsTemporarilyClosed] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if banner was temporarily closed
    const temporarilyClosed = Cookies.get('loventy_banner_temporarily_closed');
    
    if (!hasConsented) {
      // If no consent has been given
      if (temporarilyClosed === 'true') {
        // If banner was temporarily closed, show floating button
        setIsTemporarilyClosed(true);
        setShowFloatingButton(true);
        setIsInitialized(true);
      } else {
        // Show the banner after a short delay
        const timer = setTimeout(() => {
          setIsOpen(true);
          setIsInitialized(true);
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    } else {
      // If consent has been given, ensure modal is closed
      setIsOpen(false);
      setShowFloatingButton(false);
      setIsInitialized(true);
    }
  }, [hasConsented]);

  const handleAcceptAll = () => {
    updatePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      advertising: true,
    });
    setIsOpen(false);
    setShowFloatingButton(false);
  };

  const handleAcceptSelected = () => {
    updatePreferences(preferences);
    setIsOpen(false);
    setShowPreferences(false);
    setShowFloatingButton(false);
  };

  const handleRejectAll = () => {
    updatePreferences({
      necessary: true, // Always true
      functional: false,
      analytics: false,
      advertising: false,
    });
    setIsOpen(false);
    setShowFloatingButton(false);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setIsTemporarilyClosed(true);
    setShowFloatingButton(true);
    // Save the temporarily closed state in a cookie (expires in 1 day)
    Cookies.set('loventy_banner_temporarily_closed', 'true', { expires: 1 });
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    if (key === 'necessary') return; // Necessary cookies cannot be changed
    
    updatePreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const handleOpenPreferences = () => {
    setShowPreferences(true);
  };

  // Ne rien afficher tant que l'initialisation n'est pas terminée
  if (!isInitialized) {
    return null;
  }

  // Si l'utilisateur a déjà donné son consentement et que le modal n'est pas ouvert
  if (hasConsented && !isOpen) {
    return null;
  }

  // Si l'utilisateur n'a pas encore donné son consentement
  if (!hasConsented) {
    // Si temporairement fermé et que le modal n'est pas ouvert, afficher le bouton flottant
    if (isTemporarilyClosed && !isOpen) {
      return (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
          aria-label="Gérer les cookies"
        >
          <Cookie className="h-5 w-5 text-[#D4A5A5]" />
        </button>
      );
    }
  }

  // Si le modal est ouvert, l'afficher
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="cookie-banner-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#D4A5A5]/10 sm:mx-0 sm:h-10 sm:w-10">
                  <Cookie className="h-6 w-6 text-[#D4A5A5]" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="cookie-banner-title">
                    Paramètres de confidentialité
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Nous utilisons des cookies pour améliorer votre expérience sur notre site, personnaliser le contenu et les publicités, fournir des fonctionnalités de médias sociaux et analyser notre trafic.
                    </p>
                  </div>
                </div>
              </div>
              
              {showPreferences ? (
                <div className="mt-4 space-y-4">
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-green-100 rounded-full">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Cookies nécessaires</p>
                          <p className="text-xs text-gray-500">Ces cookies sont essentiels au fonctionnement du site.</p>
                        </div>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input 
                          type="checkbox" 
                          checked={preferences.necessary} 
                          disabled
                          className="checked:bg-[#D4A5A5] outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-not-allowed"
                        />
                        <label className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-not-allowed"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <Settings className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Cookies fonctionnels</p>
                          <p className="text-xs text-gray-500">Ces cookies permettent d'améliorer les fonctionnalités du site.</p>
                        </div>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input 
                          type="checkbox" 
                          checked={preferences.functional} 
                          onChange={() => handlePreferenceChange('functional')}
                          className="checked:bg-[#D4A5A5] outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                        />
                        <label className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-purple-100 rounded-full">
                          <Info className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Cookies d'analyse</p>
                          <p className="text-xs text-gray-500">Ces cookies nous aident à comprendre comment vous utilisez notre site.</p>
                        </div>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input 
                          type="checkbox" 
                          checked={preferences.analytics} 
                          onChange={() => handlePreferenceChange('analytics')}
                          className="checked:bg-[#D4A5A5] outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                        />
                        <label className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-yellow-100 rounded-full">
                          <Cookie className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Cookies publicitaires</p>
                          <p className="text-xs text-gray-500">Ces cookies sont utilisés pour vous montrer des publicités pertinentes.</p>
                        </div>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input 
                          type="checkbox" 
                          checked={preferences.advertising} 
                          onChange={() => handlePreferenceChange('advertising')}
                          className="checked:bg-[#D4A5A5] outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                        />
                        <label className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Vous pouvez choisir d'accepter ou de refuser les cookies. Pour en savoir plus sur les cookies que nous utilisons, consultez notre <Link to="/cookies" className="text-[#D4A5A5] hover:text-[#E16939] underline">politique de cookies</Link>.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {showPreferences ? (
                <>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#D4A5A5] text-base font-medium text-white hover:bg-[#D4A5A5]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A5A5] sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleAcceptSelected}
                  >
                    Enregistrer mes préférences
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A5A5] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowPreferences(false)}
                  >
                    Retour
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#D4A5A5] text-base font-medium text-white hover:bg-[#D4A5A5]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A5A5] sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleAcceptAll}
                  >
                    Tout accepter
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A5A5] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleOpenPreferences}
                  >
                    Personnaliser
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A5A5] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleRejectAll}
                  >
                    Refuser tout
                  </button>
                </>
              )}
            </div>
            
            {/* Bouton de fermeture */}
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
              onClick={handleCloseModal}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Par défaut, ne rien afficher
  return null;
};

export default CookieBannerV2; 