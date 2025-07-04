import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

interface KeyProtectedRouteProps {
  children: React.ReactNode;
  secretKey: string;
  fallbackPath?: string;
}

const KeyProtectedRoute: React.FC<KeyProtectedRouteProps> = ({ children, secretKey, fallbackPath = '/' }) => {
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Vérifie la clé dans l'URL
    const params = new URLSearchParams(location.search);
    const urlKey = params.get('key');
    if (urlKey === secretKey) {
      setIsAuthorized(true);
      sessionStorage.setItem('me_key', secretKey);
      return;
    }
    // Vérifie la clé en session (si déjà validée)
    if (sessionStorage.getItem('me_key') === secretKey) {
      setIsAuthorized(true);
      return;
    }
    // Sinon, affiche le modal
    setShowModal(true);
  }, [location.search, secretKey]);

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey === secretKey) {
      setIsAuthorized(true);
      sessionStorage.setItem('me_key', secretKey);
      setShowModal(false);
    } else {
      setError('Clé incorrecte. Veuillez réessayer.');
      setInputKey('');
      if (inputRef.current) inputRef.current.focus();
    }
  };

  if (isAuthorized === null && !showModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A5A5] mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la clé d'accès...</p>
        </div>
      </div>
    );
  }

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full border border-gray-100 animate-fade-in">
          <h2 className="text-2xl font-serif font-bold text-primary mb-4 text-center">Accès protégé</h2>
          <p className="text-gray-700 mb-6 text-center">Veuillez entrer la clé d'accès pour continuer :</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="password"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-lg bg-accent font-sans"
              placeholder="Clé d'accès..."
              autoFocus
            />
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="btn-primary w-full mt-2"
            >
              Valider
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default KeyProtectedRoute; 