import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Heart, 
  Circle, 
  Square, 
  Sliders, 
  Check, 
  X,
  Loader2
} from 'lucide-react';
import { colorPalettes, fontFamilies, layoutOptions, sectionStyles, backgroundPatterns } from '../../utils/designConstants';
import type { InvitationDesignSettings, SectionDesign } from '../../types/models';

interface DesignControlsProps {
  designSettings: InvitationDesignSettings;
  onDesignChange: (newSettings: InvitationDesignSettings) => void;
  onImageUpload: (sectionId: string, imageType: 'background' | 'couple', file: File) => Promise<string>;
  isUploading: boolean;
}

const DesignControls: React.FC<DesignControlsProps> = ({ 
  designSettings, 
  onDesignChange,
  onImageUpload,
  isUploading
}) => {
  const [activeSection, setActiveSection] = useState<'hero' | 'details' | 'rsvp'>('hero');
  const [activeTab, setActiveTab] = useState<'general' | 'section'>('general');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Helper to update design settings
  const updateDesign = (path: string, value: any) => {
    const newSettings = { ...designSettings };
    
    // Handle nested paths like 'sections.hero.backgroundColor'
    const parts = path.split('.');
    let current: any = newSettings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    onDesignChange(newSettings);
  };

  // Helper to update section design
  const updateSectionDesign = (sectionId: 'hero' | 'details' | 'rsvp', property: keyof SectionDesign, value: any) => {
    const newSettings = { ...designSettings };
    newSettings.sections[sectionId][property] = value;
    onDesignChange(newSettings);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, sectionId: string, imageType: 'background' | 'couple') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleImageUpload(sectionId, imageType, file);
    }
  };

  // Handle image upload
  const handleImageUpload = async (sectionId: string, imageType: 'background' | 'couple', file: File) => {
    try {
      const imageUrl = await onImageUpload(sectionId, imageType, file);
      
      if (imageType === 'background') {
        updateSectionDesign(sectionId as any, 'backgroundImageUrl', imageUrl);
      } else if (imageType === 'couple') {
        updateSectionDesign(sectionId as any, 'coupleImageUrl', imageUrl);
      }
      
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setSelectedFile(null);
    }
  };

  // Remove image
  const handleRemoveImage = (sectionId: 'hero' | 'details' | 'rsvp', imageType: 'background' | 'couple') => {
    if (imageType === 'background') {
      updateSectionDesign(sectionId, 'backgroundImageUrl', null);
    } else if (imageType === 'couple') {
      updateSectionDesign(sectionId, 'coupleImageUrl', null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'general' 
              ? 'border-[#D4A5A5] text-[#D4A5A5]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Paramètres généraux
        </button>
        <button
          onClick={() => setActiveTab('section')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'section' 
              ? 'border-[#D4A5A5] text-[#D4A5A5]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sections
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
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
                    {designSettings.layout === layout.id && <Check className="h-4 w-4" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-[#131837]">{layout.name}</div>
                    <div className="text-xs text-gray-500">{layout.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

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
                    {designSettings.fontFamilyId === font.id && <Check className="h-4 w-4" />}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-[#131837]" style={{ fontFamily: font.heading }}>{font.name}</div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: font.body }}>Exemple de texte</div>
                  </div>
                </button>
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
      )}

      {/* Section Settings */}
      {activeTab === 'section' && (
        <div className="space-y-6">
          {/* Section Selector */}
          <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveSection('hero')}
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeSection === 'hero' 
                  ? 'border-[#D4A5A5] text-[#D4A5A5]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Section d'accueil
            </button>
            <button
              onClick={() => setActiveSection('details')}
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeSection === 'details' 
                  ? 'border-[#D4A5A5] text-[#D4A5A5]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Section détails
            </button>
            <button
              onClick={() => setActiveSection('rsvp')}
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeSection === 'rsvp' 
                  ? 'border-[#D4A5A5] text-[#D4A5A5]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Section RSVP
            </button>
          </div>

          {/* Section Style */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-[#131837] mb-4">
              Style de la section
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sectionStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => updateSectionDesign(activeSection, 'style', style.id)}
                  className={`p-3 border rounded-lg transition-colors ${
                    designSettings.sections[activeSection].style === style.id
                      ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                      : 'border-gray-200 hover:border-[#D4A5A5]/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">{style.name}</div>
                    <div className="text-xs text-gray-500">{style.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2 text-[#D4A5A5]" />
              Couleur de fond
            </h3>
            
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={designSettings.sections[activeSection].backgroundColor || '#ffffff'}
                onChange={(e) => updateSectionDesign(activeSection, 'backgroundColor', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={designSettings.sections[activeSection].backgroundColor || ''}
                onChange={(e) => updateSectionDesign(activeSection, 'backgroundColor', e.target.value)}
                placeholder="Transparent"
                className="form-input flex-1"
              />
              {designSettings.sections[activeSection].backgroundColor && (
                <button
                  onClick={() => updateSectionDesign(activeSection, 'backgroundColor', null)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Supprimer la couleur"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Background Image */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-[#D4A5A5]" />
              Image de fond
            </h3>
            
            {designSettings.sections[activeSection].backgroundImageUrl ? (
              <div className="mb-4">
                <div className="relative rounded-lg overflow-hidden h-40 mb-2">
                  <img 
                    src={designSettings.sections[activeSection].backgroundImageUrl} 
                    alt="Background" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(activeSection, 'background')}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#131837]">
                    Opacité de l'image
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={designSettings.sections[activeSection].backgroundOpacity}
                    onChange={(e) => updateSectionDesign(activeSection, 'backgroundOpacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Transparent</span>
                    <span>Opaque</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D4A5A5] transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Glissez une image ou cliquez pour parcourir</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, activeSection, 'background')}
                    className="hidden"
                    id={`background-upload-${activeSection}`}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor={`background-upload-${activeSection}`}
                    className={`inline-block px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors cursor-pointer ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Téléchargement...</span>
                      </div>
                    ) : (
                      'Choisir une image'
                    )}
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Ou choisir un motif de fond
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {backgroundPatterns.map(pattern => (
                      <button
                        key={pattern.id}
                        onClick={() => updateSectionDesign(activeSection, 'backgroundPattern', pattern.id)}
                        className={`p-3 border rounded-lg transition-colors ${
                          designSettings.sections[activeSection].backgroundPattern === pattern.id
                            ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                            : 'border-gray-200 hover:border-[#D4A5A5]/50'
                        }`}
                      >
                        <div className="h-12 rounded-lg mb-2" style={{
                          backgroundImage: pattern.url ? `url(${pattern.url})` : 'none',
                          backgroundColor: pattern.id === 'none' ? '#f9fafb' : 'transparent'
                        }}></div>
                        <div className="text-xs text-center">{pattern.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Couple Image - Only for hero and details sections */}
          {(activeSection === 'hero' || activeSection === 'details') && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-[#D4A5A5]" />
                Image du couple
              </h3>
              
              {designSettings.sections[activeSection].coupleImageUrl ? (
                <div className="mb-4">
                  <div className="relative rounded-lg overflow-hidden h-40 mb-2">
                    <img 
                      src={designSettings.sections[activeSection].coupleImageUrl} 
                      alt="Couple" 
                      className={`w-full h-full object-cover ${
                        designSettings.sections[activeSection].coupleImageShape === 'rounded' ? 'rounded-xl' :
                        designSettings.sections[activeSection].coupleImageShape === 'circle' ? 'rounded-full' :
                        ''
                      }`}
                    />
                    <button
                      onClick={() => handleRemoveImage(activeSection, 'couple')}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#131837]">
                      Forme de l'image
                    </label>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => updateSectionDesign(activeSection, 'coupleImageShape', 'original')}
                        className={`p-2 border rounded-lg transition-colors ${
                          designSettings.sections[activeSection].coupleImageShape === 'original'
                            ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                            : 'border-gray-200 hover:border-[#D4A5A5]/50'
                        }`}
                        title="Original"
                      >
                        <Square className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => updateSectionDesign(activeSection, 'coupleImageShape', 'rounded')}
                        className={`p-2 border rounded-lg transition-colors ${
                          designSettings.sections[activeSection].coupleImageShape === 'rounded'
                            ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                            : 'border-gray-200 hover:border-[#D4A5A5]/50'
                        }`}
                        title="Arrondi"
                      >
                        <div className="w-5 h-5 rounded-lg bg-gray-400"></div>
                      </button>
                      <button
                        onClick={() => updateSectionDesign(activeSection, 'coupleImageShape', 'circle')}
                        className={`p-2 border rounded-lg transition-colors ${
                          designSettings.sections[activeSection].coupleImageShape === 'circle'
                            ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                            : 'border-gray-200 hover:border-[#D4A5A5]/50'
                        }`}
                        title="Cercle"
                      >
                        <Circle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => updateSectionDesign(activeSection, 'coupleImageShape', 'heart')}
                        className={`p-2 border rounded-lg transition-colors ${
                          designSettings.sections[activeSection].coupleImageShape === 'heart'
                            ? 'border-[#D4A5A5] bg-[#D4A5A5]/5'
                            : 'border-gray-200 hover:border-[#D4A5A5]/50'
                        }`}
                        title="Cœur"
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D4A5A5] transition-colors">
                  <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Ajoutez une photo du couple</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, activeSection, 'couple')}
                    className="hidden"
                    id={`couple-upload-${activeSection}`}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor={`couple-upload-${activeSection}`}
                    className={`inline-block px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors cursor-pointer ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Téléchargement...</span>
                      </div>
                    ) : (
                      'Choisir une image'
                    )}
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignControls;