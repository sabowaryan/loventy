import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { SessionInfo } from "../types/auth";

interface UseAdminSessionsReturn {
  sessions: SessionInfo[] | undefined;
  isLoading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<boolean>;
}

export const useAdminSessions = (): UseAdminSessionsReturn => {
  const { activeSessions, getActiveSessions, terminateSession, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getActiveSessions();
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await terminateSession(sessionId);
      
      if (!result.success) {
        setError(result.error || "Failed to terminate session");
        return false;
      }
      
      // Refresh user data to update sessions list
      await refreshUserData();
      
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sessions: activeSessions,
    isLoading,
    error,
    refreshSessions,
    terminateSession: handleTerminateSession
  };
};
