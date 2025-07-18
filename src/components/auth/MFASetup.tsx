/**
 * Composant pour la configuration de l'authentification à deux facteurs (MFA)
 * Supporte TOTP (Google Authenticator, Authy, etc.)
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Smartphone, Key, CheckCircle, AlertCircle } from 'lucide-react';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialiser la configuration MFA
  useEffect(() => {
    if (user && step === 'setup') {
      setupMFA();
    }
  }, [user, step]);

  const setupMFA = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la configuration MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      const totpFactor = factors.data.totp?.[0];
      if (!totpFactor) throw new Error('Facteur TOTP non trouvé');

      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code: verificationCode
      });

      if (error) throw error;

      setStep('complete');
      
      // Enregistrer l'activation MFA dans les logs d'audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'mfa_enabled',
        details: { factor_type: 'totp' },
        severity: 'info'
      });

    } catch (err: any) {
      setError(err.message || 'Code de vérification invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete?.();
  };

  if (step === 'setup') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            Configuration de l'authentification à deux facteurs
          </h2>
          <p className="text-gray-600 mt-2">
            Renforcez la sécurité de votre compte avec la MFA
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Configuration en cours...</p>
          </div>
        ) : (
          <>
            {qrCode && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Instructions :</h3>
                      <ol className="mt-2 text-sm text-blue-800 space-y-1">
                        <li>1. Installez une app d'authentification (Google Authenticator, Authy, etc.)</li>
                        <li>2. Scannez le QR code ci-dessus</li>
                        <li>3. Entrez le code généré pour vérifier</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">Clé secrète :</span>
                  </div>
                  <code className="text-xs font-mono bg-white p-2 rounded mt-1 block break-all">
                    {secret}
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    Sauvegardez cette clé en lieu sûr
                  </p>
                </div>

                <button
                  onClick={() => setStep('verify')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continuer vers la vérification
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            Vérification du code
          </h2>
          <p className="text-gray-600 mt-2">
            Entrez le code à 6 chiffres de votre app d'authentification
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code de vérification
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono"
              maxLength={6}
            />
          </div>

          <button
            onClick={verifyMFA}
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Vérification...' : 'Vérifier le code'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setStep('setup')}
            className="text-gray-600 hover:text-gray-800 text-sm mr-4"
          >
            Retour
          </button>
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            MFA activée avec succès !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre compte est maintenant protégé par l'authentification à deux facteurs.
          </p>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-800">
              <strong>Important :</strong> Conservez votre app d'authentification et la clé de sauvegarde en lieu sûr. 
              Vous en aurez besoin pour vous connecter.
            </p>
          </div>

          <button
            onClick={handleComplete}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Terminer
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MFASetup;