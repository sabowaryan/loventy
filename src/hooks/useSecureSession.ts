/**
 * Hook pour la gestion sécurisée des sessions utilisateur
 * Inclut la détection d'inactivité, validation de session et nettoyage automatique
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SessionConfig {
  inactivityTimeout: number; // en millisecondes
  warningTime: number; // temps avant expiration pour afficher l'avertissement
  checkInterval: number; // intervalle de vérification de la session
}

const DEFAULT_CONFIG: SessionConfig = {
  inactivityTimeout: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes avant expiration
  checkInterval: 60 * 1000 // vérification chaque minute
};

export const useSecureSession = (config: Partial<SessionConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { user, signOut } = useAuth();
  
  const [isActive, setIsActive] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Mise à jour de l'activité utilisateur
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsActive(true);
    setShowWarning(false);
    warningShownRef.current = false;
  }, []);

  // Vérification de la validité de la session
  const validateSession = useCallback(async () => {
    if (!user) return false;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('Session invalide détectée:', error);
        await signOut();
        return false;
      }

      // Vérifier si le token est proche de l'expiration
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Renouveler le token si nécessaire (moins de 10 minutes restantes)
      if (timeUntilExpiry < 10 * 60 * 1000) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Erreur lors du renouvellement de session:', refreshError);
          await signOut();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la validation de session:', error);
      await signOut();
      return false;
    }
  }, [user, signOut]);

  // Gestion de l'inactivité
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    const timeUntilExpiry = finalConfig.inactivityTimeout - timeSinceLastActivity;

    setTimeUntilExpiry(Math.max(0, timeUntilExpiry));

    // Afficher l'avertissement
    if (timeUntilExpiry <= finalConfig.warningTime && timeUntilExpiry > 0) {
      if (!warningShownRef.current) {
        setShowWarning(true);
        warningShownRef.current = true;
      }
    }

    // Déconnexion automatique
    if (timeSinceLastActivity >= finalConfig.inactivityTimeout) {
      setIsActive(false);
      signOut();
    }
  }, [finalConfig, signOut]);

  // Extension manuelle de la session
  const extendSession = useCallback(() => {
    updateActivity();
    validateSession();
  }, [updateActivity, validateSession]);

  // Configuration des écouteurs d'événements
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Démarrer la vérification périodique
    intervalRef.current = setInterval(() => {
      checkInactivity();
      validateSession();
    }, finalConfig.checkInterval);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, updateActivity, checkInactivity, validateSession, finalConfig.checkInterval]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isActive,
    showWarning,
    timeUntilExpiry: Math.ceil(timeUntilExpiry / 1000), // en secondes
    extendSession,
    updateActivity
  };
};

// Hook pour l'audit des actions utilisateur
export const useAuditLog = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (
    action: string,
    details: Record<string, any> = {},
    severity: 'info' | 'warning' | 'error' = 'info'
  ) => {
    try {
      const clientIP = await getClientIP();
      
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action,
        metadata: details,
        severity: severity === 'info' ? 'low' : severity === 'warning' ? 'medium' : 'high',
        ip_address: clientIP,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
    }
  }, [user]);

  const recordLoginAttempt = useCallback(async (
    email: string,
    success: boolean,
    failureReason?: string
  ) => {
    try {
      const clientIP = await getClientIP();
      
      await supabase.rpc('record_login_attempt', {
        p_email: email,
        p_success: success,
        p_ip_address: clientIP,
        p_user_agent: navigator.userAgent,
        p_failure_reason: failureReason
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la tentative de connexion:', error);
    }
  }, []);

  return { logAction, recordLoginAttempt };
};

// Utilitaire pour obtenir l'IP du client (approximative)
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
};