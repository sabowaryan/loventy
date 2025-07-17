/**
 * Admin Types and Interfaces
 * This file contains TypeScript interfaces for admin data models, error handling, 
 * component props, and hook return types.
 */

import { User } from './auth';

// ============================================================================
// Admin Data Models
// ============================================================================

/**
 * Admin statistics overview
 */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  monthlyRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  newUsersLast30Days: number;
  newEventsLast30Days: number;
  activeSubscriptions: number;
  averageResponseTime: number;
  storageUsed: number;
  totalStorage: number;
}

/**
 * System health metrics
 */
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

/**
 * System alert notification
 */
export interface SystemAlert {
  id: string;
  alertType: 'security' | 'performance' | 'error' | 'notification';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * User activity log entry
 */
export interface UserActivityLog {
  id: string;
  userId: string;
  activityType: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Admin audit log entry
 */
export interface AuditLogEntry {
  id: string;
  adminId: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Financial metrics for admin dashboard
 */
export interface FinancialMetrics {
  totalRevenue: number;
  subscriptionRevenue: number;
  oneTimePayments: number;
  refunds: number;
  churnRate: number;
  conversionRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  period: 'day' | 'week' | 'month' | 'year';
  comparisonPercentage: number;
}

/**
 * Content moderation item
 */
export interface ModerationItem {
  id: string;
  contentType: 'event' | 'message' | 'image' | 'profile';
  contentId: string;
  reportedBy?: string;
  reportReason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reviewedBy?: string;
  reviewedAt?: Date;
  automatedFlags?: string[];
  contentPreview: string;
  createdAt: Date;
}

/**
 * Support ticket for admin management
 */
export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  description: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  messages: SupportMessage[];
}

/**
 * Support ticket message
 */
export interface SupportMessage {
  id: string;
  ticketId: string;
  sender: 'user' | 'admin';
  senderId: string;
  message: string;
  attachments?: string[];
  createdAt: Date;
}

/**
 * User list item for admin management
 */
export interface UserListItem {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  subscriptionType: 'free' | 'premium';
  lastLogin: Date;
  eventsCount: number;
  joinDate: Date;
  avatarUrl?: string;
}

/**
 * Event list item for admin oversight
 */
export interface EventListItem {
  id: string;
  title: string;
  ownerName: string;
  ownerEmail: string;
  eventDate: Date;
  guestCount: number;
  status: 'active' | 'completed' | 'flagged';
  flagReason?: string;
  createdAt: Date;
}

// ============================================================================
// Admin Error Types
// ============================================================================

/**
 * Admin-specific error types
 */
export enum AdminErrorType {
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  AUDIT_LOG_FAILURE = 'AUDIT_LOG_FAILURE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INVALID_OPERATION = 'INVALID_OPERATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

/**
 * Admin error interface
 */
export interface AdminError {
  type: AdminErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  adminId: string;
  action: string;
  statusCode?: number;
  recoverable: boolean;
  correlationId?: string;
}

/**
 * Admin error boundary state
 */
export interface AdminErrorBoundaryState {
  hasError: boolean;
  error?: AdminError;
  errorInfo?: any;
}

// ============================================================================
// Admin Component Props
// ============================================================================

/**
 * Admin dashboard component props
 */
export interface AdminDashboardProps {
  children?: React.ReactNode;
}

/**
 * User management component props
 */
export interface UserManagementProps {
  searchQuery?: string;
  filterStatus?: 'all' | 'active' | 'suspended' | 'pending';
}

/**
 * Event oversight component props
 */
export interface EventOversightProps {
  dateRange?: { start: Date; end: Date };
  statusFilter?: 'all' | 'active' | 'completed' | 'flagged';
}

/**
 * System health component props
 */
export interface SystemHealthProps {
  refreshInterval?: number;
}

/**
 * Financial dashboard component props
 */
export interface FinancialDashboardProps {
  period: 'day' | 'week' | 'month' | 'year';
}

/**
 * Admin layout component props
 */
export interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin route protection wrapper props
 */
export interface AdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * Content moderation component props
 */
export interface ContentModerationProps {
  contentType?: 'all' | 'event' | 'message' | 'image' | 'profile';
  status?: 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';
}

/**
 * Support management component props
 */
export interface SupportManagementProps {
  category?: string;
  status?: 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Admin error boundary props
 */
export interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: AdminError, errorInfo: any) => void;
}

// ============================================================================
// Admin Hook Return Types
// ============================================================================

/**
 * Admin stats hook return type
 */
export interface AdminStatsHook {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * User management hook return type
 */
export interface UserManagementHook {
  users: UserListItem[];
  loading: boolean;
  error: string | null;
  searchUsers: (query: string) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  reactivateUser: (userId: string) => Promise<void>;
  getUserDetails: (userId: string) => Promise<User>;
  filterUsers?: (filters: Record<string, any>) => Promise<void>;
  getUserActivity?: (userId: string) => Promise<any[]>;
  updateUser?: (userId: string, updates: Partial<any>) => Promise<void>;
  deleteUser?: (userId: string) => Promise<void>;
}

/**
 * System health hook return type
 */
export interface SystemHealthHook {
  metrics: HealthMetrics | null;
  alerts: SystemAlert[];
  loading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
}

/**
 * Event oversight hook return type
 */
export interface EventOversightHook {
  events: EventListItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  searchEvents: (query: string) => Promise<void>;
  filterEvents: (filters: Record<string, any>) => Promise<void>;
  flagEvent: (eventId: string, reason: string) => Promise<void>;
  approveEvent: (eventId: string) => Promise<void>;
  getEventAnalytics: (eventId: string) => Promise<any>;
  getContentModerationItems: (filterOptions: {
    contentType?: 'all' | 'event' | 'message' | 'image' | 'profile';
    status?: 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';
    page?: number;
    pageSize?: number;
  }) => Promise<{ data: ModerationItem[]; total: number }>;
  flagContent: (contentId: string, contentType: string, reason: string) => Promise<void>;
  getEventMetrics: () => Promise<any>;
  scanContent: (content: string, contentType: string) => Promise<{ isInappropriate: boolean; flags: string[] }>;
}

/**
 * Financial management hook return type
 */
export interface FinancialManagementHook {
  metrics: FinancialMetrics | null;
  loading: boolean;
  error: string | null;
  refreshMetrics: (period: 'day' | 'week' | 'month' | 'year') => Promise<void>;
  processRefund: (paymentId: string, amount: number, reason: string) => Promise<void>;
  getSubscriptionDetails: (subscriptionId: string) => Promise<any>;
}

/**
 * Content moderation hook return type
 */
export interface ContentModerationHook {
  items: ModerationItem[];
  loading: boolean;
  error: string | null;
  fetchItems: (filters: Record<string, any>) => Promise<void>;
  approveContent: (itemId: string) => Promise<void>;
  rejectContent: (itemId: string, reason: string) => Promise<void>;
  flagContent: (contentId: string, contentType: string, reason: string) => Promise<void>;
}

/**
 * Support management hook return type
 */
export interface SupportManagementHook {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  fetchTickets: (filters: Record<string, any>) => Promise<void>;
  assignTicket: (ticketId: string, adminId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
  replyToTicket: (ticketId: string, message: string) => Promise<void>;
}

/**
 * Audit log hook return type
 */
export interface AuditLogHook {
  logs: AuditLogEntry[];
  loading: boolean;
  error: string | null;
  fetchLogs: (filters: Record<string, any>) => Promise<void>;
  exportLogs: (format: 'csv' | 'json') => Promise<string>;
}

/**
 * Platform configuration hook return type
 */
export interface PlatformConfigHook {
  settings: Record<string, any>;
  featureFlags: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  updateSetting: (key: string, value: any) => Promise<void>;
  toggleFeatureFlag: (key: string, enabled: boolean) => Promise<void>;
  applyMaintenanceMode: (enabled: boolean, message?: string) => Promise<void>;
}