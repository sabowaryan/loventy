/**
 * Event Filters Utilities
 * This file contains utility functions and constants for event filtering and display
 */

/**
 * Event status filter options
 */
export const eventStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'flagged', label: 'Flagged' }
];

/**
 * Event sort options
 */
export const eventSortOptions = [
  { value: 'event_date', label: 'Event Date' },
  { value: 'created_at', label: 'Creation Date' },
  { value: 'title', label: 'Title' },
  { value: 'guest_count', label: 'Guest Count' }
];

/**
 * Sort direction options
 */
export const sortDirectionOptions = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' }
];

/**
 * Content type filter options
 */
export const contentTypeOptions = [
  { value: 'all', label: 'All Content' },
  { value: 'event', label: 'Events' },
  { value: 'message', label: 'Messages' },
  { value: 'image', label: 'Images' },
  { value: 'profile', label: 'Profiles' }
];

/**
 * Content moderation status options
 */
export const moderationStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'flagged', label: 'Flagged' }
];

/**
 * Format date for display
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date with time for display
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get color for event status
 * @param status Event status
 * @returns Tailwind color class name
 */
export const getEventStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'green';
    case 'completed':
      return 'blue';
    case 'flagged':
      return 'red';
    default:
      return 'gray';
  }
};

/**
 * Get color for moderation status
 * @param status Moderation status
 * @returns Tailwind color class name
 */
export const getModerationStatusColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    case 'flagged':
      return 'yellow';
    case 'pending':
      return 'blue';
    default:
      return 'gray';
  }
};

/**
 * Get color for content type
 * @param contentType Content type
 * @returns Tailwind color class name
 */
export const getContentTypeColor = (contentType: string): string => {
  switch (contentType) {
    case 'event':
      return 'purple';
    case 'message':
      return 'blue';
    case 'image':
      return 'green';
    case 'profile':
      return 'orange';
    default:
      return 'gray';
  }
};