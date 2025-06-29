import React, { useState, useRef, useCallback } from 'react';
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
  Loader2,
  Crop as CropIcon // Renamed to avoid conflict with ReactCrop's Crop type
} from 'lucide-react';
import { colorPalettes, fontFamilies, layoutOptions, sectionStyles, backgroundPatterns } from '../../utils/designConstants';
import type { InvitationDesignSettings, SectionDesign } from '../../types/models';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface DesignControlsProps {
  designSettings: InvitationDesignSettings;
  onDesignChange: (newSettings: InvitationDesignSettings) => void;
  onImageUpload: (sectionId: string, imageType: 'background' | 'couple' | 'decorative', file: File) => Promise<string>;
  isUploading: boolean;
}

// Helper function to center the crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

// Helper to get cropped image as a Blob
const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('No 2d context'));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg'); // You can change the format here
});
};


const SectionDesignEditor: React.FC<DesignControlsProps> = ({
  designSettings,
  onDesignChange,
  onImageUpload,
  isUploading
}) => {
  const [activeSection, setActiveSection] = useState<'hero' | 'details' | 'rsvp' | 'welcome' | 'program' | 'honeymoon' | 'music' | 'interactive' | 'contact' | 'policies' | 'additional'>('hero');
  
  // Cropping states
  const [imgSrc, setImgSrc] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<File | null>(null);
  const [currentImageType, setCurrentImageType] = useState<'background' | 'couple' | 'decorative' | null>(null);
  const aspect = 16 / 9; // Default aspect ratio for cropping, can be made dynamic

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

  const updateSectionDesign = useCallback((sectionId: typeof activeSection, property: keyof SectionDesign, value: any) => {
    onDesignChange(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          [property]: value
        }
      }
    }));
  }, [onDesignChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, sectionId: typeof activeSection, imageType: 'background' | 'couple' | 'decorative') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileForCrop(file);
      setCurrentImageType(imageType);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setCropperModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = async () => {
    if (completedCrop && imageRef.current && selectedFileForCrop && currentImageType) {
      try {
        const croppedBlob = await getCroppedImg(imageRef.current, completedCrop);
        const croppedFile = new File([croppedBlob], selectedFileForCrop.name, { type: selectedFileForCrop.type });
        
        const imageUrl = await onImageUpload(activeSection, currentImageType, croppedFile);

        // Update design settings with the new image URL and its dimensions
        const newSectionDesign: Partial<SectionDesign> = {};
        if (currentImageType === 'background') {
          newSectionDesign.backgroundImageUrl = imageUrl;
          newSectionDesign.backgroundImageWidth = completedCrop.width;
          newSectionDesign.backgroundImageHeight = completedCrop.height;
          newSectionDesign.backgroundPattern = null; // Remove pattern if image is selected
        } else if (currentImageType === 'couple') {
          newSectionDesign.coupleImageUrl = imageUrl;
          newSectionDesign.coupleImageWidth = completedCrop.width;
          newSectionDesign.coupleImageHeight = completedCrop.height;
        } else if (currentImageType === 'decorative') {
          newSectionDesign.decorativeElementUrl = imageUrl;
          newSectionDesign.decorativeElementWidth = completedCrop.width;
          newSectionDesign.decorativeElementHeight = completedCrop.height;
        }
        updateSectionDesign(activeSection, newSectionDesign as any); // Cast to any for partial update

        setCropperModalOpen(false);
        setImgSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        setSelectedFileForCrop(null);
        setCurrentImageType(null);
      } catch (e) {
        console.error('Error cropping or uploading image:', e);
        setErrorMessage('Erreur lors du rognage ou du téléchargement de l\'image.');
      }
    }
  };

  const handleCancelCrop = () => {
    setCropperModalOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setSelectedFileForCrop(null);
    setCurrentImageType(null);
  };

  const handleRemoveImage = (sectionId: typeof activeSection, imageType: 'background' | 'couple' | 'decorative') => {
    if (imageType === 'background') {
      updateSectionDesign(sectionId, 'backgroundImageUrl', null);
      updateSectionDesign(sectionId, 'backgroundImageWidth', null);
      updateSectionDesign(sectionId, 'backgroundImageHeight', null);
    } else if (imageType === 'couple') {
      updateSectionDesign(sectionId, 'coupleImageUrl', null);
      updateSectionDesign(sectionId, 'coupleImageWidth', null);
      updateSectionDesign(sectionId, 'coupleImageHeight', null);
    } else if (imageType === 'decorative') {
      updateSectionDesign(sectionId, 'decorativeElementUrl', null);
      updateSectionDesign(sectionId, 'decorativeElementWidth', null);
      updateSectionDesign(sectionId, 'decorativeElementHeight', null);
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
      {/* Cropper Modal */}
      {cropperModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#131837]">Rogner l'image</h3>
              <button onClick={handleCancelCrop} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {!!imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={c => setCrop(c)}
                  onComplete={c => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  <img ref={imageRef} alt="Source" src={imgSrc} onLoad={(e) => {
                    imageRef.current = e.currentTarget;
                    const { width, height } = e.currentTarget;
                    setCrop(centerAspectCrop(width, height, aspect));
                  }} />
                </ReactCrop>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelCrop}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApplyCrop}
                className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
              >
                Appliquer le rognage
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Width and Height inputs */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#131837] mb-2">
                  Largeur (px)
                </label>
                <input
                  type="number"
                  value={designSettings.sections[activeSection].backgroundImageWidth || ''}
                  onChange={(e) => updateSectionDesign(activeSection, 'backgroundImageWidth', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="Auto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#131837] mb-2">
                  Hauteur (px)
                </label>
                <input
                  type="number"
                  value={designSettings.sections[activeSection].backgroundImageHeight || ''}
                  onChange={(e) => updateSectionDesign(activeSection, 'backgroundImageHeight', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="Auto"
                />
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
                  className={`w-full h-full ${
                    designSettings.sections[activeSection].coupleImageShape === 'rounded' ? 'rounded-xl' :
                    designSettings.sections[activeSection].coupleImageShape === 'circle' ? 'rounded-full' :
                    designSettings.sections[activeSection].coupleImageShape === 'heart' ? 'heart-shape' : ''
                  }`}
                  style={{ objectFit: designSettings.sections[activeSection].coupleImageFit || 'cover' }}
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

              {/* Width and Height inputs */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Largeur (px)
                  </label>
                  <input
                    type="number"
                    value={designSettings.sections[activeSection].coupleImageWidth || ''}
                    onChange={(e) => updateSectionDesign(activeSection, 'coupleImageWidth', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Hauteur (px)
                  </label>
                  <input
                    type="number"
                    value={designSettings.sections[activeSection].coupleImageHeight || ''}
                    onChange={(e) => updateSectionDesign(activeSection, 'coupleImageHeight', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                    placeholder="Auto"
                  />
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

              {/* Width and Height inputs */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Largeur (px)
                  </label>
                  <input
                    type="number"
                    value={designSettings.sections[activeSection].decorativeElementWidth || ''}
                    onChange={(e) => updateSectionDesign(activeSection, 'decorativeElementWidth', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Hauteur (px)
                  </label>
                  <input
                    type="number"
                    value={designSettings.sections[activeSection].decorativeElementHeight || ''}
                    onChange={(e) => updateSectionDesign(activeSection, 'decorativeElementHeight', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                    placeholder="Auto"
                  />
                </div>
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
