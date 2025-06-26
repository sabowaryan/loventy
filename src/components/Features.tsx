import React from 'react';
import { 
  Heart, 
  Zap, 
  Globe, 
  Users, 
  Smartphone, 
  Shield, 
  Palette, 
  Mail, 
  BarChart3, 
  Crown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import StaggeredGrid from './StaggeredGrid';
import AnimatedSection from './AnimatedSection';

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Heart,
      title: 'Designs Élégants',
      description: 'Collection de modèles sophistiqués conçus par des designers professionnels pour votre jour J',
      color: 'text-[#E16939]',
      bgColor: 'bg-[#E16939]/10',
      borderColor: 'border-[#E16939]/20',
      category: 'Design'
    },
    {
      icon: Zap,
      title: 'Création Instantanée',
      description: 'Créez votre invitation en moins de 5 minutes avec notre éditeur intuitif et puissant',
      color: 'text-[#131837]',
      bgColor: 'bg-[#131837]/10',
      borderColor: 'border-[#131837]/20',
      category: 'Rapidité'
    },
    {
      icon: Globe,
      title: 'Partage Multi-Canal',
      description: 'Email, SMS, WhatsApp, QR code - partagez vos invitations comme vous le souhaitez',
      color: 'text-[#E16939]',
      bgColor: 'bg-[#E16939]/10',
      borderColor: 'border-[#E16939]/20',
      category: 'Partage'
    },
    {
      icon: Users,
      title: 'Gestion Intelligente',
      description: 'Suivi des RSVP en temps réel avec relances automatiques et analytics détaillées',
      color: 'text-[#131837]',
      bgColor: 'bg-[#131837]/10',
      borderColor: 'border-[#131837]/20',
      category: 'Gestion'
    },
    {
      icon: Smartphone,
      title: '100% Responsive',
      description: 'Parfait sur tous les appareils, du mobile au desktop avec une expérience optimisée',
      color: 'text-[#E16939]',
      bgColor: 'bg-[#E16939]/10',
      borderColor: 'border-[#E16939]/20',
      category: 'Technologie'
    },
    {
      icon: Shield,
      title: 'Sécurisé & Fiable',
      description: 'Vos données protégées avec un hébergement sécurisé et une infrastructure robuste',
      color: 'text-[#131837]',
      bgColor: 'bg-[#131837]/10',
      borderColor: 'border-[#131837]/20',
      category: 'Sécurité'
    }
  ];

  const premiumFeatures = [
    {
      icon: Palette,
      title: 'Personnalisation Avancée',
      description: 'Couleurs, polices, layouts personnalisés',
      isPremium: true
    },
    {
      icon: BarChart3,
      title: 'Analytics Détaillées',
      description: 'Statistiques complètes et insights',
      isPremium: true
    },
    {
      icon: Mail,
      title: 'Emails Illimités',
      description: 'Envois et relances sans limite',
      isPremium: true
    },
    {
      icon: Crown,
      title: 'Support Prioritaire',
      description: 'Assistance dédiée 24/7',
      isPremium: true
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#FAF9F7] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23131837' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-[#D4A5A5]/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-[#E16939]/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-[#C5D2C2]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header avec animation */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#D4A5A5]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-[#D4A5A5] animate-pulse" />
            <span className="text-sm font-medium text-[#D4A5A5]">Fonctionnalités</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#131837] mb-6 font-serif">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Une plateforme complète pour créer et gérer vos invitations de mariage avec élégance et simplicité
          </p>
        </AnimatedSection>

        {/* Main features grid avec animation en cascade */}
        <StaggeredGrid 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          itemClassName="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#D4A5A5]/30 overflow-hidden"
          delay={100}
        >
          {mainFeatures.map((feature, index) => (
            <React.Fragment key={index}>
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A5A5]/5 to-[#E16939]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Category badge */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-medium text-[#D4A5A5] bg-[#D4A5A5]/10 px-2 py-1 rounded-full">
                  {feature.category}
                </span>
              </div>

              {/* Icon container */}
              <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-[#131837] mb-4 group-hover:text-[#D4A5A5] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#D4A5A5]/20 rounded-full group-hover:bg-[#D4A5A5]/40 transition-colors duration-300"></div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
              
              {/* Hover arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="h-5 w-5 text-[#D4A5A5]" />
              </div>
            </React.Fragment>
          ))}
        </StaggeredGrid>

        {/* Premium features section */}
        <div className="relative">
          {/* Premium header avec animation */}
          <AnimatedSection animation="fadeInUp" className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white px-4 py-2 rounded-full mb-4">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">Fonctionnalités Premium</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#131837] mb-4 font-serif">
              Débloquez tout le potentiel
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Accédez à des fonctionnalités avancées pour une expérience encore plus personnalisée
            </p>
          </AnimatedSection>

          {/* Premium features grid avec animation */}
          <StaggeredGrid 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            itemClassName="group relative bg-gradient-to-br from-white to-[#FAF9F7] rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-[#D4A5A5]/20 hover:border-[#D4A5A5]/40"
            delay={150}
          >
            {premiumFeatures.map((feature, index) => (
              <React.Fragment key={index}>
                {/* Premium badge */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] rounded-full flex items-center justify-center">
                  <Crown className="h-3 w-3 text-white" />
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-[#D4A5A5]/10 rounded-lg group-hover:bg-[#D4A5A5]/20 transition-colors duration-300">
                    <feature.icon className="h-5 w-5 text-[#D4A5A5]" />
                  </div>
                  <h4 className="font-semibold text-[#131837] text-sm group-hover:text-[#D4A5A5] transition-colors duration-300">
                    {feature.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </React.Fragment>
            ))}
          </StaggeredGrid>

          {/* CTA Section avec animation */}
          <AnimatedSection animation="fadeInUp" className="text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <a
                href="/pricing"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 transform active:scale-95"
              >
                <Crown className="h-5 w-5 mr-2" />
                <span>Découvrir Premium</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              
              <a
                href="/auth/register"
                className="inline-flex items-center px-8 py-4 border-2 border-[#D4A5A5] text-[#D4A5A5] font-semibold rounded-full hover:bg-[#D4A5A5] hover:text-white transition-all duration-300 transform active:scale-95"
              >
                <span>Essayer gratuitement</span>
              </a>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              ✨ Aucune carte de crédit requise • 🎨 Modèles gratuits inclus
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Features;