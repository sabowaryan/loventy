import React from 'react';
import { DollarSign, Plane, Heart, Gift } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings, SectionDesign } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface HoneymoonFundSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
  design: SectionDesign; // New prop for section-specific design
}

const HoneymoonFundSection: React.FC<HoneymoonFundSectionProps> = ({
  invitationData,
  designSettings,
  design // Use this for section-specific design properties
}) => {
  // Si la cagnotte n'est pas activée, ne pas afficher la section
  if (!invitationData.honeymoonFundEnabled) {
    return null;
  }

  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];

  // Calculer le pourcentage de progression si un montant cible est défini
  const progressPercentage = invitationData.honeymoonFundTargetAmount
    ? Math.min(Math.round((Math.random() * 0.7) * 100), 100) // Simuler une progression aléatoire (à remplacer par la vraie valeur)
    : null;

  return (
    <InvitationSection
      design={design} // Pass the section-specific design
      colorPaletteId={designSettings.colorPaletteId}
      id="honeymoon-fund-section"
      className="min-h-[40vh] flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colorPalette.primary}20` }}
          >
            <Plane
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
          Notre lune de miel
        </h2>

        {invitationData.honeymoonFundMessage && (
          <p
            className="text-lg leading-relaxed"
            style={{
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            {invitationData.honeymoonFundMessage}
          </p>
        )}

        {/* Progress bar if target amount is set */}
        {progressPercentage !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span
                style={{
                  fontFamily: fontFamily.body,
                  color: colorPalette.textColor
                }}
              >
                Progression
              </span>
              <span
                className="font-medium"
                style={{
                  fontFamily: fontFamily.body,
                  color: colorPalette.primary
                }}
              >
                {progressPercentage}%
              </span>
            </div>

            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: `${colorPalette.secondary}30` }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: colorPalette.primary
                }}
              ></div>
            </div>

            {invitationData.honeymoonFundTargetAmount && (
              <div
                className="text-sm font-medium"
                style={{
                  fontFamily: fontFamily.body,
                  color: colorPalette.textColor
                }}
              >
                Objectif: {invitationData.honeymoonFundTargetAmount.toLocaleString('fr-FR')}€
              </div>
            )}
          </div>
        )}

        {/* Contribution button */}
        <div className="pt-4">
          <button
            className="px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: colorPalette.primary,
              color: 'white',
              fontFamily: fontFamily.body
            }}
          >
            <Gift className="h-5 w-5" />
            <span>Contribuer à notre lune de miel</span>
          </button>
        </div>

        {/* Thank you message */}
        <div
          className="flex items-center justify-center space-x-2 text-sm"
          style={{
            fontFamily: fontFamily.body,
            color: colorPalette.textColor
          }}
        >
          <Heart className="h-4 w-4" style={{ color: colorPalette.primary }} />
          <span>Merci pour votre générosité</span>
        </div>
      </div>
    </InvitationSection>
  );
};

export default HoneymoonFundSection;
