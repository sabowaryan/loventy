import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, X, Wifi, WifiOff } from 'lucide-react';

interface ConnectionErrorBannerProps {
  onRetry?: () => void;
}

const ConnectionErrorBanner: React.FC<ConnectionErrorBannerProps> = ({ onRetry }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastConnectionCheck, setLastConnectionCheck] = useState(Date.now());

  useEffect(() => {
    // Vérifier si une erreur de connexion récente est stockée
    const hasConnectionError = sessionStorage.getItem('connection_error');
    if (hasConnectionError) {
      setIsVisible(true);
    }

    // Écouter les événements de connexion
    const handleOnline = () => {
      setIsOnline(true);
      // Si nous sommes de retour en ligne et qu'une erreur était affichée,
      // essayer de se reconnecter automatiquement après un court délai
      if (isVisible) {
        setTimeout(() => {
          if (onRetry) {
            onRetry();
            // Ne pas cacher immédiatement la bannière, attendons de voir si la reconnexion réussit
            setLastConnectionCheck(Date.now());
          }
        }, 1500);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
      // Stocker l'information qu'une déconnexion s'est produite
      sessionStorage.setItem('connection_error', 'offline');
    };

    // Fonction pour vérifier périodiquement la connexion au serveur
    const checkServerConnection = async () => {
      if (!isOnline) return; // Ne pas vérifier si déjà hors ligne

      try {
        // Simple requête pour vérifier si le serveur est accessible
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${window.location.origin}/api/health-check`, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          // La connexion est bonne, on peut masquer la bannière si elle était visible
          if (isVisible) {
            setIsVisible(false);
            sessionStorage.removeItem('connection_error');
          }
        }
      } catch (error) {
        // Une erreur s'est produite, mais ne montrons la bannière que si ce n'est pas déjà le cas
        if (!isVisible) {
          setIsVisible(true);
          sessionStorage.setItem('connection_error', 'server_unreachable');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier la connexion au serveur toutes les 30 secondes si la bannière est visible
    const intervalId = setInterval(() => {
      if (isVisible && isOnline && Date.now() - lastConnectionCheck > 30000) {
        checkServerConnection();
        setLastConnectionCheck(Date.now());
      }
    }, 30000);

    // Vérification initiale
    if (isOnline) {
      checkServerConnection();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [onRetry, isVisible, isOnline, lastConnectionCheck]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Si aucune fonction de retry n'est fournie, rafraîchir la page
      window.location.reload();
    }
    setLastConnectionCheck(Date.now());
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.removeItem('connection_error');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-16 inset-x-0 z-50 flex justify-center p-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 max-w-md w-full flex items-start space-x-3 animate-in slide-in-from-top-2">
        {isOnline ? (
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        ) : (
          <WifiOff className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-amber-800">
              {!isOnline ? 'Vous êtes hors ligne' : 'Problème de connexion'}
            </h3>
            <button 
              onClick={handleDismiss}
              className="text-amber-500 hover:text-amber-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            {!isOnline 
              ? 'Vérifiez votre connexion internet et réessayez.' 
              : 'Impossible de communiquer avec le serveur. Veuillez réessayer.'}
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleRetry}
              className="flex items-center space-x-1 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-md hover:bg-amber-200 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Réessayer</span>
            </button>
            <a
              href="/error"
              className="px-3 py-1.5 bg-white border border-amber-200 text-amber-800 text-xs font-medium rounded-md hover:bg-amber-50 transition-colors"
            >
              Plus d'infos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionErrorBanner;