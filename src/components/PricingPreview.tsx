import React from 'react';
import { Crown, Check, ArrowRight, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import StaggeredGrid from './StaggeredGrid';
import AnimatedSection from './AnimatedSection';

const PricingPreview: React.FC = () => {
  const plans = [
    {
      name: 'Découverte',
      price: 0,
      period: 'Gratuit',
      description: 'Parfait pour commencer',
      features: [
        '3 invitations par mois',
        '50 invités maximum',
        '2 modèles gratuits',
        'Envoi par email',
        'Support communautaire'
      ],
      cta: 'Commencer gratuitement',
      popular: false,
      color: 'border-gray-200',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      buttonColor: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      name: 'Essentiel',
      price: 19.99,
      period: 'par mois',
      description: 'Idéal pour les petits mariages',
      features: [
        '25 invitations par mois',
        '300 invités maximum',
        '10 modèles premium',
        'Tous canaux d\'envoi',
        'Support prioritaire',
        'Export PDF',
        'Statistiques basiques'
      ],
      cta: 'Choisir Essentiel',
      popular: true,
      color: 'border-[#D4A5A5]',
      bgColor: 'bg-[#D4A5A5]/5',
      textColor: 'text-[#D4A5A5]',
      buttonColor: 'bg-[#D4A5A5] hover:bg-[#D4A5A5]/90'
    },
    {
      name: 'Prestige',
      price: 39.99,
      period: 'par mois',
      description: 'Pour les grands événements',
      features: [
        'Invitations illimitées',
        'Invités illimités',
        'Tous les modèles',
        'Domaine personnalisé',
        'Analytics avancées',
        'Support dédié',
        'API & intégrations'
      ],
      cta: 'Choisir Prestige',
      popular: false,
      color: 'border-[#E16939]',
      bgColor: 'bg-[#E16939]/5',
      textColor: 'text-[#E16939]',
      buttonColor: 'bg-[#E16939] hover:bg-[#E16939]/90'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#FAF9F7] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23131837' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-[#D4A5A5]/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-[#E16939]/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-[#C5D2C2]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header avec animation */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#E16939]/10 px-4 py-2 rounded-full mb-6">
            <Crown className="h-4 w-4 text-[#E16939] animate-pulse" />
            <span className="text-sm font-medium text-[#E16939]">Tarifs</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#131837] mb-6 font-serif">
            Des prix transparents
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choisissez le plan qui correspond à vos besoins. Commencez gratuitement et évoluez selon vos projets
          </p>
        </AnimatedSection>

        {/* Pricing cards avec animation en cascade */}
        <StaggeredGrid 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          itemClassName="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border-2 hover:border-[#D4A5A5]/50 overflow-hidden"
          delay={200}
        >
          {plans.map((plan, index) => (
            <React.Fragment key={index}>
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>Le plus populaire</span>
                  </div>
                </div>
              )}

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A5A5]/5 to-[#E16939]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${plan.bgColor} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Crown className={`h-8 w-8 ${plan.textColor}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-[#131837] mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#131837]">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    )}
                  </div>
                  
                  <Link
                    to={plan.price === 0 ? "/auth/register" : "/pricing"}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 ${plan.buttonColor} text-white font-medium rounded-full transition-all duration-300 group-hover:scale-105 transform active:scale-95`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
                
                {/* Features list avec animation en cascade */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[#131837] mb-3">Fonctionnalités incluses:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex} 
                      className="flex items-center space-x-3 transition-all duration-300"
                      style={{ transitionDelay: `${featureIndex * 50}ms` }}
                    >
                      <div className={`p-1 ${plan.bgColor} rounded-full`}>
                        <Check className={`h-4 w-4 ${plan.textColor}`} />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-6 right-6 w-2 h-2 bg-[#D4A5A5]/20 rounded-full group-hover:bg-[#D4A5A5]/40 transition-colors duration-300"></div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
            </React.Fragment>
          ))}
        </StaggeredGrid>

        {/* Bottom CTA avec animation */}
        <AnimatedSection animation="fadeInUp" delay={400} className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-[#D4A5A5]/10 max-w-2xl mx-auto transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Zap className="h-6 w-6 text-[#E16939] animate-pulse" />
              <h3 className="text-xl font-semibold text-[#131837]">
                Garantie satisfait ou remboursé
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Essayez Loventy sans risque pendant 30 jours. Si vous n'êtes pas entièrement satisfait, nous vous remboursons intégralement.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center px-6 py-3 bg-[#131837] text-white font-medium rounded-full hover:bg-[#1e2347] transition-colors duration-300 transform hover:scale-105 active:scale-95"
            >
              <span>Voir tous les détails</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingPreview;