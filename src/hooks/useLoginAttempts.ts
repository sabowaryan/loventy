/**
 * Hook pour la gestion des tentatives de connexion
 * Protection contre les attaques par force brute
 */

import { useState, useEffect, useCallback } from 'react';

interface LoginAttempt {
  timestamp: number;
  email: string;
  success: boolean;
  ip?: string;
}

interface LoginAttemptsConfig {
  maxAttempts: number;
  lockoutDuration: number; // en millisecondes
  slidingWindow: number; // en millisecondes
}

const DEFAULT_CONFIG: LoginAttemptsConfig = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  slidingWindow: 60 * 60 * 1000 // 1 heure
};

const STORAGE_KEY = 'login_attempts';

export const useLoginAttempts = (config: Partial<LoginAttemptsConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  // Charger les tentatives depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedAttempts = JSON.parse(stored) as LoginAttempt[];
        // Nettoyer les anciennes tentatives
        const now = Date.now();
        const validAttempts = parsedAttempts.filter(
          attempt => now - attempt.timestamp < finalConfig.slidingWindow
        );
        setAttempts(validAttempts);
      } catch (error) {
        console.error('Erreur lors du chargement des tentatives de connexion:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [finalConfig.slidingWindow]);

  // Sauvegarder les tentatives dans le localStorage
  useEffect(() => {
    if (attempts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    }
  }, [attempts]);

  // Vérifier le statut de verrouillage
  useEffect(() => {
    checkLockoutStatus();
  }, [attempts, finalConfig]);

  // Mettre à jour le temps restant
  useEffect(() => {
    if (!isLocked || !lockoutEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, lockoutEndTime - now);
      setRemainingTime(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        setIsLocked(false);
        setLockoutEndTime(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockoutEndTime]);

  const checkLockoutStatus = useCallback(() => {
    const now = Date.now();
    
    // Nettoyer les anciennes tentatives
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < finalConfig.slidingWindow
    );

    if (recentAttempts.length !== attempts.length) {
      setAttempts(recentAttempts);
    }

    // Vérifier les tentatives échouées récentes
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    
    if (failedAttempts.length >= finalConfig.maxAttempts) {
      const lastFailedAttempt = failedAttempts[failedAttempts.length - 1];
      const lockoutEnd = lastFailedAttempt.timestamp + finalConfig.lockoutDuration;
      
      if (now < lockoutEnd) {
        setIsLocked(true);
        setLockoutEndTime(lockoutEnd);
        setRemainingTime(Math.ceil((lockoutEnd - now) / 1000));
      } else {
        setIsLocked(false);
        setLockoutEndTime(null);
      }
    } else {
      setIsLocked(false);
      setLockoutEndTime(null);
    }
  }, [attempts, finalConfig]);

  const recordAttempt = useCallback((email: string, success: boolean, ip?: string) => {
    const newAttempt: LoginAttempt = {
      timestamp: Date.now(),
      email: email.toLowerCase(),
      success,
      ip
    };

    setAttempts(prev => [...prev, newAttempt]);

    // Si la connexion réussit, nettoyer les tentatives échouées pour cet email
    if (success) {
      setTimeout(() => {
        setAttempts(prev => prev.filter(attempt => 
          attempt.email !== email.toLowerCase() || attempt.success
        ));
      }, 1000);
    }
  }, []);

  const getAttemptsForEmail = useCallback((email: string) => {
    const now = Date.now();
    return attempts.filter(attempt => 
      attempt.email === email.toLowerCase() &&
      now - attempt.timestamp < finalConfig.slidingWindow
    );
  }, [attempts, finalConfig.slidingWindow]);

  const getFailedAttemptsCount = useCallback((email?: string) => {
    const now = Date.now();
    let filteredAttempts = attempts.filter(attempt => 
      !attempt.success && 
      now - attempt.timestamp < finalConfig.slidingWindow
    );

    if (email) {
      filteredAttempts = filteredAttempts.filter(attempt => 
        attempt.email === email.toLowerCase()
      );
    }

    return filteredAttempts.length;
  }, [attempts, finalConfig.slidingWindow]);

  const clearAttempts = useCallback((email?: string) => {
    if (email) {
      setAttempts(prev => prev.filter(attempt => 
        attempt.email !== email.toLowerCase()
      ));
    } else {
      setAttempts([]);
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLocked(false);
    setLockoutEndTime(null);
  }, []);

  const getRemainingAttempts = useCallback((email?: string) => {
    const failedCount = getFailedAttemptsCount(email);
    return Math.max(0, finalConfig.maxAttempts - failedCount);
  }, [getFailedAttemptsCount, finalConfig.maxAttempts]);

  const formatRemainingTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }, []);

  return {
    isLocked,
    remainingTime,
    remainingAttempts: getRemainingAttempts(),
    recordAttempt,
    getAttemptsForEmail,
    getFailedAttemptsCount,
    getRemainingAttempts,
    clearAttempts,
    formatRemainingTime,
    maxAttempts: finalConfig.maxAttempts
  };
};

// Hook pour obtenir l'IP du client (approximative)
export const useClientIP = () => {
  const [ip, setIP] = useState<string>('unknown');

  useEffect(() => {
    const getIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIP(data.ip || 'unknown');
      } catch (error) {
        console.warn('Impossible d\'obtenir l\'IP du client:', error);
        setIP('unknown');
      }
    };

    getIP();
  }, []);

  return ip;
};