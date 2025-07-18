/**
 * Types pour le système d'administration
 */

// Types de base pour les événements dans l'interface d'administration
export interface EventListItem {
  id: string;
  title: string;
  ownerName: string;
  ownerEmail: string;
  eventDate: Date;
  guestCount: number;
  status: 'active' | 'completed' | 'flagged' | 'suspended';
  flagReason?: string;
  createdAt: Date;
}

// Types pour la modération de contenu
export interface ModerationItem {
  id: string;
  contentType: 'event' | 'message' | 'image' | 'profile';
  contentId: string;
  reportedBy?: string;
  reportReason: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reviewedBy?: string;
  reviewedAt?: Date;
  automatedFlags?: string[];
  contentPreview: string;
  createdAt: Date;
}

// Interface pour les détails d'utilisateur dans l'administration
export interface AdminUserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'suspended' | 'banned';
  suspensionReason?: string;
  eventsCount: number;
  guestsCount: number;
  subscriptionStatus: string;
  subscriptionEndDate?: string;
  totalRevenue: number;
  accountFlags: string[];
  eventsLast30Days: number;
  guestsLast30Days: number;
  storageUsedBytes: number;
}

// Interface pour les statistiques d'événements
export interface EventMetrics {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  flaggedEvents: number;
  eventsThisMonth: number;
  eventsLastMonth: number;
  averageGuestsPerEvent: number;
  totalGuests: number;
  guestsThisMonth: number;
  guestsLastMonth: number;
}

// Interface pour les analytics d'événement
export interface EventAnalytics {
  eventId: string;
  title: string;
  totalViews: number;
  uniqueVisitors: number;
  rsvpRate: number;
  guestEngagement: {
    totalGuests: number;
    confirmedGuests: number;
    declinedGuests: number;
    pendingGuests: number;
  };
  viewsByDay: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  locationStats: Array<{
    country: string;
    visitors: number;
  }>;
}

// Interface pour les filtres d'événements
export interface EventFilters {
  status?: 'all' | 'active' | 'completed' | 'flagged';
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Interface pour les filtres de modération
export interface ModerationFilters {
  contentType?: 'all' | 'event' | 'message' | 'image' | 'profile';
  status?: 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';
  page?: number;
  pageSize?: number;
}

// Interface pour le hook d'oversight des événements
export interface EventOversightHook {
  events: EventListItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  searchEvents: (query: string) => Promise<void>;
  filterEvents: (filters: Record<string, any>) => Promise<void>;
  flagEvent: (eventId: string, reason: string) => Promise<void>;
  approveEvent: (eventId: string) => Promise<void>;
  getEventAnalytics: (eventId: string) => Promise<EventAnalytics>;
  getContentModerationItems: (filters: ModerationFilters) => Promise<{
    data: ModerationItem[];
    total: number;
  }>;
  flagContent: (contentId: string, contentType: string, reason: string) => Promise<void>;
  getEventMetrics: () => Promise<EventMetrics>;
  scanContent: (content: string, contentType: string) => Promise<{
    isInappropriate: boolean;
    flags: string[];
  }>;
}

// Types pour les actions d'administration
export type AdminActionType = 
  | 'CREATE'
  | 'UPDATE' 
  | 'DELETE'
  | 'FLAG'
  | 'APPROVE'
  | 'SUSPEND'
  | 'UNSUSPEND'
  | 'BAN'
  | 'UNBAN';

export type AdminResourceType = 
  | 'USER'
  | 'EVENT'
  | 'GUEST'
  | 'INVITATION'
  | 'MESSAGE'
  | 'IMAGE'
  | 'PROFILE';

// Interface pour les logs d'audit d'administration
export interface AdminAuditLog {
  id: string;
  adminId: string;
  actionType: AdminActionType;
  resourceType: AdminResourceType;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  createdAt: Date;
}

// Interface pour les statistiques globales d'administration
export interface AdminGlobalStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalEvents: number;
  activeEvents: number;
  flaggedEvents: number;
  totalGuests: number;
  totalInvitations: number;
  pendingModerationItems: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

// Interface pour les options de filtres
export interface FilterOption {
  value: string;
  label: string;
}

// Types pour les statuts d'événements avec couleurs
export type EventStatus = 'active' | 'completed' | 'flagged' | 'suspended';
export type EventStatusColor = 'green' | 'blue' | 'red' | 'yellow';

// Types pour les types de contenu de modération
export type ContentType = 'all' | 'event' | 'message' | 'image' | 'profile';
export type ModerationStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';

// Types pour la santé du système
export interface HealthMetrics {
  apiResponseTime: number;
  databaseConnections: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  activeUsers: number;
  cpuUsage: number;
  diskUsage: number;
  lastUpdated: Date;
  serviceStatus: {
    database: 'operational' | 'degraded' | 'down';
    storage: 'operational' | 'degraded' | 'down';
    authentication: 'operational' | 'degraded' | 'down';
    email: 'operational' | 'degraded' | 'down';
    payments: 'operational' | 'degraded' | 'down';
  };
}

export interface SystemAlert {
  id: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  isResolved: boolean;
  metadata?: Record<string, any>;
}

export interface SystemHealthHook {
  metrics: HealthMetrics | null;
  alerts: SystemAlert[];
  loading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
}

// Interface pour les éléments de liste d'utilisateurs
export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  subscriptionStatus: 'free' | 'premium' | 'pro' | 'enterprise';
  eventsCount: number;
  guestsCount: number;
  createdAt: Date;
  lastLoginAt?: Date;
  suspensionReason?: string;
}

// Interface pour le hook de gestion des utilisateurs
export interface UserManagementHook {
  users: UserListItem[];
  loading: boolean;
  error: string | null;
  searchUsers: (query: string) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  reactivateUser: (userId: string) => Promise<void>;
  getUserDetails: (userId: string) => Promise<import('../types/auth').User>;
}