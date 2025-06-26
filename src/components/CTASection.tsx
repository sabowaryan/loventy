import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, CheckCircle, Star, Crown } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import StaggeredGrid from './StaggeredGrid';

const CTASection: React.FC = () => {
  const guarantees = [
    {
      icon: CheckCircle,
      text: 'Aucune carte de crédit requise',
      color: 'text-green-400'
    },
    {
      icon: Star,
      text: 'Modèles gratuits inclus',
      color: 'text-yellow-400'
    },
    {
      icon: Heart,
      text: 'Support 24/7',
      color: 'text-pink-400'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Couples satisfaits' },
    { value: '4.9/5', label: 'Note moyenne' },
    { value: '99%', label: 'Recommandent' }
  ];

  return (
    <section className="py-24 bg-gradient-to-r from-[#131837] via-[#1e2347] to-[#131837] text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-3 h-3 bg-[#D4A5A5]/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-3.5 h-3.5 bg-[#E16939]/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Large decorative hearts */}
      <div className="absolute top-1/4 left-10 opacity-5">
        <Heart className="h-32 w-32 text-white fill-current" />
      </div>
      <div className="absolute bottom-1/4 right-10 opacity-5">
        <Crown className="h-24 w-24 text-white" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge avec animation */}
          <AnimatedSection animation="fadeInUp" className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-[#D4A5A5] animate-pulse" />
            <span className="text-sm font-medium">Commencez dès aujourd'hui</span>
          </AnimatedSection>
          
          {/* Main title avec animation */}
          <AnimatedSection animation="fadeInUp" delay={200} className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight">
              Prêts à créer votre
              <span className="block text-transparent bg-gradient-to-r from-[#D4A5A5] to-[#E16939] bg-clip-text">
                invitation de rêve ?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Rejoignez des milliers de couples qui ont choisi Loventy pour leur grand jour
            </p>
          </AnimatedSection>

          {/* Stats avec animation en cascade */}
          <StaggeredGrid 
            className="flex flex-wrap justify-center items-center gap-8 py-8"
            itemClassName="text-center"
            delay={150}
          >
            {stats.map((stat) => (
              <React.Fragment key={stat.value}>
                <div className="text-3xl md:text-4xl font-bold text-[#D4A5A5] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm opacity-75">{stat.label}</div>
              </React.Fragment>
            ))}
          </StaggeredGrid>
          
          {/* CTA Buttons avec animation */}
          <AnimatedSection animation="fadeInUp" delay={400} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              to="/auth/register"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg transform active:scale-95"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            
            <Link
              to="/templates"
              className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 text-lg transform active:scale-95"
            >
              <span>Voir les modèles</span>
            </Link>
          </AnimatedSection>
          
          {/* Guarantees avec animation en cascade */}
          <StaggeredGrid 
            className="flex flex-wrap justify-center items-center gap-6 md:gap-8 pt-8"
            itemClassName="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
            delay={100}
          >
            {guarantees.map((guarantee) => (
              <React.Fragment key={guarantee.text}>
                <guarantee.icon className={`h-4 w-4 ${guarantee.color}`} />
                <span className="text-sm font-medium">{guarantee.text}</span>
              </React.Fragment>
            ))}
          </StaggeredGrid>

          {/* Bottom message avec animation */}
          <AnimatedSection animation="fadeInUp" delay={600} className="pt-8 border-t border-white/10">
            <p className="text-sm opacity-75 max-w-2xl mx-auto leading-relaxed">
              Plus de <strong>10,000 couples</strong> ont déjà créé leur invitation parfaite avec Loventy. 
              Rejoignez-les et créez des souvenirs inoubliables pour votre jour J.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default CTASection;