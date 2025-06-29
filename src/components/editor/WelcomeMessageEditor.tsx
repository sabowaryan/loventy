// src/components/editor/WelcomeMessageEditor.tsx
import React from 'react';
import {
  MessageSquare,
  Quote,
  Heart
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
      {/* Message de bienvenue */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Message de bienvenue
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Message d'introduction formel
            </label>
            <textarea
              value={invitationData.formalMessageIntro || ''}
              onChange={(e) => onInputChange('formalMessageIntro', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Monsieur et Madame Dubois ont l'honneur de vous convier au mariage de leur fille"
            />
            <p className="mt-1 text-xs text-gray-500">
              Message formel d'introduction, généralement utilisé pour les invitations traditionnelles
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Message principal
            </label>
            <textarea
              value={invitationData.message}
              onChange={(e) => onInputChange('message', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Nous serions honorés de votre présence pour célébrer notre union..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Message principal qui apparaîtra sur votre invitation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Citation ou verset préféré
            </label>
            <textarea
              value={invitationData.coupleQuote || ''}
              onChange={(e) => onInputChange('coupleQuote', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="L'amour est patient, l'amour est bon. - 1 Corinthiens 13:4"
            />
            <p className="mt-1 text-xs text-gray-500">
              Une citation ou un verset qui représente votre couple
            </p>
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
            <p className="mt-1 text-xs text-gray-500">
              Une déclaration de vos valeurs en tant que couple
            </p>
          </div>
        </div>
      </div>

      {/* Type de message */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Type de message
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

          {invitationData.coupleMessageType !== 'text' && (
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
              <p className="mt-1 text-xs text-gray-500">
                {invitationData.coupleMessageType === 'video'
                  ? 'Lien vers une vidéo YouTube, Vimeo, etc.'
                  : 'Lien vers un fichier audio SoundCloud, Spotify, etc.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessageEditor;
