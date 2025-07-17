/**
 * User filtering and sorting utilities for admin user management
 */

import { UserListItem } from '../types/admin';

/**
 * Available user status filter options
 */
export const userStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' }
];

/**
 * Available user subscription filter options
 */
export const userSubscriptionOptions = [
  { value: 'all', label: 'All Subscriptions' },
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' }
];

/**
 * Available user sort options
 */
export const userSortOptions = [
  { value: 'created_at', label: 'Join Date' },
  { value: 'last_login_at', label: 'Last Login' },
  { value: 'email', label: 'Email' },
  { value: 'first_name', label: 'First Name' },
  { value: 'events_count', label: 'Events Count' }
];

/**
 * Available sort direction options
 */
export const sortDirectionOptions = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' }
];

/**
 * Format date for display in user list
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time elapsed since date
 */
export const timeAgo = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a month
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a year
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  
  // More than a year
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

/**
 * Get status badge color based on user status
 */
export const getUserStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'green';
    case 'suspended':
      return 'red';
    case 'pending':
      return 'yellow';
    default:
      return 'gray';
  }
};

/**
 * Get subscription badge color based on subscription type
 */
export const getSubscriptionColor = (type: string): string => {
  switch (type) {
    case 'premium':
      return 'purple';
    case 'free':
      return 'blue';
    default:
      return 'gray';
  }
};

/**
 * Format user activity type for display
 */
export const formatActivityType = (type: string): string => {
  // Convert snake_case to Title Case with spaces
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Parse and format user activity details for display
 */
export const formatActivityDetails = (details: Record<string, any>): string => {
  if (!details) return '';
  
  // Handle different activity types
  if (details.event_title) {
    return `"${details.event_title}"`;
  }
  
  if (details.guest_name) {
    return `Guest: ${details.guest_name}`;
  }
  
  if (details.file_name) {
    return `File: ${details.file_name}`;
  }
  
  // Generic fallback
  return Object.entries(details)
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
    .join(', ');
};