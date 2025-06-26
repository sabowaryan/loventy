import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Heart, Sparkles, Gift, User } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import StaggeredGrid from './StaggeredGrid';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    // Simuler l'inscription
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  const benefits = [
    {
      icon: Sparkles,
      text: 'Nouveaux modèles en avant-première',
      color: 'text-[#E16939]'
    },
    {
      icon: Gift,
      text: 'Offres exclusives et réductions',
      color: 'text-[#D4A5A5]'
    },
    {
      icon: Heart,
      text: 'Conseils mariage personnalisés',
      color: 'text-[#C5D2C2]'
    }
  ];

  if (isSubscribed) {
    return (
      <section className="py-20 bg-gradient-to-r from-[#131837] via-[#1e2347] to-[#131837] text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-scale-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
              Merci pour votre inscription !
            </h3>
            
            <p className="text-xl opacity-90 mb-8">
              Vous recevrez bientôt nos dernières nouveautés et offres exclusives
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-sm opacity-75">
              <Heart className="h-4 w-4 fill-current animate-pulse" />
              <span>Bienvenue dans la famille Loventy</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-r from-[#131837] via-[#1e2347] to-[#131837] text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-[#D4A5A5]/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-[#E16939]/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header avec animation */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-12">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
            <Mail className="h-8 w-8 text-[#D4A5A5]" />
          </div>
          
          {/* Title */}
          <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
            Restez inspirés
          </h3>
          
          {/* Subtitle */}
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Recevez nos derniers modèles, conseils mariage et offres exclusives directement dans votre boîte mail
          </p>
        </AnimatedSection>

        {/* Benefits avec animation en cascade */}
        <StaggeredGrid 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          itemClassName="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
          delay={150}
        >
          {benefits.map((benefit) => (
            <React.Fragment key={benefit.text}>
              <div className="p-2 bg-white/10 rounded-lg">
                <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
              </div>
              <span className="text-sm font-medium">{benefit.text}</span>
            </React.Fragment>
          ))}
        </StaggeredGrid>

        {/* Newsletter form avec animation */}
        <AnimatedSection animation="fadeInUp" delay={300} className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input container avec design amélioré */}
            <div className="relative group">
              {/* Background glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${isFocused ? 'opacity-30' : ''}`}></div>
              
              {/* Main input container */}
              <div className={`relative bg-white/10 backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ${
                isFocused 
                  ? 'border-[#D4A5A5] bg-white/15 shadow-2xl shadow-[#D4A5A5]/20' 
                  : 'border-white/20 hover:border-white/40'
              }`}>
                
                {/* Input field */}
                <div className="flex items-center">
                  {/* Icon container */}
                  <div className={`flex items-center justify-center w-14 h-14 transition-colors duration-300 ${
                    isFocused ? 'text-[#D4A5A5]' : 'text-white/60'
                  }`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  
                  {/* Input */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="votre@email.com"
                    required
                    className="flex-1 bg-transparent text-white placeholder-white/60 focus:placeholder-white/40 outline-none py-4 pr-4 text-lg font-medium transition-all duration-300"
                  />
                  
                  {/* Submit button intégré */}
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className={`mr-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                      isLoading || !email.trim()
                        ? 'bg-white/20 text-white/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white hover:shadow-lg hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Envoi...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="hidden sm:inline">S'inscrire</span>
                        <Send className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                </div>
                
                {/* Bottom border animation */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] transition-all duration-500 ${
                  isFocused ? 'w-full' : 'w-0'
                }`}></div>
              </div>
              
              {/* Floating label */}
              <div className={`absolute left-14 transition-all duration-300 pointer-events-none ${
                isFocused || email 
                  ? '-top-3 left-4 text-xs bg-[#131837] px-2 text-[#D4A5A5] font-medium' 
                  : 'top-4 text-white/60'
              }`}>
                {isFocused || email ? 'Adresse email' : ''}
              </div>
            </div>
            
            {/* Alternative: Version séparée pour mobile */}
            <div className="sm:hidden">
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                  isLoading || !email.trim()
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white hover:shadow-lg hover:scale-105 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Inscription en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>S'inscrire à la newsletter</span>
                    <Send className="h-5 w-5" />
                  </div>
                )}
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-4 text-xs opacity-75">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Aucun spam</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Désinscription facile</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Contenu exclusif</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs opacity-60">
                <User className="h-3 w-3" />
                <span>Rejoignez plus de 15 000 couples qui nous font confiance</span>
              </div>
            </div>
          </form>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Newsletter;