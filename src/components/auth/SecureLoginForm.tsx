/**
 * Formulaire de connexion sécurisé avec protection contre les attaques par force brute,
 * validation en temps réel et audit des tentatives
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Shield, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSecurity } from './SecurityProvider';
import { useClientIP } from '../../hooks/useLoginAttempts';
import { validateEmail, validatePassword } from '../../utils/validation';
import ValidatedInput from '../forms/ValidatedInput';

interface SecureLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const SecureLoginForm: React.FC<SecureLoginFormProps> = ({
  onSuccess,
  redirectTo = '/dashboard'
}) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { 
    isLocked, 
    remainingAttempts, 
    remainingTime, 
    recordLoginAttempt, 
    formatRemainingTime,
    logAction 
  } = useSecurity();
  const clientIP = useClientIP();

  // État du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Validation en temps réel
  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePassword(formData.password);
  
  const isFormValid = emailValidation.isValid && passwordValidation.isValid;
  const canSubmit = isFormValid && !isLoading && !isLocked;

  // Gestion des changements de champs
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Effacer l'erreur lors de la saisie
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    setIsLoading(true);
    setError('');

    try {
      // Enregistrer la tentative de connexion
      await logAction('login_attempt', {
        email: formData.email,
        ip_address: clientIP,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      const result = await signIn(formData.email, formData.password);

      if (result.error) {
        // Enregistrer l'échec
        recordLoginAttempt(formData.email, false, clientIP);
        await logAction('login_failed', {
          email: formData.email,
          error: result.error,
          ip_address: clientIP,
          remaining_attempts: remainingAttempts - 1
        }, 'warning');

        setError(result.error);
      } else {
        // Enregistrer le succès
        recordLoginAttempt(formData.email, true, clientIP);
        await logAction('login_success', {
          email: formData.email,
          ip_address: clientIP
        });

        // Redirection ou callback de succès
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectTo);
        }
      }
    } catch (err: any) {
      recordLoginAttempt(formData.email, false, clientIP);
      await logAction('login_error', {
        email: formData.email,
        error: err.message,
        ip_address: clientIP
      }, 'error');

      setError('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage du verrouillage
  if (isLocked) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Compte temporairement verrouillé</h2>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-semibold text-red-800">Trop de tentatives de connexion</span>
          </div>
          <p className="text-red-700 text-sm mb-3">
            Votre compte a été temporairement verrouillé pour des raisons de sécurité.
          </p>
          <div className="flex items-center justify-center bg-red-100 rounded p-3">
            <Clock className="w-4 h-4 text-red-600 mr-2" />
            <span className="font-mono text-red-800">
              Temps restant : {formatRemainingTime(remainingTime)}
            </span>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Si vous avez oublié votre mot de passe, vous pouvez</p>
          <Link to="/auth/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
            demander une réinitialisation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Connexion sécurisée</h2>
        <p className="text-gray-600 mt-2">Accédez à votre compte Loventy</p>
      </div>

      {/* Indicateur de tentatives restantes */}
      {remainingAttempts < 5 && remainingAttempts > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              {remainingAttempts} tentative{remainingAttempts > 1 ? 's' : ''} restante{remainingAttempts > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Email */}
        <ValidatedInput
          label="Adresse email"
          type="email"
          value={formData.email}
          onChange={(value) => handleChange('email', value)}
          onBlur={() => handleBlur('email')}
          validator={validateEmail}
          placeholder="votre@email.com"
          required
          disabled={isLoading}
        />

        {/* Champ Mot de passe */}
        <ValidatedInput
          label="Mot de passe"
          type="password"
          value={formData.password}
          onChange={(value) => handleChange('password', value)}
          onBlur={() => handleBlur('password')}
          validator={validatePassword}
          placeholder="Votre mot de passe"
          required
          disabled={isLoading}
          showValidIcon={false} // Pas d'icône de validation pour le mot de passe
        />

        {/* Message d'erreur global */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
            ${canSubmit
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connexion en cours...
            </div>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      {/* Liens utiles */}
      <div className="mt-6 text-center space-y-2">
        <Link
          to="/auth/forgot-password"
          className="block text-sm text-blue-600 hover:text-blue-800"
        >
          Mot de passe oublié ?
        </Link>
        
        <div className="text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/auth/register" className="text-blue-600 hover:text-blue-800 font-medium">
            S'inscrire
          </Link>
        </div>
      </div>

      {/* Informations de sécurité */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <Shield className="w-4 h-4 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">Sécurité renforcée</span>
        </div>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Connexion chiffrée SSL/TLS</li>
          <li>• Protection contre les attaques par force brute</li>
          <li>• Audit des tentatives de connexion</li>
          <li>• Validation en temps réel</li>
        </ul>
      </div>
    </div>
  );
};

export default SecureLoginForm;