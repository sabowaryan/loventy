import React from 'react';
import { Star, Heart, Quote } from 'lucide-react';
import StaggeredGrid from './StaggeredGrid';
import AnimatedSection from './AnimatedSection';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Grâce & Emmanuel',
      text: 'Loventy nous a permis de créer des invitations magnifiques en quelques minutes. Le processus était si simple et le résultat dépassait nos attentes ! Nos invités ont adoré le design élégant.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      role: 'Mariés en Juin 2024',
      location: 'Gombe, Kinshasa'
    },
    {
      id: 2,
      name: 'Joséphine & Patrice',
      text: 'Le suivi des réponses est fantastique. Plus besoin de relancer tout le monde par téléphone ! Nos invités ont adoré recevoir une invitation si moderne et interactive.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      role: 'Mariés en Septembre 2024',
      location: 'Lingwala, Kinshasa'
    },
    {
      id: 3,
      name: 'Béatrice & Dieudonné',
      text: 'Design épuré, interface intuitive. Exactement ce que nous recherchions pour notre mariage. Le service client est également exceptionnel et très réactif.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      role: 'Mariés en Décembre 2024',
      location: 'Limete, Kinshasa'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#FAF9F7] to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23131837' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating hearts */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-[#D4A5A5]/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-[#E16939]/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-[#C5D2C2]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header avec animation */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#C5D2C2]/20 px-4 py-2 rounded-full mb-6">
            <Heart className="h-4 w-4 text-[#C5D2C2] animate-pulse" />
            <span className="text-sm font-medium text-[#C5D2C2]">Témoignages</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#131837] mb-6 font-serif">
            Ils nous font confiance
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez ce que nos couples pensent de Loventy et pourquoi ils recommandent notre plateforme
          </p>
        </AnimatedSection>
        
        {/* Testimonials grid avec animation en cascade */}
        <StaggeredGrid 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          itemClassName="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#D4A5A5]/30 overflow-hidden"
          delay={200}
        >
          {testimonials.map((testimonial) => (
            <React.Fragment key={testimonial.id}>
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A5A5]/5 to-[#E16939]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939]"></div>
              
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Quote className="h-12 w-12 text-[#D4A5A5]" />
              </div>
              
              <div className="relative z-10">
                {/* Rating stars avec animation */}
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
                      className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
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
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#E16939] to-[#D4A5A5] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
            </React.Fragment>
          ))}
        </StaggeredGrid>

        {/* Bottom stats avec animation - VERSION RESPONSIVE OPTIMISÉE */}
        <AnimatedSection animation="fadeInUp" delay={300} className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 sm:px-6 lg:px-8 py-6 shadow-lg border border-[#D4A5A5]/10 max-w-4xl mx-auto transform hover:scale-105 transition-all duration-300">
            
            {/* Version mobile - Layout vertical avec espacement optimisé */}
            <div className="block sm:hidden space-y-4">
              <div className="text-center py-2">
                <div className="text-2xl font-bold text-[#131837] mb-1">4.9/5</div>
                <div className="text-xs text-gray-600 mb-2">Note moyenne</div>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-[#E16939] fill-current" />
                  ))}
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-200"></div>
              
              <div className="text-center py-2">
                <div className="text-2xl font-bold text-[#131837] mb-1">10K+</div>
                <div className="text-xs text-gray-600 mb-2">Couples satisfaits</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-r from-[#E16939] to-[#131837] border-2 border-white"></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-200"></div>
              
              <div className="text-center py-2">
                <div className="text-2xl font-bold text-[#131837] mb-1">99%</div>
                <div className="text-xs text-gray-600 mb-2">Recommandent</div>
                <div className="flex items-center justify-center space-x-1">
                  <Heart className="h-3 w-3 text-[#E16939] fill-current animate-pulse" />
                  <span className="text-xs text-gray-500">Taux de satisfaction</span>
                </div>
              </div>
            </div>

            {/* Version tablette - Layout horizontal compact */}
            <div className="hidden sm:flex lg:hidden items-center justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#131837] mb-1">4.9/5</div>
                <div className="text-xs text-gray-600">Note moyenne</div>
              </div>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#131837] mb-1">10K+</div>
                <div className="text-xs text-gray-600">Couples satisfaits</div>
              </div>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#131837] mb-1">99%</div>
                <div className="text-xs text-gray-600">Recommandent</div>
              </div>
            </div>

            {/* Version desktop - Layout horizontal complet */}
            <div className="hidden lg:flex items-center justify-center space-x-8">
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
                    <span className="font-semibold text-[#131837]">4.9/5</span> - Note moyenne
                  </p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-[#131837] mb-1">10K+</div>
                <div className="text-sm text-gray-600">Couples satisfaits</div>
              </div>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-[#131837] mb-1">99%</div>
                <div className="text-sm text-gray-600">Recommandent</div>
              </div>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              <div className="flex items-center space-x-2 text-[#E16939] font-medium">
                <Heart className="h-5 w-5 fill-current animate-pulse" />
                <span>Prêt à rejoindre cette communauté ?</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Testimonials;