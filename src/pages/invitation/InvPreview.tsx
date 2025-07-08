import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, Clock, Wine, MessageCircle, X, ChevronLeft, ChevronRight, User, Hash, CheckCircle, Download, Printer } from 'lucide-react';
import { useDatabase } from '../../hooks/useDatabase';
import { WeddingDetails, GuestInfo, DrinkOptions, WeddingTexts } from '../../data/weddingData';
import LoventyLogo from '../../components/LoventyLogo';
import SeoHead from '../../components/SeoHead';
import { Guest, WeddingData } from '../../lib/database';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

// Import des images de fond
import fond1 from '../../assets/wedding/fond/fond1.jpg';
import fond2 from '../../assets/wedding/fond/fond2.jpg';
import fond3 from '../../assets/wedding/fond/fond3.jpg';
import fond4 from '../../assets/wedding/fond/fond4.jpg';
import fond5 from '../../assets/wedding/fond/fond5.jpg';
import fond6 from '../../assets/wedding/fond/fond6.jpg';

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
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Fonction pour générer et télécharger une image combinée des sections
  const handleGenerateImages = useCallback(async () => {
    if (!weddingDetails || !guest) {
      setToast('Données manquantes pour la génération');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    setIsGenerating(true);
    setToast('Génération de l\'image en cours...');

    try {
      const sectionsToCapture = [0, 1, 2];
      const currentSectionBackup = currentSection;
      const canvases: HTMLCanvasElement[] = [];

      // Capturer chaque section
      for (let i = 0; i < sectionsToCapture.length; i++) {
        const sectionIndex = sectionsToCapture[i];

        setCurrentSection(sectionIndex);
        // Attendre le rendu React + DOM
        await new Promise(resolve => setTimeout(resolve, 400));

        const sectionElement = sectionRefs.current[sectionIndex];
        if (sectionElement) {
          const canvas = await html2canvas(sectionElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            width: sectionElement.scrollWidth,
            height: sectionElement.scrollHeight,
            scrollX: 0,
            scrollY: 0
          });
          canvases.push(canvas);
        }
      }

      setCurrentSection(currentSectionBackup);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Créer le canvas combiné
      if (canvases.length > 0) {
        const maxWidth = Math.max(...canvases.map(canvas => canvas.width));
        const totalHeight = canvases.reduce((sum, canvas) => sum + canvas.height, 0);
        
        const combinedCanvas = document.createElement('canvas');
        const ctx = combinedCanvas.getContext('2d');
        
        if (ctx) {
          combinedCanvas.width = maxWidth;
          combinedCanvas.height = totalHeight;
          
          // Remplir le fond avec un dégradé élégant
          const gradient = ctx.createLinearGradient(0, 0, 0, totalHeight);
          gradient.addColorStop(0, '#fdf2f8'); // rose-50
          gradient.addColorStop(1, '#fce7f3'); // rose-100
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, maxWidth, totalHeight);
          
          // Dessiner chaque section
          let currentY = 0;
          canvases.forEach((canvas, index) => {
            const x = (maxWidth - canvas.width) / 2; // Centrer horizontalement
            ctx.drawImage(canvas, x, currentY);
            
            // Ajouter un séparateur élégant entre les sections (sauf après la dernière)
            if (index < canvases.length - 1) {
              currentY += canvas.height;
              const separatorHeight = 40;
              
              // Dégradé de séparation
              const separatorGradient = ctx.createLinearGradient(0, currentY, 0, currentY + separatorHeight);
              separatorGradient.addColorStop(0, 'rgba(244, 114, 182, 0.1)'); // rose-400 avec transparence
              separatorGradient.addColorStop(0.5, 'rgba(244, 114, 182, 0.2)');
              separatorGradient.addColorStop(1, 'rgba(244, 114, 182, 0.1)');
              
              ctx.fillStyle = separatorGradient;
              ctx.fillRect(0, currentY, maxWidth, separatorHeight);
              
              // Ligne décorative
              ctx.strokeStyle = 'rgba(244, 114, 182, 0.3)';
              ctx.lineWidth = 2;
              ctx.setLineDash([10, 5]);
              ctx.beginPath();
              ctx.moveTo(maxWidth * 0.2, currentY + separatorHeight / 2);
              ctx.lineTo(maxWidth * 0.8, currentY + separatorHeight / 2);
              ctx.stroke();
              ctx.setLineDash([]);
              
              currentY += separatorHeight;
            } else {
              currentY += canvas.height;
            }
          });
          
          // Convertir en blob et télécharger
          combinedCanvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `Invitation_${weddingDetails.groomName}_${weddingDetails.brideName}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              
              setToast('Image combinée générée et téléchargée !');
              setTimeout(() => setToast(null), 3000);
            }
          }, 'image/png', 0.9);
        }
      }

    } catch (error) {
      console.error('Erreur lors de la génération de l\'image:', error);
      setToast('Erreur lors de la génération de l\'image');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  }, [weddingDetails, guest, currentSection]);

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
            className="relative overflow-hidden"
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
              justifyContent: 'center'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-center p-4 w-full">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/20 relative">
                {/* Décorations - Rubans élégants dans les coins */}
                <div className="absolute top-2 left-2 w-8 h-8">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-rose-300 to-transparent transform rotate-45 origin-left"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-b from-rose-300 to-transparent transform -rotate-45 origin-top"></div>
                </div>
                <div className="absolute top-2 right-2 w-8 h-8">
                  <div className="w-6 h-0.5 bg-gradient-to-l from-rose-300 to-transparent transform -rotate-45 origin-right"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-b from-rose-300 to-transparent transform rotate-45 origin-top"></div>
                </div>
                <div className="absolute bottom-2 left-2 w-8 h-8">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-rose-300 to-transparent transform -rotate-45 origin-left"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-t from-rose-300 to-transparent transform rotate-45 origin-bottom"></div>
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8">
                  <div className="w-6 h-0.5 bg-gradient-to-l from-rose-300 to-transparent transform rotate-45 origin-right"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-t from-rose-300 to-transparent transform -rotate-45 origin-bottom"></div>
                </div>

                {/* Décorations - Éléments romantiques (cœurs ailés) */}
                <div className="absolute top-3 left-3 w-5 h-5">
                  <div className="w-3 h-3 bg-rose-300 rounded-full transform rotate-45 relative">
                    <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-rose-200 rounded-full"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-200 rounded-full"></div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 w-5 h-5">
                  <div className="w-3 h-3 bg-rose-300 rounded-full transform rotate-45 relative">
                    <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-rose-200 rounded-full"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-200 rounded-full"></div>
                  </div>
                </div>

                {/* Décorations - Étoiles scintillantes */}
                <div className="absolute top-4 left-1/4 w-3 h-3">
                  <div className="w-3 h-3 bg-yellow-300 transform rotate-45 relative animate-pulse">
                    <div className="absolute inset-0 bg-yellow-200 transform rotate-45"></div>
                  </div>
                </div>
                <div className="absolute top-4 right-1/4 w-2 h-2">
                  <div className="w-2 h-2 bg-yellow-300 transform rotate-45 relative animate-pulse delay-100">
                    <div className="absolute inset-0 bg-yellow-200 transform rotate-45"></div>
                  </div>
                </div>

                {/* Décorations - Bulles de champagne flottantes */}
                <div className="absolute top-6 left-6 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-200"></div>
                <div className="absolute bottom-6 left-8 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-8 right-6 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-150"></div>

                {/* Décorations - Petites clés d'amour */}
                <div className="absolute bottom-3 left-3 w-5 h-6">
                  <div className="w-3 h-3 border border-rose-300 rounded-full"></div>
                  <div className="w-0.5 h-3 bg-rose-300 mx-auto mt-0.5"></div>
                  <div className="w-2 h-0.5 bg-rose-300 mx-auto mt-0.5"></div>
                </div>
                <div className="absolute bottom-3 right-3 w-5 h-6">
                  <div className="w-3 h-3 border border-rose-300 rounded-full"></div>
                  <div className="w-0.5 h-3 bg-rose-300 mx-auto mt-0.5"></div>
                  <div className="w-2 h-0.5 bg-rose-300 mx-auto mt-0.5"></div>
                </div>

                {/* Contenu principal de la carte */}
                {/* Photo du couple en cercle */}
                <div className="mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-2 sm:border-4 border-rose-200 shadow-xl">
                    <img 
                      src={weddingDetails?.couplePhoto}
                      alt={`${weddingDetails?.groomName} et ${weddingDetails?.brideName}`}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: 'center top',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                      decoding="async"
                      onError={handleBackgroundImageError}
                    />
                  </div>
                </div>
                {/* Noms des mariés */}
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-2 sm:mb-4 drop-shadow-sm" 
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {weddingDetails?.groomName} <span className="text-rose-600 font-normal drop-shadow-sm">&</span> {weddingDetails?.brideName}
                  </h1>
                  {/* Ligne décorative */}
                  <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
                    <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500 fill-rose-500 drop-shadow-sm" />
                    <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
                  </div>
                </div>
                {/* Message d'invitation */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm sm:text-base md:text-lg text-gray-800 mb-2 sm:mb-4 leading-relaxed px-4 sm:px-6 drop-shadow-sm"
                     style={{ 
                       fontFamily: 'Dancing Script, cursive', 
                       fontSize: 'clamp(1rem, 4vw, 1.5rem)', 
                       fontWeight: 600,
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
                  <div className="text-gray-700 text-sm sm:text-base font-semibold drop-shadow-sm">{weddingDetails?.weddingDate.month}</div>
                  <div className="flex items-center justify-center space-x-4 sm:space-x-6 md:space-x-8">
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1 drop-shadow-sm font-medium">{weddingDetails?.weddingDate.dayOfWeek}</div>
                      <div className="w-8 sm:w-12 h-px bg-gray-400"></div>
                    </div>
                    <div className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 drop-shadow-sm" 
                         style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                      {weddingDetails?.weddingDate.day}
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1 drop-shadow-sm font-medium">{weddingDetails?.weddingDate.time}</div>
                      <div className="w-8 sm:w-12 h-px bg-gray-400"></div>
                    </div>
                  </div>
                  <div className="text-gray-700 text-sm sm:text-base font-semibold drop-shadow-sm">{weddingDetails?.weddingDate.year}</div>
                </div>
                {/* Lieu */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-300">
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words font-medium drop-shadow-sm">
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
            ref={(el) => sectionRefs.current[1] = el}
            className="relative overflow-hidden"
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
              justifyContent: 'center'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-center p-4 w-full">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/20 relative">
                {/* Décorations - Rubans élégants dans les coins */}
                <div className="absolute top-2 left-2 w-8 h-8">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-rose-300 to-transparent transform rotate-45 origin-left"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-b from-rose-300 to-transparent transform -rotate-45 origin-top"></div>
                </div>
                <div className="absolute top-2 right-2 w-8 h-8">
                  <div className="w-6 h-0.5 bg-gradient-to-l from-rose-300 to-transparent transform -rotate-45 origin-right"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-b from-rose-300 to-transparent transform rotate-45 origin-top"></div>
                </div>
                <div className="absolute bottom-2 left-2 w-8 h-8">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-rose-300 to-transparent transform -rotate-45 origin-left"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-t from-rose-300 to-transparent transform rotate-45 origin-bottom"></div>
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8">
                  <div className="w-6 h-0.5 bg-gradient-to-l from-rose-300 to-transparent transform rotate-45 origin-right"></div>
                  <div className="w-0.5 h-6 bg-gradient-to-t from-rose-300 to-transparent transform -rotate-45 origin-bottom"></div>
                </div>

                {/* Décorations - Éléments romantiques (cœurs ailés) */}
                <div className="absolute top-3 left-3 w-5 h-5">
                  <div className="w-3 h-3 bg-rose-300 rounded-full transform rotate-45 relative">
                    <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-rose-200 rounded-full"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-200 rounded-full"></div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 w-5 h-5">
                  <div className="w-3 h-3 bg-rose-300 rounded-full transform rotate-45 relative">
                    <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-rose-200 rounded-full"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-200 rounded-full"></div>
                  </div>
                </div>

                {/* Décorations - Étoiles scintillantes */}
                <div className="absolute top-4 left-1/4 w-3 h-3">
                  <div className="w-3 h-3 bg-yellow-300 transform rotate-45 relative animate-pulse">
                    <div className="absolute inset-0 bg-yellow-200 transform rotate-45"></div>
                  </div>
                </div>
                <div className="absolute top-4 right-1/4 w-2 h-2">
                  <div className="w-2 h-2 bg-yellow-300 transform rotate-45 relative animate-pulse delay-100">
                    <div className="absolute inset-0 bg-yellow-200 transform rotate-45"></div>
                  </div>
                </div>

                {/* Décorations - Bulles de champagne flottantes */}
                <div className="absolute top-6 left-6 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-200"></div>
                <div className="absolute bottom-6 left-8 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-8 right-6 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-150"></div>

                {/* Décorations - Petites clés d'amour */}
                <div className="absolute bottom-3 left-3 w-5 h-6">
                  <div className="w-3 h-3 border border-rose-300 rounded-full"></div>
                  <div className="w-0.5 h-3 bg-rose-300 mx-auto mt-0.5"></div>
                  <div className="w-2 h-0.5 bg-rose-300 mx-auto mt-0.5"></div>
                </div>
                <div className="absolute bottom-3 right-3 w-5 h-6">
                  <div className="w-3 h-3 border border-rose-300 rounded-full"></div>
                  <div className="w-0.5 h-3 bg-rose-300 mx-auto mt-0.5"></div>
                  <div className="w-2 h-0.5 bg-rose-300 mx-auto mt-0.5"></div>
                </div>

                {/* Contenu principal de la carte */}
                <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
                  {weddingTexts?.invitation.title}
                </h2>
                
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
            ref={(el) => sectionRefs.current[2] = el}
            className="relative overflow-hidden"
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
              justifyContent: 'center'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-center p-4 w-full">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/20">
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-6 sm:mb-8"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 sm:mb-8">
                  {weddingTexts?.program.title}
                </h2>
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
                
                {/* Bouton d'impression */}
                <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
                  <button
                    onClick={handleGenerateImages}
                    disabled={isGenerating || !weddingDetails || !guest}
                    className="inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span>Génération en cours...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Télécharger l'image complète</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                    Combine les sections Accueil, Invitation et Programme en une seule image
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div 
            className="relative overflow-hidden"
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
              justifyContent: 'center'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-center p-4 w-full">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/20">
                <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
                  {weddingTexts?.guestbook.title}
                </h2>
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
            className="relative overflow-y-auto sm:overflow-hidden"
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
              justifyContent: 'center'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-center p-4 w-full sm:min-h-screen">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/20 my-8 sm:my-0">
                <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
                  {weddingTexts?.preferences.title}
                </h2>
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
                      <span className="ml-2 text-sm font-normal text-red-600">
                        ({selectedAlcoholic.length}/2)
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-48 sm:max-h-none overflow-y-auto">
                      {alcoholicDrinks.map((drink: string, index: number) => {
                        const isSelected = selectedAlcoholic.includes(drink);
                        const isDisabled = !isSelected && selectedAlcoholic.length >= 2;
                        return (
                          <label 
                            key={index} 
                            className={`flex items-center space-x-2 p-2 sm:p-3 bg-white rounded border transition-colors ${
                              isDisabled 
                                ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                                : 'hover:bg-red-50 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="text-red-600 focus:ring-red-500"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={e => setSelectedAlcoholic(sel => e.target.checked ? [...sel, drink] : sel.filter(d => d !== drink))}
                            />
                            <span className={`text-xs sm:text-sm md:text-base ${
                              isDisabled ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              {drink}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {/* Boissons non-alcoolisées */}
                  <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl md:rounded-2xl border border-blue-200 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-800 mb-3 sm:mb-4">
                      {weddingTexts?.preferences.nonAlcoholicTitle}
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        ({selectedNonAlcoholic.length}/2)
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-48 sm:max-h-none overflow-y-auto">
                      {nonAlcoholicDrinks.map((drink: string, index: number) => {
                        const isSelected = selectedNonAlcoholic.includes(drink);
                        const isDisabled = !isSelected && selectedNonAlcoholic.length >= 2;
                        return (
                          <label 
                            key={index} 
                            className={`flex items-center space-x-2 p-2 sm:p-3 bg-white rounded border transition-colors ${
                              isDisabled 
                                ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                                : 'hover:bg-blue-50 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="text-blue-600 focus:ring-blue-500"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={e => setSelectedNonAlcoholic(sel => e.target.checked ? [...sel, drink] : sel.filter(d => d !== drink))}
                            />
                            <span className={`text-xs sm:text-sm md:text-base ${
                              isDisabled ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              {drink}
                            </span>
                          </label>
                        );
                      })}
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
            className="relative overflow-hidden"
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
              justifyContent: 'center'
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-center p-4 w-full">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full text-center border border-white/20">
                <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mb-4 sm:mb-6 md:mb-8"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">
                  {weddingTexts?.cancellation.title}
                </h2>
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

  // Gestion du swipe mobile avec throttling
  const [isSectionReady, setIsSectionReady] = useState(true);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let startX = 0;
    let endX = 0;
    let isSwiping = false;
    let isThrottled = false;
    let hasMoved = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (isThrottled || !isSectionReady) return;
      startX = e.touches[0].clientX;
      endX = startX;
      isSwiping = true;
      hasMoved = false;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping || isThrottled || !isSectionReady) return;
      endX = e.touches[0].clientX;
      // Vérifier s'il y a eu un mouvement significatif
      const diff = Math.abs(endX - startX);
      if (diff > 5) {
        hasMoved = true;
      }
    };
    
    const handleTouchEnd = () => {
      if (!isSwiping || isThrottled || !isSectionReady) return;
      isSwiping = false;
      const diff = startX - endX;
      const threshold = 50;
      if (hasMoved && Math.abs(diff) > threshold) {
        isThrottled = true;
        setIsSectionReady(false); // Bloque la navigation
        setTimeout(() => { isThrottled = false; }, 300);
        if (diff > 0) {
          setCurrentSection(prev => {
            const next = (prev + 1) % weddingSections.length;
            setTimeout(() => setIsSectionReady(true), 100);
            return next;
          });
        } else {
          setCurrentSection(prev => {
            const next = (prev - 1 + weddingSections.length) % weddingSections.length;
            setTimeout(() => setIsSectionReady(true), 100);
            return next;
          });
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
  }, [nextSection, prevSection, weddingSections, currentSection, isSectionReady]);

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

  return (
    <div ref={containerRef} className="relative h-screen sm:h-auto sm:min-h-screen sm:overflow-y-auto">
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
      {weddingSections && weddingSections.length > 0 && (
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
      )}
      {/* Navigation Arrows */}
      {weddingSections && weddingSections.length > 0 && (
        <>
          <button
            onClick={() => {
              if (!isSectionReady) return;
              setIsSectionReady(false);
              setCurrentSection(prev => {
                const next = (prev - 1 + weddingSections.length) % weddingSections.length;
                setTimeout(() => setIsSectionReady(true), 100);
                return next;
              });
            }}
            disabled={!isSectionReady}
            className={`fixed left-2 sm:left-8 top-1/2 transform -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-600 hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl border border-rose-200 ${!isSectionReady ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => {
              if (!isSectionReady) return;
              setIsSectionReady(false);
              setCurrentSection(prev => {
                const next = (prev + 1) % weddingSections.length;
                setTimeout(() => setIsSectionReady(true), 100);
                return next;
              });
            }}
            disabled={!isSectionReady}
            className={`fixed right-2 sm:right-8 top-1/2 transform -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-600 hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl border border-rose-200 ${!isSectionReady ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}
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