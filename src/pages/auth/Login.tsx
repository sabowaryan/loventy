import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/layouts/AuthLayout';
import PublicRoute from '../../components/PublicRoute';
import { usePageTitle } from '../../hooks/usePageTitle';

const Login: React.FC = () => {
  usePageTitle('Connexion');
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer l'URL de redirection et le template sélectionné
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const templateId = searchParams.get('template');
  
  // Construire l'URL de redirection complète
  const from = templateId 
    ? `${redirectPath}?template=${templateId}` 
    : redirectPath;

  // Vérifier si l'utilisateur vient de s'inscrire
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const registered = params.get('registered');
    
    if (registered === 'true') {
      setSuccessMessage('Inscription réussie ! Veuillez vous connecter avec vos identifiants.');
      
      // Nettoyer l'URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    const { error: signInError } = await signIn(formData.email, formData.password);
    
    if (signInError) {
      setError(signInError);
      setIsLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMessage('');
    setIsGoogleLoading(true);
    
    const { error: googleError } = await signInWithGoogle();
    
    if (googleError) {
      setError(googleError);
      setIsGoogleLoading(false);
    }
    // Note: Si succès, la redirection se fait automatiquement via OAuth
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const isFormValid = formData.email.trim() && formData.password.trim() && acceptTerms;

  return (
    <PublicRoute>
      <AuthLayout 
        title="Bon retour !" 
        subtitle="Connectez-vous à votre compte pour créer de magnifiques invitations"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Erreur de connexion</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Succès</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Enhanced Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="group relative w-full bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-sm overflow-hidden"
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              {isGoogleLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-3 text-[#D4A5A5]" />
                  <span>Connexion avec Google...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="group-hover:text-gray-800 transition-colors duration-200">Continuer avec Google</span>
                </div>
              )}
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Ou avec votre email</span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#131837] mb-2">
                Adresse email
              </label>
              <div className={`relative group transition-all duration-300 ${
                isFocused === 'email' ? 'ring-2 ring-[#D4A5A5]/20 rounded-lg' : ''
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${
                    isFocused === 'email' ? 'text-[#D4A5A5]' : 'text-gray-400'
                  } transition-colors duration-200`} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200 bg-white placeholder-gray-400 text-[#131837]"
                  placeholder="votre@email.com"
                  disabled={isLoading || isGoogleLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#131837] mb-2">
                Mot de passe
              </label>
              <div className={`relative group transition-all duration-300 ${
                isFocused === 'password' ? 'ring-2 ring-[#D4A5A5]/20 rounded-lg' : ''
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${
                    isFocused === 'password' ? 'text-[#D4A5A5]' : 'text-gray-400'
                  } transition-colors duration-200`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  className="w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200 bg-white placeholder-gray-400 text-[#131837]"
                  placeholder="••••••••"
                  disabled={isLoading || isGoogleLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-[#D4A5A5] transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isGoogleLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded transition-colors duration-200"
                disabled={isLoading || isGoogleLoading}
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
                Se souvenir de moi
              </label>
            </div>

            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-[#D4A5A5] hover:text-[#E16939] transition-colors duration-200"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Acceptation des conditions d'utilisation */}
          <div className="flex items-start space-x-3 p-4 bg-rose-50/30 border border-rose-100/50 rounded-xl backdrop-blur-sm">
            <input
              id="accept-terms-login"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-rose-500 focus:ring-rose-500 border-gray-300 rounded transition-colors duration-200"
              disabled={isLoading || isGoogleLoading}
            />
            <label htmlFor="accept-terms-login" className="text-sm text-slate-700 leading-relaxed">
              J'accepte les{' '}
              <Link to="/terms" className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-200 underline decoration-dotted underline-offset-2">
                conditions d'utilisation
              </Link>{' '}
              et la{' '}
              <Link to="/privacy" className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-200 underline decoration-dotted underline-offset-2">
                politique de confidentialité
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading || !isFormValid}
            className="group relative w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
                <span>Connexion en cours...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Se connecter</span>
                <ArrowRight className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
              </div>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Nouveau sur Loventy ?</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to={templateId ? `/auth/register?redirect=/templates&template=${templateId}` : "/auth/register"}
              className="group w-full inline-flex items-center justify-center py-3 px-4 border-2 border-[#D4A5A5] text-[#D4A5A5] font-medium rounded-xl hover:bg-[#D4A5A5]/5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Créer un compte gratuit</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
};

export default Login;