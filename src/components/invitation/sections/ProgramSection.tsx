import React from 'react';
import { Calendar, Clock, MapPin, CloudSun } from 'lucide-react';
import { ExtendedInvitationData, InvitationDesignSettings, InvitationEvent } from '../../../types/models';
import InvitationSection from '../InvitationSection';
import { colorPalettes, fontFamilies } from '../../../utils/designConstants';

interface ProgramSectionProps {
  invitationData: ExtendedInvitationData;
  designSettings: InvitationDesignSettings;
  events: InvitationEvent[];
}

const ProgramSection: React.FC<ProgramSectionProps> = ({ 
  invitationData, 
  designSettings,
  events
}) => {
  // Récupérer la palette de couleurs et la famille de polices
  const colorPalette = colorPalettes.find(p => p.id === designSettings.colorPaletteId) || colorPalettes[0];
  const fontFamily = fontFamilies.find(f => f.id === designSettings.fontFamilyId) || fontFamilies[0];
  
  // Récupérer les paramètres de design spécifiques à cette section
  const sectionDesign = designSettings.sections.program;

  // Fonction pour obtenir la couleur en fonction du type d'événement
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'ceremony':
        return colorPalette.primary;
      case 'reception':
        return colorPalette.accent;
      case 'cocktail':
        return '#9D8EC7'; // Lavande
      case 'dinner':
        return '#B87333'; // Cuivre
      case 'party':
        return '#D8A7B1'; // Rose poudré
      default:
        return colorPalette.secondary;
    }
  };

  // Fonction pour obtenir le libellé du type d'événement
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'ceremony':
        return 'Cérémonie';
      case 'reception':
        return 'Réception';
      case 'cocktail':
        return 'Cocktail';
      case 'dinner':
        return 'Dîner';
      case 'party':
        return 'Soirée';
      default:
        return 'Événement';
    }
  };

  return (
    <InvitationSection 
      design={sectionDesign} 
      colorPaletteId={designSettings.colorPaletteId}
      id="program-section"
      className="min-h-[50vh]"
    >
      <div className="space-y-8">
        <h2 
          className="text-2xl md:text-3xl font-bold text-center mb-6"
          style={{ 
            fontFamily: fontFamily.heading,
            color: colorPalette.primary
          }}
        >
          Programme
        </h2>
        
        {events.length === 0 ? (
          <div 
            className="text-center p-6 rounded-lg"
            style={{ 
              backgroundColor: `${colorPalette.secondary}15`,
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            <p>Le programme détaillé sera disponible prochainement.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div 
              className="absolute left-4 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: `${colorPalette.primary}40` }}
            ></div>
            
            {/* Events */}
            <div className="space-y-8 ml-10">
              {events.map((event, index) => (
                <div key={event.id} className="relative">
                  {/* Timeline dot */}
                  <div 
                    className="absolute -left-10 top-0 w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: getEventTypeColor(event.event_type),
                      border: `2px solid white`,
                      boxShadow: `0 0 0 2px ${getEventTypeColor(event.event_type)}40`
                    }}
                  ></div>
                  
                  {/* Event card */}
                  <div 
                    className="rounded-lg p-4"
                    style={{ 
                      backgroundColor: `${getEventTypeColor(event.event_type)}10`,
                      borderLeft: `3px solid ${getEventTypeColor(event.event_type)}`
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getEventTypeColor(event.event_type)}20`,
                          color: getEventTypeColor(event.event_type)
                        }}
                      >
                        {getEventTypeLabel(event.event_type)}
                      </span>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ 
                          fontFamily: fontFamily.heading,
                          color: colorPalette.textColor
                        }}
                      >
                        {event.title}
                      </h3>
                    </div>
                    
                    <div 
                      className="space-y-2 text-sm"
                      style={{ 
                        fontFamily: fontFamily.body,
                        color: colorPalette.textColor
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" style={{ color: getEventTypeColor(event.event_type) }} />
                        <span>{event.event_time}</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: getEventTypeColor(event.event_type) }} />
                        <div>
                          <div className="font-medium">{event.location_name}</div>
                          <div className="text-xs opacity-75">{event.address}</div>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="italic text-sm mt-2">{event.description}</p>
                      )}
                      
                      {/* Plan B information if available */}
                      {(event.plan_b_location_name || event.plan_b_address || event.plan_b_description) && (
                        <div 
                          className="mt-2 p-2 rounded-lg"
                          style={{ backgroundColor: `${colorPalette.secondary}15` }}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <CloudSun className="h-3 w-3" style={{ color: colorPalette.accent }} />
                            <span className="text-xs font-medium">Plan B (en cas de mauvais temps)</span>
                          </div>
                          {event.plan_b_location_name && (
                            <div className="text-xs">{event.plan_b_location_name}</div>
                          )}
                          {event.plan_b_address && (
                            <div className="text-xs opacity-75">{event.plan_b_address}</div>
                          )}
                          {event.plan_b_description && (
                            <div className="text-xs italic mt-1">{event.plan_b_description}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional event information */}
        {invitationData.additionalInfo && (
          <div 
            className="mt-6 p-4 rounded-lg"
            style={{ 
              backgroundColor: `${colorPalette.secondary}15`,
              fontFamily: fontFamily.body,
              color: colorPalette.textColor
            }}
          >
            <p className="italic">{invitationData.additionalInfo}</p>
          </div>
        )}
      </div>
    </InvitationSection>
  );
};

export default ProgramSection;