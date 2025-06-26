import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Star, CheckCircle, Sparkles } from 'lucide-react';
import ParallaxElement from './ParallaxElement';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Déclencher l'animation après le montage
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] to-white overflow-hidden">
      {/* Subtle background pattern avec parallax */}
      <ParallaxElement speed={0.2} className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23131837' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </ParallaxElement>

      {/* Floating elements animés */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-[#D4A5A5]/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-[#E16939]/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-[#C5D2C2]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          
          {/* Left Content - Animation d'entrée */}
          <div className={`text-center lg:text-left space-y-6 lg:space-y-10 order-2 lg:order-1 transition-all duration-1000 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            
            {/* Badge discret avec animation */}
            <div className={`inline-flex items-center space-x-2 bg-[#D4A5A5]/5 border border-[#D4A5A5]/10 px-3 py-2 rounded-full transition-all duration-700 delay-200 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <div className="w-2 h-2 bg-[#D4A5A5] rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-[#131837]">Plateforme #1 des invitations digitales</span>
            </div>
            
            {/* Titre principal avec animation en cascade */}
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight">
                <span className={`block text-[#131837] font-serif transition-all duration-700 delay-300 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>Invitations</span>
                <span className={`block text-[#131837] font-serif transition-all duration-700 delay-500 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>de mariage</span>
                <span className={`block text-[#D4A5A5] font-serif italic transition-all duration-700 delay-700 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>élégantes</span>
              </h1>
              
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 font-light leading-relaxed max-w-xl mx-auto lg:mx-0 transition-all duration-700 delay-900 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                Créez et partagez des invitations digitales sophistiquées. 
                <span className="block mt-2 text-[#131837] font-medium">
                  Suivi des réponses en temps réel.
                </span>
              </p>
            </div>

            {/* CTA Section avec animation */}
            <div className={`space-y-4 lg:space-y-6 transition-all duration-700 delay-1100 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/auth/register"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-[#131837] text-white font-medium rounded-full hover:bg-[#1e2347] transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base transform hover:scale-105 active:scale-95"
                >
                  <span>Créer mon invitation</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                
                <Link
                  to="/templates"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-[#131837]/20 text-[#131837] font-medium rounded-full hover:border-[#131837]/40 hover:bg-[#131837]/5 transition-all duration-300 text-sm sm:text-base transform hover:scale-105 active:scale-95"
                >
                  <span>Voir les modèles</span>
                </Link>
              </div>

              {/* Garanties avec animation en cascade */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
                {[
                  { icon: CheckCircle, text: 'Essai gratuit', delay: 1300 },
                  { icon: CheckCircle, text: 'Modèles inclus', delay: 1400 },
                  { icon: CheckCircle, text: 'Prêt en 5 minutes', delay: 1500 }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center space-x-2 transition-all duration-500 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`} style={{ transitionDelay: `${item.delay}ms` }}>
                    <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-[#D4A5A5]" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof avec animation */}
            <div className={`flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6 pt-6 lg:pt-8 border-t border-gray-100 transition-all duration-700 delay-1600 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#D4A5A5] to-[#E16939] border-2 border-white transition-all duration-500 ${
                      isLoaded ? 'scale-100' : 'scale-0'
                    }`} style={{ transitionDelay: `${1700 + i * 100}ms` }}></div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 sm:h-4 sm:w-4 text-[#D4A5A5] fill-current transition-all duration-300 ${
                        isLoaded ? 'scale-100' : 'scale-0'
                      }`} style={{ transitionDelay: `${2000 + i * 50}ms` }} />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-[#131837]">10,000+</span> couples satisfaits
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Invitation avec parallax et animation */}
          <div className={`relative flex items-center justify-center order-1 lg:order-2 px-4 sm:px-0 transition-all duration-1000 delay-400 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <ParallaxElement speed={0.3} className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] mx-auto">
              
              {/* Invitation card avec animation de rotation subtile */}
              <div className={`relative w-full aspect-[3/4] mx-auto transform transition-all duration-1000 hover:scale-105 hover:rotate-1 ${
                isLoaded ? 'rotate-0' : 'rotate-3'
              }`} style={{
                background: 'linear-gradient(135deg, #1a4a3a 0%, #0d2818 100%)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}>
                
                {/* Motifs décoratifs avec animation */}
                <div className="absolute inset-0 opacity-10 overflow-hidden">
                  {[
                    { top: '8px', left: '8px', size: 'w-4 h-4 sm:w-6 sm:h-6', delay: 2200 },
                    { top: '8px', right: '8px', size: 'w-3 h-3 sm:w-4 sm:h-4', delay: 2300 },
                    { bottom: '8px', left: '8px', size: 'w-3 h-3 sm:w-4 sm:h-4', delay: 2400 },
                    { bottom: '8px', right: '8px', size: 'w-4 h-4 sm:w-6 sm:h-6', delay: 2500 }
                  ].map((item, index) => (
                    <div key={index} className={`absolute ${item.size} transition-all duration-500 ${
                      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`} style={{ 
                      ...item,
                      transitionDelay: `${item.delay}ms`,
                      background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23D4A5A5'/%3E%3C/svg%3E") center/contain no-repeat`
                    }}></div>
                  ))}
                </div>
                
                {/* Contenu de l'invitation avec animations en cascade */}
                <div className="relative h-full p-3 sm:p-4 md:p-6 flex flex-col justify-between text-center text-white overflow-hidden">
                  
                  {/* Header */}
                  <div className={`space-y-2 sm:space-y-3 flex-shrink-0 transition-all duration-700 delay-2600 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <div className="flex justify-center mb-1">
                      <div className="w-8 sm:w-12 h-0.5 bg-[#D4A5A5] rounded-full"></div>
                    </div>
                    <div className="text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] uppercase font-light opacity-90">
                      Les familles
                    </div>
                    <div className="text-xs sm:text-sm md:text-base font-bold tracking-wide leading-tight">
                      MUKENDI & TSHIAMALA
                    </div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs leading-relaxed opacity-90 px-1 sm:px-2">
                      Ont l'honneur de vous inviter<br/>
                      au mariage de leurs enfants
                    </div>
                  </div>

                  {/* Noms des mariés avec animation spéciale */}
                  <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col justify-center">
                    <div className={`relative transition-all duration-700 delay-2800 ${
                      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}>
                      <div 
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#D4A5A5] mb-1"
                        style={{
                          fontFamily: 'Dancing Script, cursive',
                          fontWeight: '600',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          lineHeight: '1.1'
                        }}
                      >
                        Grâce
                      </div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs tracking-wider font-light">MUKENDI</div>
                    </div>

                    {/* Anneaux avec animation de rotation */}
                    <div className={`flex justify-center items-center transition-all duration-700 delay-3000 ${
                      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 border-[#D4A5A5] transform rotate-12 opacity-90 animate-pulse"></div>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 border-[#D4A5A5] transform -rotate-12 opacity-90 -ml-1 sm:-ml-2 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                    </div>

                    <div className={`relative transition-all duration-700 delay-3200 ${
                      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}>
                      <div 
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#D4A5A5] mb-1"
                        style={{
                          fontFamily: 'Dancing Script, cursive',
                          fontWeight: '600',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          lineHeight: '1.1'
                        }}
                      >
                        Emmanuel
                      </div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs tracking-wider font-light">TSHIAMALA</div>
                    </div>
                  </div>

                  {/* Détails de l'événement avec animation */}
                  <div className={`space-y-2 sm:space-y-3 flex-shrink-0 transition-all duration-700 delay-3400 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <div className="flex justify-center mb-1">
                      <div className="w-6 sm:w-8 h-0.5 bg-[#D4A5A5] rounded-full"></div>
                    </div>
                    <div className="text-sm sm:text-base md:text-lg font-bold tracking-wide">
                      15 JUIN 2025
                    </div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs leading-relaxed space-y-1">
                      <div className="font-semibold">ÉGLISE SAINT-JOSEPH</div>
                      <div className="opacity-90">Avenue Tombalbaye, Gombe</div>
                      <div className="text-[#D4A5A5] font-medium">Kinshasa, RDC</div>
                    </div>
                    <div className="text-sm sm:text-base md:text-lg font-bold tracking-wider">
                      14H30
                    </div>
                    <div className="text-[8px] sm:text-[9px] md:text-[10px] space-y-0.5">
                      <div className="font-semibold">RSVP:</div>
                      <div className="text-[#D4A5A5]">MARIE : +243 81 234 5678</div>
                      <div className="text-[#D4A5A5]">JOSEPH : +243 99 876 5432</div>
                    </div>
                  </div>

                  {/* Décoration florale avec animation */}
                  <div className={`absolute bottom-0 left-0 right-0 h-6 sm:h-8 md:h-10 flex items-end justify-center transition-all duration-700 delay-3600 ${
                    isLoaded ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}>
                    <div className="w-full h-4 sm:h-6 md:h-8" style={{
                      background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4A5A5'%3E%3Cpath d='M50 30 Q75 15 100 30 Q125 45 150 30 Q175 15 200 30 Q225 45 250 30 Q275 15 300 30 Q325 45 350 30' stroke='%23D4A5A5' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='50' cy='30' r='2'/%3E%3Ccircle cx='100' cy='30' r='3'/%3E%3Ccircle cx='150' cy='30' r='2'/%3E%3Ccircle cx='200' cy='30' r='4'/%3E%3Ccircle cx='250' cy='30' r='2'/%3E%3Ccircle cx='300' cy='30' r='3'/%3E%3Ccircle cx='350' cy='30' r='2'/%3E%3Cpath d='M180 20 Q190 15 200 20 Q210 25 220 20' stroke='%23D4A5A5' stroke-width='1' fill='none'/%3E%3Cpath d='M180 40 Q190 45 200 40 Q210 35 220 40' stroke='%23D4A5A5' stroke-width='1' fill='none'/%3E%3C/g%3E%3C/svg%3E") center bottom/contain no-repeat`
                    }}></div>
                  </div>
                </div>
              </div>
              
              {/* Éléments décoratifs avec animation */}
              <div className={`absolute -top-2 -right-2 w-4 h-4 sm:w-6 sm:h-6 bg-[#D4A5A5]/20 rounded-full flex items-center justify-center transition-all duration-500 delay-3800 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}>
                <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-[#D4A5A5]" />
              </div>
              
              <div className={`absolute -bottom-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-[#E16939]/20 rounded-full flex items-center justify-center transition-all duration-500 delay-4000 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}>
                <Heart className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-[#E16939] fill-current" />
              </div>

              {/* Motifs décoratifs flottants */}
              <div className={`absolute top-1/4 -left-4 sm:-left-6 w-3 h-3 sm:w-4 sm:h-4 opacity-30 animate-pulse transition-all duration-500 delay-4200 ${
                isLoaded ? 'opacity-30 scale-100' : 'opacity-0 scale-0'
              }`} style={{
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23D4A5A5'/%3E%3C/svg%3E") center/contain no-repeat`
              }}></div>
              
              <div className={`absolute top-3/4 -right-4 sm:-right-6 w-2 h-2 sm:w-3 sm:h-3 opacity-40 animate-pulse transition-all duration-500 delay-4400 ${
                isLoaded ? 'opacity-40 scale-100' : 'opacity-0 scale-0'
              }`} style={{
                animationDelay: '1s',
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2l2.09 6.26L20 9.27l-5 4.87 1.18 6.88L12 17.77l-4.18 3.25L9 14.14 4 9.27l5.91-1.01L12 2z' fill='%23E16939'/%3E%3C/svg%3E") center/contain no-repeat`
              }}></div>
            </ParallaxElement>
          </div>
        </div>
      </div>

      {/* Scroll indicator avec animation */}
      <div className={`absolute bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 text-center hidden lg:block transition-all duration-700 delay-4600 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="w-px h-8 lg:h-12 bg-gradient-to-b from-transparent via-[#D4A5A5] to-transparent mx-auto mb-2 animate-pulse" style={{ animationDuration: '2s' }}></div>
        <p className="text-xs text-gray-400 font-light tracking-wide">DÉCOUVRIR</p>
      </div>

      {/* Import Google Fonts pour la calligraphie */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap');
      `}</style>
    </section>
  );
};

export default Hero;