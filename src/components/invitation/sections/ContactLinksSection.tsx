import React from 'react';
import { Phone, Mail, Link as LinkIcon, User } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings, SectionDesign } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface ContactLinksSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
  design: SectionDesign; // New prop for section-specific design
}

const ContactLinksSection: React.FC<ContactLinksSectionProps> = ({
  invitationData,
  designSettings,
  design // Use this for section-specific design properties
}) => {
  // Si aucune information de contact n'est disponible, ne pas afficher la section
  if (!invitationData.phoneContact &&
      !invitationData.emailContact &&
      !invitationData.weddingWebsite &&
      !invitationData.registryLink &&
      !invitationData.contactPersonName) {
    return null;
  }

  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];

  return (
    <InvitationSection
      design={design} // Pass the section-specific design
      colorPaletteId={designSettings.colorPaletteId}
      id="contact-links-section"
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
          Contact & Liens
        </h2>

        <div className="max-w-md mx-auto">
          {/* Contact Person */}
          {invitationData.contactPersonName && (
            <div
              className="flex items-center justify-center space-x-3 mb-4"
              style={{
                fontFamily: fontFamily.body,
                color: colorPalette.textColor
              }}
            >
              <User className="h-5 w-5" style={{ color: colorPalette.primary }} />
              <span>
                <span className="font-medium">Personne à contacter:</span> {invitationData.contactPersonName}
              </span>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {invitationData.phoneContact && (
              <a
                href={`tel:${invitationData.phoneContact}`}
                className="flex items-center justify-center space-x-2 p-3 rounded-lg transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: `${colorPalette.secondary}15`,
                  fontFamily: fontFamily.body,
                  color: colorPalette.textColor
                }}
              >
                <Phone className="h-5 w-5" style={{ color: colorPalette.primary }} />
                <span>{invitationData.phoneContact}</span>
              </a>
            )}

            {invitationData.emailContact && (
              <a
                href={`mailto:${invitationData.emailContact}`}
                className="flex items-center justify-center space-x-2 p-3 rounded-lg transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: `${colorPalette.secondary}15`,
                  fontFamily: fontFamily.body,
                  color: colorPalette.textColor
                }}
              >
                <Mail className="h-5 w-5" style={{ color: colorPalette.primary }} />
                <span>{invitationData.emailContact}</span>
              </a>
            )}
          </div>

          {/* External Links */}
          <div className="space-y-4">
            {invitationData.weddingWebsite && (
              <a
                href={invitationData.weddingWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-3 rounded-lg font-medium transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: colorPalette.primary,
                  color: 'white',
                  fontFamily: fontFamily.body
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <LinkIcon className="h-5 w-5" />
                  <span>Site web du mariage</span>
                </div>
              </a>
            )}

            {invitationData.registryLink && (
              <a
                href={invitationData.registryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-3 rounded-lg font-medium transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: `${colorPalette.secondary}20`,
                  color: colorPalette.textColor,
                  fontFamily: fontFamily.body
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <LinkIcon className="h-5 w-5" style={{ color: colorPalette.primary }} />
                  <span>Liste de mariage</span>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </InvitationSection>
  );
};

export default ContactLinksSection;
