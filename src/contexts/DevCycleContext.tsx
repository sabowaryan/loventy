import React, { createContext, useContext, ReactNode } from 'react';
import { DevCycleProvider, useDevCycleClient, useVariableValue } from '@devcycle/react-client-sdk';
import { useAuth } from './AuthContext';

// Créer un contexte pour les fonctionnalités DevCycle
interface DevCycleContextType {
  isFeatureEnabled: (featureKey: string) => boolean;
  getVariableValue: <T>(key: string, defaultValue: T) => T;
}

const DevCycleContext = createContext<DevCycleContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte DevCycle
export const useDevCycle = () => {
  }
  const context = useContext(DevCycleContext);
  if (context === undefined) {
    throw new Error('useDevCycle must be used within a DevCycleContextProvider');
  }
  return context;
};

// Composant interne qui fournit les fonctionnalités DevCycle
const DevCycleFeatures: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const devCycleClient = useDevCycleClient();

  // Fonction pour vérifier si une fonctionnalité est activée
  const isFeatureEnabled = (featureKey: string): boolean => {
    // Utiliser la méthode variableValue du client DevCycle
    const variable = devCycleClient.variableValue(featureKey, false);
    return !!variable;
  };

  // Fonction pour obtenir la valeur d'une variable
  const getVariableValue = <T,>(key: string, defaultValue: T): T => {
    return devCycleClient.variableValue(key, defaultValue);
  };

  // Fournir les fonctionnalités via le contexte
  return (
    <DevCycleContext.Provider value={{ isFeatureEnabled, getVariableValue }}>
      {children}
    </DevCycleContext.Provider>
  );
};

// Composant principal qui initialise DevCycle
interface DevCycleContextProviderProps {
  }
  children: ReactNode;
}

export const DevCycleContextProvider: React.FC<DevCycleContextProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Clé d'API DevCycle
  const devCycleClientKey = import.meta.env.VITE_DEVCYCLE_CLIENT_KEY || 'dvc_client_YOUR_KEY_HERE';
  
  // Configurer l'utilisateur pour DevCycle
  const devCycleUser = {
    user_id: user?.id || 'anonymous',
    email: user?.email,
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : undefined,
    customData: {
      isPremium: user ? true : false,
      createdAt: user?.createdAt,
    }
  };

  // Options de configuration pour DevCycle
  const options = {
    logLevel: import.meta.env.DEV ? 'debug' : 'error',
    enableEdgeDB: true,
  };

  return (
    <DevCycleProvider
      clientKey={devCycleClientKey}
      user={devCycleUser}
      options={options}
    >
      <DevCycleFeatures>
        {children}
      </DevCycleFeatures>
    </DevCycleProvider>
  );
};

// Hook personnalisé pour vérifier si une fonctionnalité est activée
export const useFeatureFlag = (featureKey: string, defaultValue: boolean = false): boolean => {
  return useVariableValue(featureKey, defaultValue);
};