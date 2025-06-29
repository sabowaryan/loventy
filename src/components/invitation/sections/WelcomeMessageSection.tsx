import React from 'react';
import { MessageSquare, User } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings, SectionDesign } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface WelcomeMessageSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings; // Keep for global design settings
  guestName?: string;
  guestTable?: string;
  design: SectionDesign; // New prop for section-specific design
}

const WelcomeMessageSection: React.FC<WelcomeMessageSectionProps> = ({
  invitationData,
  designSettings, // Keep for global design settings like color palette and font
  guestName,
  guestTable,
  design // Use this for section-specific design properties
}) => {
  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];

  return (
    <InvitationSection
      design={design} // Pass the section-specific design
      colorPaletteId={designSettings.colorPaletteId}
      id="welcome-section"
      className="min-h-[50vh] flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        {/* Host Name if available */}
        {invitationData.hostName && (
          <div
            className="text-lg font-medium"
            style={{
              fontFamily: fontFamily.heading,
              color: colorPalette.accent
            }}
          >
            {invitationData.hostName}
          </div>
        )}

        {/* Couple Image */}
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

        {/* Formal message intro if available */}
        {invitationData.formalMessageIntro && (
          <p
            className="text-lg"
            style={{
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            {invitationData.formalMessageIntro}
          </p>
        )}

        {/* Welcome Message */}
        <div>
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: fontFamily.heading,
              color: colorPalette.primary
            }}
          >
            Bienvenue
          </h2>

          {/* Guest-specific welcome if available */}
          {guestName && (
            <div
              className="mb-4 p-4 rounded-lg"
              style={{
                backgroundColor: `${colorPalette.secondary}20`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <p className="font-medium mb-2">
                Cher/Chère {guestName}
              </p>
              {guestTable && (
                <p className="text-sm">
                  Vous êtes assigné(e) à la table <span className="font-semibold">{guestTable}</span>
                </p>
              )}
            </div>
          )}

          {/* Main message */}
          {invitationData.message && (
            <div
              className="text-lg leading-relaxed"
              style={{
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              {invitationData.message}
            </div>
          )}
        </div>

        {/* Couple Quote if available */}
        {invitationData.coupleQuote && (
          <blockquote
            className="italic px-6 py-4 rounded-lg mx-auto max-w-md"
            style={{
              backgroundColor: `${colorPalette.secondary}15`,
              fontFamily: fontFamily.body,
              color: colorPalette.textColor,
              borderLeft: `4px solid ${colorPalette.primary}`
            }}
          >
            "{invitationData.coupleQuote}"
          </blockquote>
        )}

        {/* Couple Values Statement if available */}
        {invitationData.coupleValuesStatement && (
          <p
            className="text-sm"
            style={{
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            {invitationData.coupleValuesStatement}
          </p>
        )}
      </div>
    </InvitationSection>
  );
};

export default WelcomeMessageSection;

