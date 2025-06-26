import React from 'react';
import { Wifi, WifiOff, RefreshCw, Home, ArrowLeft, ServerCrash } from 'lucide-react';

const ConnectionError: React.FC = () => {
  const isOnline = navigator.onLine;
  const errorType = new URLSearchParams(window.location.search).get('type') || 'unknown';

  const getErrorMessage = () => {
    if (!isOnline) {
      return 'Vérifiez votre connexion internet et réessayez.';
    }
    
    switch (errorType) {
      case 'server':
        return 'Nos serveurs rencontrent actuellement des difficultés. Veuillez réessayer plus tard.';
      case 'connection':
        return 'Impossible de communiquer avec nos serveurs. Veuillez vérifier votre connexion ou réessayer plus tard.';
      case 'timeout':
        return 'La requête a pris trop de temps. Veuillez réessayer.';
      default:
        return 'Impossible de communiquer avec le serveur. Veuillez vérifier vos paramètres de connexion ou réessayer plus tard.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#F6F7EC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#D4A5A5]/20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full mb-6">
            {isOnline ? <ServerCrash className="h-10 w-10 text-amber-500" /> : <WifiOff className="h-10 w-10 text-amber-500" />}
          </div>
          
          <h2 className="text-2xl font-bold text-[#131837] mb-2 font-serif">
            {isOnline ? 'Problème de connexion' : 'Vous êtes hors ligne'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage()}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Réessayer</span>
            </button>
            
            <a
              href="/"
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-[#D4A5A5] text-[#D4A5A5] font-medium rounded-xl hover:bg-[#D4A5A5]/5 transition-all duration-200 no-underline"
            >
              <Home className="h-5 w-5" />
              <span>Retourner à l'accueil</span>
            </a>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Page précédente</span>
            </button>
          </div>
          
          {isOnline && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg text-sm text-amber-800">
              <h3 className="font-medium mb-2">Conseils de dépannage :</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Vérifiez que votre connexion internet est stable</li>
                <li>Essayez de désactiver temporairement votre VPN ou proxy si vous en utilisez un</li>
                <li>Videz le cache de votre navigateur et réessayez</li>
                <li>Si le problème persiste, contactez notre support</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionError;