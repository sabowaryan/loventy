import React from 'react';
import { ServerCrash, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#F6F7EC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#D4A5A5]/20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
            <ServerCrash className="h-10 w-10 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#131837] mb-2 font-serif">
            Quelque chose s'est mal passé
          </h2>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-red-800 mb-1">Erreur:</p>
            <p className="text-sm text-red-700 break-words">
              {error.message || 'Une erreur inattendue s\'est produite'}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={resetErrorBoundary}
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
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;