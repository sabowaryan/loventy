import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { supabase } from '../../lib/supabase';
import AuthLayout from '../../components/layouts/AuthLayout';
import PublicRoute from '../../components/PublicRoute';

const ForgotPassword: React.FC = () => {
  usePageTitle('Mot de passe oublié');
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Veuillez saisir votre adresse email');
      return;
    }
    
    setIsSubmitting(true);
    setStatus('idle');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PublicRoute>
      <AuthLayout 
        title="Mot de passe oublié" 
        subtitle="Réinitialisez votre mot de passe pour accéder à votre compte"
      >
        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-[#131837] mb-4">
              Email envoyé !
            </h3>
            
            <p className="text-gray-600 mb-6">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
            
            <p className="text-sm text-gray-500 mb-8">
              N'oubliez pas de vérifier votre dossier de spam si vous ne trouvez pas l'email dans votre boîte de réception.
            </p>
            
            <div className="space-y-4">
              <Link
                to="/auth/login"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Retour à la connexion</span>
              </Link>
              
              <button
                onClick={() => {
                  setStatus('idle');
                  setEmail('');
                }}
                className="w-full py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Essayer une autre adresse email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Erreur</p>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-gray-600 mb-6">
                Saisissez l'adresse email associée à votre compte et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#131837] mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200 bg-white placeholder-gray-400 text-[#131837]"
                    placeholder="votre@email.com"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="group relative w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Envoyer les instructions</span>
                  <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-sm text-[#D4A5A5] hover:text-[#E16939] transition-colors duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Retour à la connexion</span>
              </Link>
            </div>
          </form>
        )}
      </AuthLayout>
    </PublicRoute>
  );
};

export default ForgotPassword;