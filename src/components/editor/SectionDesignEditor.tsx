// src/components/editor/SectionDesignEditor.tsx
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
  onImageUpload: (sectionId: string, imageType: 'background' | 'couple' | 'decorative', file: File) => Promise<string>; // Updated imageType
  isUploading: boolean;
}

const SectionDesignEditor: React.FC<DesignControlsProps> = ({
  designSettings,
  onDesignChange,
  onImageUpload,
  isUploading
}) => {
  const [activeSection, setActiveSection] = useState<'hero' | 'details' | 'rsvp' | 'welcome' | 'program' | 'honeymoon' | 'music' | 'interactive' | 'contact' | 'policies' | 'additional'>('hero');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const updateDesign = (path: string, value: any) => {
    const newSettings = { ...designSettings };

    const parts = path.split('.');
    let current: any = newSettings;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
    onDesignChange(newSettings);
  };

  const updateSectionDesign = (sectionId: typeof activeSection, property: keyof SectionDesign, value: any) => {
    const newSettings = { ...designSettings };
    newSettings.sections[sectionId] = {
      ...newSettings.sections[sectionId],
      [property]: value
    };
    onDesignChange(newSettings);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, sectionId: typeof activeSection, imageType: 'background' | 'couple' | 'decorative') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleImageUpload(sectionId, imageType, file);
    }
  };

  const handleImageUpload = async (sectionId: typeof activeSection, imageType: 'background' | 'couple' | 'decorative', file: File) => {
    try {
      const imageUrl = await onImageUpload(sectionId, imageType, file);

      if (imageType === 'background') {
        updateSectionDesign(sectionId, 'backgroundImageUrl', imageUrl);
      } else if (imageType === 'couple') {
        updateSectionDesign(sectionId, 'coupleImageUrl', imageUrl);
      } else if (imageType === 'decorative') { // Handle decorative element
        updateSectionDesign(sectionId, 'decorativeElementUrl', imageUrl);
      }

      setSelectedFile(null);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setSelectedFile(null);
      throw error;
    }
  };

  const handleRemoveImage = (sectionId: typeof activeSection, imageType: 'background' | 'couple' | 'decorative') => {
    if (imageType === 'background') {
      updateSectionDesign(sectionId, 'backgroundImageUrl', null);
    } else if (imageType === 'couple') {
      updateSectionDesign(sectionId, 'coupleImageUrl', null);
    } else if (imageType === 'decorative') { // Handle decorative element removal
      updateSectionDesign(sectionId, 'decorativeElementUrl', null);
    }
  };

  const allSections = [
    { id: 'hero', name: 'Section d\'accueil' },
    { id: 'welcome', name: 'Message de bienvenue' },
    { id: 'program', name: 'Programme' },
    { id: 'details', name: 'Détails de l\'événement' },
    { id: 'rsvp', name: 'Confirmation de présence' },
    { id: 'honeymoon', name: 'Cagnotte lune de miel' },
    { id: 'music', name: 'Musique' },
    { id: 'interactive', name: 'Fonctionnalités interactives' },
    { id: 'contact', name: 'Contact et liens' },
    { id: 'policies', name: 'Informations supplémentaires' },
    { id: 'additional', name: 'Informations pratiques' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Selector */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4">
          Sélectionnez une section
        </h3>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto hide-scrollbar">
          {allSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-[#D4A5A5] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>
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

            {/* Mode d'ajustement de l'image de fond */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#131837] mb-2">
                Mode d'ajustement
              </label>
              <select
                value={designSettings.sections[activeSection].backgroundFit || 'cover'}
                onChange={(e) => updateSectionDesign(activeSection, 'backgroundFit', e.target.value as 'cover' | 'contain')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              >
                <option value="cover">Couvrir</option>
                <option value="contain">Contenir</option>
              </select>
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

      {/* Couple Image - Only for hero and welcome sections */}
      {(activeSection === 'hero' || activeSection === 'welcome') && (
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
                    designSettings.sections[activeSection].coupleImageShape === 'heart' ? 'heart-shape' : ''
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

              {/* Mode d'ajustement de l'image du couple */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#131837] mb-2">
                  Mode d'ajustement
                </label>
                <select
                  value={designSettings.sections[activeSection].coupleImageFit || 'cover'}
                  onChange={(e) => updateSectionDesign(activeSection, 'coupleImageFit', e.target.value as 'cover' | 'contain')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                >
                  <option value="cover">Couvrir</option>
                  <option value="contain">Contenir</option>
                </select>
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

      {/* Decorative Element - Only for hero section */}
      {activeSection === 'hero' && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-[#D4A5A5]" />
            Élément décoratif
          </h3>

          {designSettings.sections[activeSection].decorativeElementUrl ? (
            <div className="mb-4">
              <div className="relative rounded-lg overflow-hidden h-40 mb-2 flex items-center justify-center bg-gray-100">
                <img
                  src={designSettings.sections[activeSection].decorativeElementUrl}
                  alt="Decorative Element"
                  className="h-24 w-24 object-contain"
                />
                <button
                  onClick={() => handleRemoveImage(activeSection, 'decorative')}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D4A5A5] transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Ajoutez une petite image ou icône décorative</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, activeSection, 'decorative')}
                className="hidden"
                id={`decorative-upload-${activeSection}`}
                disabled={isUploading}
              />
              <label
                htmlFor={`decorative-upload-${activeSection}`}
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
  );
};

export default SectionDesignEditor;

