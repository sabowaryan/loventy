import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { 
  AuthContextType, 
  AuthState, 
  User, 
  Role, 
  Permission, 
  AdminUserDetails, 
  MFAStatus, 
  SessionInfo 
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Cache global pour éviter les rechargements
const authCache = {
  session: null as Session | null,
  userData: null as any,
  lastUpdate: 0,
  isValid: () => Date.now() - authCache.lastUpdate < 30000, // Cache valide 30 secondes
  clear: () => {
    authCache.session = null;
    authCache.userData = null;
    authCache.lastUpdate = 0;
  },
  set: (session: Session | null, userData: any) => {
    authCache.session = session;
    authCache.userData = userData;
    authCache.lastUpdate = Date.now();
  }
};

// Admin session constants
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const ADMIN_SESSION_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    roles: [],
    permissions: [],
    isLoading: true,
    isAuthenticated: false,
    mfaStatus: undefined,
    activeSessions: undefined,
  });

  // Admin session timeout handler
  useEffect(() => {
    let adminSessionTimer: NodeJS.Timeout | null = null;
    
    // Only set up the timer if the user is authenticated and has admin role
    if (state.isAuthenticated && state.roles.some(r => r.name === "admin")) {
      let lastActivity = Date.now();
      
      // Update last activity on user interaction
      const updateLastActivity = () => {
        lastActivity = Date.now();
      };
      
      // Add event listeners for user activity
      window.addEventListener("mousemove", updateLastActivity);
      window.addEventListener("keydown", updateLastActivity);
      window.addEventListener("click", updateLastActivity);
      window.addEventListener("scroll", updateLastActivity);
      
      // Check session timeout periodically
      adminSessionTimer = setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        
        // If inactive for too long, sign out
        if (inactiveTime >= ADMIN_SESSION_TIMEOUT) {
          console.log("Admin session timeout due to inactivity");
          signOut();
        }
        // If approaching timeout, refresh token to keep session alive if user is active
        else if (inactiveTime < ADMIN_SESSION_REFRESH_THRESHOLD) {
          // Refresh token silently
          supabase.auth.refreshSession();
        }
      }, 60000); // Check every minute
    }
    
    return () => {
      // Clean up event listeners and timer
      if (adminSessionTimer) {
        clearInterval(adminSessionTimer);
      }
      window.removeEventListener("mousemove", () => {});
      window.removeEventListener("keydown", () => {});
      window.removeEventListener("click", () => {});
      window.removeEventListener("scroll", () => {});
    };
  }, [state.isAuthenticated, state.roles]);

  // Fonction optimisée pour charger les données utilisateur
  const loadUserData = async (supabaseUser: SupabaseUser, useCache = true) => {
    const userId = supabaseUser.id;
    
    // Vérifier le cache si demandé
    if (useCache && authCache.isValid() && authCache.userData?.user?.id === userId) {
      setState({
        ...authCache.userData,
        isLoading: false,
        isAuthenticated: true,
      });
      return;
    }

    try {
      // Charger les données en parallèle pour optimiser les performances
      const [profileResult, rolesResult, permissionsResult, mfaStatusResult] = await Promise.allSettled([
        // Charger le profil utilisateur
        supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
        
        // Charger les rôles de l"utilisateur
        (async () => {
          try {
            return await supabase.rpc("get_user_roles", { user_uuid: userId });
          } catch (error) {
            return { data: null, error: null };
          }
        })(),
        
        // Charger les permissions de l"utilisateur
        (async () => {
          try {
            return await supabase.rpc("get_user_permissions", { user_uuid: userId });
          } catch (error) {
            return { data: null, error: null };
          }
        })(),
        
        // Charger le statut MFA (pour les admins)
        (async () => {
          try {
            return await supabase.rpc("get_user_mfa_status", { user_uuid: userId });
          } catch (error) {
            return { data: null, error: null };
          }
        })()
      ]);

      // Traiter le profil utilisateur
      let userProfile = null;
      if (profileResult.status === "fulfilled" && !profileResult.value.error) {
        userProfile = profileResult.value.data;
      }

      // Vérifier si l"utilisateur est suspendu
      const isSuspended = userProfile?.status === "suspended";
      if (isSuspended) {
        // Si l"utilisateur est suspendu, déconnecter et retourner une erreur
        await supabase.auth.signOut();
        setState({
          user: null,
          roles: [],
          permissions: [],
          isLoading: false,
          isAuthenticated: false,
        });
        console.error("User account is suspended");
        return;
      }

      // Construire l"objet utilisateur avec les données disponibles
      const user: User = {
        id: userId,
        email: supabaseUser.email || "",
        firstName: userProfile?.first_name || supabaseUser.user_metadata?.first_name || supabaseUser.user_metadata?.given_name || "",
        lastName: userProfile?.last_name || supabaseUser.user_metadata?.last_name || supabaseUser.user_metadata?.family_name || "",
        avatarUrl: userProfile?.avatar_url || supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || "",
        createdAt: userProfile?.created_at || supabaseUser.created_at,
        updatedAt: userProfile?.updated_at || supabaseUser.updated_at || supabaseUser.created_at,
        status: userProfile?.status || "active",
        lastLoginAt: supabaseUser.last_sign_in_at,
      };

      // Traiter les rôles
      let roles: Role[] = [];
      if (rolesResult.status === "fulfilled" && rolesResult.value.data) {
        roles = rolesResult.value.data.map((role: any) => ({
          id: role.role_id || "",
          name: role.role_name,
          description: role.role_description || "",
          isSystem: true,
          createdAt: role.assigned_at || "",
          updatedAt: "",
        }));
      }

      // Traiter les permissions
      let permissions: Permission[] = [];
      if (permissionsResult.status === "fulfilled" && permissionsResult.value.data) {
        permissions = permissionsResult.value.data.map((permission: any) => ({
          id: permission.permission_id || "",
          name: permission.permission_name,
          description: permission.permission_description || "",
          resource: permission.resource,
          action: permission.action,
          createdAt: "",
        }));
      }

      // Traiter le statut MFA
      let mfaStatus: MFAStatus | undefined = undefined;
      if (mfaStatusResult.status === "fulfilled" && mfaStatusResult.value.data) {
        const mfaData = mfaStatusResult.value.data;
        mfaStatus = {
          enabled: mfaData.enabled || false,
          verified: mfaData.verified || false,
          methods: mfaData.methods || [],
          preferredMethod: mfaData.preferred_method,
        };
      }

      // Charger les sessions actives pour les admins
      let activeSessions: SessionInfo[] | undefined = undefined;
      if (roles.some(r => r.name === "admin")) {
        try {
          const { data: sessionsData, error: sessionsError } = await supabase.rpc("get_user_active_sessions", { user_uuid: userId });
          if (!sessionsError && sessionsData) {
            activeSessions = sessionsData.map((session: any) => ({
              id: session.id,
              createdAt: session.created_at,
              lastActiveAt: session.last_active_at,
              ipAddress: session.ip_address,
              userAgent: session.user_agent,
              expiresAt: session.expires_at,
              isCurrentSession: session.is_current_session,
            }));
          }
        } catch (error) {
          console.error("Error loading user sessions:", error);
        }
      }

      const userData = {
        user,
        roles,
        permissions,
        mfaStatus,
        activeSessions,
      };

      // Mettre en cache les données
      authCache.set(authCache.session, userData);

      setState({
        ...userData,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback avec données minimales
      const fallbackData = {
        user: {
          id: userId,
          email: supabaseUser.email || "",
          firstName: supabaseUser.user_metadata?.first_name || supabaseUser.user_metadata?.given_name || "",
          lastName: supabaseUser.user_metadata?.last_name || supabaseUser.user_metadata?.family_name || "",
          avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || "",
          createdAt: supabaseUser.created_at,
          updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
        },
        roles: [],
        permissions: [],
      };

      setState({
        ...fallbackData,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  };

  // Fonction pour gérer les changements de session
  const handleSessionChange = async (session: Session | null, event?: string) => {
    // Mettre à jour le cache de session
    authCache.session = session;

    if (session?.user && session.user.email_confirmed_at) {
      // Utiliser le cache pour les refresh de token
      const useCache = event === "TOKEN_REFRESHED";
      await loadUserData(session.user, useCache);
    } else {
      // Nettoyer l"état et le cache
      authCache.clear();
      setState({
        user: null,
        roles: [],
        permissions: [],
        isLoading: false,
        isAuthenticated: false,
        mfaStatus: undefined,
        activeSessions: undefined,
      });
    }
  };

  // Optimiser l"écoute des changements d"authentification
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Fonction pour initialiser l"authentification
    const initializeAuth = async () => {
      try {
        // Récupérer la session initiale
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        }

        if (mounted) {
          await handleSessionChange(session);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    // Initialiser immédiatement
    initializeAuth();

    // Écouter les changements de session avec debouncing optimisé
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Debounce pour éviter les appels multiples rapides
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (!mounted) return;

        console.log("Auth state change:", event, !!session);

        switch (event) {
          case "SIGNED_IN":
            if (session?.user && session.user.email_confirmed_at) {
              await handleSessionChange(session, event);
            }
            break;
          
          case "SIGNED_OUT":
            await handleSessionChange(null, event);
            break;
          
          case "TOKEN_REFRESHED":
            if (session?.user && session.user.email_confirmed_at) {
              await handleSessionChange(session, event);
            }
            break;
          
          case "USER_UPDATED":
            if (session?.user && session.user.email_confirmed_at) {
              // Invalider le cache pour forcer le rechargement
              authCache.clear();
              await handleSessionChange(session, event);
            }
            break;
        }
      }, 50); // Debounce très court pour la réactivité
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      // Check if unsubscribe method exists before calling it
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Fonction de connexion optimisée
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Vérifier si l"email est confirmé
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return { error: "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception." };
      }

      return {};
    } catch (error) {
      return { error: "Une erreur inattendue s\"est produite" };
    }
  };

  // Fonction de connexion avec Google (selon la documentation Supabase)
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes: "openid email profile"
        }
      });

      if (error) {
        return { error: error.message };
      }

      // Pour OAuth, la redirection se fait automatiquement
      // Pas besoin de gérer la réponse ici
      return {};
    } catch (error) {
      return { error: "Une erreur inattendue s\"est produite lors de la connexion avec Google" };
    }
  };

  // Fonction d"inscription optimisée
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: "Une erreur inattendue s\"est produite" };
    }
  };

  // Fonction de déconnexion optimisée
  const signOut = async () => {
    try {
      // Nettoyer le cache et l"état immédiatement pour une UX rapide
      authCache.clear();
      
      setState({
        user: null,
        roles: [],
        permissions: [],
        isLoading: false,
        isAuthenticated: false,
        mfaStatus: undefined,
        activeSessions: undefined,
      });

      // Puis effectuer la déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Check if the error is specifically about user not found in JWT
        if (error.message && error.message.includes("User from sub claim in JWT does not exist")) {
          // This is expected when the user"s session is invalid or user was deleted
          // Log as warning instead of error since client-side logout still succeeds
          console.warn("User session was already invalid during logout:", error.message);
        } else {
          // Log other errors normally
          console.error("Error signing out:", error);
        }
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Vérifier si l"utilisateur a une permission
  const hasPermission = (permission: string): boolean => {
    return state.permissions.some(p => p.name === permission);
  };

  // Vérifier si l"utilisateur a un rôle
  const hasRole = (role: string): boolean => {
    return state.roles.some(r => r.name === role);
  };

  // Vérifier si l"utilisateur est admin
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  // Vérifier si l"utilisateur admin a une permission spécifique
  const hasAdminPermission = (permission: string): boolean => {
    return isAdmin() && hasPermission(permission);
  };

  // Rafraîchir les données utilisateur (invalider le cache)
  const refreshUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email_confirmed_at) {
      // Invalider le cache
      authCache.clear();
      await loadUserData(user, false);
    }
  };

  // Obtenir les détails d"un utilisateur pour les admins
  const getAdminUserDetails = async (userId: string): Promise<AdminUserDetails | null> => {
    if (!isAdmin()) {
      console.error("Access denied: Admin privileges required");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("admin_user_overview")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching admin user details:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Map database fields to AdminUserDetails interface
      const adminUserDetails: AdminUserDetails = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        status: data.status,
        suspensionReason: data.suspension_reason,
        eventsCount: data.events_count,
        guestsCount: data.guests_count,
        subscriptionStatus: data.subscription_status,
        subscriptionEndDate: data.current_period_end,
        totalRevenue: 0, // This would need to be calculated from payment history
        accountFlags: [], // This would need to be populated from various sources
        eventsLast30Days: data.events_last_30_days,
        guestsLast30Days: data.guests_last_30_days,
        storageUsedBytes: data.storage_used_bytes,
      };

      return adminUserDetails;
    } catch (error) {
      console.error("Error in getAdminUserDetails:", error);
      return null;
    }
  };

  // Terminer une session utilisateur (pour les admins)
  const terminateSession = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin()) {
      return { success: false, error: "Access denied: Admin privileges required" };
    }

    try {
      const { data, error } = await supabase.rpc("admin_terminate_session", { session_id: sessionId });

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh sessions list
      await refreshUserData();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to terminate session" };
    }
  };

  // Configurer l"authentification multi-facteurs
  const setupMFA = async (method: "totp" | "sms" | "email"): Promise<{ success: boolean; secret?: string; qrCode?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc("setup_mfa", { method_type: method });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        secret: data.secret,
        qrCode: data.qr_code,
      };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to set up MFA" };
    }
  };

  // Vérifier un code MFA
  const verifyMFA = async (code: string, method: "totp" | "sms" | "email"): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc("verify_mfa", { code, method_type: method });

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh user data to update MFA status
      await refreshUserData();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to verify MFA code" };
    }
  };

  // Désactiver l"authentification multi-facteurs
  const disableMFA = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.rpc("disable_mfa");

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh user data to update MFA status
      await refreshUserData();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to disable MFA" };
    }
  };

  // Obtenir les sessions actives
  const getActiveSessions = async (): Promise<{ sessions: SessionInfo[]; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc("get_user_active_sessions");

      if (error) {
        return { sessions: [], error: error.message };
      }

      const sessions: SessionInfo[] = data.map((session: any) => ({
        id: session.id,
        createdAt: session.created_at,
        lastActiveAt: session.last_active_at,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        expiresAt: session.expires_at,
        isCurrentSession: session.is_current_session,
      }));

      return { sessions };
    } catch (error: any) {
      return { sessions: [], error: error.message || "Failed to get active sessions" };
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    hasPermission,
    hasRole,
    refreshUserData,
    isAdmin,
    hasAdminPermission,
    getAdminUserDetails,
    terminateSession,
    setupMFA,
    verifyMFA,
    disableMFA,
    getActiveSessions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
