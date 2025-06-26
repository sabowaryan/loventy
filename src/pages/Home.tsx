import React, { useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import AnimatedSection from '../components/AnimatedSection';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import Features from '../components/Features';
import Process from '../components/Process';
import Testimonials from '../components/Testimonials';
import TemplatesPreview from '../components/TemplatesPreview';
import PricingPreview from '../components/PricingPreview';
import Newsletter from '../components/Newsletter';
import CTASection from '../components/CTASection';
import SeoHead from '../components/SeoHead';

const Home: React.FC = () => {
  usePageTitle('Accueil');
  
  // Ajouter des IDs aux sections pour la détection de scroll
  useEffect(() => {
    const sections = [
      { component: 'hero', id: 'hero' },
      { component: 'stats', id: 'stats' },
      { component: 'features', id: 'features' },
      { component: 'process', id: 'process' },
      { component: 'templates', id: 'templates' },
      { component: 'testimonials', id: 'testimonials' },
      { component: 'pricing', id: 'pricing' },
      { component: 'newsletter', id: 'newsletter' },
      { component: 'cta', id: 'cta' }
    ];
    
    // Observer pour détecter les sections visibles
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Mettre à jour l'attribut data-section sur le body
            document.body.setAttribute('data-section', entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    
    // Observer chaque section
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => {
      // Nettoyer l'observer
      observer.disconnect();
    };
  }, []);
  
  return (
    <>
      <SeoHead 
        pagePath="/" 
        overrides={{
          title: "Loventy - Créez des invitations de mariage élégantes et personnalisées",
          description: "Créez, personnalisez et partagez des invitations de mariage digitales élégantes. Suivez les réponses de vos invités en temps réel avec Loventy.",
          keywords: "invitation mariage, faire-part électronique, RSVP en ligne, invitation digitale, mariage, faire-part mariage"
        }}
      />
      <div className="overflow-hidden scroll-smooth">
        {/* Hero Section - Pas d'animation car déjà visible */}
        <section id="hero">
          <Hero />
        </section>

        {/* Stats Section avec animation */}
        <section id="stats">
          <AnimatedSection animation="fadeInUp" threshold={0.2}>
            <StatsSection />
          </AnimatedSection>
        </section>

        {/* Features Section avec animation décalée */}
        <section id="features">
          <AnimatedSection animation="fadeInUp" delay={100} threshold={0.15}>
            <Features />
          </AnimatedSection>
        </section>

        {/* Process Section avec animation slide */}
        <section id="process">
          <AnimatedSection animation="slideInLeft" delay={200} threshold={0.15}>
            <Process />
          </AnimatedSection>
        </section>

        {/* Templates Preview Section */}
        <section id="templates">
          <AnimatedSection animation="scaleIn" delay={100} threshold={0.1}>
            <TemplatesPreview />
          </AnimatedSection>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials">
          <AnimatedSection animation="fadeInUp" delay={150} threshold={0.1}>
            <Testimonials />
          </AnimatedSection>
        </section>

        {/* Pricing Preview Section */}
        <section id="pricing">
          <AnimatedSection animation="slideInRight" delay={100} threshold={0.1}>
            <PricingPreview />
          </AnimatedSection>
        </section>

        {/* Newsletter Section */}
        <section id="newsletter">
          <AnimatedSection animation="fadeIn" delay={200} threshold={0.15}>
            <Newsletter />
          </AnimatedSection>
        </section>

        {/* Final CTA Section */}
        <section id="cta">
          <AnimatedSection animation="fadeInUp" delay={100} threshold={0.2}>
            <CTASection />
          </AnimatedSection>
        </section>
      </div>
    </>
  );
};

export default Home;