import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { MFAStatus } from "../types/auth";

interface UseMFAReturn {
  mfaStatus: MFAStatus | undefined;
  isLoading: boolean;
  error: string | null;
  setupMFA: (method: "totp" | "sms" | "email") => Promise<{ success: boolean; secret?: string; qrCode?: string }>;
  verifyMFA: (code: string, method: "totp" | "sms" | "email") => Promise<boolean>;
  disableMFA: () => Promise<boolean>;
}

export const useMFA = (): UseMFAReturn => {
  const { mfaStatus, setupMFA, verifyMFA, disableMFA } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupMFA = async (method: "totp" | "sms" | "email") => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await setupMFA(method);
      
      if (!result.success) {
        setError(result.error || "Failed to set up MFA");
        return { success: false };
      }
      
      return {
        success: true,
        secret: result.secret,
        qrCode: result.qrCode
      };
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async (code: string, method: "totp" | "sms" | "email") => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await verifyMFA(code, method);
      
      if (!result.success) {
        setError(result.error || "Failed to verify MFA code");
        return false;
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await disableMFA();
      
      if (!result.success) {
        setError(result.error || "Failed to disable MFA");
        return false;
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mfaStatus,
    isLoading,
    error,
    setupMFA: handleSetupMFA,
    verifyMFA: handleVerifyMFA,
    disableMFA: handleDisableMFA
  };
};
