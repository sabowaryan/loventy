export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  timezone?: string;
  language?: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
  primary_role: UserRoleType;
  subscription: UserSubscription;
  permissions: Permission[];
  status: "active" | "suspended" | "expired";
}

export type UserRoleType = 'super_admin' | 'admin' | 'moderator' | 'host' | 'guest' | 'support';

export type SubscriptionPlan = 'free' | 'premium' | 'pro' | 'enterprise';

export type PlanStatus = 'active' | 'trial' | 'expired' | 'cancelled' | 'suspended';

export interface Role {
  role: UserRoleType;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: PlanStatus;
  started_at: string;
  expires_at?: string;
  trial_ends_at?: string;
  max_events: number;
  max_guests_per_event: number;
  max_storage_mb: number;
  features: PlanFeatures;
  limits: PlanLimits;
}

export interface PlanLimits {
  max_events: number;
  max_guests_per_event: number;
  max_storage_mb: number;
  features: PlanFeatures;
}

export interface PlanFeatures {
  custom_templates: boolean;
  analytics: boolean;
  qr_codes: boolean;
  email_invitations: boolean;
  custom_domain: boolean;
  priority_support: boolean;
  white_label?: boolean;
  api_access?: boolean;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface AdminUserDetails extends User {
  events_count: number;
  guests_count: number;
  events_last_30_days: number;
  guests_last_30_days: number;
  storage_used_bytes: number;
  subscription_status: PlanStatus;
  current_period_end?: string;
  suspension_reason?: string;
  is_suspended: boolean;
  // Additional admin-specific fields
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MFAStatus {
  enabled: boolean;
  verified: boolean;
  methods: Array<"totp" | "sms" | "email">;
  preferredMethod?: "totp" | "sms" | "email";
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  isCurrentSession: boolean;
}

export interface AuthState {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  isAuthenticated: boolean;
  mfaStatus?: MFAStatus;
  activeSessions?: SessionInfo[];
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRoleType) => boolean;
  refreshUserData: () => Promise<void>;
  
  // Profile management
  updateProfile: (profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    date_of_birth?: string;
    timezone?: string;
    language?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  // Plan management
  getCurrentPlan: () => UserSubscription | null;
  getSubscription: () => UserSubscription | null;
  getPlanLimits: () => {
    maxEvents: number;
    maxGuestsPerEvent: number;
    maxInvitations: number;
    canUseCustomDomain: boolean;
    canUseAdvancedAnalytics: boolean;
    canExportData: boolean;
    storageLimit: number;
  };
  changePlan: (userId: string, newPlan: SubscriptionPlan, expiresAt?: string) => Promise<{ success: boolean; error?: string }>;
  
  // Role management
  assignRole: (userId: string, role: UserRoleType, expiresAt?: string) => Promise<{ success: boolean; error?: string }>;
  removeRole: (userId: string, role: UserRoleType) => Promise<{ success: boolean; error?: string }>;
  
  // Admin-specific methods
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  hasAdminPermission: (resource: string, action: string) => boolean;
  getAdminUserDetails: (userId: string) => Promise<AdminUserDetails | null>;
  suspendUser: (userId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  unsuspendUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  terminateSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  
  // MFA methods (simplified stubs)
  setupMFA: (method: "totp" | "sms" | "email") => Promise<{ success: boolean; secret?: string; qrCode?: string; error?: string }>;
  verifyMFA: (code: string, method: "totp" | "sms" | "email") => Promise<{ success: boolean; error?: string }>;
  disableMFA: () => Promise<{ success: boolean; error?: string }>;
  getActiveSessions: () => Promise<{ sessions: SessionInfo[]; error?: string }>;
}

// Nouvelles interfaces pour le système de gestion des plans et rôles
export interface RoleAssignment {
  id: string;
  user_id: string;
  role: UserRoleType;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  metadata: Record<string, any>;
}

export interface PlanChangeRequest {
  user_id: string;
  new_plan: SubscriptionPlan;
  expires_at?: string;
  reason?: string;
}

export interface UserManagementActions {
  suspend: (userId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  unsuspend: (userId: string) => Promise<{ success: boolean; error?: string }>;
  changePlan: (request: PlanChangeRequest) => Promise<{ success: boolean; error?: string }>;
  assignRole: (userId: string, role: UserRoleType, expiresAt?: string) => Promise<{ success: boolean; error?: string }>;
  removeRole: (userId: string, role: UserRoleType) => Promise<{ success: boolean; error?: string }>;
}
