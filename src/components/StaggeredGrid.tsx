import React, { ReactNode } from 'react';
import { useStaggeredAnimation } from '../hooks/useScrollAnimation';

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  delay?: number;
}

const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  className = '',
  itemClassName = '',
  delay = 150
}) => {
  const { containerRef, visibleItems } = useStaggeredAnimation(children.length, delay);

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`${itemClassName} transition-all duration-700 ease-out ${
            visibleItems.has(index) 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            transitionDelay: visibleItems.has(index) ? '0ms' : `${index * delay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default StaggeredGrid;