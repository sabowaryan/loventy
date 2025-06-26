import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import LoventyLogo from '../LoventyLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true 
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAF9F7] via-white to-[#F6F7EC] z-0"></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4A5A5]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E16939]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#D4A5A5]/3 to-[#E16939]/3 rounded-full blur-3xl"></div>
      </div>

      {/* Floating hearts animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <LoventyLogo className="h-4 w-4 text-[#D4A5A5]/20 fill-current" />
          </div>
        ))}
      </div>

      {/* Decorative shapes */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-[#D4A5A5]/20 rounded-full animate-pulse hidden lg:block"></div>
      <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#E16939]/30 rounded-full animate-pulse hidden lg:block" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 bg-[#C5D2C2]/25 rounded-full animate-pulse hidden lg:block" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-8 px-4 sm:px-0">
              <Link
                to="/"
                className="group inline-flex items-center text-sm font-medium text-[#131837] hover:text-[#D4A5A5] transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Retour à l'accueil
              </Link>
            </div>
          )}

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="group flex items-center space-x-3">
              <div className="relative">
                <LoventyLogo className="h-12 w-12 text-[#D4A5A5] fill-current group-hover:scale-110 transition-transform duration-300" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-[#E16939] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-4xl font-bold text-[#131837] font-serif group-hover:text-[#D4A5A5] transition-colors duration-300">
                Loventy
              </span>
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-8 px-4 sm:px-0">
            <h2 className="text-3xl font-bold text-[#131837] font-serif mb-3">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Form Container */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white/80 backdrop-blur-sm py-10 px-6 shadow-2xl rounded-3xl sm:px-12 border border-white/20 relative overflow-hidden">
            {/* Card decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939]"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#D4A5A5]/20 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#E16939]/20 rounded-full"></div>
            
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center px-4 sm:px-0">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 leading-relaxed">
              En continuant, vous acceptez nos{' '}
              <Link to="/terms" className="text-[#D4A5A5] hover:text-[#E16939] font-medium transition-colors duration-200 underline decoration-dotted">
                conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link to="/privacy" className="text-[#D4A5A5] hover:text-[#E16939] font-medium transition-colors duration-200 underline decoration-dotted">
                politique de confidentialité
              </Link>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <Link to="/cookies" className="text-[#D4A5A5] hover:text-[#E16939] font-medium transition-colors duration-200 underline decoration-dotted">
                En savoir plus sur notre utilisation des cookies
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.3;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;