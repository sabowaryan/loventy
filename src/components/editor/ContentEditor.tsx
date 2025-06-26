import React from 'react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Type, 
  Share2,
  User,
  Mail,
  Phone,
  Link,
  MessageSquare,
  Gift,
  Music,
  Users,
  Home,
  Car,
  Bus,
  Hotel,
  Baby,
  DollarSign,
  Quote,
  Video,
  FileText,
  ToggleLeft,
  Clock
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface ContentEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ invitationData, onInputChange }) => {
  return (
    <div className="space-y-8">
      {/* Informations principales */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Informations principales
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Titre de l'invitation
            </label>
            <input
              type="text"
              value={invitationData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Mariage Sarah & Alex"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#131837] mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Nom de la mariée
              </label>
              <input
                type="text"
                value={invitationData.brideName}
                onChange={(e) => onInputChange('brideName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Sarah"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#131837] mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Nom du marié
              </label>
              <input
                type="text"
                value={invitationData.groomName}
                onChange={(e) => onInputChange('groomName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Alex"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#131837] mb-2">
                <Home className="inline h-4 w-4 mr-1" />
                Nom des hôtes
              </label>
              <input
                type="text"
                value={invitationData.hostName || ''}
                onChange={(e) => onInputChange('hostName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Familles Dubois & Martin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#131837] mb-2">
                <Type className="inline h-4 w-4 mr-1" />
                Titre d'annonce
              </label>
              <input
                type="text"
                value={invitationData.announcementTitle || ''}
                onChange={(e) => onInputChange('announcementTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="SAVE THE DATE"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <MessageSquare className="inline h-4 w-4 mr-1" />
              Message d'introduction formel
            </label>
            <textarea
              value={invitationData.formalMessageIntro || ''}
              onChange={(e) => onInputChange('formalMessageIntro', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Monsieur et Madame Dubois ont l'honneur de vous convier au mariage de leur fille"
            />
          </div>
        </div>
      </div>

      {/* Détails de l'événement */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Détails de l'événement
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Date du mariage
            </label>
            <input
              type="date"
              value={invitationData.eventDate}
              onChange={(e) => onInputChange('eventDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Heure de la cérémonie
            </label>
            <input
              type="time"
              value={invitationData.eventTime}
              onChange={(e) => onInputChange('eventTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Lieu de la cérémonie
            </label>
            <input
              type="text"
              value={invitationData.venue}
              onChange={(e) => onInputChange('venue', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Domaine des Roses"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Adresse complète
            </label>
            <input
              type="text"
              value={invitationData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="123 Rue de la Paix, 75001 Paris"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Date limite RSVP
            </label>
            <input
              type="date"
              value={invitationData.rsvpDate}
              onChange={(e) => onInputChange('rsvpDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Code vestimentaire
            </label>
            <input
              type="text"
              value={invitationData.dressCode}
              onChange={(e) => onInputChange('dressCode', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Tenue de soirée souhaitée"
            />
          </div>
        </div>
      </div>

      {/* Informations de transport */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Car className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Informations de transport
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Car className="inline h-4 w-4 mr-1" />
              Informations de stationnement
            </label>
            <textarea
              value={invitationData.parkingInfo || ''}
              onChange={(e) => onInputChange('parkingInfo', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Parking gratuit disponible sur place"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Bus className="inline h-4 w-4 mr-1" />
              Transports en commun
            </label>
            <textarea
              value={invitationData.publicTransportInfo || ''}
              onChange={(e) => onInputChange('publicTransportInfo', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Bus 42 - Arrêt 'Domaine des Roses'"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Bus className="inline h-4 w-4 mr-1" />
              Informations sur les navettes
            </label>
            <textarea
              value={invitationData.shuttleInfo || ''}
              onChange={(e) => onInputChange('shuttleInfo', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Une navette sera disponible depuis la gare centrale à 15h"
            />
          </div>
        </div>
      </div>

      {/* Hébergement */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Hotel className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Hébergement
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Hôtel recommandé
            </label>
            <input
              type="text"
              value={invitationData.preferredHotelName || ''}
              onChange={(e) => onInputChange('preferredHotelName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Hôtel du Parc"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Code de réduction
            </label>
            <input
              type="text"
              value={invitationData.preferredHotelCode || ''}
              onChange={(e) => onInputChange('preferredHotelCode', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="MARIAGE2025"
            />
          </div>
        </div>
      </div>

      {/* Politiques */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Politiques
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Baby className="inline h-4 w-4 mr-1" />
              Politique concernant les enfants
            </label>
            <select
              value={invitationData.childrenPolicy}
              onChange={(e) => onInputChange('childrenPolicy', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
            >
              <option value="welcome">Enfants bienvenus</option>
              <option value="not_admitted">Pas d'enfants</option>
              <option value="limited">Enfants limités (préciser dans le message)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Gift className="inline h-4 w-4 mr-1" />
              Politique concernant les cadeaux
            </label>
            <textarea
              value={invitationData.giftPolicy || ''}
              onChange={(e) => onInputChange('giftPolicy', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Votre présence est notre plus beau cadeau. Si vous souhaitez néanmoins nous offrir quelque chose, une urne sera à votre disposition."
            />
          </div>
        </div>
      </div>

      {/* Cagnotte lune de miel */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Cagnotte lune de miel
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="honeymoonFundEnabled"
              checked={invitationData.honeymoonFundEnabled}
              onChange={(e) => onInputChange('honeymoonFundEnabled', e.target.checked)}
              className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
            />
            <label htmlFor="honeymoonFundEnabled" className="ml-2 block text-sm text-gray-700">
              Activer la cagnotte lune de miel
            </label>
          </div>
          
          {invitationData.honeymoonFundEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#131837] mb-2">
                  Message pour la cagnotte
                </label>
                <textarea
                  value={invitationData.honeymoonFundMessage || ''}
                  onChange={(e) => onInputChange('honeymoonFundMessage', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="Nous rêvons de partir en lune de miel à Bali. Votre contribution nous aiderait à réaliser ce rêve."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#131837] mb-2">
                  Montant cible (optionnel)
                </label>
                <input
                  type="number"
                  value={invitationData.honeymoonFundTargetAmount || ''}
                  onChange={(e) => onInputChange('honeymoonFundTargetAmount', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="3000"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message du couple */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Message du couple
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Type de message
            </label>
            <select
              value={invitationData.coupleMessageType || 'text'}
              onChange={(e) => onInputChange('coupleMessageType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
            >
              <option value="text">Texte</option>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
            </select>
          </div>
          
          {invitationData.coupleMessageType === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-[#131837] mb-2">
                Message principal
              </label>
              <textarea
                value={invitationData.message}
                onChange={(e) => onInputChange('message', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Nous serions honorés de votre présence pour célébrer notre union..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#131837] mb-2">
                {invitationData.coupleMessageType === 'video' ? 'URL de la vidéo' : 'URL de l\'audio'}
              </label>
              <input
                type="url"
                value={invitationData.coupleMessageContent || ''}
                onChange={(e) => onInputChange('coupleMessageContent', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder={invitationData.coupleMessageType === 'video' ? 'https://youtube.com/watch?v=...' : 'https://soundcloud.com/...'}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Quote className="inline h-4 w-4 mr-1" />
              Citation ou verset préféré
            </label>
            <textarea
              value={invitationData.coupleQuote || ''}
              onChange={(e) => onInputChange('coupleQuote', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder={`"L'amour est patient, l'amour est bon." - 1 Corinthiens 13:4`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Déclaration des valeurs du couple
            </label>
            <textarea
              value={invitationData.coupleValuesStatement || ''}
              onChange={(e) => onInputChange('coupleValuesStatement', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Nous croyons en l'amour, le respect et la bienveillance."
            />
          </div>
        </div>
      </div>

      {/* Musique et divertissement */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Music className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Musique et divertissement
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              URL de la playlist
            </label>
            <input
              type="url"
              value={invitationData.playlistUrl || ''}
              onChange={(e) => onInputChange('playlistUrl', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="https://open.spotify.com/playlist/..."
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowSongSuggestions"
              checked={invitationData.allowSongSuggestions}
              onChange={(e) => onInputChange('allowSongSuggestions', e.target.checked)}
              className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
            />
            <label htmlFor="allowSongSuggestions" className="ml-2 block text-sm text-gray-700">
              Permettre aux invités de suggérer des chansons
            </label>
          </div>
        </div>
      </div>

      {/* Fonctionnalités interactives */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <ToggleLeft className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Fonctionnalités interactives
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="countdownEnabled"
              checked={invitationData.countdownEnabled}
              onChange={(e) => onInputChange('countdownEnabled', e.target.checked)}
              className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
            />
            <label htmlFor="countdownEnabled" className="ml-2 block text-sm text-gray-700">
              Activer le compte à rebours
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="quizEnabled"
              checked={invitationData.quizEnabled}
              onChange={(e) => onInputChange('quizEnabled', e.target.checked)}
              className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
            />
            <label htmlFor="quizEnabled" className="ml-2 block text-sm text-gray-700">
              Activer le quiz sur les mariés
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="socialWallEnabled"
              checked={invitationData.socialWallEnabled}
              onChange={(e) => onInputChange('socialWallEnabled', e.target.checked)}
              className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
            />
            <label htmlFor="socialWallEnabled" className="ml-2 block text-sm text-gray-700">
              Activer le mur social
            </label>
          </div>
          
          {invitationData.socialWallEnabled && (
            <div className="ml-6 flex items-center">
              <input
                type="checkbox"
                id="socialWallModerationEnabled"
                checked={invitationData.socialWallModerationEnabled}
                onChange={(e) => onInputChange('socialWallModerationEnabled', e.target.checked)}
                className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
              />
              <label htmlFor="socialWallModerationEnabled" className="ml-2 block text-sm text-gray-700">
                Activer la modération du mur social
              </label>
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="virtualKeepsakeEnabled"
              checked={invitationData.virtualKeepsakeEnabled}
              onChange={(e) => onInputChange('virtualKeepsakeEnabled', e.target.checked)}
              className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
            />
            <label htmlFor="virtualKeepsakeEnabled" className="ml-2 block text-sm text-gray-700">
              Activer le coffret virtuel souvenir
            </label>
          </div>
        </div>
      </div>

      {/* Contact et liens */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Share2 className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Contact et liens
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Personne à contacter
            </label>
            <input
              type="text"
              value={invitationData.contactPersonName || ''}
              onChange={(e) => onInputChange('contactPersonName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Marie (témoin)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Téléphone de contact
            </label>
            <input
              type="tel"
              value={invitationData.phoneContact}
              onChange={(e) => onInputChange('phoneContact', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email de contact
            </label>
            <input
              type="email"
              value={invitationData.emailContact}
              onChange={(e) => onInputChange('emailContact', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="sarah.alex@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Link className="inline h-4 w-4 mr-1" />
              Site web du mariage
            </label>
            <input
              type="url"
              value={invitationData.weddingWebsite}
              onChange={(e) => onInputChange('weddingWebsite', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="https://sarah-alex-wedding.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Gift className="inline h-4 w-4 mr-1" />
              Liste de mariage
            </label>
            <input
              type="url"
              value={invitationData.registryLink}
              onChange={(e) => onInputChange('registryLink', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="https://liste-mariage.fr/sarah-alex"
            />
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Type className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Informations supplémentaires
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Informations additionnelles
            </label>
            <textarea
              value={invitationData.additionalInfo}
              onChange={(e) => onInputChange('additionalInfo', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Cérémonie religieuse suivie d'un cocktail..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;