import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Home, RefreshCw, AlertTriangle, ServerCrash, FileX, Coffee, Compass } from 'lucide-react';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ statusCode, title, message }) => {
  const navigate = useNavigate();
  
  // Set defaults based on status code
  let errorStatusCode = statusCode || 500;
  let errorTitle = title;
  let errorMessage = message;
  
  // Set defaults based on status code
  if (!errorTitle) {
    if (errorStatusCode === 404) {
      errorTitle = 'Page introuvable';
    } else if (errorStatusCode >= 500) {
      errorTitle = 'Erreur serveur';
    } else if (errorStatusCode >= 400) {
      errorTitle = 'Erreur client';
    } else {
      errorTitle = 'Une erreur est survenue';
    }
  }
  
  if (!errorMessage) {
    if (errorStatusCode === 404) {
      errorMessage = 'La page que vous recherchez n\'existe pas ou a été déplacée.';
    } else if (errorStatusCode === 403) {
      errorMessage = 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.';
    } else if (errorStatusCode === 401) {
      errorMessage = 'Veuillez vous connecter pour accéder à cette page.';
    } else if (errorStatusCode >= 500) {
      errorMessage = 'Une erreur est survenue sur nos serveurs. Veuillez réessayer plus tard.';
    } else {
      errorMessage = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
    }
  }

  // Choose icon based on status code
  const ErrorIcon = () => {
    if (errorStatusCode === 404) return <FileX className="h-16 w-16 text-secondary" />;
    if (errorStatusCode === 403) return <AlertTriangle className="h-16 w-16 text-amber-500" />;
    if (errorStatusCode === 401) return <Compass className="h-16 w-16 text-blue-500" />;
    if (errorStatusCode === 418) return <Coffee className="h-16 w-16 text-brown-500" />;
    if (errorStatusCode >= 500) return <ServerCrash className="h-16 w-16 text-red-500" />;
    return <AlertTriangle className="h-16 w-16 text-secondary" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#F6F7EC] flex flex-col items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4A5A5]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E16939]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#D4A5A5]/3 to-[#E16939]/3 rounded-full blur-3xl"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-[#D4A5A5]/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-[#E16939]/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-[#C5D2C2]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939]"></div>
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Heart className="h-12 w-12 text-[#D4A5A5] fill-current" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[#E16939] font-bold text-lg">{errorStatusCode.toString().charAt(0)}</span>
            </div>
          </div>
        </div>
        
        {/* Error code */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-4">
            <ErrorIcon />
          </div>
          <h1 className="text-4xl font-bold text-[#131837] mb-2 font-serif">
            {errorStatusCode}
          </h1>
          <h2 className="text-2xl font-semibold text-[#131837] mb-4 font-serif">
            {errorTitle}
          </h2>
          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-[#D4A5A5] text-[#D4A5A5] font-medium rounded-xl hover:bg-[#D4A5A5]/5 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour à la page précédente</span>
          </button>
          
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <Home className="h-5 w-5" />
            <span>Retourner à l'accueil</span>
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Rafraîchir la page</span>
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
          <Heart className="h-4 w-4 text-[#D4A5A5]" />
          <span>Loventy</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;