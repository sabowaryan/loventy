import React from 'react';
import { 
  FileText, 
  Baby, 
  Gift
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface PoliciesEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const PoliciesEditor: React.FC<PoliciesEditorProps> = ({ 
  invitationData, 
  onInputChange 
}) => {
  return (
    <div className="space-y-8">
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
    </div>
  );
};

export default PoliciesEditor;