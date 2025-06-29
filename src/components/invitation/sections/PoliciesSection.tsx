import React from 'react';
import { Baby, Gift, Info } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings, SectionDesign } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface PoliciesSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
  design: SectionDesign; // New prop for section-specific design
}

const PoliciesSection: React.FC<PoliciesSectionProps> = ({
  invitationData,
  designSettings,
  design // Use this for section-specific design properties
}) => {
  // Si aucune politique n'est définie, ne pas afficher la section
  if (!invitationData.childrenPolicy && !invitationData.giftPolicy) {
    return null;
  }

  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];

  // Obtenir le texte de la politique concernant les enfants
  const getChildrenPolicyText = () => {
    switch (invitationData.childrenPolicy) {
      case 'welcome':
        return 'Les enfants sont les bienvenus à notre célébration.';
      case 'not_admitted':
        return 'Nous vous prions de comprendre que notre cérémonie et notre réception sont réservées aux adultes uniquement.';
      case 'limited':
        return 'Seuls les enfants de la famille proche sont invités à notre célébration.';
      default:
        return '';
    }
  };

  return (
    <InvitationSection
      design={design} // Pass the section-specific design
      colorPaletteId={designSettings.colorPaletteId}
      id="policies-section"
      className="min-h-[30vh]"
    >
      <div className="text-center space-y-6">
        <h2
          className="text-2xl md:text-3xl font-bold"
          style={{
            fontFamily: fontFamily.heading,
            color: colorPalette.primary
          }}
        >
          Informations pratiques
        </h2>

        <div className="max-w-md mx-auto space-y-6">
          {/* Children Policy */}
          {invitationData.childrenPolicy && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <div className="flex justify-center mb-3">
                <Baby
                  className="h-6 w-6"
                  style={{ color: colorPalette.primary }}
                />
              </div>

              <h3
                className="text-lg font-semibold mb-2"
                style={{
                  fontFamily: fontFamily.heading,
                  color: colorPalette.primary
                }}
              >
                Concernant les enfants
              </h3>

              <p>{getChildrenPolicyText()}</p>
            </div>
          )}

          {/* Gift Policy */}
          {invitationData.giftPolicy && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <div className="flex justify-center mb-3">
                <Gift
                  className="h-6 w-6"
                  style={{ color: colorPalette.primary }}
                />
              </div>

              <h3
                className="text-lg font-semibold mb-2"
                style={{
                  fontFamily: fontFamily.heading,
                  color: colorPalette.primary
                }}
              >
                Concernant les cadeaux
              </h3>

              <p>{invitationData.giftPolicy}</p>
            </div>
          )}

          {/* Dress Code */}
          {invitationData.dressCode && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <div className="flex justify-center mb-3">
                <Info
                  className="h-6 w-6"
                  style={{ color: colorPalette.primary }}
                />
              </div>

              <h3
                className="text-lg font-semibold mb-2"
                style={{
                  fontFamily: fontFamily.heading,
                  color: colorPalette.primary
                }}
              >
                Code vestimentaire
              </h3>

              <p>{invitationData.dressCode}</p>
            </div>
          )}
        </div>
      </div>
    </InvitationSection>
  );
};

export default PoliciesSection;
