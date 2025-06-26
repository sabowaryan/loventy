import React, { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';

const Contact: React.FC = () => {
  usePageTitle('Contact');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    // Simulate API call
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact information
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@loventy.org',
      link: 'mailto:contact@loventy.org'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+243 81 234 5678',
      link: 'tel:+243812345678'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: 'Avenue Tombalbaye, Gombe, Kinshasa, RDC',
      link: 'https://maps.google.com/?q=Avenue+Tombalbaye+Gombe+Kinshasa+RDC'
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: 'Comment puis-je créer mon invitation de mariage ?',
      answer: 'Créer votre invitation est simple ! Inscrivez-vous gratuitement, choisissez un modèle qui vous plaît, personnalisez-le avec vos informations et partagez-le avec vos invités par email ou via un lien.'
    },
    {
      question: 'Puis-je essayer Loventy gratuitement ?',
      answer: 'Oui, nous proposons un plan gratuit qui vous permet de créer jusqu\'à 3 invitations par mois avec 50 invités maximum. C\'est parfait pour tester notre plateforme avant de passer à un plan premium.'
    },
    {
      question: 'Comment mes invités confirment-ils leur présence ?',
      answer: 'Vos invités reçoivent un lien vers votre invitation en ligne où ils peuvent facilement confirmer leur présence en quelques clics. Vous recevez des notifications en temps réel et pouvez suivre toutes les réponses dans votre tableau de bord.'
    },
    {
      question: 'Puis-je personnaliser les questions RSVP ?',
      answer: 'Absolument ! Avec nos plans premium, vous pouvez ajouter des questions personnalisées à votre formulaire RSVP pour recueillir des informations supplémentaires comme les préférences alimentaires ou les besoins spécifiques de vos invités.'
    }
  ];

  return (
    <div className="min-h-screen bg-accent py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#D4A5A5]/10 px-4 py-2 rounded-full mb-6">
            <Mail className="h-4 w-4 text-[#D4A5A5] animate-pulse" />
            <span className="text-sm font-medium text-[#D4A5A5]">Contact</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-serif">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Vous avez des questions ou besoin d'aide ? Notre équipe est là pour vous accompagner dans la création de vos invitations de mariage parfaites.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <AnimatedSection animation="fadeInUp" delay={200} className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-primary mb-6 font-serif">
                Envoyez-nous un message
              </h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Message envoyé avec succès</p>
                    <p className="text-sm text-green-700 mt-1">Merci de nous avoir contactés ! Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Erreur</p>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200"
                      placeholder="Votre nom"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200"
                      placeholder="votre@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="billing">Facturation</option>
                    <option value="feature">Suggestion de fonctionnalité</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-all duration-200"
                    placeholder="Comment pouvons-nous vous aider ?"
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {/* Contact Information */}
          <AnimatedSection animation="fadeInUp" delay={400} className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-primary mb-6 font-serif">
                Nos coordonnées
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-3 bg-[#D4A5A5]/10 rounded-lg">
                      <item.icon className="h-6 w-6 text-[#D4A5A5]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                      <a 
                        href={item.link} 
                        className="text-gray-600 hover:text-[#D4A5A5] transition-colors"
                        target={item.title === 'Adresse' ? '_blank' : undefined}
                        rel={item.title === 'Adresse' ? 'noopener noreferrer' : undefined}
                      >
                        {item.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Heures d'ouverture</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Lundi - Vendredi: 8h00 - 18h00</p>
                  <p>Samedi: 9h00 - 14h00</p>
                  <p>Dimanche: Fermé</p>
                </div>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-primary mb-6 font-serif">
                Questions fréquentes
              </h2>
              
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Map Section */}
        <AnimatedSection animation="fadeInUp" delay={600} className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-primary mb-6 font-serif text-center">
              Nous trouver
            </h2>
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.454699960991!2d15.2922146!3d-4.3068813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a6a33d43d1b5e3b%3A0x3e89d7ec0b38e1d!2sAvenue%20Tombalbaye%2C%20Kinshasa!5e0!3m2!1sfr!2scd!4v1687350000000!5m2!1sfr!2scd" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Loventy Office Location"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection animation="fadeInUp" delay={800} className="text-center">
          <div className="bg-gradient-to-r from-[#131837] to-[#1e2347] rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif">
                Prêt à créer votre invitation de mariage parfaite ?
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Commencez dès aujourd'hui et découvrez pourquoi des milliers de couples choisissent Loventy pour leur grand jour.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-[#131837] font-semibold rounded-full hover:bg-gray-50 transition-colors duration-300 transform hover:scale-105 active:scale-95"
                >
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="/templates"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors duration-300 transform hover:scale-105 active:scale-95"
                >
                  <span>Voir les modèles</span>
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Contact;