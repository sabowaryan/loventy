import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DevCycleContextProvider } from '../contexts/DevCycleContext';

interface DevCycleAuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that safely accesses the Auth context before rendering DevCycle
 * This ensures that useAuth is always called within the AuthProvider's context
 */
export const DevCycleAuthWrapper: React.FC<DevCycleAuthWrapperProps> = ({ children }) => {
  // Safely access auth context here, after AuthProvider is initialized
  const auth = useAuth();
  
  return (
    <DevCycleContextProvider auth={auth}>
      {children}
    </DevCycleContextProvider>
  );
};

export default DevCycleAuthWrapper;