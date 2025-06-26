import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getProductByPriceId, getDefaultLimits, isUnlimited, StripeProduct } from '../stripe-config';

interface UsageStats {
  invitations: number;
  guests: number;
  emailsSent: number;
  storageUsed: number; // in MB
}

interface PlanLimits extends StripeProduct['limits'] {
  isActive: boolean;
  usage: UsageStats;
  canCreate: {
    invitation: boolean;
    guest: boolean;
  };
  percentageUsed: {
    invitations: number;
    guests: number;
    emails: number;
    storage: number;
  };
}

interface QuotaInfo {
  used: number;
  total: number;
  percent: number;
  isUnlimited: boolean;
  unit?: string;
}

// Valeurs par défaut pour éviter les null checks
const defaultUsageStats: UsageStats = {
  invitations: 0,
  guests: 0,
  emailsSent: 0,
  storageUsed: 0
};

const defaultPlanLimits: PlanLimits = {
  ...getDefaultLimits(),
  isActive: false,
  usage: defaultUsageStats,
  canCreate: { invitation: false, guest: false },
  percentageUsed: { invitations: 0, guests: 0, emails: 0, storage: 0 }
};

export const usePlanLimits = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<PlanLimits>(defaultPlanLimits);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  // Fonction pour calculer le pourcentage d'utilisation
  const calculatePercentage = useCallback((used: number, limit: number): number => {
    if (isUnlimited(limit)) return 0;
    if (limit === 0) return 100;
    return Math.min(Math.round((used / limit) * 100), 100);
  }, []);

  // Fonction pour déterminer ce qui peut être créé
  const getCanCreate = useCallback((usage: UsageStats, planLimits: StripeProduct['limits']) => ({
    invitation: isUnlimited(planLimits.invitations) || usage.invitations < planLimits.invitations,
    guest: isUnlimited(planLimits.guests) || usage.guests < planLimits.guests
  }), []);

  // Fonction pour calculer les pourcentages d'utilisation
  const getPercentageUsed = useCallback((usage: UsageStats, planLimits: StripeProduct['limits']) => ({
    invitations: calculatePercentage(usage.invitations, planLimits.invitations),
    guests: calculatePercentage(usage.guests, planLimits.guests),
    emails: calculatePercentage(usage.emailsSent, planLimits.emailsPerMonth),
    storage: calculatePercentage(usage.storageUsed, planLimits.storage)
  }), [calculatePercentage]);

  // Fonction pour charger les statistiques d'utilisation
  const loadUsageStats = useCallback(async (): Promise<UsageStats> => {
    if (!user) {
      return defaultUsageStats;
    }

    try {
      // Charger le nombre d'invitations créées ce mois
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Exécuter les requêtes en parallèle pour de meilleures performances
      const [invitationsResult, guestsResult, emailsResult, storageResult] = await Promise.allSettled([
        supabase
          .from('invitations')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString()),
        
        supabase
          .from('guests')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        
        supabase
          .from('email_logs')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('sent_at', startOfMonth.toISOString()),
        
        supabase
          .from('user_files')
          .select('file_size')
          .eq('user_id', user.id)
      ]);

      // Gérer les erreurs potentielles
      if (invitationsResult.status === 'rejected') {
        console.error('Error loading invitations count:', invitationsResult.reason);
      }
      
      if (guestsResult.status === 'rejected') {
        console.error('Error loading guests count:', guestsResult.reason);
      }
      
      if (emailsResult.status === 'rejected') {
        console.error('Error loading emails count:', emailsResult.reason);
      }
      
      if (storageResult.status === 'rejected') {
        console.error('Error loading storage usage:', storageResult.reason);
      }

      // Extraire les résultats
      const invitationsCount = invitationsResult.status === 'fulfilled' ? invitationsResult.value.count || 0 : 0;
      const guestsCount = guestsResult.status === 'fulfilled' ? guestsResult.value.count || 0 : 0;
      const emailsCount = emailsResult.status === 'fulfilled' ? emailsResult.value.count || 0 : 0;
      
      // Calculer l'utilisation du stockage en MB
      const storageUsed = storageResult.status === 'fulfilled' && storageResult.value.data
        ? storageResult.value.data.reduce((total, file) => total + (file.file_size || 0), 0)
        : 0;
      
      const storageUsedMB = Math.round(storageUsed / (1024 * 1024));

      return {
        invitations: invitationsCount,
        guests: guestsCount,
        emailsSent: emailsCount,
        storageUsed: storageUsedMB
      };
    } catch (error) {
      console.error('Error loading usage stats:', error);
      return defaultUsageStats;
    }
  }, [user]);

  // Fonction pour charger les limites du plan actuel
  const loadPlanLimits = useCallback(async () => {
    if (!user) {
      setLimits(defaultPlanLimits);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Charger l'utilisation actuelle en premier
      const usage = await loadUsageStats();

      // Charger l'abonnement actuel
      const { data: subscription, error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        console.warn('Error fetching subscription:', subError);
      }

      // Déterminer les limites basées sur l'abonnement
      let planLimits = getDefaultLimits();
      let isActive = false;

      if (subscription?.price_id) {
        const product = getProductByPriceId(subscription.price_id);
        if (product) {
          planLimits = product.limits;
          isActive = subscription.subscription_status === 'active';
        } else {
          console.warn(`Product not found for price_id: ${subscription.price_id}`);
        }
      }

      // Si l'abonnement n'est pas actif, utiliser les limites du plan gratuit
      if (!isActive) {
        planLimits = getDefaultLimits();
      }

      // Calculer les pourcentages d'utilisation
      const percentageUsed = getPercentageUsed(usage, planLimits);

      // Déterminer ce qui peut être créé
      const canCreate = getCanCreate(usage, planLimits);

      setLimits({
        ...planLimits,
        isActive,
        usage,
        canCreate,
        percentageUsed
      });
    } catch (err) {
      console.error('Error loading plan limits:', err, { user });
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des limites');
      
      // En cas d'erreur, utiliser les limites par défaut
      const usage = await loadUsageStats();
      const defaultLimits = getDefaultLimits();
      
      setLimits({
        ...defaultLimits,
        isActive: false,
        usage,
        canCreate: getCanCreate(usage, defaultLimits),
        percentageUsed: getPercentageUsed(usage, defaultLimits)
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, loadUsageStats, getPercentageUsed, getCanCreate]);

  // Fonction pour vérifier si une action est autorisée
  const checkLimit = useCallback((action: 'invitation' | 'guest' | 'email' | 'storage', amount: number = 1): boolean => {
    if (!limits) return false;

    switch (action) {
      case 'invitation':
        return isUnlimited(limits.invitations) || (limits.usage.invitations + amount) <= limits.invitations;
      case 'guest':
        return isUnlimited(limits.guests) || (limits.usage.guests + amount) <= limits.guests;
      case 'email':
        return isUnlimited(limits.emailsPerMonth) || (limits.usage.emailsSent + amount) <= limits.emailsPerMonth;
      case 'storage':
        return isUnlimited(limits.storage) || (limits.usage.storageUsed + amount) <= limits.storage;
      default:
        return false;
    }
  }, [limits]);

  // Fonction pour obtenir le message d'erreur de limite
  const getLimitMessage = useCallback((action: 'invitation' | 'guest' | 'email' | 'storage'): string => {
    if (!limits) return 'Limites non disponibles';

    switch (action) {
      case 'invitation':
        if (isUnlimited(limits.invitations)) return '';
        return `Limite atteinte: ${limits.usage.invitations}/${limits.invitations} invitations ce mois`;
      case 'guest':
        if (isUnlimited(limits.guests)) return '';
        return `Limite atteinte: ${limits.usage.guests}/${limits.guests} invités maximum`;
      case 'email':
        if (isUnlimited(limits.emailsPerMonth)) return '';
        return `Limite atteinte: ${limits.usage.emailsSent}/${limits.emailsPerMonth} emails ce mois`;
      case 'storage':
        if (isUnlimited(limits.storage)) return '';
        return `Limite atteinte: ${limits.usage.storageUsed}/${limits.storage} MB de stockage`;
      default:
        return 'Limite inconnue';
    }
  }, [limits]);

  // Fonction pour obtenir les informations de quota pour l'UI
  const getQuota = useCallback((action: 'invitation' | 'guest' | 'email' | 'storage'): QuotaInfo | null => {
    if (!limits) return null;
    
    const { usage } = limits;
    
    switch (action) {
      case 'invitation':
        return {
          used: usage.invitations,
          total: limits.invitations,
          percent: limits.percentageUsed.invitations,
          isUnlimited: isUnlimited(limits.invitations)
        };
      case 'guest':
        return {
          used: usage.guests,
          total: limits.guests,
          percent: limits.percentageUsed.guests,
          isUnlimited: isUnlimited(limits.guests)
        };
      case 'email':
        return {
          used: usage.emailsSent,
          total: limits.emailsPerMonth,
          percent: limits.percentageUsed.emails,
          isUnlimited: isUnlimited(limits.emailsPerMonth)
        };
      case 'storage':
        return {
          used: usage.storageUsed,
          total: limits.storage,
          percent: limits.percentageUsed.storage,
          isUnlimited: isUnlimited(limits.storage),
          unit: 'MB'
        };
      default:
        return null;
    }
  }, [limits]);

  // Fonction pour rafraîchir les limites
  const refreshLimits = useCallback(() => {
    setIsRefreshing(true);
    loadPlanLimits();
  }, [loadPlanLimits]);

  // Charger les limites au montage et quand l'utilisateur change
  useEffect(() => {
    loadPlanLimits();
  }, [loadPlanLimits]);

  // Écouter les changements dans la base de données en temps réel
  useEffect(() => {
    if (!user) return;

    // Nettoyer l'ancien canal s'il existe
    if (channelRef.current) {
      console.log('Cleaning up existing channel subscription');
      try {
        // Check if unsubscribe method exists before calling it
        if (channelRef.current && typeof channelRef.current.unsubscribe === 'function') {
          channelRef.current.unsubscribe();
        }
      } catch (err) {
        console.error('Error cleaning up channel:', err);
      }
      channelRef.current = null;
    }

    // Créer un seul canal pour toutes les tables
    const channelId = `plan-limits-changes-${user.id}`;
    
    try {
      const channel = supabase.channel(channelId);

      // Configurer les écouteurs d'événements
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stripe_subscriptions',
            filter: `customer_id=in.(select customer_id from stripe_customers where user_id=eq.${user.id})`
          },
          () => {
            console.log('Subscription changed, refreshing limits...');
            refreshLimits();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invitations',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Invitations changed, refreshing limits...');
            refreshLimits();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guests',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Guests changed, refreshing limits...');
            refreshLimits();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'email_logs',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Email logs changed, refreshing limits...');
            refreshLimits();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_files',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('User files changed, refreshing limits...');
            refreshLimits();
          }
        );

      // Stocker la référence du canal
      channelRef.current = channel;

      // S'abonner au canal seulement s'il est dans l'état 'closed'
      if (!channel.state || channel.state === 'closed') {
        channel.subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });
      } else {
        console.log('Channel already in state:', channel.state, 'not subscribing again');
      }
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
    }

    // Nettoyer l'abonnement lors du démontage
    return () => {
      console.log('Cleaning up channel subscription on unmount');
      if (channelRef.current) {
        try {
          // Check if unsubscribe method exists before calling it
          if (typeof channelRef.current.unsubscribe === 'function') {
            channelRef.current.unsubscribe();
          }
        } catch (err) {
          console.error('Error unsubscribing from channel:', err);
        }
        channelRef.current = null;
      }
    };
  }, [user, refreshLimits]);

  // Mémoiser les valeurs dérivées pour éviter les recalculs inutiles
  const quotas = useMemo(() => ({
    invitation: getQuota('invitation'),
    guest: getQuota('guest'),
    email: getQuota('email'),
    storage: getQuota('storage')
  }), [getQuota]);

  const features = useMemo(() => ({
    canCreateInvitation: limits?.canCreate?.invitation ?? false,
    canAddGuest: limits?.canCreate?.guest ?? false,
    hasAnalytics: limits?.analytics ?? false,
    hasCustomDomain: limits?.customDomain ?? false,
    supportLevel: limits?.support ?? 'basic'
  }), [limits]);

  return {
    limits,
    isLoading,
    isRefreshing,
    error,
    checkLimit,
    getLimitMessage,
    refreshLimits,
    getQuota,
    quotas,
    features,
    // Helpers pour les vérifications courantes
    canCreateInvitation: limits?.canCreate?.invitation ?? false,
    canAddGuest: limits?.canCreate?.guest ?? false,
    hasAnalytics: limits?.analytics ?? false,
    hasCustomDomain: limits?.customDomain ?? false,
    supportLevel: limits?.support ?? 'basic'
  };
};