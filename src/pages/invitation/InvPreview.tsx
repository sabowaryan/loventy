import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, Clock, Wine, MessageCircle, X, ChevronLeft, ChevronRight, User, Hash, CheckCircle } from 'lucide-react';
import { useDatabase } from '../../hooks/useDatabase';
import { WeddingDetails, GuestInfo, DrinkOptions, WeddingTexts } from '../../data/weddingData';
import LoventyLogo from '../../components/LoventyLogo';
import SeoHead from '../../components/SeoHead';
import { Guest, WeddingData } from '../../lib/database';

// Construction dynamique des sections à partir des données chargées
const buildWeddingSections = (weddingDetails: WeddingDetails, weddingTexts: WeddingTexts) => {
  return [
    { id: 0, title: 'Accueil', background: "url('/images/wedding/fond/fond1.jpg') center/cover no-repeat" },
    { id: 1, title: 'Invitation', background: 'linear-gradient(135deg, #fff 0%, #f3e8ff 100%)' },
    { id: 2, title: 'Programme', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)' },
    { id: 3, title: 'Livre d\'or', background: 'linear-gradient(135deg, #f0fdf4 0%, #fef9c3 100%)' },
    { id: 4, title: 'Boissons', background: 'linear-gradient(135deg, #f0f9ff 0%, #f3e8ff 100%)' },
    { id: 5, title: 'Annulation', background: 'linear-gradient(135deg, #fff7ed 0%, #ffe4e6 100%)' },
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
  
  // État pour tester le chargement de l'image de fond
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);

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

  // Image de fond statique simplifiée avec fallback
  const backgroundStyle = useMemo(() => {
    // Fallback vers un gradient élégant si l'image ne charge pas
    const fallbackGradient = 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #fbcfe8 50%, #f9a8d4 75%, #ec4899 100%)';
    
    if (backgroundImageLoaded) {
      return {
        backgroundImage: "url('/images/wedding/fond/fond1.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        // Suppression de backgroundAttachment: 'fixed' pour un meilleur contrôle
        width: '100%',
        height: '100%',
        minHeight: '100vh'
      };
    }
    
    return {
      background: fallbackGradient,
      width: '100%',
      height: '100%',
      minHeight: '100vh'
    };
  }, [backgroundImageLoaded]);

  // Test de chargement de l'image de fond
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      console.log('Image de fond chargée avec succès');
      setBackgroundImageLoaded(true);
    };
    img.onerror = () => {
      console.warn('Erreur lors du chargement de l\'image de fond, utilisation du fallback');
      setBackgroundImageLoaded(false);
    };
    img.src = '/images/wedding/fond/fond1.jpg';
  }, []);

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
    // Ajout d'un guard pour les sections qui nécessitent guest
    if ((index === 1 || index === 2) && !guest) return null;
    
    switch (index) {
      case 0:
        return (
          <div 
            className="relative overflow-hidden"
            style={{
              ...backgroundStyle,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-center p-4 w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/20">
                {/* Photo du couple en cercle */}
                <div className="mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-2 sm:border-4 border-rose-200 shadow-xl">
                    <img 
                      src={weddingDetails?.couplePhoto}
                      alt={`${weddingDetails?.groomName} et ${weddingDetails?.brideName}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={handleBackgroundImageError}
                    />
                  </div>
                </div>
                {/* Noms des mariés */}
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-2 sm:mb-4" 
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {weddingDetails?.groomName} <span className="text-rose-500 font-normal">&</span> {weddingDetails?.brideName}
                  </h1>
                  {/* Ligne décorative */}
                  <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
                    <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400 fill-rose-400" />
                    <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                  </div>
                </div>
                {/* Message d'invitation */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-2 sm:mb-4 leading-relaxed px-4 sm:px-6"
                     style={{ 
                       fontFamily: 'Dancing Script, cursive', 
                       fontSize: 'clamp(1rem, 4vw, 1.5rem)', 
                       fontWeight: 500,
                       lineHeight: '1.6',
                       wordWrap: 'break-word',
                       overflowWrap: 'break-word',
                       hyphens: 'auto',
                       maxWidth: '100%',
                       textAlign: 'center'
                     }}>
                    {weddingTexts?.welcome.invitationMessage}
                  </p>
                </div>
                {/* Date et détails */}
                <div className="space-y-2 sm:space-y-4">
                  <div className="text-gray-600 text-sm sm:text-base font-medium">{weddingDetails?.weddingDate.month}</div>
                  <div className="flex items-center justify-center space-x-4 sm:space-x-6 md:space-x-8">
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-500 mb-1">{weddingDetails?.weddingDate.dayOfWeek}</div>
                      <div className="w-8 sm:w-12 h-px bg-gray-300"></div>
                    </div>
                    <div className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800" 
                         style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                      {weddingDetails?.weddingDate.day}
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-500 mb-1">{weddingDetails?.weddingDate.time}</div>
                      <div className="w-8 sm:w-12 h-px bg-gray-300"></div>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base font-medium">{weddingDetails?.weddingDate.year}</div>
                </div>
                {/* Lieu */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed break-words">
                    {weddingDetails?.ceremony.venue}
                    <br />
                    {weddingDetails?.ceremony.address}
                  </p>
                </div>
                {/* Décoration florale */}
                <div className="mt-3 sm:mt-4 flex items-center justify-center space-x-2">
                  <div className="w-6 sm:w-8 h-px bg-rose-200"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-300 rounded-full"></div>
                  <div className="w-6 sm:w-8 h-px bg-rose-200"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div 
            className="min-w-full min-h-full bg-cover bg-center bg-fixed flex items-start sm:items-center justify-center py-6 sm:py-8 md:py-0"
            style={{ backgroundImage: weddingSections[1]?.background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 md:px-8 text-center w-full">
              <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
                {weddingTexts?.invitation.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
                {/* Nom de l'invité avec décoration */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-800 mb-2 sm:mb-3 md:mb-4 italic tracking-wide" 
                      style={{ 
                        fontFamily: 'Crimson Text, Georgia, serif',
                        fontStyle: 'italic',
                        fontWeight: 300,
                        letterSpacing: '0.08em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        transform: 'skew(-2deg)',
                        transformOrigin: 'center'
                      }}>
                      Cher(e) {guest?.name ?? ''}
                  </h3>
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="w-6 sm:w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-rose-300 rounded-full"></div>
                    <div className="w-6 sm:w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                  </div>
                </div>
                
                {/* Message d'invitation personnalisé */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 italic leading-relaxed mb-3 sm:mb-4 md:mb-6">
                    {weddingTexts?.invitation.loveQuote}
                  </p>
                  <div className="w-12 sm:w-16 h-px bg-rose-300 mx-auto mb-3 sm:mb-4 md:mb-6"></div>
                </div>
                
                {/* Invitation formelle */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-800 font-medium leading-relaxed">
                    {weddingTexts?.invitation.mainMessage}
                  </p>
                  
                  {/* Information de table */}
                  <div className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg sm:rounded-xl border border-rose-200">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Vous serez placé(e) à la Table <span className="font-medium text-rose-700">{guest?.table_name ?? ''}</span>
                    </p>
                  </div>
                  
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-rose-600">
                    {weddingTexts?.invitation.dateMessage}
                  </p>
                  
                  {/* Détails pratiques */}
                  <div className="mt-3 sm:mt-4 md:mt-6 pt-2 sm:pt-3 md:pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Nous aurons le plaisir de vous accueillir pour partager ce moment unique de notre vie.
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                      Votre présence nous honorera et contribuera à rendre cette journée encore plus spéciale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div 
            className="min-w-full min-h-full bg-cover bg-center bg-fixed flex items-start sm:items-center justify-center py-8 sm:py-0"
            style={{ backgroundImage: weddingSections[2]?.background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center w-full">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-6 sm:mb-8"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 sm:mb-8">
                {weddingTexts?.program.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 italic leading-relaxed mb-6 sm:mb-8">
                  {weddingTexts?.program.welcomeMessage}
                </p>
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {/* Cérémonie */}
                  <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg sm:rounded-xl lg:rounded-2xl border border-rose-200">
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-4">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-rose-600" />
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-rose-800">{weddingTexts?.program.ceremonyTitle}</h3>
                    </div>
                    <div className="space-y-1 sm:space-y-2 md:space-y-3">
                      <p className="text-sm sm:text-base md:text-lg text-gray-700">{weddingDetails?.ceremony.time}</p>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-rose-500" />
                        <span className="text-xs sm:text-sm md:text-base">{weddingDetails?.ceremony.venue}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{weddingDetails?.ceremony.address}</p>
                    </div>
                  </div>
                  {/* Réception */}
                  <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl lg:rounded-2xl border border-blue-200">
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-4">
                      <Wine className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-800">{weddingTexts?.program.receptionTitle}</h3>
                    </div>
                    <div className="space-y-1 sm:space-y-2 md:space-y-3">
                      <p className="text-sm sm:text-base md:text-lg text-gray-700">{weddingDetails?.reception.time}</p>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />
                        <span className="text-xs sm:text-sm md:text-base">{weddingDetails?.reception.venue}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{weddingDetails?.reception.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div 
            className="min-w-full min-h-full bg-cover bg-center bg-fixed flex items-start sm:items-center justify-center py-6 sm:py-8 md:py-0"
            style={{ backgroundImage: weddingSections[3]?.background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 md:px-8 text-center w-full">
              <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
                {weddingTexts?.guestbook.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 italic leading-relaxed mb-4 sm:mb-6">
                  {weddingTexts?.guestbook.subtitle}
                </p>
                <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl border border-green-200 shadow-sm">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-800">Message pour les mariés</h3>
                  </div>
                  <textarea
                    className="w-full p-2 sm:p-3 md:p-4 border border-green-200 rounded-lg resize-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                    rows={3}
                    placeholder={weddingTexts?.guestbook.placeholder}
                    value={guestbookMessage}
                    onChange={e => setGuestbookMessage(e.target.value)}
                  />
                  <button
                    className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendGuestbook}
                    disabled={!guest || !guestbookMessage.trim()}
                  >
                    {weddingTexts?.guestbook.saveButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div 
            className="min-w-full min-h-full bg-cover bg-center bg-fixed flex items-start sm:items-center justify-center py-6 sm:py-8 md:py-0"
            style={{ backgroundImage: weddingSections[4]?.background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 md:px-8 text-center w-full">
              <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
                {weddingTexts?.preferences.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 italic leading-relaxed mb-4 sm:mb-6">
                  {weddingTexts?.preferences.subtitle}
                </p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6">
                  {weddingTexts?.preferences.description}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                  {weddingTexts?.preferences.limitation}
                </p>
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  {/* Boissons alcoolisées */}
                  <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg sm:rounded-xl md:rounded-2xl border border-red-200 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-red-800 mb-3 sm:mb-4">
                      {weddingTexts?.preferences.alcoholicTitle}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {alcoholicDrinks.map((drink: string, index: number) => (
                        <label key={index} className="flex items-center space-x-2 p-2 sm:p-3 bg-white rounded border hover:bg-red-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            className="text-red-600 focus:ring-red-500"
                            checked={selectedAlcoholic.includes(drink)}
                            onChange={e => setSelectedAlcoholic(sel => e.target.checked ? [...sel, drink] : sel.filter(d => d !== drink))}
                          />
                          <span className="text-xs sm:text-sm md:text-base text-gray-700">{drink}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Boissons non-alcoolisées */}
                  <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl md:rounded-2xl border border-blue-200 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-800 mb-3 sm:mb-4">
                      {weddingTexts?.preferences.nonAlcoholicTitle}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {nonAlcoholicDrinks.map((drink: string, index: number) => (
                        <label key={index} className="flex items-center space-x-2 p-2 sm:p-3 bg-white rounded border hover:bg-blue-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            className="text-blue-600 focus:ring-blue-500"
                            checked={selectedNonAlcoholic.includes(drink)}
                            onChange={e => setSelectedNonAlcoholic(sel => e.target.checked ? [...sel, drink] : sel.filter(d => d !== drink))}
                          />
                          <span className="text-xs sm:text-sm md:text-base text-gray-700">{drink}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSavePreferences}
                  disabled={!guest}
                >
                  Enregistrer mes choix
                </button>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div 
            className="min-w-full min-h-full bg-cover bg-center bg-fixed flex items-start sm:items-center justify-center py-6 sm:py-8 md:py-0"
            style={{ backgroundImage: weddingSections[5]?.background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 md:px-8 text-center w-full">
              <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
                {weddingTexts?.cancellation.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 italic leading-relaxed mb-4 sm:mb-6">
                  {weddingTexts?.cancellation.description}
                </p>
                <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg sm:rounded-xl md:rounded-2xl border border-orange-200 shadow-sm">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600" />
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-orange-800">Confirmation de présence</h3>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6">
                    {weddingTexts?.cancellation.timeLimit}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      onClick={() => handleRsvp('confirmed')}
                      disabled={!guest || guest?.rsvp_status === 'confirmed'}
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Confirmer ma présence</span>
                    </button>
                    <button
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      onClick={() => handleRsvp('cancelled')}
                      disabled={!guest || guest?.rsvp_status === 'cancelled'}
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Annuler ma venue</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [weddingDetails, weddingTexts, guest, weddingSections, alcoholicDrinks, nonAlcoholicDrinks, selectedAlcoholic, selectedNonAlcoholic, guestbookMessage, handleSendGuestbook, handleSavePreferences, handleRsvp, backgroundStyle, handleBackgroundImageError]);

  // Charger les données de l'invitation et de l'invité
  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;
    
    const loadData = async () => {
      if (!id || hasLoaded) {
        console.log('InvPreview: Pas d\'ID fourni ou déjà chargé');
        return;
      }
      
      console.log('InvPreview: Début du chargement pour ID:', id);
      setLoading(true);
      hasLoaded = true;
      
      try {
        console.log('InvPreview: Chargement des données de mariage...');
        const data = await loadWeddingData();
        console.log('InvPreview: Données de mariage chargées:', !!data);
        
        if (!isMounted) {
          console.log('InvPreview: Composant démonté, arrêt du chargement');
          return;
        }
        
        if (data) {
          setWeddingDetails(data.weddingDetails);
          setDrinkOptions(data.drinkOptions);
          setWeddingTexts(data.weddingTexts);
          
          console.log('InvPreview: Chargement des invités...');
          // Utilise l'id du weddingDetails pour fetchGuests
          const allGuests = await fetchGuests(data.weddingDetails.id ?? '');
          console.log('InvPreview: Invités chargés:', allGuests.length);
          
          if (!isMounted) return;
          
          const found = allGuests.find((g: Guest) => g.id === id);
          console.log('InvPreview: Invité trouvé:', !!found, 'ID recherché:', id);
          
          if (found) {
            setGuest(found);
            setGuestFound(true);
          } else {
            setGuest(null);
            setGuestFound(false);
          }
        } else {
          console.log('InvPreview: Aucune donnée de mariage trouvée');
          setGuestFound(false);
        }
      } catch (error) {
        console.error('InvPreview: Erreur lors du chargement:', error);
        if (isMounted) {
          setGuestFound(false);
        }
      } finally {
        if (isMounted) {
          console.log('InvPreview: Fin du chargement, loading = false');
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      console.log('InvPreview: Nettoyage du composant');
      isMounted = false;
    };
  }, [id]); // Suppression des dépendances loadWeddingData et fetchGuests qui causent la boucle

  const nextSection = useCallback(() => {
    if (!weddingSections || !weddingSections.length) return;
    setCurrentSection(prev => (prev + 1) % weddingSections.length);
  }, [weddingSections]);
  
  const prevSection = useCallback(() => {
    if (!weddingSections || !weddingSections.length) return;
    setCurrentSection(prev => (prev - 1 + weddingSections.length) % weddingSections.length);
  }, [weddingSections]);

  // Gestion du swipe mobile avec throttling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let startX = 0;
    let endX = 0;
    let isSwiping = false;
    let isThrottled = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (isThrottled) return;
      startX = e.touches[0].clientX;
      endX = startX;
      isSwiping = true;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping || isThrottled) return;
      endX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      if (!isSwiping || isThrottled) return;
      isSwiping = false;
      
      const diff = startX - endX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        isThrottled = true;
        setTimeout(() => { isThrottled = false; }, 300);
        
        if (diff > 0) {
          nextSection();
        } else {
          prevSection();
        }
      }
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextSection, prevSection]);

  const goToSection = useCallback((index: number) => {
    if (index === currentSection) return;
    setCurrentSection(index);
  }, [currentSection]);

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

  return (
    <div ref={containerRef} className="relative h-screen sm:h-auto sm:min-h-screen sm:overflow-y-auto overflow-hidden">
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
      {/* Navigation Dots */}
      <div className="fixed top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-50 flex space-x-2 sm:space-x-3">
        {weddingSections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => goToSection(index)}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 shadow-lg ${
              currentSection === index 
                ? 'bg-white scale-125 shadow-xl ring-2 ring-rose-300' 
                : 'bg-white/80 hover:bg-white hover:scale-110'
            }`}
            title={section.title}
          />
        ))}
      </div>
      {/* Navigation Arrows */}
      <button
        onClick={prevSection}
        className="fixed left-2 sm:left-8 top-1/2 transform -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-600 hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl border border-rose-200"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSection}
        className="fixed right-2 sm:right-8 top-1/2 transform -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-600 hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl border border-rose-200"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      {/* Section courante uniquement */}
      {renderSection(currentSection)}
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