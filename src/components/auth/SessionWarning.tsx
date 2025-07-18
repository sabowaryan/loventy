/**
 * Composant d'avertissement de session
 * Affiche une notification quand la session est sur le point d'expirer
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';

interface SessionWarningProps {
  show: boolean;
  timeUntilExpiry: number; // en secondes
  onExtend: () => void;
  onSignOut: () => void;
}

export const SessionWarning: React.FC<SessionWarningProps> = ({
  show,
  timeUntilExpiry,
  onExtend,
  onSignOut
}) => {
  const [countdown, setCountdown] = useState(timeUntilExpiry);

  useEffect(() => {
    setCountdown(timeUntilExpiry);
  }, [timeUntilExpiry]);

  useEffect(() => {
    if (!show || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [show, countdown, onSignOut]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Session sur le point d'expirer
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Votre session va expirer dans :
          </p>
          
          <div className="flex items-center justify-center bg-amber-50 rounded-lg p-4">
            <Clock className="w-6 h-6 text-amber-600 mr-2" />
            <span className="text-2xl font-mono font-bold text-amber-800">
              {formatTime(countdown)}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-3 text-center">
            Vous serez automatiquement déconnecté(e) si aucune action n'est effectuée.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Prolonger la session
          </button>
          
          <button
            onClick={onSignOut}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Cette mesure de sécurité protège votre compte contre les accès non autorisés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;