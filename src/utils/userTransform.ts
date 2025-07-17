/**
 * User data transformation utilities for admin user management
 */

import { User, AdminUserDetails } from '../types/auth';
import { UserListItem } from '../types/admin';

/**
 * Transform database user record to User interface
 */
export const transformDatabaseUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name || '',
    lastName: dbUser.last_name || '',
    avatarUrl: dbUser.avatar_url || '',
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at || dbUser.created_at,
    status: dbUser.status || 'active',
    lastLoginAt: dbUser.last_login_at
  };
};

/**
 * Transform database user record to AdminUserDetails interface
 */
export const transformAdminUserDetails = (dbUser: any): AdminUserDetails => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name || '',
    lastName: dbUser.last_name || '',
    avatarUrl: dbUser.avatar_url || '',
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at || dbUser.created_at,
    status: dbUser.status || 'active',
    suspensionReason: dbUser.suspension_reason,
    lastLoginAt: dbUser.last_login_at,
    eventsCount: dbUser.events_count || 0,
    guestsCount: dbUser.guests_count || 0,
    subscriptionStatus: dbUser.subscription_status || 'free',
    subscriptionEndDate: dbUser.current_period_end,
    totalRevenue: dbUser.total_revenue || 0,
    accountFlags: dbUser.account_flags || [],
    eventsLast30Days: dbUser.events_last_30_days || 0,
    guestsLast30Days: dbUser.guests_last_30_days || 0,
    storageUsedBytes: dbUser.storage_used_bytes || 0
  };
};

/**
 * Transform database user record to UserListItem interface
 */
export const transformUserListItem = (dbUser: any): UserListItem => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || dbUser.email.split('@')[0],
    status: dbUser.status || 'active',
    subscriptionType: dbUser.subscription_status === 'premium' ? 'premium' : 'free',
    lastLogin: dbUser.last_login_at ? new Date(dbUser.last_login_at) : new Date(dbUser.created_at),
    eventsCount: dbUser.events_count || 0,
    joinDate: new Date(dbUser.created_at)
  };
};

/**
 * Format user name for display
 */
export const formatUserName = (user: User | AdminUserDetails | UserListItem | null): string => {
  if (!user) return 'Unknown User';
  
  if ('firstName' in user && 'lastName' in user) {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  
  if ('name' in user && user.name) {
    return user.name;
  }
  
  if ('email' in user) {
    return user.email.split('@')[0];
  }
  
  return 'Unknown User';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format subscription status for display
 */
export const formatSubscriptionStatus = (status: string | undefined): string => {
  if (!status) return 'Free';
  
  switch (status) {
    case 'premium':
      return 'Premium';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Free';
  }
};

/**
 * Format user status for display
 */
export const formatUserStatus = (status: string | undefined): string => {
  if (!status) return 'Active';
  
  switch (status) {
    case 'active':
      return 'Active';
    case 'suspended':
      return 'Suspended';
    case 'pending':
      return 'Pending';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Get user initials for avatar fallback
 */
export const getUserInitials = (user: User | AdminUserDetails | UserListItem | null): string => {
  if (!user) return '?';
  
  if ('firstName' in user && 'lastName' in user) {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
  }
  
  if ('name' in user && user.name) {
    const nameParts = user.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  if ('email' in user) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return '?';
};