import React from 'react';
import { Heart, Calendar } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface HeroSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
  guestName?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  invitationData, 
  designSettings,
  guestName
}) => {
  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];
  
  // Récupérer les paramètres de design spécifiques à cette section
  const sectionDesign = designSettings.sections.hero;

  return (
    <InvitationSection 
      design={sectionDesign} 
      colorPaletteId={designSettings.colorPaletteId}
      id="hero-section"
      className="min-h-[50vh] flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        {/* Couple Image as Background or Element */}
        {sectionDesign.coupleImageUrl && (
          <div className="flex justify-center mb-6">
            <div 
              className={`${
                sectionDesign.coupleImageShape === 'rounded' ? 'rounded-xl' :
                sectionDesign.coupleImageShape === 'circle' ? 'rounded-full' :
                sectionDesign.coupleImageShape === 'heart' ? 'heart-shape' : ''
              } overflow-hidden w-32 h-32 md:w-40 md:h-40 border-4`}
              style={{ 
                borderColor: colorPalette.primary,
                boxShadow: `0 10px 25px -5px ${colorPalette.primary}40`
              }}
            >
              <img 
                src={sectionDesign.coupleImageUrl} 
                alt="Couple" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        {/* Announcement Title if available */}
        {invitationData.announcementTitle && (
          <div 
            className="text-sm md:text-base font-semibold tracking-wider"
            style={{ color: colorPalette.accent, fontFamily: fontFamily.heading }}
          >
            {invitationData.announcementTitle}
          </div>
        )}
        
        {/* Heart Icon */}
        <div className="flex justify-center">
          <Heart 
            className="h-10 w-10 fill-current animate-pulse" 
            style={{ color: colorPalette.primary }}
          />
        </div>
        
        {/* Names */}
        <div>
          <h1 
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ 
              fontFamily: fontFamily.heading,
              color: colorPalette.primary
            }}
          >
            {invitationData.brideName} & {invitationData.groomName}
          </h1>
          
          {/* Formal message intro if available */}
          {invitationData.formalMessageIntro ? (
            <p 
              className="text-lg"
              style={{ 
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              {invitationData.formalMessageIntro}
            </p>
          ) : (
            <p 
              className="text-lg"
              style={{ 
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              {guestName ? `Cher/Chère ${guestName}, vous êtes invité(e) à notre mariage` : 'Vous invitent à célébrer leur union'}
            </p>
          )}
        </div>
        
        {/* Date */}
        <div 
          className="text-xl font-semibold"
          style={{ 
            fontFamily: fontFamily.heading,
            color: colorPalette.accent
          }}
        >
          {invitationData.eventDate ? new Date(invitationData.eventDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Date à venir'}
        </div>

        {/* Event Time if available */}
        {invitationData.eventTime && (
          <div 
            className="text-lg font-medium"
            style={{ 
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            à {invitationData.eventTime}
          </div>
        )}

        {/* Venue if available */}
        {invitationData.venue && (
          <div 
            className="text-lg"
            style={{ 
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            {invitationData.venue}
          </div>
        )}
      </div>
    </InvitationSection>
  );
};

export default HeroSection;