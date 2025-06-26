import React from 'react';
import { Music, Headphones, ListMusic, PlusCircle } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface MusicSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
}

const MusicSection: React.FC<MusicSectionProps> = ({ 
  invitationData, 
  designSettings
}) => {
  // Si aucune playlist n'est définie et que les suggestions ne sont pas activées, ne pas afficher la section
  if (!invitationData.playlistUrl && !invitationData.allowSongSuggestions) {
    return null;
  }

  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];
  
  // Récupérer les paramètres de design spécifiques à cette section
  const sectionDesign = designSettings.sections.music;

  // Fonction pour extraire l'ID de la playlist Spotify
  const getSpotifyEmbedUrl = () => {
    if (!invitationData.playlistUrl) return null;
    
    // Extraire l'ID de la playlist Spotify
    const spotifyRegex = /spotify\.com\/playlist\/([a-zA-Z0-9]+)/;
    const match = invitationData.playlistUrl.match(spotifyRegex);
    
    if (match && match[1]) {
      return `https://open.spotify.com/embed/playlist/${match[1]}`;
    }
    
    return null;
  };

  const spotifyEmbedUrl = getSpotifyEmbedUrl();

  return (
    <InvitationSection 
      design={sectionDesign} 
      colorPaletteId={designSettings.colorPaletteId}
      id="music-section"
      className="min-h-[40vh]"
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colorPalette.primary}20` }}
          >
            <Music 
              className="h-8 w-8" 
              style={{ color: colorPalette.primary }}
            />
          </div>
        </div>
        
        <h2 
          className="text-2xl md:text-3xl font-bold"
          style={{ 
            fontFamily: fontFamily.heading,
            color: colorPalette.primary
          }}
        >
          Playlist du mariage
        </h2>
        
        {/* Spotify Embed */}
        {spotifyEmbedUrl && (
          <div className="max-w-md mx-auto">
            <iframe 
              src={spotifyEmbedUrl} 
              width="100%" 
              height="380" 
              frameBorder="0" 
              allow="encrypted-media"
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>
        )}
        
        {/* Direct link to playlist */}
        {invitationData.playlistUrl && !spotifyEmbedUrl && (
          <div className="max-w-md mx-auto">
            <a 
              href={invitationData.playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-transform hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: colorPalette.primary,
                color: 'white',
                fontFamily: fontFamily.body
              }}
            >
              <Headphones className="h-5 w-5" />
              <span>Écouter notre playlist</span>
            </a>
          </div>
        )}
        
        {/* Song suggestions */}
        {invitationData.allowSongSuggestions && (
          <div className="max-w-md mx-auto mt-8">
            <h3 
              className="text-xl font-semibold mb-4"
              style={{ 
                fontFamily: fontFamily.heading,
                color: colorPalette.accent
              }}
            >
              Suggérez une chanson
            </h3>
            
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <p className="mb-4">
                Aidez-nous à créer la playlist parfaite pour notre soirée ! Suggérez une chanson qui vous ferait danser.
              </p>
              
              <div className="space-y-3">
                <div>
                  <input 
                    type="text" 
                    placeholder="Titre de la chanson"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-shadow"
                    style={{ 
                      borderColor: `${colorPalette.primary}30`,
                      fontFamily: fontFamily.body,
                      color: colorPalette.textColor,
                      focusRing: colorPalette.primary
                    }}
                  />
                </div>
                
                <div>
                  <input 
                    type="text" 
                    placeholder="Artiste"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-shadow"
                    style={{ 
                      borderColor: `${colorPalette.primary}30`,
                      fontFamily: fontFamily.body,
                      color: colorPalette.textColor,
                      focusRing: colorPalette.primary
                    }}
                  />
                </div>
                
                <button 
                  className="w-full px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center space-x-2 transition-transform hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: colorPalette.primary,
                    color: 'white',
                    fontFamily: fontFamily.body
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Ajouter ma suggestion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InvitationSection>
  );
};

export default MusicSection;