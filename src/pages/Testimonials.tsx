import React, { useState } from 'react';
import { Star, Heart, Quote, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import AnimatedSection from '../components/AnimatedSection';

// Testimonial data type
interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
  featured?: boolean;
}

const Testimonials: React.FC = () => {
  usePageTitle('Témoignages');
  const [currentPage, setCurrentPage] = useState(0);
  const testimonialsPerPage = 6;

  // Mock testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Grâce & Emmanuel',
      role: 'Mariés en Juin 2024',
      location: 'Gombe, Kinshasa',
      text: 'Loventy nous a permis de créer des invitations magnifiques en quelques minutes. Le processus était si simple et le résultat dépassait nos attentes ! Nos invités ont adoré le design élégant et la facilité de répondre en ligne.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      featured: true
    },
    {
      id: 2,
      name: 'Joséphine & Patrice',
      role: 'Mariés en Septembre 2024',
      location: 'Lingwala, Kinshasa',
      text: 'Le suivi des réponses est fantastique. Plus besoin de relancer tout le monde par téléphone ! Nos invités ont adoré recevoir une invitation si moderne et interactive. Le service client a été très réactif quand nous avions des questions.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 3,
      name: 'Béatrice & Dieudonné',
      role: 'Mariés en Décembre 2024',
      location: 'Limete, Kinshasa',
      text: 'Design épuré, interface intuitive. Exactement ce que nous recherchions pour notre mariage. Le service client est également exceptionnel et très réactif. Nous avons pu créer une invitation qui reflète parfaitement notre style.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 4,
      name: 'Marie & Jean',
      role: 'Mariés en Mars 2024',
      location: 'Pointe-Noire, Congo',
      text: 'Nous avons choisi le forfait premium et cela en valait vraiment la peine ! Les modèles exclusifs sont magnifiques et les fonctionnalités supplémentaires comme le mur social ont rendu notre expérience de mariage encore plus spéciale.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3916455/pexels-photo-3916455.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 5,
      name: 'Carine & Michel',
      role: 'Mariés en Juillet 2024',
      location: 'Douala, Cameroun',
      text: 'Même avec le forfait gratuit, nous avons pu créer une invitation élégante qui a impressionné tous nos invités. La plateforme est vraiment intuitive et le résultat final était bien au-delà de nos attentes.',
      rating: 4,
      avatar: 'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 6,
      name: 'Sophie & Thomas',
      role: 'Mariés en Février 2024',
      location: 'Libreville, Gabon',
      text: 'La fonction de suivi des RSVP nous a fait gagner tellement de temps ! Plus besoin de passer des heures au téléphone pour savoir qui vient. Tout était centralisé et facile à gérer. Merci Loventy !',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 7,
      name: 'Aline & Paul',
      role: 'Mariés en Avril 2024',
      location: 'Abidjan, Côte d\'Ivoire',
      text: 'Nous avons eu un problème technique et l\'équipe de support a résolu notre souci en moins d\'une heure. Ce niveau de service est vraiment impressionnant. Notre invitation était parfaite pour notre grand jour !',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1034859/pexels-photo-1034859.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 8,
      name: 'Fatou & Ibrahim',
      role: 'Mariés en Mai 2024',
      location: 'Dakar, Sénégal',
      text: 'Les options de personnalisation sont incroyables. Nous avons pu adapter les couleurs et les polices pour qu\'elles correspondent parfaitement à notre thème de mariage. Nos invités ont été impressionnés par la qualité professionnelle.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 9,
      name: 'Nadine & Eric',
      role: 'Mariés en Août 2024',
      location: 'Brazzaville, Congo',
      text: 'La possibilité d\'ajouter des questions personnalisées au formulaire RSVP était exactement ce dont nous avions besoin. Nous avons pu recueillir les préférences alimentaires et d\'autres informations importantes en une seule étape.',
      rating: 4,
      avatar: 'https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 10,
      name: 'Christine & David',
      role: 'Mariés en Novembre 2024',
      location: 'Yaoundé, Cameroun',
      text: 'Le rapport qualité-prix est imbattable. Nous avons obtenu une invitation de mariage de qualité professionnelle pour une fraction du prix que nous aurions payé pour des invitations papier traditionnelles.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1813157/pexels-photo-1813157.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: 11,
      name: 'Aminata & Moussa',
      role: 'Mariés en Janvier 2025',
      location: 'Bamako, Mali',
      text: 'Loventy a rendu notre planification de mariage tellement plus facile. La gestion des invités était un jeu d\'enfant et les statistiques en temps réel nous ont permis de suivre facilement qui avait répondu et qui avait besoin d\'un rappel.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1730877/pexels-photo-1730877.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      featured: true
    },
    {
      id: 12,
      name: 'Sandrine & Pierre',
      role: 'Mariés en Octobre 2024',
      location: 'Lomé, Togo',
      text: 'Nous avons reçu tellement de compliments sur notre invitation électronique ! Plusieurs amis nous ont demandé comment nous l\'avions créée et nous avons bien sûr recommandé Loventy. Merci pour ce service exceptionnel !',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  ];

  // Get featured testimonials
  const featuredTestimonials = testimonials.filter(t => t.featured);
  
  // Get regular testimonials (non-featured)
  const regularTestimonials = testimonials.filter(t => !t.featured);
  
  // Calculate pagination
  const totalPages = Math.ceil(regularTestimonials.length / testimonialsPerPage);
  const currentTestimonials = regularTestimonials.slice(
    currentPage * testimonialsPerPage, 
    (currentPage + 1) * testimonialsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="min-h-screen bg-accent py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#D4A5A5]/10 px-4 py-2 rounded-full mb-6">
            <Heart className="h-4 w-4 text-[#D4A5A5] animate-pulse" />
            <span className="text-sm font-medium text-[#D4A5A5]">Témoignages</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-serif">
            Ce que nos clients disent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez les expériences de couples qui ont utilisé Loventy pour créer leurs invitations de mariage parfaites
          </p>
        </AnimatedSection>

        {/* Featured Testimonials */}
        {featuredTestimonials.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-primary mb-8 font-serif text-center">
              Témoignages à la une
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredTestimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#D4A5A5]/30 overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4A5A5]/5 to-[#E16939]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Quote icon */}
                  <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <Quote className="h-12 w-12 text-[#D4A5A5]" />
                  </div>
                  
                  <div className="relative z-10">
                    {/* Rating stars */}
                    <div className="flex items-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="h-5 w-5 text-[#E16939] fill-current group-hover:scale-110 transition-transform duration-300" 
                          style={{ transitionDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>
                    
                    {/* Testimonial text */}
                    <blockquote className="text-gray-700 mb-8 leading-relaxed italic text-lg group-hover:text-gray-800 transition-colors duration-300">
                      "{testimonial.text}"
                    </blockquote>
                    
                    {/* Author info */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4A5A5] rounded-full flex items-center justify-center">
                          <Heart className="h-3 w-3 text-white fill-current" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#131837] group-hover:text-[#D4A5A5] transition-colors duration-300">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">{testimonial.role}</p>
                        <p className="text-xs text-[#E16939] font-medium">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#D4A5A5]/20 rounded-full group-hover:bg-[#D4A5A5]/40 transition-colors duration-300"></div>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Testimonials Grid */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#D4A5A5]/30 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A5A5]/5 to-[#E16939]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Quote icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Quote className="h-8 w-8 text-[#D4A5A5]" />
                </div>
                
                <div className="relative z-10">
                  {/* Rating stars */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 text-[#E16939] fill-current" 
                      />
                    ))}
                  </div>
                  
                  {/* Testimonial text */}
                  <blockquote className="text-gray-700 mb-6 leading-relaxed italic text-sm group-hover:text-gray-800 transition-colors duration-300 line-clamp-4">
                    "{testimonial.text}"
                  </blockquote>
                  
                  {/* Author info */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-300"
                    />
                    <div>
                      <p className="font-semibold text-[#131837] group-hover:text-[#D4A5A5] transition-colors duration-300 text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                      <p className="text-xs text-[#E16939]">{testimonial.location}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mb-16">
            <button
              onClick={prevPage}
              className="p-2 rounded-full border border-gray-200 hover:border-[#D4A5A5] hover:bg-[#D4A5A5]/5 transition-colors"
              aria-label="Page précédente"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-[#D4A5A5]" />
            </button>
            
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} sur {totalPages}
            </div>
            
            <button
              onClick={nextPage}
              className="p-2 rounded-full border border-gray-200 hover:border-[#D4A5A5] hover:bg-[#D4A5A5]/5 transition-colors"
              aria-label="Page suivante"
            >
              <ArrowRight className="h-5 w-5 text-gray-600 hover:text-[#D4A5A5]" />
            </button>
          </div>
        )}

        {/* Submit Your Testimonial */}
        <div className="bg-gradient-to-r from-[#D4A5A5] to-[#E16939] rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <Heart className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif">
              Partagez votre expérience
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Vous avez utilisé Loventy pour votre mariage ? Nous aimerions entendre votre histoire et comment notre plateforme a contribué à rendre votre journée spéciale.
            </p>
            <button className="inline-flex items-center px-8 py-4 bg-white text-[#D4A5A5] font-semibold rounded-full hover:bg-gray-50 transition-colors duration-300 transform hover:scale-105 active:scale-95">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Soumettre un témoignage</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-primary mb-8 font-serif">
            Ils nous font confiance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-[#D4A5A5] mb-2">15K+</div>
              <div className="text-sm text-gray-600">Couples satisfaits</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-[#D4A5A5] mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">Note moyenne</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-[#D4A5A5] mb-2">99%</div>
              <div className="text-sm text-gray-600">Recommandent</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-[#D4A5A5] mb-2">45</div>
              <div className="text-sm text-gray-600">Pays</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;