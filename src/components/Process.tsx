import React from 'react';
import { 
  ArrowRight, 
  Heart, 
  Mail, 
  Smartphone, 
  Calendar, 
  Zap,
  Sparkles,
  CheckCircle,
  Edit,
  Send,
  Users
} from 'lucide-react';
import StaggeredGrid from './StaggeredGrid';
import AnimatedSection from './AnimatedSection';

const Process: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Choisissez',
      subtitle: 'Votre modèle parfait',
      description: 'Sélectionnez parmi notre collection de modèles élégants, conçus spécialement pour votre jour J',
      icon: Heart,
      color: 'from-[#D4A5A5] to-[#E16939]',
      bgColor: 'bg-[#D4A5A5]/10',
      borderColor: 'border-[#D4A5A5]/20',
      textColor: 'text-[#D4A5A5]',
      features: ['20+ modèles premium', 'Designs responsives', 'Personnalisation facile']
    },
    {
      step: '2',
      title: 'Personnalisez',
      subtitle: 'Votre histoire unique',
      description: 'Ajoutez vos informations, photos et messages personnels avec notre éditeur intuitif',
      icon: Edit,
      color: 'from-[#E16939] to-[#D4A5A5]',
      bgColor: 'bg-[#E16939]/10',
      borderColor: 'border-[#E16939]/20',
      textColor: 'text-[#E16939]',
      features: ['Éditeur visuel', 'Photos personnalisées', 'Messages sur mesure']
    },
    {
      step: '3',
      title: 'Partagez',
      subtitle: 'En un clic',
      description: 'Envoyez vos invitations par email, SMS, WhatsApp ou générez un QR code',
      icon: Send,
      color: 'from-[#C5D2C2] to-[#D4A5A5]',
      bgColor: 'bg-[#C5D2C2]/10',
      borderColor: 'border-[#C5D2C2]/20',
      textColor: 'text-[#C5D2C2]',
      features: ['Multi-canaux', 'Envoi groupé', 'QR codes inclus']
    },
    {
      step: '4',
      title: 'Suivez',
      subtitle: 'Les réponses en temps réel',
      description: 'Gérez les RSVP, envoyez des relances automatiques et consultez vos statistiques',
      icon: Users,
      color: 'from-[#131837] to-[#1e2347]',
      bgColor: 'bg-[#131837]/10',
      borderColor: 'border-[#131837]/20',
      textColor: 'text-[#131837]',
      features: ['Suivi temps réel', 'Relances auto', 'Analytics détaillées']
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
      <div className="absolute top-20 left-20 w-3 h-3 bg-[#E16939]/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-[#D4A5A5]/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-[#C5D2C2]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header avec animation */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#E16939]/10 px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4 text-[#E16939] animate-pulse" />
            <span className="text-sm font-medium text-[#E16939]">Processus</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#131837] mb-6 font-serif">
            Comment ça marche
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Créez votre invitation parfaite en 4 étapes simples et intuitives
          </p>
        </AnimatedSection>

        {/* Steps grid - Mobile first approach */}
        <div className="space-y-12 lg:space-y-0">
          {/* Mobile & Tablet Layout avec animation en cascade */}
          <div className="lg:hidden space-y-12">
            {steps.map((step, index) => (
              <AnimatedSection 
                key={index}
                animation="fadeInUp"
                delay={index * 200}
                className="relative"
              >
                {/* Step card */}
                <div className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#D4A5A5]/30 overflow-hidden">
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4A5A5]/5 to-[#E16939]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Step number and icon */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} text-white rounded-2xl font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {step.step}
                      </div>
                      <div className={`p-3 ${step.bgColor} rounded-xl border ${step.borderColor} group-hover:scale-105 transition-transform duration-300`}>
                        <step.icon className={`h-6 w-6 ${step.textColor}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#131837] mb-2 group-hover:text-[#D4A5A5] transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-lg font-medium text-[#E16939] mb-3">
                          {step.subtitle}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Features list */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {step.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-[#D4A5A5] flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-6 right-6 w-3 h-3 bg-[#D4A5A5]/20 rounded-full group-hover:bg-[#D4A5A5]/40 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                </div>

                {/* Connection arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-8">
                    <div className="w-12 h-12 bg-[#D4A5A5]/10 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-[#D4A5A5] transform rotate-90" />
                    </div>
                  </div>
                )}
              </AnimatedSection>
            ))}
          </div>

          {/* Desktop Layout avec animation en cascade */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-4 gap-8 relative">
              {/* Connection lines avec animation */}
              <AnimatedSection animation="fadeIn" delay={300} className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4A5A5] via-[#E16939] to-[#D4A5A5] opacity-30"></AnimatedSection>
              
              {steps.map((step, index) => (
                <AnimatedSection 
                  key={index}
                  animation="fadeInUp"
                  delay={index * 200}
                  className="relative group"
                >
                  {/* Step card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#D4A5A5]/30 overflow-hidden relative">
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4A5A5]/5 to-[#E16939]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 text-center">
                      {/* Step number */}
                      <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.color} text-white rounded-2xl font-bold text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {step.step}
                      </div>

                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 ${step.bgColor} rounded-xl border ${step.borderColor} mb-6 group-hover:scale-105 transition-transform duration-300`}>
                        <step.icon className={`h-8 w-8 ${step.textColor}`} />
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#131837] mb-2 group-hover:text-[#D4A5A5] transition-colors duration-300">
                            {step.title}
                          </h3>
                          <p className="text-sm font-medium text-[#E16939] mb-3">
                            {step.subtitle}
                          </p>
                          <p className="text-gray-600 leading-relaxed text-sm">
                            {step.description}
                          </p>
                        </div>

                        {/* Features list */}
                        <div className="space-y-2">
                          {step.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center justify-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-[#D4A5A5] flex-shrink-0" />
                              <span className="text-xs text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-[#D4A5A5]/20 rounded-full group-hover:bg-[#D4A5A5]/40 transition-colors duration-300"></div>
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                  </div>

                  {/* Connection arrows avec animation */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-20 -right-4 z-20">
                      <div className="w-8 h-8 bg-white rounded-full border-2 border-[#D4A5A5] flex items-center justify-center shadow-lg animate-pulse" style={{ animationDuration: '3s', animationDelay: `${index * 0.5}s` }}>
                        <ArrowRight className="h-4 w-4 text-[#D4A5A5]" />
                      </div>
                    </div>
                  )}

                  {/* Floating decoration */}
                  <div 
                    className="absolute -top-2 -right-2 w-4 h-4 bg-[#E16939]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-full h-full bg-[#E16939]/20 rounded-full animate-ping"></div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA avec animation */}
        <AnimatedSection animation="fadeInUp" delay={400} className="text-center mt-20">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <a
              href="/auth/register"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#131837] to-[#1e2347] text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 transform active:scale-95"
            >
              <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
              <span>Commencer maintenant</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            
            <a
              href="/templates"
              className="inline-flex items-center px-8 py-4 border-2 border-[#D4A5A5] text-[#D4A5A5] font-semibold rounded-full hover:bg-[#D4A5A5] hover:text-white transition-all duration-300 transform active:scale-95"
            >
              <span>Voir les modèles</span>
            </a>
          </div>
          
          <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
            ✨ Créez votre première invitation en moins de 5 minutes • 🎨 Aucune compétence technique requise
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Process;