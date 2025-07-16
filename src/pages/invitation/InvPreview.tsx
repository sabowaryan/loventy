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
  const [sectionReady, setSectionReady] = useState(false);
  
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
        setSectionReady(false);
        setCurrentSection(sectionIndex);
        // Attendre que la section soit prête (max 2s)
        let tries = 0;
        while (!sectionReady && tries < 40) {
          await new Promise(resolve => setTimeout(resolve, 50));
          tries++;
        }
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
        } else {
          setToast(`Erreur : la section ${sectionIndex + 1} n'a pas pu être capturée.`);
          setIsGenerating(false);
          return;
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
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let startX = 0;
    let endX = 0;
    let isSwiping = false;
    let isThrottled = false;
    let hasMoved = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (isThrottled) return;
      startX = e.touches[0].clientX;
      endX = startX;
      isSwiping = true;
      hasMoved = false;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping || isThrottled) return;
      endX = e.touches[0].clientX;
      
      // Vérifier s'il y a eu un mouvement significatif
      const diff = Math.abs(endX - startX);
      if (diff > 5) {
        hasMoved = true;
      }
    };
    
    const handleTouchEnd = () => {
      if (!isSwiping || isThrottled) return;
      isSwiping = false;
      
      const diff = startX - endX;
      const threshold = 50;
      
      // S'assurer qu'il y a eu un mouvement ET que le seuil est atteint
      if (hasMoved && Math.abs(diff) > threshold) {
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

  // --- Place cette fonction juste avant le return principal du composant ---
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
          <div ref={(el) => { sectionRefs.current[0] = el; if (currentSection === 0 && el) setSectionReady(true); }}
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
            {/* Place ici tout le JSX détaillé de la section 0 (Accueil) */}
          </div>
        );
      case 1:
        return (
          <div ref={(el) => { sectionRefs.current[1] = el; if (currentSection === 1 && el) setSectionReady(true); }}
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
            {/* Place ici tout le JSX détaillé de la section 1 (Invitation) */}
          </div>
        );
      case 2:
        return (
          <div ref={(el) => { sectionRefs.current[2] = el; if (currentSection === 2 && el) setSectionReady(true); }}
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
            {/* Place ici tout le JSX détaillé de la section 2 (Programme) */}
          </div>
        );
      // ... Ajoute les autres cases si besoin ...
      default:
        return null;
    }
  }, [weddingSections, guest, currentSection, sectionRefs, sectionReady, setSectionReady]);

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