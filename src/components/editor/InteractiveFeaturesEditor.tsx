import React from 'react';
import { 
  ToggleLeft, 
  Clock, 
  Brain, 
  Users, 
  Gift
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface InteractiveFeaturesEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const InteractiveFeaturesEditor: React.FC<InteractiveFeaturesEditorProps> = ({ 
  invitationData, 
  onInputChange 
}) => {
  return (
    <div className="space-y-8">
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
            <label htmlFor="countdownEnabled" className="ml-2 block text-sm text-gray-700 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
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
            <label htmlFor="quizEnabled" className="ml-2 block text-sm text-gray-700 flex items-center">
              <Brain className="h-4 w-4 mr-1 text-gray-500" />
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
            <label htmlFor="socialWallEnabled" className="ml-2 block text-sm text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-1 text-gray-500" />
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
            <label htmlFor="virtualKeepsakeEnabled" className="ml-2 block text-sm text-gray-700 flex items-center">
              <Gift className="h-4 w-4 mr-1 text-gray-500" />
              Activer le coffret virtuel souvenir
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveFeaturesEditor;