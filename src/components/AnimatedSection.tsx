import React, { ReactNode } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeInUp' | 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  delay?: number;
  threshold?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  animation = 'fadeInUp',
  delay = 0,
  threshold = 0.1
}) => {
  const { elementRef, isVisible } = useScrollAnimation({ threshold });

  const animationClasses = {
    fadeInUp: 'animate-fade-in-up',
    fadeIn: 'animate-fade-in',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    scaleIn: 'animate-scale-in'
  };

  return (
    <div
      ref={elementRef}
      className={`${className} ${isVisible ? animationClasses[animation] : 'opacity-0'} transition-all duration-700 ease-out`}
      style={{
        animationDelay: isVisible ? `${delay}ms` : '0ms',
        transform: !isVisible ? getInitialTransform(animation) : 'none'
      }}
    >
      {children}
    </div>
  );
};

const getInitialTransform = (animation: string): string => {
  switch (animation) {
    case 'fadeInUp':
      return 'translateY(30px)';
    case 'slideInLeft':
      return 'translateX(-30px)';
    case 'slideInRight':
      return 'translateX(30px)';
    case 'scaleIn':
      return 'scale(0.95)';
    default:
      return 'none';
  }
};

export default AnimatedSection;