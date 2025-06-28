import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Crown, Leaf, Sparkles, AlertTriangle, Loader2, Calendar, MapPin, Clock, Lock, Search, Filter, X } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useCreateInvitation } from '../hooks/useCreateInvitation';
import { useAuth } from '../contexts/AuthContext';
import { useTemplates } from '../hooks/useTemplates';
import { useEvents } from '../hooks/useEvents';
import PlanLimitWarning from '../components/PlanLimitWarning';
import EventCreatorModal from '../components/events/EventCreatorModal';
import type { TemplateDetails } from '../types/models';
import SeoHead from '../components/SeoHead';

const Templates: React.FC = () => {
  usePageTitle('Modèles');
  
  const { limits, canCreateInvitation, isLoading: limitsLoading, features } = usePlanLimits();
  const { createInvitation, isLoading: creatingInvitation, error: creationError, clearError } = useCreateInvitation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour le modèle sélectionné
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Utiliser le hook useTemplates pour charger les modèles depuis la base de données
  const { 
    templates, 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    isLoading: templatesLoading, 
    error: templatesError,
    refreshTemplates
  } = useTemplates({
    initialSearchTerm: searchTerm
  });

  // Utiliser le hook useEvents pour vérifier si l'utilisateur a des événements
  const { events, isLoading: eventsLoading } = useEvents();

  // Récupérer le template et l'événement sélectionnés depuis l'URL si présents
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const templateId = params.get('template');
    const eventId = params.get('event');
    
    if (templateId) {
      setSelectedTemplateId(templateId);
    }
    
    if (eventId) {
      setSelectedEventId(eventId);
    }
  }, [location]);

  // Fonction pour gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Rafraîchir les modèles avec le terme de recherche
    refreshTemplates();
    
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(true);
    
    // Rafraîchir les modèles sans terme de recherche
    refreshTemplates();
    
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  // Fonction pour gérer la sélection d'un modèle
  const handleTemplateSelect = async (template: TemplateDetails) => {
    // Effacer les erreurs précédentes
    clearError();
    
    // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    // en conservant l'information sur le modèle sélectionné
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/templates&template=${template.id}`);
      return;
    }

    // Vérifier si l'utilisateur peut créer une invitation
    if (!canCreateInvitation) {
      return; // L'erreur sera affichée par PlanLimitWarning
    }

    // Vérifier si le template est premium et si l'utilisateur y a accès
    if (template.is_premium && features?.hasAnalytics === false) {
      // Proposer une mise à niveau
      if (confirm('Ce modèle est réservé aux utilisateurs Premium. Souhaitez-vous découvrir nos offres Premium ?')) {
        navigate('/pricing');
      }
      return;
    }

    // Vérifier si l'utilisateur a déjà sélectionné un événement
    if (selectedEventId) {
      // Créer l'invitation avec l'événement sélectionné
      try {
        await createInvitation({
          title: `Invitation ${template.name}`,
          templateId: template.id,
          eventId: selectedEventId
        });
        // La redirection vers l'éditeur est gérée dans le hook useCreateInvitation
      } catch (err) {
        console.error('Erreur lors de la création de l\'invitation:', err);
      }
    } else {
      // Stocker le modèle sélectionné et ouvrir le modal de sélection d'événement
      setSelectedTemplateId(template.id);
      setShowEventModal(true);
    }
  };

  // Fonction pour gérer la sélection d'un événement
  const handleEventSelected = async (eventId: string) => {
    if (!selectedTemplateId) return;
    
    setShowEventModal(false);
    
    try {
      await createInvitation({
        title: `Invitation ${templates.find(t => t.id === selectedTemplateId)?.name || 'Personnalisée'}`,
        templateId: selectedTemplateId,
        eventId: eventId
      });
      // La redirection vers l'éditeur est gérée dans le hook useCreateInvitation
    } catch (err) {
      console.error('Erreur lors de la création de l\'invitation:', err);
    }
  };

  // Afficher un état de chargement pendant que les données sont récupérées
  // Amélioration: vérifier tous les états de chargement pertinents
  const isLoading = (limitsLoading && isAuthenticated) || authLoading || templatesLoading || eventsLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-4" />
          <p className="text-gray-600">Chargement des modèles...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si le chargement des modèles a échoué
  if (templatesError) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{templatesError}</p>
          <button 
            onClick={refreshTemplates}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Get the selected template for SEO
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <>
      <SeoHead 
        pagePath="/templates" 
        entityId={selectedTemplateId || undefined}
        overrides={selectedTemplate ? {
          title: `${selectedTemplate.name} - Modèle d'invitation de mariage | Loventy`,
          description: `Découvrez et utilisez notre modèle d'invitation de mariage ${selectedTemplate.name}. ${selectedTemplate.description || 'Créez une invitation élégante et personnalisée pour votre grand jour.'}`,
          keywords: `modèle invitation mariage, ${selectedTemplate.name}, ${selectedTemplate.category_name}, invitation mariage, faire-part mariage`
        } : {
          title: "Modèles d'invitations de mariage élégants | Loventy",
          description: "Découvrez notre collection de modèles d'invitations de mariage élégants et personnalisables. Créez une invitation unique pour votre grand jour.",
          keywords: "modèles invitation mariage, templates mariage, faire-part mariage, invitation digitale, design invitation"
        }}
      />
      <div className="min-h-screen bg-accent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-serif">
              Choisissez votre modèle
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre collection de modèles élégants, conçus pour rendre votre invitation unique et mémorable
            </p>
          </div>

          {/* Plan Limit Warning - Seulement pour les utilisateurs authentifiés */}
          {isAuthenticated && !canCreateInvitation && (
            <div className="mb-8">
              <PlanLimitWarning type="invitation" />
            </div>
          )}

          {/* Usage Display - Seulement pour les utilisateurs authentifiés */}
          {isAuthenticated && limits && (
            <div className="card max-w-md mx-auto mb-8">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Votre utilisation ce mois</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invitations:</span>
                  <span className="font-medium">
                    {limits.usage?.invitations || 0} / {limits.invitations === -1 ? '∞' : limits.invitations}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(limits.percentageUsed?.invitations || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Barre de recherche et filtres */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              {/* Barre de recherche */}
              <div className="relative flex-1">
                <form onSubmit={handleSearch} className="w-full">
                  <input
                    type="text"
                    placeholder="Rechercher un modèle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {searchTerm && (
                    <button 
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </form>
              </div>
              
              {/* Filtres par catégorie */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? "text-[#D4A5A5] bg-[#D4A5A5]/10 border border-[#D4A5A5]/30"
                      : "text-gray-700 hover:text-[#D4A5A5] hover:bg-[#D4A5A5]/5 border border-gray-200"
                  }`}
                >
                  Tous
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category.slug
                        ? "text-[#D4A5A5] bg-[#D4A5A5]/10 border border-[#D4A5A5]/30"
                        : "text-gray-700 hover:text-[#D4A5A5] hover:bg-[#D4A5A5]/5 border border-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* État de recherche */}
          {isSearching && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-secondary" />
                <span className="text-gray-600">Recherche en cours...</span>
              </div>
            </div>
          )}

          {/* Templates Grid */}
          {templates.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3 font-serif">
                Aucun modèle trouvé
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? `Aucun modèle ne correspond à "${searchTerm}". Essayez d'autres termes de recherche.`
                  : 'Aucun modèle disponible dans cette catégorie pour le moment.'}
              </p>
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Voir tous les modèles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {templates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onTemplateSelect={handleTemplateSelect}
                  isSelected={selectedTemplateId === template.id}
                  isCreating={creatingInvitation && selectedTemplateId === template.id}
                  error={creationError && selectedTemplateId === template.id ? creationError : null}
                />
              ))}
            </div>
          )}

          {/* Upgrade Prompt - Seulement pour les utilisateurs authentifiés non premium */}
          {isAuthenticated && features?.hasAnalytics === false && (
            <div className="gradient-secondary rounded-2xl p-8 text-center text-white relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>
              
              <div className="relative z-10">
                <Crown className="h-12 w-12 mx-auto mb-4 animate-bounce-in" />
                <h3 className="text-2xl font-bold mb-2 font-serif">Débloquez tous les modèles</h3>
                <p className="text-lg opacity-90 mb-6">
                  Accédez à notre collection complète de modèles premium et à toutes les fonctionnalités avancées
                </p>
                <Link
                  to="/pricing"
                  className="inline-block px-8 py-3 bg-white text-secondary font-semibold rounded-full hover:bg-gray-50 transition-colors duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Voir les tarifs
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de sélection d'événement */}
      {showEventModal && (
        <EventCreatorModal
          onClose={() => setShowEventModal(false)}
          onEventSelected={handleEventSelected}
          templateId={selectedTemplateId || undefined}
        />
      )}
    </>
  );
};

export default Templates;

// Template Card Component
const TemplateCard = ({ 
  template, 
  onTemplateSelect, 
  isSelected, 
  isCreating, 
  error 
}: { 
  template: TemplateDetails; 
  onTemplateSelect: (template: TemplateDetails) => void;
  isSelected: boolean;
  isCreating: boolean;
  error: string | null;
}) => {
  const { limits, canCreateInvitation, features } = usePlanLimits();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur peut utiliser ce modèle
  const canUseTemplate = isAuthenticated && 
                        canCreateInvitation && 
                        (!template.is_premium || features?.hasAnalytics === true);
  
  // Extraire les couleurs du modèle
  const colors = {
    primary: template.color_palette?.primary || '#D4A5A5',
    secondary: template.color_palette?.secondary || '#C5D2C2',
    accent: template.color_palette?.accent || '#E16939'
  };

  return (
    <div className={`group relative card hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-[1.02] ${
      isSelected ? 'ring-4 ring-[#D4A5A5] scale-[1.02]' : ''
    }`}>
      {template.is_premium && (
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
          <Crown className="h-3 w-3" />
          <span>Premium</span>
        </div>
      )}
      
      {/* Template Preview avec image de fond */}
      <div className="relative h-96 overflow-hidden">
        {/* Image de fond avec overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ 
            backgroundImage: `url(${template.preview_image_url || 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800'})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        
        {/* Invitation card flottante */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div 
            className="w-full max-w-xs bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 transform group-hover:scale-105 transition-all duration-500 border border-white/20"
            style={{ 
              boxShadow: `0 25px 50px -12px ${colors.primary}40` 
            }}
          >
            <div className="text-center">
              {/* Ornement décoratif */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <Heart 
                    className="h-6 w-6 fill-current animate-pulse" 
                    style={{ color: colors.primary }}
                  />
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                </div>
              </div>
              
              {/* Noms des mariés */}
              <h3 
                className="text-xl font-serif mb-1 font-bold"
                style={{ color: colors.primary }}
              >
                Grâce & Emmanuel
              </h3>
              
              <p className="text-primary-light text-sm font-medium mb-4">
                Vous invitent à leur mariage
              </p>
              
              {/* Détails de l'événement */}
              <div className="space-y-2 text-xs text-gray-700 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar 
                    className="h-3 w-3 flex-shrink-0" 
                    style={{ color: colors.accent }} 
                  />
                  <span>15 Juin 2025</span>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <Clock 
                    className="h-3 w-3 flex-shrink-0" 
                    style={{ color: colors.accent }} 
                  />
                  <span>14h30</span>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <MapPin 
                    className="h-3 w-3 flex-shrink-0" 
                    style={{ color: colors.accent }} 
                  />
                  <div className="text-center">
                    <div className="font-medium">Église Saint-Joseph</div>
                    <div className="text-gray-500 text-xs">Kinshasa, RDC</div>
                  </div>
                </div>
              </div>
              
              {/* Bouton RSVP */}
              <button 
                className="w-full py-2.5 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-all duration-300 shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                Confirmer ma présence
              </button>
              
              {/* Ornement décoratif bas */}
              <div className="flex items-center justify-center mt-4 space-x-1">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay d'interaction */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <Sparkles className="h-8 w-8 text-[#D4A5A5]" />
          </div>
        </div>
        
        {/* Overlay Premium pour les utilisateurs non premium */}
        {template.is_premium && isAuthenticated && features?.hasAnalytics === false && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 z-10">
            <Lock className="h-12 w-12 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Modèle Premium</h3>
            <p className="text-white/80 text-center mb-4">
              Ce modèle est réservé aux utilisateurs Premium
            </p>
            <Link
              to="/pricing"
              className="px-6 py-3 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-full hover:shadow-lg transition-all duration-300"
            >
              <Crown className="h-4 w-4 mr-2 inline-block" />
              Passer Premium
            </Link>
          </div>
        )}
      </div>
      
      {/* Template Info */}
      <div className="p-6 bg-gradient-to-b from-white to-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-primary group-hover:text-[#D4A5A5] transition-colors duration-300">
            {template.name}
          </h3>
          <span 
            className="text-xs px-3 py-1 rounded-full font-medium border"
            style={{ 
              backgroundColor: `${colors.primary}15`,
              borderColor: `${colors.primary}30`,
              color: colors.primary
            }}
          >
            {template.category_name || 'Classique'}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{template.description}</p>
        
        {/* Palette de couleurs */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xs text-gray-500">Couleurs:</span>
          <div className="flex space-x-1">
            {Object.values(colors).map((color, index) => (
              <div 
                key={index}
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-secondary font-semibold text-sm">
              {template.is_premium ? 'Premium' : 'Gratuit'}
            </span>
            {template.is_premium && (
              <Crown className="h-4 w-4 text-secondary" />
            )}
          </div>
          
          {isAuthenticated ? (
            canUseTemplate ? (
              <button
                onClick={() => onTemplateSelect(template)}
                disabled={isCreating}
                className="px-6 py-2 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isCreating && isSelected ? 'Création...' : 'Utiliser ce modèle'}
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {!canCreateInvitation ? 'Limite atteinte' : 'Premium requis'}
                </span>
              </div>
            )
          ) : (
            <button
              onClick={() => onTemplateSelect(template)}
              className="px-6 py-2 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Utiliser ce modèle
            </button>
          )}
        </div>
        
        {error && isSelected && (
          <div className="mt-3 p-3 notification-error rounded-lg text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Effet de bordure animé */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#D4A5A5]/30 transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
};