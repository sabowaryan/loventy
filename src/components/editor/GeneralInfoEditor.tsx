import React from 'react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Type, 
  Clock
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface GeneralInfoEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const GeneralInfoEditor: React.FC<GeneralInfoEditorProps> = ({ invitationData, onInputChange }) => {
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
    </div>
  );
};

export default GeneralInfoEditor;
