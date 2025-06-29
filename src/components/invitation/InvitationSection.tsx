// src/components/invitation/InvitationSection.tsx
import React, { ReactNode } from 'react';
import { SectionDesign } from '../../types/models';
import { colorPalettes, backgroundPatterns } from '../../utils/designConstants';

interface InvitationSectionProps {
  children: ReactNode;
  design: SectionDesign;
  colorPaletteId: string;
  className?: string;
  id?: string;
}

const InvitationSection: React.FC<InvitationSectionProps> = ({
  children,
  design,
  colorPaletteId,
  className = '',
  id
}) => {
  // Si la section n'est pas visible, ne pas la rendre
  if (design.visible === false) {
    return null;
  }

  // Récupérer la palette de couleurs
  const colorPalette = colorPalettes.find(p => p.id === colorPaletteId) || colorPalettes[0];
  
  // Construire les couches de fond
  const backgroundLayers: string[] = [];
  const backgroundSizes: string[] = [];
  const backgroundPositions: string[] = [];
  const backgroundRepeats: string[] = [];

  const patternUrl = backgroundPatterns.find(p => p.id === design.backgroundPattern)?.url || null;

  // Layer 1: Pattern (on top)
  if (patternUrl) {
    backgroundLayers.push(`url(${patternUrl})`);
    backgroundSizes.push('auto'); // Patterns usually repeat, so auto size is good
    backgroundPositions.push('center');
    backgroundRepeats.push('repeat');
  }

  // Layer 2: Background Image (below pattern, above color)
  if (design.backgroundImageUrl) {
    // Apply a black overlay to control the image's visibility/darkness
    // If design.backgroundOpacity is 1, overlay is transparent (image fully visible)
    // If design.backgroundOpacity is 0.1, overlay is almost opaque black (image almost hidden by black)
    const overlayOpacity = 1 - design.backgroundOpacity;
    backgroundLayers.push(`linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), url(${design.backgroundImageUrl})`);
    backgroundSizes.push(design.backgroundFit || 'cover'); // Use backgroundFit, default to 'cover'
    backgroundPositions.push('center');
    backgroundRepeats.push('no-repeat');
  }

  // Construct the style object
  const sectionStyle: React.CSSProperties = {
    backgroundColor: design.backgroundColor || 'transparent', // Base color
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

  if (backgroundLayers.length > 0) {
    sectionStyle.backgroundImage = backgroundLayers.join(', ');
    sectionStyle.backgroundSize = backgroundSizes.join(', ');
    sectionStyle.backgroundPosition = backgroundPositions.join(', ');
    sectionStyle.backgroundRepeat = backgroundRepeats.join(', ');
  }

  // Appliquer des styles spécifiques selon le style de la section
  const getStyleClasses = () => {
    switch (design.style) {
      case 'modern':
        return 'p-6 md:p-8';
      case 'rustic':
        return 'p-6 md:p-8 border-2 border-opacity-20';
      case 'romantic':
        return 'p-6 md:p-8 rounded-lg';
      default: // 'classic'
        return 'p-6 md:p-8';
    }
  };

  return (
    <section 
      id={id}
      className={`invitation-section ${getStyleClasses()} ${className}`}
      style={sectionStyle}
    >
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

export default InvitationSection;

