import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Heart, Calendar, Share2 } from 'lucide-react';
import InvitationLayout from '../../components/layouts/InvitationLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { colorPalettes, fontFamilies, defaultDesignSettings } from '../../utils/designConstants';
import { InvitationDesignSettings, GuestDetails } from '../../types/models';
import { useInvitationGuests } from '../../hooks/useInvitationGuests';
import InvitationPreview from '../../components/invitation/InvitationPreview';
import SeoHead from '../../components/SeoHead';

const InvitationView: React.FC = () => {
  const { invitationId } = useParams();
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('guest');
  
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'confirmed' | 'declined'>('pending');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [designSettings, setDesignSettings] = useState<InvitationDesignSettings>(defaultDesignSettings);
  const [currentGuest, setCurrentGuest] = useState<GuestDetails | null>(null);
  const [events, setEvents] = useState<any[]>([]); // Remplacer par le type correct
  
  // Utiliser le hook pour récupérer les invités de cette invitation
  const { guests, isLoading: guestsLoading } = useInvitationGuests(invitationId);

  // Mock invitation data - in real app, this would come from API
  const invitation = {
    id: invitationId,
    title: 'Mariage Sarah & Alex',
    templateId: 'elegant-gold',
    brideName: 'Sarah',
    groomName: 'Alex',
    eventDate: '2025-07-12',
    eventTime: '16:00',
    venue: 'Domaine des Roses',
    address: '123 Rue de la Paix, 75001 Paris',
    message: 'Nous serions honorés de votre présence pour célébrer notre union et partager ce moment magique avec vous.',
    dressCode: 'Tenue de soirée souhaitée',
    rsvpDate: '2025-06-01',
    weddingWebsite: 'https://sarah-alex-wedding.com',
    registryLink: 'https://liste-mariage.fr/sarah-alex',
    additionalInfo: 'Cérémonie religieuse suivie d\'un cocktail et d\'un dîner dansant.',
    status: 'published',
    
    // Nouveaux champs
    announcementTitle: 'SAVE THE DATE',
    formalMessageIntro: 'Monsieur et Madame Dubois ont l\'honneur de vous convier au mariage de leur fille',
    hostName: 'Familles Dubois & Martin',
    contactPersonName: 'Marie (témoin)',
    
    // Informations de contact
    phoneContact: '+33 6 12 34 56 78',
    emailContact: 'sarah.alex.mariage@email.com',
    
    // Informations de transport
    parkingInfo: 'Parking gratuit disponible sur place',
    publicTransportInfo: 'Bus 42 - Arrêt "Domaine des Roses"',
    shuttleInfo: 'Une navette sera disponible depuis la gare centrale à 15h',
    
    // Hébergement
    accommodationSuggestions: [
      { name: 'Hôtel du Parc', url: 'https://hotel-du-parc.com', description: 'À 5 minutes du lieu de réception', price: '120€/nuit' }
    ],
    preferredHotelName: 'Hôtel du Parc',
    preferredHotelCode: 'MARIAGE2025',
    
    // Politiques
    childrenPolicy: 'welcome',
    giftPolicy: 'Votre présence est notre plus beau cadeau. Si vous souhaitez néanmoins nous offrir quelque chose, une urne sera à votre disposition.',
    
    // Cagnotte lune de miel
    honeymoonFundEnabled: true,
    honeymoonFundMessage: 'Nous rêvons de partir en lune de miel à Bali. Votre contribution nous aiderait à réaliser ce rêve.',
    honeymoonFundTargetAmount: 3000,
    
    // Message du couple
    coupleMessageType: 'text',
    coupleMessageContent: '',
    coupleValuesStatement: 'Nous croyons en l\'amour, le respect et la bienveillance.',
    coupleQuote: 'L\'amour est patient, l\'amour est bon. - 1 Corinthiens 13:4',
    
    // Musique et divertissement
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0UrRvztWcAU',
    allowSongSuggestions: true,
    
    // Fonctionnalités interactives
    countdownEnabled: true,
    quizEnabled: true,
    socialWallEnabled: true,
    socialWallModerationEnabled: true,
    virtualKeepsakeEnabled: false,
    
    // Design settings
    designSettings: defaultDesignSettings
  };

  usePageTitle(`Mariage ${invitation.brideName} & ${invitation.groomName}`);

  // Trouver l'invité spécifique si un ID est fourni
  useEffect(() => {
    if (guestId && guests.length > 0) {
      const guest = guests.find(g => g.id === guestId);
      if (guest) {
        setCurrentGuest(guest);
        setGuestName(guest.name);
        setGuestEmail(guest.email);
        setGuestPhone(guest.phone || '');
        setRsvpStatus(guest.status as 'pending' | 'confirmed' | 'declined');
        setMessage(guest.response_message || '');
      }
    }
    
    // Simuler le chargement des événements
    setEvents([
      {
        id: '1',
        invitation_id: invitationId,
        event_type: 'ceremony',
        title: 'Cérémonie religieuse',
        event_time: '14:30',
        location_name: 'Église Saint-Joseph',
        address: '123 Rue de la Paix, 75001 Paris',
        description: 'La cérémonie débutera à 14h30 précises',
        display_order: 0
      },
      {
        id: '2',
        invitation_id: invitationId,
        event_type: 'cocktail',
        title: 'Vin d\'honneur',
        event_time: '16:00',
        location_name: 'Domaine des Roses - Jardin',
        address: '123 Rue de la Paix, 75001 Paris',
        description: 'Un cocktail sera servi dans les jardins',
        plan_b_location_name: 'Domaine des Roses - Orangerie',
        plan_b_description: 'En cas de pluie, le cocktail se tiendra dans l\'orangerie',
        display_order: 1
      },
      {
        id: '3',
        invitation_id: invitationId,
        event_type: 'dinner',
        title: 'Dîner',
        event_time: '19:00',
        location_name: 'Domaine des Roses - Grande Salle',
        address: '123 Rue de la Paix, 75001 Paris',
        description: 'Un dîner gastronomique vous sera servi',
        display_order: 2
      },
      {
        id: '4',
        invitation_id: invitationId,
        event_type: 'party',
        title: 'Soirée dansante',
        event_time: '21:30',
        location_name: 'Domaine des Roses - Grande Salle',
        address: '123 Rue de la Paix, 75001 Paris',
        description: 'La fête se prolongera jusqu\'au bout de la nuit',
        display_order: 3
      }
    ]);
  }, [guestId, guests, invitationId]);

  // Fetch invitation data and design settings
  useEffect(() => {
    // In a real app, this would be an API call to get the invitation data
    // For now, we'll just use the mock data
    setDesignSettings(invitation.designSettings);
  }, [invitationId]);

  const handleRsvpSubmit = async (status: 'confirmed' | 'declined', responseMessage: string) => {
    if (!guestName.trim()) {
      alert('Veuillez saisir votre nom');
      return;
    }

    setIsSubmitting(true);
    
    // TODO: Implement actual RSVP submission
    setTimeout(() => {
      setRsvpStatus(status);
      setMessage(responseMessage);
      setIsSubmitting(false);
      setShowRsvpForm(false);
    }, 1000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mariage de ${invitation.brideName} & ${invitation.groomName}`,
          text: 'Vous êtes invité(e) à notre mariage !',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erreur lors du partage:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const addToCalendar = () => {
    const startDate = new Date(`${invitation.eventDate}T${invitation.eventTime}`);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // +4 hours
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Mariage ${invitation.brideName} & ${invitation.groomName}`)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(invitation.message)}&location=${encodeURIComponent(`${invitation.venue}, ${invitation.address}`)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  if (guestsLoading) {
    return (
      <InvitationLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A5A5]"></div>
        </div>
      </InvitationLayout>
    );
  }

  return (
    <>
      <SeoHead 
        entityId={invitationId}
        overrides={{
          title: `Mariage de ${invitation.brideName} & ${invitation.groomName} | Invitation`,
          description: `Vous êtes invité(e) au mariage de ${invitation.brideName} & ${invitation.groomName} le ${new Date(invitation.eventDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})} à ${invitation.venue}.`,
          ogImageUrl: invitation.designSettings.sections.hero.backgroundImageUrl || undefined
        }}
      />
      <InvitationLayout>
        <div className="space-y-8">
          {/* Utiliser le composant InvitationPreview pour afficher l'invitation */}
          <InvitationPreview 
            invitationData={invitation}
            designSettings={designSettings}
            guestDetails={currentGuest || undefined}
            events={events}
            onRsvpSubmit={handleRsvpSubmit}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={addToCalendar}
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium bg-[#D4A5A5]"
            >
              <Calendar className="h-4 w-4" />
              <span>Ajouter au calendrier</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium border border-[#D4A5A5] text-[#D4A5A5]"
            >
              <Share2 className="h-4 w-4" />
              <span>Partager</span>
            </button>
          </div>
        </div>
      </InvitationLayout>
    </>
  );
};

export default InvitationView;