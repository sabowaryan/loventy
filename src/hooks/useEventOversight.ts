import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  EventListItem, 
  EventOversightHook
} from '../types/admin';
import { 
  searchEvents, 
  flagEvent, 
  approveEvent, 
  getEventAnalytics, 
  getContentModerationItems, 
  flagContent, 
  getEventMetrics, 
  scanContent 
} from '../utils/eventOversight';

/**
 * Hook for event oversight and content moderation
 * Provides functionality for searching, filtering, and moderating events
 * @returns EventOversightHook interface with events data and functions
 */
export const useEventOversight = (): EventOversightHook => {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<{
    status: 'all' | 'active' | 'completed' | 'flagged';
    dateRange?: { start: Date; end: Date };
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    page: number;
    pageSize: number;
  }>({
    status: 'all',
    dateRange: undefined,
    sortBy: 'event_date',
    sortDirection: 'desc',
    page: 1,
    pageSize: 10
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Search events with the current query and filters
   * @param query Search query string
   */
  const searchEventsHandler = useCallback(async (query: string) => {
    if (!isAdmin() || !user) {
      setError('Unauthorized: Admin privileges required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);

      const { data, total } = await searchEvents(query, filters);
      
      setEvents(data);
      setTotalCount(total);
    } catch (err: any) {
      setError(err.message || 'Error searching events');
      console.error('Error searching events:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin, user]);

  /**
   * Filter events with specified criteria
   * @param filterOptions Filter options for events
   */
  const filterEvents = useCallback(async (filterOptions: Record<string, any>) => {
    if (!isAdmin() || !user) {
      setError('Unauthorized: Admin privileges required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const updatedFilters = {
        ...filters,
        ...filterOptions
      };
      
      setFilters(updatedFilters);
      
      const { data, total } = await searchEvents(searchQuery, updatedFilters);
      
      setEvents(data);
      setTotalCount(total);
    } catch (err: any) {
      setError(err.message || 'Error filtering events');
      console.error('Error filtering events:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, isAdmin, user]);

  /**
   * Flag an event for review
   * @param eventId Event ID to flag
   * @param reason Reason for flagging
   */
  const flagEventHandler = useCallback(async (eventId: string, reason: string) => {
    if (!isAdmin() || !user) {
      setError('Unauthorized: Admin privileges required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await flagEvent(eventId, user.id, reason);
      
      // Refresh the events list
      const { data, total } = await searchEvents(searchQuery, filters);
      
      setEvents(data);
      setTotalCount(total);
    } catch (err: any) {
      setError(err.message || 'Error flagging event');
      console.error('Error flagging event:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, isAdmin, user]);

  /**
   * Approve a flagged event
   * @param eventId Event ID to approve
   */
  const approveEventHandler = useCallback(async (eventId: string) => {
    if (!isAdmin() || !user) {
      setError('Unauthorized: Admin privileges required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await approveEvent(eventId, user.id);
      
      // Refresh the events list
      const { data, total } = await searchEvents(searchQuery, filters);
      
      setEvents(data);
      setTotalCount(total);
    } catch (err: any) {
      setError(err.message || 'Error approving event');
      console.error('Error approving event:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, isAdmin, user]);

  /**
   * Get analytics data for a specific event
   * @param eventId Event ID to get analytics for
   * @returns Event analytics data
   */
  const getEventAnalyticsHandler = useCallback(async (eventId: string) => {
    if (!isAdmin() || !user) {
      throw new Error('Unauthorized: Admin privileges required');
    }

    try {
      return await getEventAnalytics(eventId);
    } catch (err: any) {
      console.error('Error getting event analytics:', err);
      throw err;
    }
  }, [isAdmin, user]);

  /**
   * Get content moderation items with filtering
   * @param filterOptions Filter options for moderation items
   * @returns Filtered moderation items and total count
   */
  const getContentModerationItemsHandler = useCallback(async (
    filterOptions: {
      contentType?: 'all' | 'event' | 'message' | 'image' | 'profile';
      status?: 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';
      page?: number;
      pageSize?: number;
    }
  ) => {
    if (!isAdmin() || !user) {
      throw new Error('Unauthorized: Admin privileges required');
    }

    try {
      return await getContentModerationItems(filterOptions);
    } catch (err: any) {
      console.error('Error getting content moderation items:', err);
      throw err;
    }
  }, [isAdmin, user]);

  /**
   * Flag content for moderation
   * @param contentId Content ID to flag
   * @param contentType Type of content being flagged
   * @param reason Reason for flagging
   */
  const flagContentHandler = useCallback(async (
    contentId: string,
    contentType: string,
    reason: string
  ) => {
    if (!isAdmin() || !user) {
      throw new Error('Unauthorized: Admin privileges required');
    }

    try {
      await flagContent(contentId, contentType, user.id, reason);
    } catch (err: any) {
      console.error('Error flagging content:', err);
      throw err;
    }
  }, [isAdmin, user]);

  /**
   * Get event metrics for admin dashboard
   * @returns Event metrics data
   */
  const getEventMetricsHandler = useCallback(async () => {
    if (!isAdmin() || !user) {
      throw new Error('Unauthorized: Admin privileges required');
    }

    try {
      return await getEventMetrics();
    } catch (err: any) {
      console.error('Error getting event metrics:', err);
      throw err;
    }
  }, [isAdmin, user]);

  /**
   * Scan content for inappropriate material
   * @param content Content to scan
   * @param contentType Type of content being scanned
   * @returns Scan results with flags if inappropriate content is detected
   */
  const scanContentHandler = useCallback(async (
    content: string,
    contentType: string
  ) => {
    if (!isAdmin() || !user) {
      throw new Error('Unauthorized: Admin privileges required');
    }

    try {
      return await scanContent(content, contentType);
    } catch (err: any) {
      console.error('Error scanning content:', err);
      throw err;
    }
  }, [isAdmin, user]);

  // Load initial data when the component mounts
  useEffect(() => {
    if (isAdmin() && user) {
      searchEventsHandler('');
    }
  }, [isAdmin, user]);

  return {
    events,
    loading,
    error,
    searchEvents: searchEventsHandler,
    filterEvents,
    flagEvent: flagEventHandler,
    approveEvent: approveEventHandler,
    getEventAnalytics: getEventAnalyticsHandler,
    getContentModerationItems: getContentModerationItemsHandler,
    flagContent: flagContentHandler,
    getEventMetrics: getEventMetricsHandler,
    scanContent: scanContentHandler,
    totalCount
  };
};