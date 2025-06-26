import React from 'react';
import { 
  Music, 
  Headphones, 
  ListMusic
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface MusicEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const MusicEditor: React.FC<MusicEditorProps> = ({ 
  invitationData, 
  onInputChange 
}) => {
  return (
    <div className="space-y-8">
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
            <p className="mt-1 text-xs text-gray-500">
              Copiez l'URL d'une playlist Spotify, Apple Music, Deezer ou YouTube
            </p>
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
    </div>
  );
};

export default MusicEditor;