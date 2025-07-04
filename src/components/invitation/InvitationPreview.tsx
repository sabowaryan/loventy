import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InvitationDesignSettings, ExtendedInvitationData, GuestDetails } from '../../types/models';
import { colorPalettes, fontFamilies } from '../../utils/designConstants';

// Import des sections
import HeroSection from './sections/HeroSection';
import WelcomeMessageSection from './sections/WelcomeMessageSection';
import ProgramSection from './sections/ProgramSection';
import HoneymoonFundSection from './sections/HoneymoonFundSection';
import MusicSection from './sections/MusicSection';
import InteractiveFeaturesSection from './sections/InteractiveFeaturesSection';
import ContactLinksSection from './sections/ContactLinksSection';
import PoliciesSection from './sections/PoliciesSection';
import AdditionalInfoSection from './sections/AdditionalInfoSection';
import RsvpSection from './sections/RsvpSection';

interface InvitationPreviewProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
  isFullscreen?: boolean;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
  guestDetails?: GuestDetails;
  events?: any[]; // Remplacer par le type correct des événements
  onRsvpSubmit?: (status: 'confirmed' | 'declined', message: string) => Promise<void>;
}

const InvitationPreview: React.FC<InvitationPreviewProps> = ({
  invitationData,
  designSettings,
  isFullscreen = false,
  previewDevice = 'desktop',
  guestDetails,
  events = [],
  onRsvpSubmit
}) => {
  // État pour la navigation entre les sections (pour le layout horizontal)
  const [activeSection, setActiveSection] = useState(0);

  // Get selected color palette
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  
  // Get selected font family
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];

  // Get container class based on preview device
  const getContainerClass = () => {
    if (isFullscreen) {
      switch (previewDevice) {
        case 'mobile':
          return 'w-80 h-[600px]';
        case 'tablet':
          return 'w-96 h-[700px]';
        default:
          return 'w-full max-w-2xl h-[800px]';
      }
    }
    return "w-full max-w-md mx-auto";
  };

  // Sections à afficher
  const sections = [
    {
      id: 'hero',
      component: <HeroSection 
        invitationData={invitationData} 
        designSettings={designSettings} 
        guestName={guestDetails?.name}
        design={designSettings.sections.hero} // Pass section-specific design
      />
    },
    {
      id: 'welcome',
      component: <WelcomeMessageSection 
        invitationData={invitationData} 
        designSettings={designSettings} 
        guestName={guestDetails?.name}
        guestTable={guestDetails?.table_name}
        design={designSettings.sections.welcome} // Pass section-specific design
      />
    },
    {
      id: 'program',
      component: <ProgramSection 
        invitationData={invitationData} 
        designSettings={designSettings}
        events={events}
        design={designSettings.sections.program} // Pass section-specific design
      />
    },
    {
      id: 'honeymoon',
      component: <HoneymoonFundSection 
        invitationData={invitationData} 
        designSettings={designSettings}
        design={designSettings.sections.honeymoon} // Pass section-specific design
      />
    },
    {
      id: 'music',
      component: <MusicSection 
        invitationData={invitationData} 
        designSettings={designSettings}
        design={designSettings.sections.music} // Pass section-specific design
      />
    },
    {
      id: 'interactive',
      component: <InteractiveFeaturesSection 
        invitationData={invitationData} 
        designSettings={designSettings}
        design={designSettings.sections.interactive} // Pass section-specific design
      />
    },
    {
      id: 'contact',
      component: <ContactLinksSection 
        invitationData={invitationData} 
        designSettings={designSettings}
        design={designSettings.sections.contact} // Pass section-specific design
      />
    },
    {
      id: 'policies',
      component: <PoliciesSection 
        invitationData={invitationData} 
        designSettings={designSettings}
        design={designSettings.sections.policies} // Pass section-specific design
      />
    },
    {
      id: 'additional',
      component: <AdditionalInfoSection 
        invitationData={invitationData} 
        designSettings={designSettings}
        design={designSettings.sections.additional} // Pass section-specific design
      />
    },
    {
      id: 'rsvp',
      component: <RsvpSection 
        invitationData={invitationData} 
        designSettings={designSettings}
        guestDetails={guestDetails}
        onRsvpSubmit={onRsvpSubmit}
        design={designSettings.sections.rsvp} // Pass section-specific design
      />
    }
  ];

  // Filtrer les sections visibles
  const visibleSections = sections.filter((section) => {
    const sectionId = section.id as keyof typeof designSettings.sections;
    return designSettings.sections[sectionId]?.visible !== false;
  });

  // Navigation entre les sections
  const goToNextSection = () => {
    if (activeSection < visibleSections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const goToPrevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  return (
    <div className={isFullscreen ? `min-h-screen bg-gray-100 p-8 flex items-center justify-center` : ""}>
      <div 
        className={`${getContainerClass()} bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300`}
        style={{
          fontFamily: fontFamily.body,
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: `0 20px 25px -5px ${colorPalette.primary}20, 0 10px 10px -5px ${colorPalette.primary}10`
        }}
      >
        {designSettings.layout === 'vertical' ? (
          // Vertical layout - Scroll through all sections
          <div className="flex flex-col h-full overflow-y-auto">
            {visibleSections.map((section) => (
              <div key={section.id} className="w-full">
                {section.component}
              </div>
            ))}
          </div>
        ) : (
          // Horizontal layout - Flipbook style with navigation
          <div className="relative h-full">
            {/* Current section */}
            <div className="h-full">
              {visibleSections[activeSection]?.component}
            </div>
            
            {/* Navigation arrows */}
            {activeSection > 0 && (
              <button 
                onClick={goToPrevSection}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-lg z-10 transition-transform hover:scale-110 active:scale-95"
                style={{ color: colorPalette.primary }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            
            {activeSection < visibleSections.length - 1 && (
              <button 
                onClick={goToNextSection}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-lg z-10 transition-transform hover:scale-110 active:scale-95"
                style={{ color: colorPalette.primary }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            
            {/* Pagination dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {visibleSections.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeSection 
                      ? 'w-4 bg-opacity-100' 
                      : 'bg-opacity-50'
                  }`}
                  style={{ 
                    backgroundColor: colorPalette.primary
                  }}
                ></button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Custom CSS for heart shape */}
      <style >{`
        .heart-shape {
          position: relative;
          width: 100%;
          height: 100%;
          transform: rotate(45deg);
          background-color: ${colorPalette.primary};
          overflow: hidden;
        }
        .heart-shape::before,
        .heart-shape::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: ${colorPalette.primary};
          border-radius: 50%;
        }
        .heart-shape::before {
          top: -50%;
          left: 0;
        }
        .heart-shape::after {
          top: 0;
          left: -50%;
        }
        .heart-shape img {
          position: absolute;
          width: 141%;
          height: 141%;
          top: -20%;
          left: -20%;
          transform: rotate(-45deg);
          z-index: 1;
          object-fit: cover;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default InvitationPreview;
