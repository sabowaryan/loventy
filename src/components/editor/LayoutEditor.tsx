import React from 'react';
import { Layout, Sliders } from 'lucide-react';
import { InvitationDesignSettings } from '../../types/models';
import { layoutOptions } from '../../utils/designConstants';

interface LayoutEditorProps {
  designSettings: InvitationDesignSettings;
  onDesignChange: (newSettings: InvitationDesignSettings) => void;
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({
  designSettings,
  onDesignChange
}) => {
  // Helper to update design settings
  const updateDesign = (path: string, value: any) => {
    const newSettings = { ...designSettings };

    // Handle nested paths like 'sections.hero.visible'
    const parts = path.split('.');
    let current: any = newSettings;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
    onDesignChange(newSettings);
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId: keyof InvitationDesignSettings['sections']) => {
    updateDesign(`sections.${sectionId}.visible`, !designSettings.sections[sectionId].visible);
  };

  // Map section IDs to user-friendly names
  const sectionNames: Record<keyof InvitationDesignSettings['sections'], string> = {
    hero: 'Section d\'accueil',
    details: 'Détails de l\'événement',
    rsvp: 'Confirmation de présence',
    welcome: 'Message de bienvenue',
    program: 'Programme',
    honeymoon: 'Cagnotte lune de miel',
    music: 'Musique',
    interactive: 'Fonctionnalités interactives',
    contact: 'Contact et liens',
    policies: 'Informations pratiques',
    additional: 'Informations supplémentaires',
  };

  return (
    <div className="space-y-8">
      {/* Layout Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Layout className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Disposition
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layoutOptions.map(layout => (
            <button
              key={layout.id}
              onClick={() => updateDesign('layout', layout.id)}
              className={`p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                designSettings.layout === layout.id
                  ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                  : 'border-gray-200 hover:border-[#D4A5A5]/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                designSettings.layout === layout.id
                  ? 'bg-[#D4A5A5] text-white'
                  : 'bg-gray-100'
              }`}>
                {designSettings.layout === layout.id && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <div className="font-medium text-[#131837]">{layout.name}</div>
                <div className="text-xs text-gray-500">{layout.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Visibility */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4">
          Visibilité des sections
        </h3>

        <div className="space-y-3">
          {Object.entries(designSettings.sections).map(([sectionId, section]) => (
            <div key={sectionId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-[#131837]">
                  {sectionNames[sectionId as keyof InvitationDesignSettings['sections']]}
                </h4>
              </div>
              <button
                onClick={() => toggleSectionVisibility(sectionId as keyof InvitationDesignSettings['sections'])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  section.visible !== false ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    section.visible !== false ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Sliders className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Espacement
        </h3>

        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">Espacement entre les éléments:</label>
          <select
            value={designSettings.spacing}
            onChange={(e) => updateDesign('spacing', e.target.value)}
            className="form-input"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacieux</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LayoutEditor;
