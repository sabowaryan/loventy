import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, Clock, Wine, MessageCircle, X, ChevronLeft, ChevronRight, User, Hash, CheckCircle,Gavel } from 'lucide-react';
import { useDatabase } from '../../hooks/useDatabase';
import { WeddingDetails, GuestInfo, DrinkOptions, WeddingTexts } from '../../data/weddingData';
import LoventyLogo from '../../components/LoventyLogo';
import SeoHead from '../../components/SeoHead';
import { Guest, WeddingData } from '../../lib/database';

// Import des images de fond
import fond1 from '../../assets/wedding/fond/fond1.jpg';
import fond2 from '../../assets/wedding/fond/fond2.jpg';
import fond3 from '../../assets/wedding/fond/fond3.jpg';
import fond4 from '../../assets/wedding/fond/fond4.jpg';
import fond5 from '../../assets/wedding/fond/fond5.jpg';
import fond6 from '../../assets/wedding/fond/fond6.jpg';
import saveImage from '../../assets/wedding/fond/save.png';

// Construction dynamique des sections à partir des données chargées
const buildWeddingSections = (weddingDetails: WeddingDetails, weddingTexts: WeddingTexts) => {
  return [
    { id: 0, title: 'Accueil', backgroundImage: fond1 },
    { id: 1, title: 'Invitation', backgroundImage: fond2 },
    { id: 2, title: 'Programme', backgroundImage: fond3 },
    { id: 3, title: 'Livre d\'or', backgroundImage: fond4 },
    { id: 4, title: 'Boissons', backgroundImage: fond5 },
    { id: 5, title: 'Annulation', backgroundImage: fond6 },
  ];
};

const InvPreview = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const [currentSection, setCurrentSection] = useState(0);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails | null>(null);
  const [drinkOptions, setDrinkOptions] = useState<DrinkOptions | null>(null);
  const [weddingTexts, setWeddingTexts] = useState<WeddingTexts | null>(null);
  const [guestFound, setGuestFound] = useState<boolean | null>(null);
  const { loadWeddingData, fetchGuests, saveGuestPreferences, updateExistingGuest, saveGuestMessage } = useDatabase();
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Section boissons : parser les listes globales
  const alcoholicDrinks = useMemo(() => drinkOptions?.alcoholic || [], [drinkOptions?.alcoholic]);
  const nonAlcoholicDrinks = useMemo(() => drinkOptions?.nonAlcoholic || [], [drinkOptions?.nonAlcoholic]);
  
  // State pour les choix de l'invité
  const [selectedAlcoholic, setSelectedAlcoholic] = useState<string[]>([]);
  const [selectedNonAlcoholic, setSelectedNonAlcoholic] = useState<string[]>([]);

  // Ajout d'un state pour feedback utilisateur
  const [toast, setToast] = useState<string | null>(null);
  
  // State pour le message du livre d'or
  const [guestbookMessage, setGuestbookMessage] = useState('');

  // Sections dynamiques mémorisées
  const weddingSections = useMemo(() => {
    if (!weddingDetails || !weddingTexts) return [];
    return buildWeddingSections(weddingDetails, weddingTexts);
  }, [weddingDetails, weddingTexts]);

  // Titre dynamique pour le SEO
  const pageTitle = useMemo(() => {
    if (!weddingDetails) {
      return 'Invitation de mariage - Loventy';
    }
    return `Mariage de ${weddingDetails.groomName} & ${weddingDetails.brideName} - Invitation - Loventy`;
  }, [weddingDetails]);

  // Description dynamique pour le SEO
  const pageDescription = useMemo(() => {
    if (!weddingDetails || !guest) {
      return 'Invitation de mariage personnalisée créée avec Loventy';
    }
    return `Invitation au mariage de ${weddingDetails.groomName} et ${weddingDetails.brideName} le ${weddingDetails.weddingDate.day} ${weddingDetails.weddingDate.month} ${weddingDetails.weddingDate.year}. Créée avec Loventy.`;
  }, [weddingDetails, guest]);

  // Handler pour enregistrer les préférences de boissons
  const handleSavePreferences = useCallback(async () => {
    if (!guest) return;
    try {
      await saveGuestPreferences(
        guest.id!,
        selectedAlcoholic,
        selectedNonAlcoholic
      );
      setToast('Préférences enregistrées !');
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      setToast("Erreur lors de l'enregistrement");
      setTimeout(() => setToast(null), 2000);
    }
  }, [guest, selectedAlcoholic, selectedNonAlcoholic, saveGuestPreferences]);

  // Handler pour confirmer ou annuler l'invitation
  const handleRsvp = useCallback(async (status: 'confirmed' | 'cancelled') => {
    if (!guest) return;
    try {
      await updateExistingGuest({ ...guest, rsvp_status: status });
      setGuest({ ...guest, rsvp_status: status });
      setToast(status === 'confirmed' ? 'Invitation confirmée !' : 'Invitation annulée.');
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      setToast("Erreur lors de la mise à jour du statut");
      setTimeout(() => setToast(null), 2000);
    }
  }, [guest, updateExistingGuest]);

  // Handler pour envoyer un message dans le livre d'or
  const handleSendGuestbook = useCallback(async () => {
    if (!guest || !guestbookMessage.trim()) return;
    try {
      await saveGuestMessage(guest.id!, guestbookMessage.trim());
      setGuestbookMessage('');
      setToast('Message envoyé !');
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      setToast("Erreur lors de l'envoi du message");
      setTimeout(() => setToast(null), 2000);
    }
  }, [guest, guestbookMessage, saveGuestMessage]);

  // Handler pour les erreurs de chargement d'image
  const handleBackgroundImageError = useCallback(() => {
    console.warn('Erreur de chargement de l\'image de fond, utilisation du fallback');
  }, []);

  // Fonction pour rendre dynamiquement la section courante
  const renderSection = useCallback((index: number) => {
    // Vérifier que weddingSections est disponible
    if (!weddingSections || !weddingSections.length) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      );
    }
    
    // Ajout d'un guard pour les sections qui nécessitent guest
    if ((index === 1 || index === 2) && !guest) return null;
    
    // Vérifier que l'index est valide
    if (index < 0 || index >= weddingSections.length) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Section non trouvée</p>
          </div>
        </div>
      );
    }
    
    switch (index) {
      case 0:
        return (
          <div 
            ref={(el) => sectionRefs.current[0] = el}
            className="relative overflow-hidden w-full animate-fade-in"
            style={{
              backgroundImage: `url(${weddingDetails?.couplePhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '100vh',
              height: 'auto',
              aspectRatio: '16/9',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 1.5s ease-out'
            }}
          >
            {/* Plus d'overlay ni de carte */}
            <div className="relative z-10 flex flex-col items-center justify-start p-4 w-full h-full pt-8 sm:pt-12 md:pt-16 lg:pt-20">
                            {/* Noms des mariés - en haut de la section */}
              <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-20 animate-slide-down"
                   style={{ animation: 'slideDown 2s ease-out' }}>
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white drop-shadow-2xl text-center animate-slide-in-left" 
                      style={{ 
                        fontFamily: 'Playfair Display, Georgia, serif',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.8)',
                        animation: 'slideInLeft 2.5s ease-out'
                      }}>
                    {weddingDetails?.groomName}
                  </h1>
                  {/* Symbole "&" centré */}
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-yellow-100 font-normal drop-shadow-2xl animate-pulse" 
                        style={{ 
                          fontFamily: 'Playfair Display, Georgia, serif',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.8)',
                          animation: 'pulse 3s ease-in-out infinite'
                        }}>
                    &
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white drop-shadow-2xl text-center animate-slide-in-right" 
                      style={{ 
                        fontFamily: 'Playfair Display, Georgia, serif',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.8)',
                        animation: 'slideInRight 2.5s ease-out'
                      }}>
                    {weddingDetails?.brideName}
                  </h1>
                </div>
                {/* Ligne décorative */}
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 mt-4 sm:mt-6 md:mt-8 animate-expand"
                     style={{ animation: 'expand 3s ease-out' }}>
                  <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-yellow-100 to-transparent"></div>
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-100 fill-yellow-100 drop-shadow-2xl animate-beat" 
                         style={{ animation: 'beat 2s ease-in-out infinite' }} />
                  <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-yellow-100 to-transparent"></div>
                </div>
                </div>
              
                            {/* Image de décoration save.png centrée */}
              <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8 lg:mb-10 animate-float"
                   style={{ animation: 'float 4s ease-in-out infinite' }}>
                <img 
                  src={saveImage}
                  alt="Décoration"
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72 object-contain drop-shadow-2xl animate-rotate-slow"
                      style={{
                    filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(45deg)', // Rend l'image jaune doré
                    opacity: 0.95,
                    animation: 'rotateSlow 20s linear infinite'
                      }}
                    />
                  </div>
              
              {/* Contenu principal centré */}
              <div className="flex flex-col items-center justify-center flex-1 pb-4 sm:pb-6 md:pb-8 lg:pb-10 animate-fade-in-up"
                   style={{ animation: 'fadeInUp 3s ease-out' }}>
                {/* Date et détails */}
                <div className="space-y-3 sm:space-y-4 md:space-y-6 text-center">
                  <div className="text-white text-base sm:text-lg md:text-xl font-semibold drop-shadow-2xl" 
                       style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {weddingDetails?.weddingDate.month}
                  </div>
                  <div className="flex items-center justify-center space-x-6 sm:space-x-8 md:space-x-12 lg:space-x-16">
                    <div className="text-center">
                      <div className="text-sm sm:text-base text-yellow-100 mb-2 drop-shadow-2xl font-medium" 
                           style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        {weddingDetails?.weddingDate.dayOfWeek}
                      </div>
                      <div className="w-12 sm:w-16 h-px bg-yellow-100/80"></div>
                    </div>
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white drop-shadow-2xl" 
                         style={{ 
                           fontFamily: 'Playfair Display, Georgia, serif',
                           textShadow: '3px 3px 6px rgba(0,0,0,0.9), -3px -3px 6px rgba(0,0,0,0.9)'
                         }}>
                      {weddingDetails?.weddingDate.day}
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-base text-yellow-100 mb-2 drop-shadow-2xl font-medium" 
                           style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        {weddingDetails?.weddingDate.time}
                      </div>
                      <div className="w-12 sm:w-16 h-px bg-yellow-100/80"></div>
                    </div>
                  </div>
                  <div className="text-white text-base sm:text-lg md:text-xl font-semibold drop-shadow-2xl" 
                       style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {weddingDetails?.weddingDate.year}
                  </div>
                </div>
                {/* Décoration florale */}
                <div className="mt-6 sm:mt-8 md:mt-10 flex items-center justify-center space-x-3 animate-bounce"
                     style={{ animation: 'bounce 2s ease-in-out infinite' }}>
                  <div className="w-8 sm:w-12 h-px bg-yellow-100/80 animate-pulse"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-100 rounded-full drop-shadow-lg animate-ping"></div>
                  <div className="w-8 sm:w-12 h-px bg-yellow-100/80 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div 
            ref={(el) => sectionRefs.current[1] = el}
            className="relative overflow-hidden animate-fade-in"
            style={{
              backgroundImage: `url(${weddingSections[index]?.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              height: '100%',
              minHeight: '100vh',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 1.5s ease-out'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/30"></div>
            {/* Plus d'overlay ni de carte */}
                        <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full h-full">
              {/* Contenu principal directement sur l'image */}
              <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-600 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8 animate-expand"
                   style={{ animation: 'expand 2s ease-out' }}></div>
                
                {/* Nom de l'invité avec table */}
              <div className="mb-6 sm:mb-8 md:mb-10 text-center animate-slide-down"
                   style={{ animation: 'slideDown 2.5s ease-out' }}>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-white mb-3 sm:mb-4 md:mb-5 italic tracking-wide drop-shadow-2xl" 
                      style={{ 
                        fontFamily: 'Crimson Text, Georgia, serif',
                        fontStyle: 'italic',
                        fontWeight: 300,
                        letterSpacing: '0.08em',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.8)',
                        transform: 'skew(-2deg)',
                        transformOrigin: 'center'
                      }}>
                      Cher(e) {guest?.name ?? ''}
                  </h3>
                {/* Information de table directement sous le nom */}
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white drop-shadow-2xl font-semibold mb-3 sm:mb-4 md:mb-5"
                   style={{ 
                     textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                     fontFamily: 'Crimson Text, Georgia, serif'
                   }}>
                  Table : <span className="font-bold text-yellow-100" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{guest?.table_name ?? ''}</span>
                </p>
                <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4">
                  <div className="w-6 sm:w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-rose-600 to-transparent"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-rose-600 rounded-full drop-shadow-lg"></div>
                  <div className="w-6 sm:w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-rose-600 to-transparent"></div>
                  </div>
                </div>
                
                {/* Message d'invitation personnalisé */}
              <div className="mb-6 sm:mb-8 md:mb-10 text-center animate-fade-in-up"
                   style={{ animation: 'fadeInUp 3s ease-out' }}>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white italic leading-relaxed mb-4 sm:mb-5 md:mb-6 drop-shadow-2xl max-w-3xl mx-auto animate-typewriter font-medium"
                   style={{ 
                     textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                     animation: 'typewriter 4s steps(40, end)'
                   }}>
                    {weddingTexts?.invitation.loveQuote}
                  </p>
                <div className="w-12 sm:w-16 h-px bg-rose-600/80 mx-auto animate-expand"
                     style={{ animation: 'expand 3.5s ease-out' }}></div>
                </div>

                {/* Programme des cérémonies */}
              <div className="mb-6 sm:mb-8 md:mb-10 text-center animate-fade-in-up"
                   style={{ animation: 'fadeInUp 4s ease-out' }}>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl animate-slide-in-left"
                    style={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      animation: 'slideInLeft 4.5s ease-out'
                    }}>
                  {weddingTexts?.program.title}
                </h3>
                <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">

              {/* Mariage civil */}
<div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/30 animate-slide-in-up"
     style={{ animation: 'slideInUp 5.25s ease-out' }}>
  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
    <Gavel className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
    <h4 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-lg"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
      Mariage civil
    </h4>
  </div>
  <div className="space-y-1 sm:space-y-2">
    <p className="text-sm sm:text-base md:text-lg text-white drop-shadow-lg font-semibold"
       style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
      10h00
    </p>
    <div className="flex items-center justify-center space-x-2 text-white">
      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
      <span className="text-sm sm:text-base drop-shadow-lg font-medium"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        Commune de Ngaliema
      </span>
    </div>
    <p className="text-sm text-yellow-100 drop-shadow-lg font-medium"
       style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
      Kinshasa, RDC
    </p>
  </div>
</div>
 

 


   
                 {/* Cérémonie */}
                  <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/30 animate-slide-in-left"
                       style={{ animation: 'slideInLeft 5s ease-out' }}>
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            <h4 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-lg"
                           style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{weddingTexts?.program.ceremonyTitle}</h4>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-sm sm:text-base md:text-lg text-white drop-shadow-lg font-semibold"
                         style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{weddingDetails?.ceremony.time}</p>
                      <div className="flex items-center justify-center space-x-2 text-white">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        <span className="text-sm sm:text-base drop-shadow-lg font-medium"
                              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{weddingDetails?.ceremony.venue}</span>
                      </div>
                      <p className="text-sm text-yellow-100 drop-shadow-lg font-medium"
                         style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{weddingDetails?.ceremony.address}</p>
                    </div>
                  </div>
                  
                  {/* Réception */}
                  <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/30 animate-slide-in-right"
                       style={{ animation: 'slideInRight 5.5s ease-out' }}>
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <Wine className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            <h4 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-lg"
                           style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{weddingTexts?.program.receptionTitle}</h4>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-sm sm:text-base md:text-lg text-white drop-shadow-lg font-semibold"
                         style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{weddingDetails?.reception.time}</p>
                      <div className="flex items-center justify-center space-x-2 text-white">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        <span className="text-sm sm:text-base drop-shadow-lg font-medium"
                              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{weddingDetails?.reception.venue}</span>
                      </div>
                      <p className="text-sm text-yellow-100 drop-shadow-lg font-medium"
                         style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{weddingDetails?.reception.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        );

      
      case 5:
        return (
          <div 
            className="relative overflow-hidden animate-fade-in"
            style={{
              backgroundImage: `url(${weddingSections[index]?.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              height: '100%',
              minHeight: '100vh',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 1.5s ease-out'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-center p-4 w-full">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/30 animate-slide-up"
                   style={{ animation: 'slideUp 2s ease-out' }}>
                <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-600 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8 animate-expand"
                     style={{ animation: 'expand 2.5s ease-out' }}></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 md:mb-8 drop-shadow-2xl animate-fade-in"
                    style={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      animation: 'fadeIn 3s ease-out'
                    }}>
                  {weddingTexts?.cancellation.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white italic leading-relaxed mb-4 sm:mb-6 drop-shadow-lg animate-fade-in-up font-medium"
                   style={{ 
                     textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                     animation: 'fadeInUp 3.5s ease-out'
                   }}>
                  {weddingTexts?.cancellation.description}
                </p>
                <div className="p-3 sm:p-4 md:p-6 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl border border-white/30 shadow-lg animate-slide-up"
                     style={{ animation: 'slideUp 4s ease-out' }}>
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-lg"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Confirmation de présence</h3>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-yellow-100 mb-4 sm:mb-6 drop-shadow-lg font-semibold"
                     style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    {weddingTexts?.cancellation.timeLimit}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 text-sm sm:text-base font-medium border border-white/30 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg animate-bounce"
                      style={{ animation: 'bounce 2s ease-in-out infinite' }}
                      onClick={() => handleRsvp('confirmed')}
                      disabled={!guest || guest?.rsvp_status === 'confirmed'}
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Confirmer ma présence</span>
                    </button>
                    <button
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 text-sm sm:text-base font-medium border border-white/30 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg animate-pulse"
                      style={{ animation: 'pulse 2s ease-in-out infinite' }}
                      onClick={() => handleRsvp('cancelled')}
                      disabled={!guest || guest?.rsvp_status === 'cancelled'}
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Annuler ma venue</span>
                    </button>
                  </div>
                </div>
                
                {/* Informations de contact simples */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/30">
                  <p className="text-base sm:text-lg md:text-xl text-white mb-3 sm:mb-4 drop-shadow-lg font-semibold"
                     style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    Contact : 
                    <a href="tel:+243817173177" className="text-yellow-100 hover:text-yellow-200 transition-colors duration-300 ml-2 font-bold"
                       style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                      +243 817 173 177
                    </a>
                    <span className="text-white mx-2">|</span>
                    <a href="tel:+243899372792" className="text-yellow-100 hover:text-yellow-200 transition-colors duration-300 font-bold"
                       style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                      +243 899 372 792
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [weddingDetails, weddingTexts, guest, weddingSections, alcoholicDrinks, nonAlcoholicDrinks, selectedAlcoholic, selectedNonAlcoholic, guestbookMessage, handleSendGuestbook, handleSavePreferences, handleRsvp, handleBackgroundImageError]);

  // Charger les données de l'invitation et de l'invité
  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;
    
    const loadData = async () => {
      if (!id || hasLoaded) {
        return;
      }
      

      setLoading(true);
      hasLoaded = true;
      
      try {
        const data = await loadWeddingData();
        
        if (!isMounted) {
          return;
        }
        
        if (data) {
          setWeddingDetails(data.weddingDetails);
          setDrinkOptions(data.drinkOptions);
          setWeddingTexts(data.weddingTexts);
          
          // Utilise l'id du weddingDetails pour fetchGuests
          const allGuests = await fetchGuests(data.weddingDetails.id ?? '');
          
          if (!isMounted) return;
          
          const found = allGuests.find((g: Guest) => g.id === id);
          
          if (found) {
            setGuest(found);
            setGuestFound(true);
          } else {
            setGuest(null);
            setGuestFound(false);
          }
        } else {
          setGuestFound(false);
        }
      } catch (error) {
        console.error('InvPreview: Erreur lors du chargement:', error);
        if (isMounted) {
          setGuestFound(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [id]); // Suppression des dépendances loadWeddingData et fetchGuests qui causent la boucle

  const nextSection = useCallback(() => {
    if (!weddingSections || !weddingSections.length) {
      console.warn('weddingSections non disponible pour la navigation');
      return;
    }
    setCurrentSection(prev => (prev + 1) % weddingSections.length);
  }, [weddingSections]);
  
  const prevSection = useCallback(() => {
    if (!weddingSections || !weddingSections.length) {
      console.warn('weddingSections non disponible pour la navigation');
      return;
    }
    setCurrentSection(prev => (prev - 1 + weddingSections.length) % weddingSections.length);
  }, [weddingSections]);

  const goToSection = useCallback((index: number) => {
    if (!weddingSections || !weddingSections.length) {
      console.warn('weddingSections non disponible pour la navigation');
      return;
    }
    if (index < 0 || index >= weddingSections.length) {
      console.warn(`Index de section invalide: ${index}`);
      return;
    }
    if (index === currentSection) return;
    setCurrentSection(index);
  }, [currentSection, weddingSections]);

  // Loader tant que les données ne sont pas chargées
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  // Afficher une page d'erreur si l'invité n'est pas trouvé
  if (guestFound === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-rose-100 rounded-full flex items-center justify-center">
              <X className="w-10 h-10 text-rose-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Invitation non trouvée
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Désolé, cette invitation n'existe pas ou n'est plus valide. 
              Veuillez vérifier le lien ou contacter les mariés.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                ID recherché : <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span>
              </p>
              <p className="text-sm text-gray-500">
                Si vous pensez qu'il s'agit d'une erreur, contactez les mariés.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier que toutes les données nécessaires sont chargées
  if (!weddingDetails || !drinkOptions || !weddingTexts || !weddingSections.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-gray-600">Erreur lors du chargement des données</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez réessayer ou contacter les mariés</p>
        </div>
      </div>
    );
  }

  // Affichage vertical de toutes les sections
  return (
    <div ref={containerRef} className="relative min-h-screen sm:overflow-y-auto flex flex-col pb-24">
      {/* SEO Head avec titre et description dynamiques */}
      <SeoHead 
        overrides={{
          title: pageTitle,
          description: pageDescription,
          ogTitle: pageTitle,
          ogDescription: pageDescription,
          ogImageUrl: weddingDetails?.couplePhoto
        }}
      />
      {/* Afficher toutes les sections verticalement */}
      {weddingSections.map((section, index) => {
        // Retirer les sections 2 (Programme), 3 (Livre d'or) et 4 (Boissons)
        if (index === 2 || index === 3 || index === 4) return null;
        return (
          <div key={section.id} className="w-full">
            {renderSection(index)}
          </div>
        );
      })}
      {/* Footer Loventy */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-white/80 backdrop-blur-sm border-t border-rose-100 flex items-center justify-center py-2 px-4 gap-2 text-xs sm:text-sm text-gray-700 font-medium shadow-sm">
        <LoventyLogo className="h-6 w-6 mr-2 inline-block align-middle" />
        <span>
          Créez vos invitations sur <a href="https://loventy.org" className="text-rose-600 hover:underline font-semibold" target="_blank" rel="noopener noreferrer">loventy.org</a>
          &nbsp;| contact: Ryan Sabowa <a href="tel:+243981682933" className="text-rose-600 hover:underline">+243 98 168 2933</a>
        </span>
      </footer>
      {/* Toast visuel global */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg bg-green-600 text-white font-semibold text-base transition-all duration-300 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
});

InvPreview.displayName = 'InvPreview';

export default InvPreview; 