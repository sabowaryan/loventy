import React from 'react';
import { 
  DollarSign, 
  Plane, 
  Heart
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface HoneymoonFundEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const HoneymoonFundEditor: React.FC<HoneymoonFundEditorProps> = ({ 
  invitationData, 
  onInputChange 
}) => {
  return (
    <div className="space-y-8">
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
    </div>
  );
};

export default HoneymoonFundEditor;