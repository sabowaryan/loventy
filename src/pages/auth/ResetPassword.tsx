import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { supabase } from '../../lib/supabase';
import AuthLayout from '../../components/layouts/AuthLayout';
import PublicRoute from '../../components/PublicRoute';

const ResetPassword: React.FC = () => {
  usePageTitle('Réinitialisation du mot de passe');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  
  // Check if we have a hash fragment with access_token
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');
    
    if (accessToken && refreshToken && type === 'recovery') {
      // Set the session with the tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Error setting session:', error);
          setStatus('error');
          setErrorMessage('Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.');
        }
      });
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setIsSubmitting(true);
    setStatus('idle');
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      setStatus('success');
      
      // Start countdown for redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/auth/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Fort', color: 'bg-green-500' };
    }
    return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
  };
  
  const passwordStrength = getPasswordStrength();
  
  return (
    <PublicRoute>
      <AuthLayout 
        title="Réinitialiser votre mot de passe" 
        subtitle="Créez un nouveau mot de passe pour votre compte"
        showBackButton={false}
      >
        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-[#131837] mb-4">
              Mot de passe réinitialisé !
            </h3>
            
            <p className="text-gray-600 mb-6">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
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
              onClick={() => navigate('/auth/login')}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              <span>Se connecter maintenant</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
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
              <label htmlFor="password" className="block text-sm font-medium text-[#131837] mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200 bg-white placeholder-gray-400 text-[#131837]"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-[#D4A5A5] transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Force du mot de passe</span>
                    <span className={`font-medium ${
                      passwordStrength.strength === 1 ? 'text-red-600' :
                      passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#131837] mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200 bg-white placeholder-gray-400 text-[#131837] ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : ''
                  }`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-[#D4A5A5] transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword || password !== confirmPassword}
              className="group relative w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  <span>Réinitialisation en cours...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Réinitialiser le mot de passe</span>
                  <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              )}
            </button>
          </form>
        )}
      </AuthLayout>
    </PublicRoute>
  );
};

export default ResetPassword;