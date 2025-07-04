import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, Clock, Wine, MessageCircle, X, ChevronLeft, ChevronRight, User, Hash } from 'lucide-react';
import { useDatabase } from '../../hooks/useDatabase';
import { WeddingDetails, GuestInfo, DrinkOptions, WeddingTexts } from '../../data/weddingData';
import LoventyLogo from '../../components/LoventyLogo';
import { Guest, WeddingData } from '../../lib/database';

// Construction dynamique des sections à partir des données chargées
function buildWeddingSections(weddingDetails: WeddingDetails, weddingTexts: WeddingTexts) {
  return [
    { id: 0, title: 'Accueil', background: "url('/images/wedding/fond/section1.jpg') center/cover no-repeat" },
    { id: 1, title: 'Invitation', background: 'linear-gradient(135deg, #fff 0%, #f3e8ff 100%)' },
    { id: 2, title: 'Programme', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)' },
    { id: 3, title: 'Livre d\'or', background: 'linear-gradient(135deg, #f0fdf4 0%, #fef9c3 100%)' },
    { id: 4, title: 'Boissons', background: 'linear-gradient(135deg, #f0f9ff 0%, #f3e8ff 100%)' },
    { id: 5, title: 'Annulation', background: 'linear-gradient(135deg, #fff7ed 0%, #ffe4e6 100%)' },
  ];
}

export default function InvPreview() {
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

  // Section boissons : parser les listes globales
  const alcoholicDrinks = drinkOptions?.alcoholic || [];
  const nonAlcoholicDrinks = drinkOptions?.nonAlcoholic || [];
  // State pour les choix de l'invité
  const [selectedAlcoholic, setSelectedAlcoholic] = useState<string[]>([]);
  const [selectedNonAlcoholic, setSelectedNonAlcoholic] = useState<string[]>([]);

  // Ajout d'un state pour feedback utilisateur
  const [toast, setToast] = useState<string | null>(null);
  
  // State pour le message du livre d'or
  const [guestbookMessage, setGuestbookMessage] = useState('');

  // Charger les données de l'invitation et de l'invité
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await loadWeddingData();
      if (data) {
        setWeddingDetails(data.weddingDetails);
        setDrinkOptions(data.drinkOptions);
        setWeddingTexts(data.weddingTexts);
        // Utilise l'id du weddingDetails pour fetchGuests
        const allGuests = await fetchGuests(data.weddingDetails.id ?? '');
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
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line
  }, [id]);

  // Gestion du swipe mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let startX = 0;
    let endX = 0;
    let isSwiping = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      endX = startX;
      isSwiping = true;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      endX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      if (!isSwiping) return;
      isSwiping = false;
      
      const diff = startX - endX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
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
  }, [currentSection]);

  const nextSection = () => {
    setCurrentSection(prev => (prev + 1) % weddingSections.length);
  };
  
  const prevSection = () => {
    setCurrentSection(prev => (prev - 1 + weddingSections.length) % weddingSections.length);
  };
  
  const goToSection = (index: number) => {
    if (index === currentSection) return;
    setCurrentSection(index);
  };

  // Loader tant que les données ne sont pas chargées
  if (loading || !weddingDetails || !drinkOptions || !weddingTexts) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  // Sections dynamiques
  const weddingSections = buildWeddingSections(weddingDetails, weddingTexts);

  // Handler pour enregistrer les préférences de boissons
  const handleSavePreferences = async () => {
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
  };

  // Handler pour confirmer ou annuler l'invitation
  const handleRsvp = async (status: 'confirmed' | 'cancelled') => {
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
  };

  // Handler pour envoyer un message dans le livre d'or
  const handleSendGuestbook = async () => {
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
  };

  // Fonction pour rendre dynamiquement la section courante
  const renderSection = (index: number) => {
    // Ajout d'un guard pour les sections qui nécessitent guest
    if ((index === 1 || index === 2) && !guest) return null;
    switch (index) {
      case 0:
        return (
          <div 
            className="min-w-full h-full bg-cover bg-center bg-fixed relative overflow-hidden"
            style={{ backgroundImage: weddingSections[0].background }}
          >
            <div className="relative z-10 h-full flex items-center justify-center p-4">
              <div className="bg-white/95 /*backdrop-blur-sm*/ rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/20">
                {/* Photo du couple en cercle */}
                <div className="mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-2 sm:border-4 border-rose-200 shadow-xl">
                    <img 
                      src={weddingDetails.couplePhoto}
                      alt={`${weddingDetails.groomName} et ${weddingDetails.brideName}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                {/* Noms des mariés */}
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-2 sm:mb-4" 
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {weddingDetails.groomName} <span className="text-rose-500 font-normal">&</span> {weddingDetails.brideName}
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
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-2 sm:mb-4 leading-relaxed">
                    {weddingTexts.welcome.invitationMessage}
                  </p>
                </div>
                {/* Date et détails */}
                <div className="space-y-2 sm:space-y-4">
                  <div className="text-gray-600 text-sm sm:text-base font-medium">{weddingDetails.weddingDate.month}</div>
                  <div className="flex items-center justify-center space-x-4 sm:space-x-6 md:space-x-8">
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-500 mb-1">{weddingDetails.weddingDate.dayOfWeek}</div>
                      <div className="w-8 sm:w-12 h-px bg-gray-300"></div>
                    </div>
                    <div className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800" 
                         style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                      {weddingDetails.weddingDate.day}
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-500 mb-1">{weddingDetails.weddingDate.time}</div>
                      <div className="w-8 sm:w-12 h-px bg-gray-300"></div>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base font-medium">{weddingDetails.weddingDate.year}</div>
                </div>
                {/* Lieu */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {weddingDetails.ceremony.venue}, {weddingDetails.ceremony.address}
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
            className="min-w-full h-full bg-cover bg-center bg-fixed flex items-center justify-center"
            style={{ backgroundImage: weddingSections[1].background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-8"></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-8">
                {weddingTexts.invitation.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
                {/* Nom de l'invité avec décoration */}
                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-800 mb-4 italic tracking-wide" 
                      style={{ 
                        fontFamily: 'Crimson Text, Georgia, serif',
                        fontStyle: 'italic',
                        fontWeight: 300,
                        letterSpacing: '0.08em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        transform: 'skew(-2deg)',
                        transformOrigin: 'center'
                      }}>
                    {guest?.name ?? ''}
                  </h3>
                  <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-6">
                    <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-rose-300 rounded-full"></div>
                    <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                  </div>
                </div>
                
                {/* Message d'invitation personnalisé */}
                <div className="mb-8">
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-6">
                    {weddingTexts.invitation.loveQuote}
                  </p>
                  <div className="w-16 h-px bg-rose-300 mx-auto mb-6"></div>
                </div>
                
                {/* Invitation formelle */}
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-base sm:text-lg md:text-xl text-gray-800 font-medium leading-relaxed">
                    {weddingTexts.invitation.mainMessage}
                  </p>
                  
                  {/* Information de table */}
                  <div className="py-4 sm:py-6 px-4 sm:px-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl sm:rounded-2xl border border-rose-200">
                    <p className="text-sm sm:text-base text-gray-600">
                      Vous serez placé(e) à la <span className="font-medium text-rose-700">{guest?.table_name ?? ''}</span>
                    </p>
                  </div>
                  
                  <p className="text-xl sm:text-2xl font-bold text-rose-600">
                    {weddingTexts.invitation.dateMessage}
                  </p>
                  
                  {/* Détails pratiques */}
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Nous aurons le plaisir de vous accueillir pour partager ce moment unique de notre vie.
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">
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
            className="min-w-full h-full bg-cover bg-center bg-fixed flex items-center justify-center"
            style={{ backgroundImage: weddingSections[2].background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-8"></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-8">
                {weddingTexts.program.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-8">
                  {weddingTexts.program.welcomeMessage}
                </p>
                <div className="space-y-6 sm:space-y-8">
                  {/* Cérémonie */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl sm:rounded-2xl border border-rose-200">
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-rose-800">{weddingTexts.program.ceremonyTitle}</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-base sm:text-lg text-gray-700">{weddingDetails.ceremony.time}</p>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                        <span className="text-sm sm:text-base">{weddingDetails.ceremony.venue}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{weddingDetails.ceremony.address}</p>
                    </div>
                  </div>
                  {/* Réception */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200">
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <Wine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800">{weddingTexts.program.receptionTitle}</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-base sm:text-lg text-gray-700">{weddingDetails.reception.time}</p>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        <span className="text-sm sm:text-base">{weddingDetails.reception.venue}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{weddingDetails.reception.address}</p>
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
            className="min-w-full h-full bg-cover bg-center bg-fixed flex items-center justify-center"
            style={{ backgroundImage: weddingSections[3].background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-8"></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-8">
                {weddingTexts.guestbook.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-6">
                  {weddingTexts.guestbook.subtitle}
                </p>
                <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-200">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-800">Message pour les mariés</h3>
                  </div>
                  <textarea
                    className="w-full p-3 sm:p-4 border border-green-200 rounded-lg resize-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    rows={4}
                    placeholder={weddingTexts.guestbook.placeholder}
                    value={guestbookMessage}
                    onChange={e => setGuestbookMessage(e.target.value)}
                  />
                  <button
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={handleSendGuestbook}
                    disabled={!guest || !guestbookMessage.trim()}
                  >
                    {weddingTexts.guestbook.saveButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div 
            className="min-w-full h-full bg-cover bg-center bg-fixed flex items-center justify-center"
            style={{ backgroundImage: weddingSections[4].background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-8"></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-8">
                {weddingTexts.preferences.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-6">
                  {weddingTexts.preferences.subtitle}
                </p>
                <p className="text-base sm:text-lg text-gray-600 mb-6">
                  {weddingTexts.preferences.description}
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  {weddingTexts.preferences.limitation}
                </p>
                <div className="space-y-6 sm:space-y-8">
                  {/* Boissons alcoolisées */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl sm:rounded-2xl border border-red-200">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-800 mb-4">
                      {weddingTexts.preferences.alcoholicTitle}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {alcoholicDrinks.map((drink: string, index: number) => (
                        <label key={index} className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-red-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="text-red-600 focus:ring-red-500"
                            checked={selectedAlcoholic.includes(drink)}
                            onChange={e => setSelectedAlcoholic(sel => e.target.checked ? [...sel, drink] : sel.filter(d => d !== drink))}
                          />
                          <span className="text-sm sm:text-base text-gray-700">{drink}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Boissons non-alcoolisées */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-blue-200">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 mb-4">
                      {weddingTexts.preferences.nonAlcoholicTitle}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {nonAlcoholicDrinks.map((drink: string, index: number) => (
                        <label key={index} className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-blue-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="text-blue-600 focus:ring-blue-500"
                            checked={selectedNonAlcoholic.includes(drink)}
                            onChange={e => setSelectedNonAlcoholic(sel => e.target.checked ? [...sel, drink] : sel.filter(d => d !== drink))}
                          />
                          <span className="text-sm sm:text-base text-gray-700">{drink}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  className="mt-6 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-colors"
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
            className="min-w-full h-full bg-cover bg-center bg-fixed flex items-center justify-center"
            style={{ backgroundImage: weddingSections[5].background }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-8"></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-8">
                {weddingTexts.cancellation.title}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-6">
                  {weddingTexts.cancellation.description}
                </p>
                <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl sm:rounded-2xl border border-orange-200">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-800">Annuler l'invitation</h3>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 mb-4">
                    {weddingTexts.cancellation.timeLimit}
                  </p>
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-2"
                    onClick={() => handleRsvp('confirmed')}
                    disabled={!guest || guest?.rsvp_status === 'confirmed'}
                  >
                    Confirmer ma présence
                  </button>
                  <button
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    onClick={() => handleRsvp('cancelled')}
                    disabled={!guest || guest?.rsvp_status === 'cancelled'}
                  >
                    Annuler ma venue
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Navigation Dots */}
      <div className="fixed top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-50 flex space-x-2 sm:space-x-3">
        {weddingSections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => goToSection(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              currentSection === index 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            title={section.title}
          />
        ))}
      </div>
      {/* Navigation Arrows */}
      <button
        onClick={prevSection}
        className="fixed left-2 sm:left-8 top-1/2 transform -translate-y-1/2 z-50 w-8 h-8 sm:w-12 sm:h-12 bg-rose-100/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-200 transition-all duration-300 shadow-lg border border-rose-200"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSection}
        className="fixed right-2 sm:right-8 top-1/2 transform -translate-y-1/2 z-50 w-8 h-8 sm:w-12 sm:h-12 bg-rose-100/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-200 transition-all duration-300 shadow-lg border border-rose-200"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      {/* Section Indicator */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 sm:px-6 sm:py-3 text-white text-sm sm:text-base font-medium">
        {currentSection + 1} / {weddingSections.length} - {weddingSections[currentSection].title}
      </div>
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
} 