/**
 * Fournisseur de sécurité qui encapsule l'application avec les fonctionnalités de sécurité avancées
 * Gère la session sécurisée, les avertissements et l'audit
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useSecureSession, useAuditLog } from '../../hooks/useSecureSession';
import { useLoginAttempts } from '../../hooks/useLoginAttempts';
import { useAuth } from '../../contexts/AuthContext';
import SessionWarning from './SessionWarning';

interface SecurityContextType {
  // Session sécurisée
  isSessionActive: boolean;
  showSessionWarning: boolean;
  timeUntilExpiry: number;
  extendSession: () => void;
  
  // Tentatives de connexion
  isLocked: boolean;
  remainingAttempts: number;
  remainingTime: number;
  recordLoginAttempt: (email: string, success: boolean, ip?: string) => void;
  clearLoginAttempts: (email?: string) => void;
  formatRemainingTime: (seconds: number) => string;
  
  // Audit
  logAction: (action: string, details?: Record<string, any>, severity?: 'info' | 'warning' | 'error') => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
  sessionConfig?: {
    inactivityTimeout?: number;
    warningTime?: number;
    checkInterval?: number;
  };
  loginAttemptsConfig?: {
    maxAttempts?: number;
    lockoutDuration?: number;
    slidingWindow?: number;
  };
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
  sessionConfig,
  loginAttemptsConfig
}) => {
  const { user, signOut } = useAuth();
  
  // Hooks de sécurité
  const {
    isActive: isSessionActive,
    showWarning: showSessionWarning,
    timeUntilExpiry,
    extendSession
  } = useSecureSession(sessionConfig);
  
  const {
    isLocked,
    remainingAttempts,
    remainingTime,
    recordAttempt: recordClientAttempt,
    clearAttempts: clearLoginAttempts,
    formatRemainingTime
  } = useLoginAttempts(loginAttemptsConfig);
  
  const { logAction, recordLoginAttempt: recordServerAttempt } = useAuditLog();

  // Gestionnaire pour prolonger la session
  const handleExtendSession = () => {
    extendSession();
    logAction('session_extended', { 
      extended_at: new Date().toISOString(),
      time_remaining: timeUntilExpiry 
    });
  };

  // Gestionnaire pour la déconnexion
  const handleSignOut = () => {
    logAction('session_expired', { 
      expired_at: new Date().toISOString(),
      reason: 'inactivity_timeout'
    });
    signOut();
  };

  // Gestionnaire combiné pour les tentatives de connexion
  const handleRecordLoginAttempt = async (email: string, success: boolean, ip?: string) => {
    // Enregistrement côté client (localStorage)
    recordClientAttempt(email, success, ip);
    
    // Enregistrement côté serveur (base de données)
    const failureReason = success ? undefined : 'authentication_failed';
    await recordServerAttempt(email, success, failureReason);
  };

  const contextValue: SecurityContextType = {
    // Session sécurisée
    isSessionActive,
    showSessionWarning,
    timeUntilExpiry,
    extendSession: handleExtendSession,
    
    // Tentatives de connexion
    isLocked,
    remainingAttempts,
    remainingTime,
    recordLoginAttempt: handleRecordLoginAttempt,
    clearLoginAttempts,
    formatRemainingTime,
    
    // Audit
    logAction
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
      
      {/* Avertissement de session */}
      {user && (
        <SessionWarning
          show={showSessionWarning}
          timeUntilExpiry={timeUntilExpiry}
          onExtend={handleExtendSession}
          onSignOut={handleSignOut}
        />
      )}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;