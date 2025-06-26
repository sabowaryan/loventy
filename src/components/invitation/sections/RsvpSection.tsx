import React, { useState } from 'react';
import { Check, X, Send, Calendar } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings, GuestDetails } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface RsvpSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
  guestDetails?: GuestDetails;
  onRsvpSubmit?: (status: 'confirmed' | 'declined', message: string) => Promise<void>;
}

const RsvpSection: React.FC<RsvpSectionProps> = ({ 
  invitationData, 
  designSettings,
  guestDetails,
  onRsvpSubmit
}) => {
  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];
  
  // Récupérer les paramètres de design spécifiques à cette section
  const sectionDesign = designSettings.sections.rsvp;

  // États pour le formulaire RSVP
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'confirmed' | 'declined'>(
    guestDetails?.status || 'pending'
  );
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [message, setMessage] = useState(guestDetails?.response_message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gérer la soumission du formulaire RSVP
  const handleRsvpSubmit = async (status: 'confirmed' | 'declined') => {
    if (!onRsvpSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      await onRsvpSubmit(status, message);
      setRsvpStatus(status);
      setShowRsvpForm(false);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InvitationSection 
      design={sectionDesign} 
      colorPaletteId={designSettings.colorPaletteId}
      id="rsvp-section"
      className="min-h-[40vh]"
    >
      <div className="text-center space-y-6">
        <h2 
          className="text-2xl md:text-3xl font-bold"
          style={{ 
            fontFamily: fontFamily.heading,
            color: colorPalette.primary
          }}
        >
          Confirmez votre présence
        </h2>
        
        {invitationData.rsvpDate && (
          <p 
            className="text-lg"
            style={{ 
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            Merci de confirmer avant le {new Date(invitationData.rsvpDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        )}
        
        {/* RSVP Status Display */}
        {rsvpStatus !== 'pending' ? (
          <div 
            className="max-w-md mx-auto p-6 rounded-lg"
            style={{ 
              backgroundColor: `${colorPalette.secondary}15`,
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            {rsvpStatus === 'confirmed' ? (
              <div>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${colorPalette.primary}20` }}
                  >
                    <Check 
                      className="h-6 w-6" 
                      style={{ color: colorPalette.primary }}
                    />
                  </div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ 
                      fontFamily: fontFamily.heading,
                      color: colorPalette.primary
                    }}
                  >
                    Présence confirmée
                  </h3>
                </div>
                
                <p>Merci d'avoir confirmé votre présence. Nous avons hâte de vous voir !</p>
                
                {message && (
                  <div 
                    className="mt-4 p-3 rounded-lg italic"
                    style={{ backgroundColor: `${colorPalette.secondary}15` }}
                  >
                    "{message}"
                  </div>
                )}
                
                <button 
                  onClick={() => setShowRsvpForm(true)}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ 
                    backgroundColor: `${colorPalette.secondary}20`,
                    color: colorPalette.textColor
                  }}
                >
                  Modifier ma réponse
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${colorPalette.secondary}20` }}
                  >
                    <X 
                      className="h-6 w-6" 
                      style={{ color: colorPalette.secondary }}
                    />
                  </div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ 
                      fontFamily: fontFamily.heading,
                      color: colorPalette.secondary
                    }}
                  >
                    Absence confirmée
                  </h3>
                </div>
                
                <p>Nous comprenons et vous remercions de nous avoir prévenus.</p>
                
                {message && (
                  <div 
                    className="mt-4 p-3 rounded-lg italic"
                    style={{ backgroundColor: `${colorPalette.secondary}15` }}
                  >
                    "{message}"
                  </div>
                )}
                
                <button 
                  onClick={() => setShowRsvpForm(true)}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ 
                    backgroundColor: `${colorPalette.secondary}20`,
                    color: colorPalette.textColor
                  }}
                >
                  Modifier ma réponse
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {!showRsvpForm ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowRsvpForm(true)}
                  className="px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center space-x-2 transition-transform hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: colorPalette.primary,
                    color: 'white',
                    fontFamily: fontFamily.body
                  }}
                >
                  <Check className="h-5 w-5" />
                  <span>Je serai présent(e)</span>
                </button>
                
                <button
                  onClick={() => handleRsvpSubmit('declined')}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center space-x-2 transition-transform hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: 'transparent',
                    border: `2px solid ${colorPalette.primary}`,
                    color: colorPalette.primary,
                    fontFamily: fontFamily.body
                  }}
                >
                  <X className="h-5 w-5" />
                  <span>Je ne pourrai pas venir</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <textarea
                    placeholder="Un petit message pour les mariés (optionnel)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                    style={{ 
                      borderColor: `${colorPalette.primary}30`,
                      fontFamily: fontFamily.body,
                      color: colorPalette.textColor,
                      backgroundColor: 'white'
                    }}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRsvpSubmit('confirmed')}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center space-x-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ 
                      backgroundColor: colorPalette.primary,
                      color: 'white',
                      fontFamily: fontFamily.body
                    }}
                  >
                    {isSubmitting ? (
                      <span>Envoi en cours...</span>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        <span>Confirmer ma présence</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowRsvpForm(false)}
                    className="px-4 py-3 rounded-lg font-medium transition-transform hover:scale-105 active:scale-95"
                    style={{ 
                      backgroundColor: 'transparent',
                      border: `2px solid ${colorPalette.primary}`,
                      color: colorPalette.primary,
                      fontFamily: fontFamily.body
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Calendar Add Button */}
        <div className="pt-6">
          <button 
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-transform hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: `${colorPalette.secondary}20`,
              color: colorPalette.textColor,
              fontFamily: fontFamily.body
            }}
          >
            <Calendar className="h-5 w-5" style={{ color: colorPalette.primary }} />
            <span>Ajouter à mon calendrier</span>
          </button>
        </div>
      </div>
    </InvitationSection>
  );
};

export default RsvpSection;