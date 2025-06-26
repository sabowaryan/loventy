import React from 'react';
import { Clock, Brain, Users, Gift } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface InteractiveFeaturesSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
}

const InteractiveFeaturesSection: React.FC<InteractiveFeaturesSectionProps> = ({ 
  invitationData, 
  designSettings
}) => {
  // Si aucune fonctionnalité interactive n'est activée, ne pas afficher la section
  if (!invitationData.countdownEnabled && 
      !invitationData.quizEnabled && 
      !invitationData.socialWallEnabled && 
      !invitationData.virtualKeepsakeEnabled) {
    return null;
  }

  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];
  
  // Récupérer les paramètres de design spécifiques à cette section
  const sectionDesign = designSettings.sections.interactive;

  // Calculer le temps restant pour le compte à rebours
  const calculateTimeRemaining = () => {
    if (!invitationData.eventDate) return null;
    
    const eventDate = new Date(invitationData.eventDate);
    const now = new Date();
    
    // Si la date est passée, ne pas afficher le compte à rebours
    if (eventDate <= now) return null;
    
    const diffTime = Math.abs(eventDate.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = calculateTimeRemaining();

  return (
    <InvitationSection 
      design={sectionDesign} 
      colorPaletteId={designSettings.colorPaletteId}
      id="interactive-features-section"
      className="min-h-[40vh]"
    >
      <div className="text-center space-y-8">
        <h2 
          className="text-2xl md:text-3xl font-bold"
          style={{ 
            fontFamily: fontFamily.heading,
            color: colorPalette.primary
          }}
        >
          Interagissez avec nous
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Countdown */}
          {invitationData.countdownEnabled && daysRemaining !== null && (
            <div 
              className="p-6 rounded-lg text-center"
              style={{ 
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <div className="flex justify-center mb-4">
                <Clock 
                  className="h-8 w-8" 
                  style={{ color: colorPalette.primary }}
                />
              </div>
              
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ 
                  fontFamily: fontFamily.heading,
                  color: colorPalette.primary
                }}
              >
                Compte à rebours
              </h3>
              
              <div 
                className="text-3xl font-bold mb-2"
                style={{ color: colorPalette.accent }}
              >
                {daysRemaining}
              </div>
              
              <p>jours avant le grand jour</p>
            </div>
          )}
          
          {/* Quiz */}
          {invitationData.quizEnabled && (
            <div 
              className="p-6 rounded-lg text-center"
              style={{ 
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <div className="flex justify-center mb-4">
                <Brain 
                  className="h-8 w-8" 
                  style={{ color: colorPalette.primary }}
                />
              </div>
              
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ 
                  fontFamily: fontFamily.heading,
                  color: colorPalette.primary
                }}
              >
                Quiz des mariés
              </h3>
              
              <p className="mb-4">Testez vos connaissances sur les mariés</p>
              
              <button 
                className="px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                style={{ 
                  backgroundColor: colorPalette.primary,
                  color: 'white'
                }}
              >
                Commencer le quiz
              </button>
            </div>
          )}
          
          {/* Social Wall */}
          {invitationData.socialWallEnabled && (
            <div 
              className="p-6 rounded-lg text-center"
              style={{ 
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <div className="flex justify-center mb-4">
                <Users 
                  className="h-8 w-8" 
                  style={{ color: colorPalette.primary }}
                />
              </div>
              
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ 
                  fontFamily: fontFamily.heading,
                  color: colorPalette.primary
                }}
              >
                Mur social
              </h3>
              
              <p className="mb-4">Partagez vos messages et photos</p>
              
              <button 
                className="px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                style={{ 
                  backgroundColor: colorPalette.primary,
                  color: 'white'
                }}
              >
                Voir le mur
              </button>
            </div>
          )}
          
          {/* Virtual Keepsake */}
          {invitationData.virtualKeepsakeEnabled && (
            <div 
              className="p-6 rounded-lg text-center"
              style={{ 
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <div className="flex justify-center mb-4">
                <Gift 
                  className="h-8 w-8" 
                  style={{ color: colorPalette.primary }}
                />
              </div>
              
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ 
                  fontFamily: fontFamily.heading,
                  color: colorPalette.primary
                }}
              >
                Coffret souvenir
              </h3>
              
              <p className="mb-4">Créez un souvenir virtuel de notre mariage</p>
              
              <button 
                className="px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                style={{ 
                  backgroundColor: colorPalette.primary,
                  color: 'white'
                }}
              >
                Ouvrir le coffret
              </button>
            </div>
          )}
        </div>
      </div>
    </InvitationSection>
  );
};

export default InteractiveFeaturesSection;