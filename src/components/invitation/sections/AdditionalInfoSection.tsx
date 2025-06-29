import React from 'react';
import { Info, Car, Bus, Hotel } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings, SectionDesign } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface AdditionalInfoSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
  design: SectionDesign; // New prop for section-specific design
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  invitationData,
  designSettings,
  design // Use this for section-specific design properties
}) => {
  // Si aucune information supplémentaire n'est disponible, ne pas afficher la section
  if (!invitationData.additionalInfo &&
      !invitationData.parkingInfo &&
      !invitationData.publicTransportInfo &&
      !invitationData.shuttleInfo &&
      !invitationData.preferredHotelName) {
    return null;
  }

  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];

  return (
    <InvitationSection
      design={design} // Pass the section-specific design
      colorPaletteId={designSettings.colorPaletteId}
      id="additional-info-section"
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
          Informations supplémentaires
        </h2>

        <div className="max-w-md mx-auto space-y-6">
          {/* Additional Info */}
          {invitationData.additionalInfo && (
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

              <p>{invitationData.additionalInfo}</p>
            </div>
          )}

          {/* Transport Information */}
          {(invitationData.parkingInfo || invitationData.publicTransportInfo || invitationData.shuttleInfo) && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: fontFamily.heading,
                  color: colorPalette.primary
                }}
              >
                Transport
              </h3>

              <div className="space-y-4">
                {invitationData.parkingInfo && (
                  <div className="flex items-start space-x-3">
                    <Car className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: colorPalette.accent }} />
                    <div className="text-left">
                      <h4
                        className="font-medium mb-1"
                        style={{ color: colorPalette.accent }}
                      >
                        Stationnement
                      </h4>
                      <p>{invitationData.parkingInfo}</p>
                    </div>
                  </div>
                )}

                {invitationData.publicTransportInfo && (
                  <div className="flex items-start space-x-3">
                    <Bus className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: colorPalette.accent }} />
                    <div className="text-left">
                      <h4
                        className="font-medium mb-1"
                        style={{ color: colorPalette.accent }}
                      >
                        Transports en commun
                      </h4>
                      <p>{invitationData.publicTransportInfo}</p>
                    </div>
                  </div>
                )}

                {invitationData.shuttleInfo && (
                  <div className="flex items-start space-x-3">
                    <Bus className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: colorPalette.accent }} />
                    <div className="text-left">
                      <h4
                        className="font-medium mb-1"
                        style={{ color: colorPalette.accent }}
                      >
                        Navettes
                      </h4>
                      <p>{invitationData.shuttleInfo}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accommodation Information */}
          {invitationData.preferredHotelName && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${colorPalette.secondary}15`,
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <div className="flex justify-center mb-3">
                <Hotel
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
                Hébergement recommandé
              </h3>

              <p className="font-medium">{invitationData.preferredHotelName}</p>

              {invitationData.preferredHotelCode && (
                <p className="mt-2 text-sm">
                  <span className="font-medium">Code de réduction:</span> {invitationData.preferredHotelCode}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </InvitationSection>
  );
};

export default AdditionalInfoSection;
