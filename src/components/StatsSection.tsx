import React from 'react';
import { Heart, Users, Globe, Award, Sparkles, TrendingUp, Star, Crown, CheckCircle } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    { 
      value: '15K+', 
      label: 'Couples heureux',
      icon: Heart,
      color: 'text-[#E16939]',
      bgColor: 'bg-[#E16939]/10',
      borderColor: 'border-[#E16939]/20',
      delay: '0s'
    },
    { 
      value: '750K+', 
      label: 'Invitations envoyées',
      icon: Sparkles,
      color: 'text-[#131837]',
      bgColor: 'bg-[#131837]/10',
      borderColor: 'border-[#131837]/20',
      delay: '0.1s'
    },
    { 
      value: '99.8%', 
      label: 'Satisfaction',
      icon: Award,
      color: 'text-[#E16939]',
      bgColor: 'bg-[#E16939]/10',
      borderColor: 'border-[#E16939]/20',
      delay: '0.2s'
    },
    { 
      value: '45', 
      label: 'Pays',
      icon: Globe,
      color: 'text-[#131837]',
      bgColor: 'bg-[#131837]/10',
      borderColor: 'border-[#131837]/20',
      delay: '0.3s'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#F6F7EC] relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23131837' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#E16939]/10 px-4 py-2 rounded-full mb-6">
            <TrendingUp className="h-4 w-4 text-[#E16939]" />
            <span className="text-sm font-medium text-[#E16939]">Nos résultats</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#131837] font-serif mb-4">
            La confiance de milliers de couples
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rejoignez une communauté grandissante qui fait confiance à Loventy pour leurs moments les plus précieux
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative"
              style={{ 
                animation: `fadeInUp 0.8s ease-out ${stat.delay} both`
              }}
            >
              {/* Card */}
              <div className={`relative bg-white rounded-2xl p-6 lg:p-8 shadow-sm border ${stat.borderColor} hover:shadow-xl hover:border-[#E16939]/40 transition-all duration-500 group-hover:-translate-y-2 overflow-hidden`}>
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#E16939]/5 to-[#131837]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon container */}
                <div className={`inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 ${stat.bgColor} rounded-2xl mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <stat.icon className={`h-6 w-6 lg:h-8 lg:w-8 ${stat.color}`} />
                </div>
                
                {/* Value */}
                <div className="text-2xl lg:text-4xl font-bold text-[#131837] mb-2 lg:mb-3 group-hover:text-[#E16939] transition-colors duration-300 relative z-10">
                  {stat.value}
                </div>
                
                {/* Label */}
                <div className="text-sm lg:text-base text-gray-600 font-medium leading-relaxed relative z-10">
                  {stat.label}
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-[#E16939]/20 rounded-full group-hover:bg-[#E16939]/40 transition-colors duration-300"></div>
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#E16939] to-[#131837] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                
                {/* Side accent line */}
                <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-[#131837] to-[#E16939] h-0 group-hover:h-full transition-all duration-500 ease-out delay-100"></div>
              </div>

              {/* Floating decoration */}
              <div 
                className="absolute -top-2 -right-2 w-4 h-4 bg-[#E16939]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  animation: `float 3s ease-in-out infinite ${stat.delay}`
                }}
              >
                <div className="w-full h-full bg-[#E16939]/20 rounded-full animate-ping"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA - Version responsive améliorée */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 sm:px-6 lg:px-8 py-6 shadow-lg border border-[#E16939]/10 max-w-4xl mx-auto">
            
            {/* Version mobile - Layout vertical */}
            <div className="block sm:hidden space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-r from-[#E16939] to-[#131837] border-2 border-white flex items-center justify-center">
                      <Star className="h-2 w-2 text-white fill-current" />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-[#E16939] fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-semibold text-[#131837]">Note moyenne</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-[#E16939] font-medium text-sm">
                <Heart className="h-4 w-4 fill-current animate-pulse" />
                <span className="text-center">Prêt à rejoindre cette communauté ?</span>
              </div>
            </div>

            {/* Version tablette et desktop - Layout horizontal */}
            <div className="hidden sm:flex items-center justify-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-[#E16939] to-[#131837] border-2 border-white flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-[#E16939] fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-[#131837]">Note moyenne</span>
                  </p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              <div className="flex items-center space-x-2 text-[#E16939] font-medium">
                <Heart className="h-5 w-5 fill-current animate-pulse" />
                <span>Prêt à rejoindre cette communauté ?</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style >{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .group:hover {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </section>
  );
};

export default StatsSection;