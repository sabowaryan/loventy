import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Heart, Star, Crown, Circle, Flower2, Gem } from 'lucide-react';
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
      {/* Modern gradient background with mesh pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-rose-50/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,165,165,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(225,105,57,0.06),transparent_50%)]"></div>

      {/* Animated mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%23D4A5A5' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-rose-200/20 to-pink-300/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-orange-200/15 to-amber-300/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-rose-300/10 to-pink-200/15 rounded-full blur-2xl animate-float-gentle" style={{ animationDelay: '6s' }}></div>

        {/* Medium decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-rose-100/30 to-transparent rounded-full blur-xl animate-pulse-gentle"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-tl from-orange-100/40 to-transparent rounded-full blur-xl animate-pulse-gentle" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Romantic floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Wedding rings */}
        {[...Array(2)].map((_, i) => (
          <div
            key={`rings-${i}`}
            className="absolute animate-float-gentle"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${12 + Math.random() * 6}s`
            }}
          >
            <Circle className="h-4 w-4 text-rose-300/20 fill-current" />
          </div>
        ))}

        {/* Flowers */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`flower-${i}`}
            className="absolute animate-twinkle"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          >
            <Flower2 className="h-3 w-3 text-pink-300/25 fill-current" />
          </div>
        ))}

        {/* Gems */}
        {[...Array(2)].map((_, i) => (
          <div
            key={`gem-${i}`}
            className="absolute animate-sparkle"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            <Gem className="h-3 w-3 text-amber-300/30 fill-current" />
          </div>
        ))}

        {/* Hearts */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute animate-float-gentle"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${10 + Math.random() * 8}s`
            }}
          >
            <Heart className="h-2.5 w-2.5 text-rose-300/20 fill-current" />
          </div>
        ))}
      </div>

      {/* Subtle geometric decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-rose-300/30 rounded-full animate-pulse-gentle hidden lg:block"></div>
        <div className="absolute bottom-1/3 right-12 w-1.5 h-1.5 bg-orange-300/40 rounded-full animate-pulse-gentle hidden lg:block" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-pink-300/25 rounded-full animate-pulse-gentle hidden lg:block" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/6 right-1/3 w-2.5 h-2.5 bg-rose-400/20 rounded-full animate-pulse-gentle hidden xl:block" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center py-8 sm:px-6 lg:px-8 min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          {/* Enhanced back button */}
          {showBackButton && (
            <div className="mb-6 px-4 sm:px-0">
              <Link
                to="/"
                className="group inline-flex items-center text-sm font-medium text-slate-600 hover:text-rose-600 transition-all duration-300 hover:translate-x-1"
              >
                <div className="mr-2 p-1 rounded-full bg-white/60 backdrop-blur-sm group-hover:bg-rose-50 transition-all duration-300">
                  <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform duration-300" />
                </div>
                Retour à l'accueil
              </Link>
            </div>
          )}

          {/* Enhanced logo section */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="group relative">
              <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 group-hover:bg-white/60 group-hover:border-rose-200/60 transition-all duration-500 group-hover:shadow-lg">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 to-orange-400/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-500"></div>
                  <div className="relative bg-white/80 p-2 rounded-xl">
                    <LoventyLogo className="h-8 w-8 text-rose-500 fill-current group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-800 font-serif group-hover:text-rose-600 transition-colors duration-500">
                    Loventy
                  </span>
                  <div className="text-xs text-slate-500 font-medium tracking-wide">
                    Invitations de mariage
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Enhanced title section */}
          <div className="text-center mb-8 px-4 sm:px-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 font-serif mb-3 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-slate-600 leading-relaxed max-w-sm mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Revolutionary form container */}
        <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
          <div className="relative group">
            {/* Outer glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-rose-300/20 via-pink-300/20 to-orange-300/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

            {/* Main glassmorphism card */}
            <div className="relative backdrop-blur-xl bg-white/70 border border-white/50 rounded-3xl shadow-2xl overflow-hidden">
              {/* Top gradient border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent"></div>

              {/* Corner accent lights */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-rose-200/30 to-transparent rounded-bl-3xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-orange-200/30 to-transparent rounded-tr-3xl"></div>

              {/* Floating particles inside card */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 right-6 w-1 h-1 bg-rose-400/40 rounded-full animate-pulse-gentle"></div>
                <div className="absolute bottom-6 right-4 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse-gentle" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-8 left-8 w-0.5 h-0.5 bg-orange-400/50 rounded-full animate-pulse-gentle" style={{ animationDelay: '2s' }}></div>
              </div>

              {/* Subtle texture overlay */}
              <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>

              {/* Inner highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-3xl"></div>

              {/* Content */}
              <div className="relative z-10 p-8 sm:p-10">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Simplified footer */}
        <div className="mt-8 text-center px-4 sm:px-0">
          <div className="max-w-lg mx-auto">
            <p className="text-xs text-slate-500">
              <Link to="/cookies" className="text-rose-500 hover:text-rose-600 font-medium transition-colors duration-200 underline decoration-dotted underline-offset-2">
                Gestion des cookies
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-12px) rotate(3deg);
            opacity: 0.6;
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-8px) scale(1.02);
            opacity: 0.7;
          }
        }
        
        @keyframes pulse-gentle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8) rotate(0deg);
          }
          25% {
            opacity: 0.8;
            transform: scale(1.2) rotate(90deg);
          }
          50% {
            opacity: 0.4;
            transform: scale(1) rotate(180deg);
          }
          75% {
            opacity: 0.9;
            transform: scale(1.3) rotate(270deg);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.1;
            transform: scale(0.5) rotate(0deg);
          }
          20% {
            opacity: 0.8;
            transform: scale(1.2) rotate(72deg);
          }
          40% {
            opacity: 0.3;
            transform: scale(0.8) rotate(144deg);
          }
          60% {
            opacity: 0.9;
            transform: scale(1.4) rotate(216deg);
          }
          80% {
            opacity: 0.2;
            transform: scale(0.6) rotate(288deg);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle 10s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 8s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 6s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;