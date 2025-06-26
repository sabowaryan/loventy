import React from 'react';
import { 
  Type, 
  Car, 
  Bus, 
  Hotel
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface AdditionalInfoEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const AdditionalInfoEditor: React.FC<AdditionalInfoEditorProps> = ({ 
  invitationData, 
  onInputChange 
}) => {
  return (
    <div className="space-y-8">
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
    </div>
  );
};

export default AdditionalInfoEditor;