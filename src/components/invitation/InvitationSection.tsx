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
  
  // Récupérer le motif de fond
  const getBackgroundPattern = () => {
    if (design.backgroundPattern && design.backgroundPattern !== 'none') {
      const pattern = backgroundPatterns.find(p => p.id === design.backgroundPattern);
      return pattern?.url || null;
    }
    return null;
  };

  // Construire le style de la section
  const sectionStyle: React.CSSProperties = {
    backgroundColor: design.backgroundColor || 'white',
    backgroundImage: design.backgroundImageUrl 
      ? `linear-gradient(rgba(255, 255, 255, ${1 - design.backgroundOpacity}), rgba(255, 255, 255, ${1 - design.backgroundOpacity})), url(${design.backgroundImageUrl})`
      : getBackgroundPattern() ? `url(${getBackgroundPattern()})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

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