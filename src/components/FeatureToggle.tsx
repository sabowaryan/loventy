import React, { ReactNode } from 'react';
import { useFeatureFlag } from '../contexts/DevCycleContext';

interface FeatureToggleProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Composant qui affiche son contenu uniquement si la fonctionnalité est activée
 */
const FeatureToggle: React.FC<FeatureToggleProps> = ({ 
  featureKey, 
  children, 
  fallback = null 
}) => {
  const isEnabled = useFeatureFlag(featureKey, false);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

export default FeatureToggle;