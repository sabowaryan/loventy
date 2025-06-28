import React from 'react';
import { Palette, Type } from 'lucide-react';
import { InvitationDesignSettings } from '../../types/models';
import { colorPalettes, fontFamilies } from '../../utils/designConstants';

interface ThemeEditorProps {
  designSettings: InvitationDesignSettings;
  onDesignChange: (newSettings: InvitationDesignSettings) => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ 
  designSettings, 
  onDesignChange 
}) => {
  // Helper to update design settings
  const updateDesign = (path: string, value: any) => {
    const newSettings = { ...designSettings };
    
    // Handle nested paths like 'animations.enabled'
    const parts = path.split('.');
    let current: any = newSettings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    onDesignChange(newSettings);
  };

  return (
    <div className="space-y-8">
      {/* Color Palette Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Palette className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Palette de couleurs
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {colorPalettes.map(palette => (
            <button
              key={palette.id}
              onClick={() => updateDesign('colorPaletteId', palette.id)}
              className={`p-3 border rounded-lg transition-colors ${
                designSettings.colorPaletteId === palette.id
                  ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                  : 'border-gray-200 hover:border-[#D4A5A5]/50'
              }`}
            >
              <div className="flex space-x-1 mb-2 justify-center">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.primary }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.secondary }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.accent }}></div>
              </div>
              <div className="text-xs font-medium text-center">{palette.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Type className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Police d'écriture
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fontFamilies.map(font => (
            <button
              key={font.id}
              onClick={() => updateDesign('fontFamilyId', font.id)}
              className={`p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                designSettings.fontFamilyId === font.id
                  ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                  : 'border-gray-200 hover:border-[#D4A5A5]/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                designSettings.fontFamilyId === font.id
                  ? 'bg-[#D4A5A5] text-white'
                  : 'bg-gray-100'
              }`}>
                {designSettings.fontFamilyId === font.id && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-[#131837]" style={{ fontFamily: font.heading }}>{font.name}</div>
                <div className="text-xs text-gray-500" style={{ fontFamily: font.body }}>Exemple de texte</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Animations */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4">
          Animations
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Activer les animations</span>
          <button
            onClick={() => updateDesign('animations.enabled', !designSettings.animations.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              designSettings.animations.enabled ? 'bg-[#D4A5A5]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                designSettings.animations.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {designSettings.animations.enabled && (
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">Type d'animation:</label>
            <select
              value={designSettings.animations.type}
              onChange={(e) => updateDesign('animations.type', e.target.value)}
              className="form-input"
            >
              <option value="fade">Fondu</option>
              <option value="slide">Glissement</option>
              <option value="zoom">Zoom</option>
              <option value="none">Aucune</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeEditor;