import React, { ReactNode } from 'react';
import { useDevCycle } from '../contexts/DevCycleContext';

interface FeatureVariantProps<T> {
  variableKey: string;
  defaultValue: T;
  children: (value: T) => ReactNode;
}

/**
 * Composant qui permet d'utiliser des variables de fonctionnalité avec différentes valeurs
 */
function FeatureVariant<T>({ 
  variableKey, 
  defaultValue, 
  children 
}: FeatureVariantProps<T>): JSX.Element {
  const { getVariableValue } = useDevCycle();
  const value = getVariableValue<T>(variableKey, defaultValue);
  
  return <>{children(value)}</>;
}

export default FeatureVariant;