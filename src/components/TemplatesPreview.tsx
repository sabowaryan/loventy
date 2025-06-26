import React, { useState, useEffect } from 'react';
import { Heart, Crown, Leaf, Sparkles, ArrowRight, Eye, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import StaggeredGrid from './StaggeredGrid';
import AnimatedSection from './AnimatedSection';
import { useTemplates } from '../hooks/useTemplates';

const TemplatesPreview: React.FC = () => {
  const { templates, categories, isLoading } = useTemplates({ limit: 4 });
  const [displayTemplates, setDisplayTemplates] = useState<any[]>([]);

  // Utiliser les templates de la base de données ou des templates par défaut
  useEffect(() => {
    if (!isLoading && templates.length > 0) {
      setDisplayTemplates(templates);
    } else {
      // Templates par défaut en attendant le chargement
      setDisplayTemplates([
        {
          id: 1,
          name: 'Élégance Dorée',
          category_name: 'Classique',
          is_premium: false,
          preview_image_url: 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800',
          description: 'Design intemporel avec touches dorées',
          color_palette: { primary: '#D4A5A5', secondary: '#F5E6D3', accent: '#E8B86D' }
        },
        {
          id: 2,
          name: 'Jardin Secret',
          category_name: 'Nature',
          is_premium: true,
          preview_image_url: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800',
          description: 'Motifs floraux délicats et verdure',
          color_palette: { primary: '#C5D2C2', secondary: '#E8F5E8', accent: '#7FB069' }
        },
        {
          id: 3,
          name: 'Minimaliste Chic',
          category_name: 'Moderne',
          is_premium: false,
          preview_image_url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
          description: 'Simplicité raffinée et moderne',
          color_palette: { primary: '#131837', secondary: '#F8F9FA', accent: '#6C757D' }
        },
        {
          id: 4,
          name: 'Romance Vintage',
          category_name: 'Classique',
          is_premium: true,
          preview_image_url: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=800',
          description: 'Charme rétro et romantique',
          color_palette: { primary: '#E16939', secondary: '#FDF2E9', accent: '#D4A574' }
        }
      ]);
    }
  }, [isLoading, templates]);

  // Préparer les catégories pour l'affichage
  const displayCategories = categories.length > 0 
    ? categories.slice(0, 4).map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || 'Crown',
        count: templates.filter(t => t.category_id === cat.id).length
      }))
    : [
        { id: 'classic', name: 'Classique', icon: 'Crown', count: 8 },
        { id: 'modern', name: 'Moderne', icon: 'Sparkles', count: 6 },
        { id: 'nature', name: 'Nature', icon: 'Leaf', count: 5 },
        { id: 'premium', name: 'Premium', icon: 'Heart', count: 12 }
      ];

  // Fonction pour obtenir l'icône correspondante
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return Crown;
      case 'Sparkles': return Sparkles;
      case 'Leaf': return Leaf;
      default: return Heart;
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#FAF9F7] to-white relative overflow-hidden">
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
          <div className="inline-flex items-center space-x-2 bg-[#D4A5A5]/10 px-4 py-2 rounded-full mb-6">
            <Palette className="h-4 w-4 text-[#D4A5A5] animate-pulse" />
            <span className="text-sm font-medium text-[#D4A5A5]">Modèles</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#131837] mb-6 font-serif">
            Des designs qui vous ressemblent
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez notre collection de modèles élégants, conçus pour rendre votre invitation unique et mémorable
          </p>
        </AnimatedSection>

        {/* Categories avec animation en cascade */}
        <StaggeredGrid 
          className="flex flex-wrap justify-center gap-4 mb-16"
          itemClassName="group bg-white rounded-2xl px-6 py-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#D4A5A5]/30"
          delay={100}
        >
          {displayCategories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <React.Fragment key={category.id}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#D4A5A5]/10 rounded-lg group-hover:bg-[#D4A5A5]/20 transition-colors duration-300">
                    <IconComponent className="h-5 w-5 text-[#D4A5A5]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#131837] group-hover:text-[#D4A5A5] transition-colors duration-300">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500">{category.count} modèles</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </StaggeredGrid>

        {/* Templates grid avec animation en cascade */}
        <StaggeredGrid 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          itemClassName="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#D4A5A5]/30 overflow-hidden"
          delay={150}
        >
          {displayTemplates.map((template) => {
            // Extraire les couleurs du modèle
            const colors = {
              primary: template.color_palette?.primary || '#D4A5A5',
              secondary: template.color_palette?.secondary || '#C5D2C2',
              accent: template.color_palette?.accent || '#E16939'
            };
            
            return (
              <React.Fragment key={template.id}>
                {/* Premium badge */}
                {template.is_premium && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Crown className="h-3 w-3" />
                    <span>Premium</span>
                  </div>
                )}
                
                {/* Template preview */}
                <div className="relative h-64 bg-gradient-to-br from-[#FAF9F7] to-white p-6 flex items-center justify-center overflow-hidden">
                  {/* Image de fond avec overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ 
                      backgroundImage: `url(${template.preview_image_url})`,
                    }}
                  />
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4A5A5]/5 to-[#E16939]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Mock invitation card */}
                  <div className="relative w-full max-w-[180px] bg-white rounded-xl shadow-lg p-4 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <Heart className="h-4 w-4 text-[#D4A5A5] fill-current" />
                      </div>
                      <h3 className="text-sm font-serif text-[#131837] mb-1">Grâce & Emmanuel</h3>
                      <p className="text-xs text-gray-600 mb-3">Vous invitent</p>
                      <div className="space-y-1 text-xs text-gray-500 mb-3">
                        <p>📅 15 Juin 2025</p>
                        <p>📍 Église Saint-Joseph</p>
                      </div>
                      <div 
                        className="w-full py-1.5 rounded-lg text-white text-xs font-medium"
                        style={{ backgroundColor: colors.primary }}
                      >
                        RSVP
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Eye className="h-6 w-6 text-[#D4A5A5]" />
                    </div>
                  </div>
                </div>
                
                {/* Template info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#131837] group-hover:text-[#D4A5A5] transition-colors duration-300">
                      {template.name}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-200 rounded-full font-medium">
                      {template.category_name}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#D4A5A5] font-semibold text-sm">
                      {template.is_premium ? 'Premium' : 'Gratuit'}
                    </span>
                    
                    <Link
                      to={`/templates?template=${template.id}`}
                      className="px-4 py-2 bg-[#D4A5A5] text-white text-sm font-medium rounded-full hover:bg-[#D4A5A5]/90 transition-colors duration-300 group-hover:scale-105 transform active:scale-95"
                    >
                      Utiliser
                    </Link>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
              </React.Fragment>
            );
          })}
        </StaggeredGrid>

        {/* Bottom CTA avec animation */}
        <AnimatedSection animation="fadeInUp" delay={300} className="text-center">
          <div className="bg-gradient-to-r from-[#D4A5A5] to-[#E16939] rounded-3xl p-8 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <Crown className="h-12 w-12 mx-auto mb-4 animate-bounce-in" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4 font-serif">
                Plus de 20 modèles vous attendent
              </h3>
              <p className="text-lg opacity-90 mb-8">
                Explorez notre collection complète et trouvez le design parfait pour votre jour J
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/templates"
                  className="inline-flex items-center px-8 py-4 bg-white text-[#D4A5A5] font-semibold rounded-full hover:bg-gray-50 transition-colors duration-300 transform hover:scale-105 active:scale-95"
                >
                  <span>Voir tous les modèles</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/auth/register"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors duration-300 transform hover:scale-105 active:scale-95"
                >
                  <span>Commencer gratuitement</span>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TemplatesPreview;