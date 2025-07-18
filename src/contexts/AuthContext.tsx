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
  SessionInfo,
  UserRoleType,
  SubscriptionPlan,
  PlanChangeRequest,
  UserSubscription
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
    if (state.isAuthenticated && state.roles.some(r => r.role === "admin")) {
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
      window.removeEventListener("mousemove", () => { });
      window.removeEventListener("keydown", () => { });
      window.removeEventListener("click", () => { });
      window.removeEventListener("scroll", () => { });
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
      // Charger le profil utilisateur complet avec rôles, permissions et plan
      const { data: profileData, error: profileError } = await supabase.rpc("get_user_profile_complete", {
        target_user_id: userId
      });

      // Traiter le profil utilisateur
      let userProfile = null;
      if (!profileError && profileData) {
        // La fonction get_user_profile_complete retourne un objet JSON
        userProfile = typeof profileData === 'string' ? JSON.parse(profileData) : profileData;
      }

      // Vérifier si l'utilisateur est suspendu
      const isSuspended = userProfile?.status === "suspended";
      if (isSuspended) {
        // Si l'utilisateur est suspendu, déconnecter et retourner une erreur
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

      // Construire l'objet utilisateur avec les nouvelles propriétés
      const user: User = {
        id: userId,
        email: userProfile?.email || supabaseUser.email || "",
        first_name: userProfile?.first_name || supabaseUser.user_metadata?.first_name || supabaseUser.user_metadata?.given_name || "",
        last_name: userProfile?.last_name || supabaseUser.user_metadata?.last_name || supabaseUser.user_metadata?.family_name || "",
        avatar_url: userProfile?.avatar_url || supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || "",
        phone: userProfile?.phone,
        date_of_birth: userProfile?.date_of_birth,
        timezone: userProfile?.timezone || 'UTC',
        language: userProfile?.language || 'fr',
        roles: [],
        primary_role: 'host',
        subscription: {
          plan: 'free',
          status: 'active',
          started_at: userProfile?.created_at || supabaseUser.created_at,
          max_events: 1,
          max_guests_per_event: 50,
          max_storage_mb: 100,
          features: {
            custom_templates: false,
            analytics: false,
            qr_codes: true,
            email_invitations: true,
            custom_domain: false,
            priority_support: false,
          },
          limits: {
            max_events: 1,
            max_guests_per_event: 50,
            max_storage_mb: 100,
            features: {
              custom_templates: false,
              analytics: false,
              qr_codes: true,
              email_invitations: true,
              custom_domain: false,
              priority_support: false,
            }
          }
        },
        permissions: [],
        is_active: userProfile?.is_active !== false,
        email_verified: userProfile?.email_verified || !!supabaseUser.email_confirmed_at,
        phone_verified: userProfile?.phone_verified || false,
        created_at: userProfile?.created_at || supabaseUser.created_at,
        updated_at: userProfile?.updated_at || supabaseUser.updated_at || supabaseUser.created_at,
        status: userProfile?.status || "active",
        last_login_at: userProfile?.last_login_at || supabaseUser.last_sign_in_at,
      };

      // Traiter les rôles
      let roles: Role[] = [];
      if (userProfile?.roles && Array.isArray(userProfile.roles)) {
        roles = userProfile.roles.map((roleName: string) => ({
          role: roleName as UserRoleType,
          granted_at: user.created_at,
          is_active: true,
        }));
      }

      // Traiter les permissions
      let permissions: Permission[] = [];
      if (userProfile?.permissions && Array.isArray(userProfile.permissions)) {
        permissions = userProfile.permissions.map((permission: any) => ({
          resource: permission.resource,
          action: permission.action,
          conditions: permission.conditions,
        }));
      }

      // Charger le statut MFA pour les admins
      let mfaStatus: MFAStatus | undefined = undefined;
      if (roles.some(r => r.role === 'admin')) {
        try {
          const { data: mfaData, error: mfaError } = await supabase.rpc("get_user_mfa_status");
          if (!mfaError && mfaData) {
            mfaStatus = {
              enabled: mfaData.enabled || false,
              verified: mfaData.verified || false,
              methods: mfaData.methods || [],
              preferredMethod: mfaData.preferred_method,
            };
          }
        } catch (error) {
          console.error("Error loading MFA status:", error);
        }
      }

      // Charger les sessions actives pour les admins
      let activeSessions: SessionInfo[] | undefined = undefined;
      if (roles.some(r => r.role === 'admin')) {
        try {
          const { data: sessionsData, error: sessionsError } = await supabase.rpc("get_user_active_sessions");
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
      const fallbackUser: User = {
        id: userId,
        email: supabaseUser.email || "",
        first_name: supabaseUser.user_metadata?.first_name || supabaseUser.user_metadata?.given_name || "",
        last_name: supabaseUser.user_metadata?.last_name || supabaseUser.user_metadata?.family_name || "",
        avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || "",
        roles: [],
        primary_role: 'host',
        subscription: {
          plan: 'free',
          status: 'active',
          started_at: supabaseUser.created_at,
          max_events: 1,
          max_guests_per_event: 50,
          max_storage_mb: 100,
          features: {
            custom_templates: false,
            analytics: false,
            qr_codes: true,
            email_invitations: true,
            custom_domain: false,
            priority_support: false,
          },
          limits: {
            max_events: 1,
            max_guests_per_event: 50,
            max_storage_mb: 100,
            features: {
              custom_templates: false,
              analytics: false,
              qr_codes: true,
              email_invitations: true,
              custom_domain: false,
              priority_support: false,
            }
          }
        },
        permissions: [],
        is_active: true,
        email_verified: !!supabaseUser.email_confirmed_at,
        phone_verified: false,
        timezone: 'UTC',
        language: 'fr',
        created_at: supabaseUser.created_at,
        updated_at: supabaseUser.updated_at || supabaseUser.created_at,
        status: 'active',
      };

      setState({
        user: fallbackUser,
        roles: [],
        permissions: [],
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
          redirectTo: `${window.location.origin}/auth/callback`,
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
  const hasPermission = (resource: string, action: string): boolean => {
    return state.permissions.some(p => p.resource === resource && p.action === action);
  };

  // Vérifier si l"utilisateur a un rôle
  const hasRole = (role: UserRoleType): boolean => {
    return state.roles.some(r => r.role === role);
  };

  // Vérifier si l"utilisateur est admin
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  // Vérifier si l"utilisateur est super admin
  const isSuperAdmin = (): boolean => {
    return hasRole("super_admin");
  };

  // Vérifier si l"utilisateur admin a une permission spécifique
  const hasAdminPermission = (resource: string, action: string): boolean => {
    return isAdmin() && hasPermission(resource, action);
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
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.avatar_url,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        timezone: data.timezone || 'UTC',
        language: data.language || 'fr',
        is_active: data.is_active !== false,
        email_verified: data.email_verified || false,
        phone_verified: data.phone_verified || false,
        last_login_at: data.last_login_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        roles: [], // Would need to be populated from roles data
        primary_role: 'host', // Would need to be determined from roles
        subscription: {
          plan: 'free',
          status: data.subscription_status || 'active',
          started_at: data.created_at,
          max_events: 1,
          max_guests_per_event: 50,
          max_storage_mb: 100,
          features: {
            custom_templates: false,
            analytics: false,
            qr_codes: true,
            email_invitations: true,
            custom_domain: false,
            priority_support: false,
          },
          limits: {
            max_events: 1,
            max_guests_per_event: 50,
            max_storage_mb: 100,
            features: {
              custom_templates: false,
              analytics: false,
              qr_codes: true,
              email_invitations: true,
              custom_domain: false,
              priority_support: false,
            }
          }
        },
        permissions: [], // Would need to be populated from permissions data
        status: data.status,
        events_count: data.events_count,
        guests_count: data.guests_count,
        events_last_30_days: data.events_last_30_days,
        guests_last_30_days: data.guests_last_30_days,
        storage_used_bytes: data.storage_used_bytes,
        subscription_status: data.subscription_status,
        current_period_end: data.current_period_end,
        suspension_reason: data.suspension_reason,
        is_suspended: data.status === 'suspended',
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

  // Mettre à jour le profil utilisateur
  const updateProfile = async (profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    date_of_birth?: string;
    timezone?: string;
    language?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc("update_user_profile", {
        p_first_name: profileData.first_name,
        p_last_name: profileData.last_name,
        p_phone: profileData.phone,
        p_date_of_birth: profileData.date_of_birth,
        p_timezone: profileData.timezone,
        p_language: profileData.language,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Rafraîchir les données utilisateur
      await refreshUserData();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to update profile" };
    }
  };

  // Obtenir le plan actuel de l'utilisateur (synchrone, basé sur les données en cache)
  const getCurrentPlan = (): UserSubscription | null => {
    return state.user?.subscription || null;
  };

  // Obtenir l'abonnement actuel (alias pour getCurrentPlan)
  const getSubscription = (): UserSubscription | null => {
    return getCurrentPlan();
  };

  // Changer le plan de l'utilisateur
  const changePlan = async (userId: string, newPlan: SubscriptionPlan, expiresAt?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc("change_user_plan", {
        p_user_id: userId,
        p_plan: newPlan,
        p_expires_at: expiresAt
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Rafraîchir les données utilisateur
      await refreshUserData();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to change plan" };
    }
  };

  // Assigner un rôle à un utilisateur (admin seulement)
  const assignRole = async (userId: string, role: UserRoleType, expiresAt?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin()) {
      return { success: false, error: "Access denied: Admin privileges required" };
    }

    try {
      const { data, error } = await supabase.rpc("assign_user_role", {
        p_user_id: userId,
        p_role: role,
        p_expires_at: expiresAt
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to assign role" };
    }
  };

  // Retirer un rôle d'un utilisateur (admin seulement)
  const removeRole = async (userId: string, role: UserRoleType): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin()) {
      return { success: false, error: "Access denied: Admin privileges required" };
    }

    try {
      const { data, error } = await supabase.rpc("remove_user_role", {
        p_user_id: userId,
        p_role: role
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to remove role" };
    }
  };

  // Obtenir les limites du plan actuel
  const getPlanLimits = () => {
    // Valeurs par défaut pour le plan gratuit
    const defaultLimits = {
      maxEvents: 1,
      maxGuestsPerEvent: 50,
      maxInvitations: 10,
      canUseCustomDomain: false,
      canUseAdvancedAnalytics: false,
      canExportData: false,
      storageLimit: 100 * 1024 * 1024, // 100MB
    };

    // TODO: Récupérer les vraies limites depuis la base de données
    // basées sur le plan de l'utilisateur
    return defaultLimits;
  };

  // Suspendre un utilisateur (admin seulement)
  const suspendUser = async (userId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin()) {
      return { success: false, error: "Access denied: Admin privileges required" };
    }

    try {
      const { data, error } = await supabase.rpc("suspend_user", {
        p_user_id: userId,
        p_reason: reason
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to suspend user" };
    }
  };

  // Réactiver un utilisateur suspendu (admin seulement)
  const unsuspendUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin()) {
      return { success: false, error: "Access denied: Admin privileges required" };
    }

    try {
      const { data, error } = await supabase.rpc("unsuspend_user", {
        p_user_id: userId
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to unsuspend user" };
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
    updateProfile,
    isAdmin,
    isSuperAdmin,
    hasAdminPermission,
    getAdminUserDetails,
    suspendUser,
    unsuspendUser,
    terminateSession,
    setupMFA,
    verifyMFA,
    disableMFA,
    getActiveSessions,
    getCurrentPlan,
    getSubscription,
    changePlan,
    assignRole,
    removeRole,
    getPlanLimits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
