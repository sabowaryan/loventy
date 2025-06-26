import React from 'react';
import { 
  MessageSquare, 
  Quote, 
  Heart, 
  Home
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface WelcomeMessageEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const WelcomeMessageEditor: React.FC<WelcomeMessageEditorProps> = ({ 
  invitationData, 
  onInputChange 
}) => {
  return (
    <div className="space-y-8">
      {/* Informations principales */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Message de bienvenue
        </h3>
        
        <div className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <MessageSquare className="inline h-4 w-4 mr-1" />
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
    </div>
  );
};

export default WelcomeMessageEditor;