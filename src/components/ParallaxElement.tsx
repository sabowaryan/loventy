import React, { ReactNode } from 'react';
import { useParallax } from '../hooks/useScrollAnimation';

interface ParallaxElementProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

const ParallaxElement: React.FC<ParallaxElementProps> = ({
  children,
  speed = 0.5,
  className = ''
}) => {
  const { elementRef, offset } = useParallax(speed);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxElement;