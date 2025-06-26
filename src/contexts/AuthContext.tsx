import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AuthContextType, AuthState, User, Role, Permission } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    roles: [],
    permissions: [],
    isLoading: true,
    isAuthenticated: false,
  });

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
      const [profileResult, rolesResult, permissionsResult] = await Promise.allSettled([
        // Charger le profil utilisateur
        supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        
        // Charger les rôles de l'utilisateur
        (async () => {
          try {
            return await supabase.rpc('get_user_roles', { user_uuid: userId });
          } catch (error) {
            return { data: null, error: null };
          }
        })(),
        
        // Charger les permissions de l'utilisateur
        (async () => {
          try {
            return await supabase.rpc('get_user_permissions', { user_uuid: userId });
          } catch (error) {
            return { data: null, error: null };
          }
        })()
      ]);

      // Traiter le profil utilisateur
      let userProfile = null;
      if (profileResult.status === 'fulfilled' && !profileResult.value.error) {
        userProfile = profileResult.value.data;
      }

      // Construire l'objet utilisateur avec les données disponibles
      const user: User = {
        id: userId,
        email: supabaseUser.email || '',
        firstName: userProfile?.first_name || supabaseUser.user_metadata?.first_name || supabaseUser.user_metadata?.given_name || '',
        lastName: userProfile?.last_name || supabaseUser.user_metadata?.last_name || supabaseUser.user_metadata?.family_name || '',
        avatarUrl: userProfile?.avatar_url || supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
        createdAt: userProfile?.created_at || supabaseUser.created_at,
        updatedAt: userProfile?.updated_at || supabaseUser.updated_at || supabaseUser.created_at,
      };

      // Traiter les rôles
      let roles: Role[] = [];
      if (rolesResult.status === 'fulfilled' && rolesResult.value.data) {
        roles = rolesResult.value.data.map((role: any) => ({
          id: role.role_id || '',
          name: role.role_name,
          description: role.role_description || '',
          isSystem: true,
          createdAt: role.assigned_at || '',
          updatedAt: '',
        }));
      }

      // Traiter les permissions
      let permissions: Permission[] = [];
      if (permissionsResult.status === 'fulfilled' && permissionsResult.value.data) {
        permissions = permissionsResult.value.data.map((permission: any) => ({
          id: permission.permission_id || '',
          name: permission.permission_name,
          description: permission.permission_description || '',
          resource: permission.resource,
          action: permission.action,
          createdAt: '',
        }));
      }

      const userData = {
        user,
        roles,
        permissions,
      };

      // Mettre en cache les données
      authCache.set(authCache.session, userData);

      setState({
        ...userData,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback avec données minimales
      const fallbackData = {
        user: {
          id: userId,
          email: supabaseUser.email || '',
          firstName: supabaseUser.user_metadata?.first_name || supabaseUser.user_metadata?.given_name || '',
          lastName: supabaseUser.user_metadata?.last_name || supabaseUser.user_metadata?.family_name || '',
          avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
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
      const useCache = event === 'TOKEN_REFRESHED';
      await loadUserData(session.user, useCache);
    } else {
      // Nettoyer l'état et le cache
      authCache.clear();
      setState({
        user: null,
        roles: [],
        permissions: [],
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // Optimiser l'écoute des changements d'authentification
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Fonction pour initialiser l'authentification
    const initializeAuth = async () => {
      try {
        // Récupérer la session initiale
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted) {
          await handleSessionChange(session);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
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

        console.log('Auth state change:', event, !!session);

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user && session.user.email_confirmed_at) {
              await handleSessionChange(session, event);
            }
            break;
          
          case 'SIGNED_OUT':
            await handleSessionChange(null, event);
            break;
          
          case 'TOKEN_REFRESHED':
            if (session?.user && session.user.email_confirmed_at) {
              await handleSessionChange(session, event);
            }
            break;
          
          case 'USER_UPDATED':
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
      if (subscription && typeof subscription.unsubscribe === 'function') {
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

      // Vérifier si l'email est confirmé
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return { error: 'Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.' };
      }

      return {};
    } catch (error) {
      return { error: 'Une erreur inattendue s\'est produite' };
    }
  };

  // Fonction de connexion avec Google (selon la documentation Supabase)
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile'
        }
      });

      if (error) {
        return { error: error.message };
      }

      // Pour OAuth, la redirection se fait automatiquement
      // Pas besoin de gérer la réponse ici
      return {};
    } catch (error) {
      return { error: 'Une erreur inattendue s\'est produite lors de la connexion avec Google' };
    }
  };

  // Fonction d'inscription optimisée
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
      return { error: 'Une erreur inattendue s\'est produite' };
    }
  };

  // Fonction de déconnexion optimisée
  const signOut = async () => {
    try {
      // Nettoyer le cache et l'état immédiatement pour une UX rapide
      authCache.clear();
      
      setState({
        user: null,
        roles: [],
        permissions: [],
        isLoading: false,
        isAuthenticated: false,
      });

      // Puis effectuer la déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Check if the error is specifically about user not found in JWT
        if (error.message && error.message.includes('User from sub claim in JWT does not exist')) {
          // This is expected when the user's session is invalid or user was deleted
          // Log as warning instead of error since client-side logout still succeeds
          console.warn('User session was already invalid during logout:', error.message);
        } else {
          // Log other errors normally
          console.error('Error signing out:', error);
        }
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Vérifier si l'utilisateur a une permission
  const hasPermission = (permission: string): boolean => {
    return state.permissions.some(p => p.name === permission);
  };

  // Vérifier si l'utilisateur a un rôle
  const hasRole = (role: string): boolean => {
    return state.roles.some(r => r.name === role);
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

  const value: AuthContextType = {
    ...state,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    hasPermission,
    hasRole,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};