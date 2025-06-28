import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types/auth';

// Define the shape of our DevCycle context
interface DevCycleContextType {
  isEnabled: (featureKey: string) => boolean;
  getVariableValue: (variableKey: string, defaultValue: any) => any;
}

// Create the context with a default value
const DevCycleContext = createContext<DevCycleContextType | undefined>(undefined);

// Custom hook to use the DevCycle context
export const useDevCycle = () => {
  const context = useContext(DevCycleContext);
  
  if (context === undefined) {
    throw new Error('useDevCycle must be used within a DevCycleContextProvider');
  }
  
  return context;
};

// Props for the DevCycleContextProvider
interface DevCycleContextProviderProps {
  children: ReactNode;
  auth: {
    user: User | null;
    isAuthenticated: boolean;
  };
}

// Component that provides the DevCycle functionality
export const DevCycleContextProvider: React.FC<DevCycleContextProviderProps> = ({ 
  children,
  auth
}) => {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [variables, setVariables] = useState<Record<string, any>>({});
  
  // Initialize DevCycle client when the component mounts
  useEffect(() => {
    // Here you would normally initialize the DevCycle client
    // For now, we'll just set some mock features and variables
    
    const mockFeatures = {
      'premium-templates': auth.isAuthenticated,
      'advanced-analytics': auth.isAuthenticated,
      'custom-domain': auth.isAuthenticated && auth.user?.firstName === 'Admin',
      'beta-features': false
    };
    
    const mockVariables = {
      'max-invitations': auth.isAuthenticated ? 25 : 3,
      'max-guests': auth.isAuthenticated ? 300 : 50,
      'theme-color': '#D4A5A5',
      'welcome-message': `Bienvenue ${auth.user?.firstName || 'sur Loventy'}`
    };
    
    setFeatures(mockFeatures);
    setVariables(mockVariables);
  }, [auth.isAuthenticated, auth.user]);
  
  // Function to check if a feature is enabled
  const isEnabled = (featureKey: string): boolean => {
    return features[featureKey] || false;
  };
  
  // Function to get a variable value
  const getVariableValue = (variableKey: string, defaultValue: any): any => {
    return variables[variableKey] !== undefined ? variables[variableKey] : defaultValue;
  };
  
  // Provide the DevCycle context to children
  return (
    <DevCycleContext.Provider value={{ isEnabled, getVariableValue }}>
      {children}
    </DevCycleContext.Provider>
  );
};