import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Mail, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AuthLayout from '../../components/layouts/AuthLayout';
import { usePageTitle } from '../../hooks/usePageTitle';

const EmailConfirmation: React.FC = () => {
  usePageTitle('Confirmation d\'email');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending' | 'awaiting_click'>('loading');
  const [message, setMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationLink, setConfirmationLink] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Extraire les paramètres de l'URL
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const email = searchParams.get('email');
  const confirmationUrl = searchParams.get('confirmation_url');

  // Fonction pour extraire les tokens du fragment de l'URL
  const extractTokensFromFragment = useCallback(() => {
    const hash = window.location.hash.substring(1);
    if (!hash) return null;
    
    const params = new URLSearchParams(hash);
    return {
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token'),
      token_type: params.get('token_type'),
      expires_in: params.get('expires_in'),
      type: params.get('type')
    };
  }, []);

  // Fonction de confirmation avec magic link
  const confirmWithMagicLink = useCallback(async (tokens: any) => {
    try {
      setStatus('loading');
      setMessage('Confirmation de votre email en cours...');

      // Définir la session avec les tokens du fragment
      const { data, error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      });

      if (error) {
        throw error;
      }

      if (data.user && data.user.email_confirmed_at) {
        setStatus('success');
        setMessage('Votre email a été confirmé avec succès ! Bienvenue sur Loventy.');
        
        // Nettoyer le fragment de l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Démarrer le compte à rebours
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else {
        throw new Error('Email non confirmé');
      }
    } catch (error: any) {
      console.error('Error confirming email with magic link:', error);
      setStatus('error');
      setMessage(error.message || 'Erreur lors de la confirmation de l\'email. Le lien peut être expiré.');
    }
  }, [navigate]);

  // Fonction de confirmation avec OTP
  const confirmWithOTP = useCallback(async (token: string) => {
    try {
      setStatus('loading');
      setMessage('Confirmation de votre email en cours...');

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setStatus('success');
        setMessage('Votre email a été confirmé avec succès ! Bienvenue sur Loventy.');
        
        // Démarrer le compte à rebours
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else {
        throw new Error('Aucun utilisateur trouvé');
      }
    } catch (error: any) {
      console.error('Error confirming email with OTP:', error);
      setStatus('error');
      setMessage(error.message || 'Erreur lors de la confirmation de l\'email. Le lien peut être expiré.');
    }
  }, [navigate]);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Cas 1: Lien de confirmation passé en paramètre (protection contre pré-extraction)
      if (confirmationUrl) {
        setStatus('awaiting_click');
        setConfirmationLink(confirmationUrl);
        setMessage('Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.');
        return;
      }

      // Cas 2: Magic link avec access_token dans le fragment de l'URL (nouveau flow)
      const fragmentTokens = extractTokensFromFragment();
      
      if (fragmentTokens?.access_token && fragmentTokens?.refresh_token && fragmentTokens?.type === 'signup') {
        await confirmWithMagicLink(fragmentTokens);
      }
      // Cas 3: Token OTP classique dans les paramètres de requête (ancien flow de fallback)
      else if (token && type === 'signup') {
        await confirmWithOTP(token);
      }
      // Cas 4: Page d'attente avec email fourni
      else if (email) {
        setStatus('pending');
        setMessage(`Un email de confirmation a été envoyé à ${email}. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.`);
      }
      // Cas 5: Lien invalide
      else {
        setStatus('error');
        setMessage('Lien de confirmation invalide ou expiré.');
      }
    };

    handleEmailConfirmation();
  }, [token, type, email, confirmationUrl, extractTokensFromFragment, confirmWithMagicLink, confirmWithOTP]);

  const handleResendConfirmation = async () => {
    if (!email) {
      setMessage('Adresse email manquante pour le renvoi.');
      return;
    }

    try {
      setIsConfirming(true);
      setMessage('Envoi de l\'email de confirmation...');
      
      // Utiliser la nouvelle API de renvoi d'email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) {
        console.error('Resend error:', error);
        throw error;
      }

      setMessage(`Un nouvel email de confirmation a été envoyé à ${email}. Veuillez vérifier votre boîte de réception et votre dossier spam.`);
      
      // Optionnel: changer le statut pour indiquer le succès
      setTimeout(() => {
        setStatus('pending');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Erreur lors de l\'envoi de l\'email de confirmation.';
      
      if (error.message?.includes('rate_limit')) {
        errorMessage = 'Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.';
      } else if (error.message?.includes('email_not_confirmed')) {
        errorMessage = 'Cette adresse email n\'est pas encore confirmée. Vérifiez votre boîte de réception.';
      } else if (error.message?.includes('invalid_email')) {
        errorMessage = 'Adresse email invalide.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setStatus('error');
    } finally {
      setIsConfirming(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] rounded-full mx-auto animate-ping opacity-20"></div>
            </div>
            <h2 className="text-2xl font-bold text-[#131837] mb-3 font-serif">
              Confirmation en cours...
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                <Clock className="h-4 w-4" />
                <span>Cette opération peut prendre quelques secondes...</span>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full mx-auto animate-ping opacity-20"></div>
            </div>
            <h2 className="text-2xl font-bold text-[#131837] mb-3 font-serif">
              Email confirmé !
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-green-700 mb-2">
                <ArrowRight className="h-4 w-4" />
                <span>Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              <span>Accéder au tableau de bord maintenant</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#131837] mb-3 font-serif">
              Erreur de confirmation
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="space-y-3">
              {email && (
                <button
                  onClick={handleResendConfirmation}
                  disabled={isConfirming}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                >
                  {isConfirming ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-3" />
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 mr-2" />
                      <span>Renvoyer l'email de confirmation</span>
                    </div>
                  )}
                </button>
              )}
              <button
                onClick={() => navigate('/auth/register')}
                className="w-full py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                <span>Créer un nouveau compte</span>
              </button>
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full py-3 px-4 border-2 border-[#D4A5A5] text-[#D4A5A5] font-medium rounded-xl hover:bg-[#D4A5A5]/5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                <span>Se connecter</span>
              </button>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#131837] mb-3 font-serif">
              Confirmez votre email
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-700 flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                <strong>Conseil :</strong> Vérifiez aussi votre dossier spam/courrier indésirable
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleResendConfirmation}
                disabled={isConfirming}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                {isConfirming ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    <span>Renvoyer l'email de confirmation</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full py-3 px-4 border-2 border-[#D4A5A5] text-[#D4A5A5] font-medium rounded-xl hover:bg-[#D4A5A5]/5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                <span>J'ai déjà confirmé mon email</span>
              </button>
            </div>
          </div>
        );

      case 'awaiting_click':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#131837] mb-3 font-serif">
              Confirmez votre email
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <strong>Sécurisé :</strong> Ce bouton vous redirigera vers Supabase pour finaliser la confirmation
              </p>
            </div>
            <div className="space-y-3">
              {confirmationLink && (
                <a
                  href={confirmationLink}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Confirmer mon email</span>
                </a>
              )}
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                <span>Retour à la connexion</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout 
      title="Confirmation d'email" 
      subtitle="Vérification de votre adresse email"
      showBackButton={false}
    >
      {renderContent()}
    </AuthLayout>
  );
};

export default EmailConfirmation;