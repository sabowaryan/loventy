import React from 'react';
import { Heart, Calendar } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings, SectionDesign } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface HeroSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings; // Keep for colorPalette and fontFamily
  guestName?: string;
  design: SectionDesign; // New prop for section-specific design
}

const HeroSection: React.FC<HeroSectionProps> = ({
  invitationData,
  designSettings, // Keep for global design settings like color palette and font
  guestName,
  design // Use this for section-specific design properties
}) => {
  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];

  return (
    <InvitationSection
      design={design} // Pass the section-specific design
      colorPaletteId={designSettings.colorPaletteId}
      id="hero-section"
      className="min-h-[50vh] flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        {/* Couple Image as Background or Element */}
        {design.coupleImageUrl && (
          <div className="flex justify-center mb-6">
            <div
              className={`${
                design.coupleImageShape === 'rounded' ? 'rounded-xl' :
                design.coupleImageShape === 'circle' ? 'rounded-full' :
                design.coupleImageShape === 'heart' ? 'heart-shape' : ''
              } overflow-hidden w-32 h-32 md:w-40 md:h-40 border-4`}
              style={{
                borderColor: colorPalette.primary,
                boxShadow: `0 10px 25px -5px ${colorPalette.primary}40`
              }}
            >
              <img
                src={design.coupleImageUrl}
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

        {/* Decorative Element (Heart Icon or Custom Image) */}
        <div className="flex justify-center">
          {design.decorativeElementUrl ? (
            <img
              src={design.decorativeElementUrl}
              alt="Decorative Element"
              className="h-10 w-10 animate-pulse"
              style={{ color: colorPalette.primary }} // Apply color if it's an SVG that can be tinted
            />
          ) : (
            <Heart
              className="h-10 w-10 fill-current animate-pulse"
              style={{ color: colorPalette.primary }}
            />
          )}
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
            className="text-lg"
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
