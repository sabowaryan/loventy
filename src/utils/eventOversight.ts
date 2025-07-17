/**
 * Event Oversight Utilities
 * This file contains utility functions for admin event oversight and content moderation
 */

import { supabase } from '../lib/supabase';
import { EventListItem, ModerationItem } from '../types/admin';

/**
 * Search events with filtering options
 * @param query Search query string
 * @param filters Additional filters for events
 * @returns Filtered events and total count
 */
export const searchEvents = async (
  query: string,
  filters: {
    status?: 'all' | 'active' | 'completed' | 'flagged';
    dateRange?: { start: Date; end: Date };
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }
): Promise<{ data: EventListItem[]; total: number }> => {
  try {
    const {
      status = 'all',
      dateRange,
      sortBy = 'event_date',
      sortDirection = 'desc',
      page = 1,
      pageSize = 10
    } = filters;

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let dbQuery = supabase
      .from('admin_event_overview')
      .select('*', { count: 'exact' });

    // Apply status filter if not 'all'
    if (status !== 'all') {
      dbQuery = dbQuery.eq('status', status);
    }

    // Apply date range filter if provided
    if (dateRange) {
      if (dateRange.start) {
        dbQuery = dbQuery.gte('event_date', dateRange.start.toISOString());
      }
      if (dateRange.end) {
        dbQuery = dbQuery.lte('event_date', dateRange.end.toISOString());
      }
    }

    // Apply search query if provided
    if (query) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query}%,owner_name.ilike.%${query}%,owner_email.ilike.%${query}%`
      );
    }

    // Apply sorting
    dbQuery = dbQuery.order(sortBy, { ascending: sortDirection === 'asc' });

    // Apply pagination
    dbQuery = dbQuery.range(from, to);

    // Execute the query
    const { data, error, count } = await dbQuery;

    if (error) {
      throw error;
    }

    // Transform the data to match the EventListItem interface
    const events: EventListItem[] = data.map(event => ({
      id: event.id,
      title: event.title,
      ownerName: event.owner_name,
      ownerEmail: event.owner_email,
      eventDate: new Date(event.event_date),
      guestCount: event.guest_count,
      status: event.status,
      flagReason: event.flag_reason,
      createdAt: new Date(event.created_at)
    }));

    return {
      data: events,
      total: count || 0
    };
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};

/**
 * Flag an event for review
 * @param eventId Event ID to flag
 * @param adminId Admin user ID performing the action
 * @param reason Reason for flagging
 */
export const flagEvent = async (
  eventId: string,
  adminId: string,
  reason: string
): Promise<void> => {
  try {
    // Call the admin_flag_event RPC function
    const { error } = await supabase.rpc('admin_flag_event', {
      event_uuid: eventId,
      admin_uuid: adminId,
      flag_reason: reason
    });

    if (error) {
      throw error;
    }

    // Log the admin action
    await logAdminAction(
      adminId,
      'FLAG',
      'EVENT',
      eventId,
      undefined,
      { reason, flaggedAt: new Date().toISOString() }
    );
  } catch (error) {
    console.error('Error flagging event:', error);
    throw error;
  }
};

/**
 * Approve a flagged event
 * @param eventId Event ID to approve
 * @param adminId Admin user ID performing the action
 */
export const approveEvent = async (
  eventId: string,
  adminId: string
): Promise<void> => {
  try {
    // Call the admin_approve_event RPC function
    const { error } = await supabase.rpc('admin_approve_event', {
      event_uuid: eventId,
      admin_uuid: adminId
    });

    if (error) {
      throw error;
    }

    // Log the admin action
    await logAdminAction(
      adminId,
      'APPROVE',
      'EVENT',
      eventId,
      undefined,
      { approvedAt: new Date().toISOString() }
    );
  } catch (error) {
    console.error('Error approving event:', error);
    throw error;
  }
};

/**
 * Get event analytics data
 * @param eventId Event ID to get analytics for
 * @returns Event analytics data
 */
export const getEventAnalytics = async (eventId: string): Promise<any> => {
  try {
    // Call the get_event_analytics RPC function
    const { data, error } = await supabase.rpc('get_event_analytics', {
      event_uuid: eventId
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting event analytics:', error);
    throw error;
  }
};

/**
 * Get content moderation items
 * @param filters Filters for content moderation items
 * @returns Filtered moderation items and total count
 */
export const getContentModerationItems = async (
  filters: {
    contentType?: 'all' | 'event' | 'message' | 'image' | 'profile';
    status?: 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';
    page?: number;
    pageSize?: number;
  }
): Promise<{ data: ModerationItem[]; total: number }> => {
  try {
    const {
      contentType = 'all',
      status = 'pending',
      page = 1,
      pageSize = 10
    } = filters;

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let dbQuery = supabase
      .from('content_moderation')
      .select('*, reported_by:users!reported_by(email), reviewed_by:users!reviewed_by(email)', { count: 'exact' });

    // Apply content type filter if not 'all'
    if (contentType !== 'all') {
      dbQuery = dbQuery.eq('content_type', contentType);
    }

    // Apply status filter if not 'all'
    if (status !== 'all') {
      dbQuery = dbQuery.eq('status', status);
    }

    // Apply sorting by creation date (newest first)
    dbQuery = dbQuery.order('created_at', { ascending: false });

    // Apply pagination
    dbQuery = dbQuery.range(from, to);

    // Execute the query
    const { data, error, count } = await dbQuery;

    if (error) {
      throw error;
    }

    // Transform the data to match the ModerationItem interface
    const items: ModerationItem[] = data.map(item => ({
      id: item.id,
      contentType: item.content_type,
      contentId: item.content_id,
      reportedBy: item.reported_by?.email,
      reportReason: item.moderation_reason,
      status: item.status,
      reviewedBy: item.reviewed_by?.email,
      reviewedAt: item.reviewed_at ? new Date(item.reviewed_at) : undefined,
      automatedFlags: item.automated_flags,
      contentPreview: item.content_preview || '',
      createdAt: new Date(item.created_at)
    }));

    return {
      data: items,
      total: count || 0
    };
  } catch (error) {
    console.error('Error getting content moderation items:', error);
    throw error;
  }
};

/**
 * Flag content for moderation
 * @param contentId Content ID to flag
 * @param contentType Type of content being flagged
 * @param adminId Admin user ID performing the action
 * @param reason Reason for flagging
 */
export const flagContent = async (
  contentId: string,
  contentType: string,
  adminId: string,
  reason: string
): Promise<void> => {
  try {
    // Insert into content_moderation table
    const { error } = await supabase
      .from('content_moderation')
      .insert({
        content_id: contentId,
        content_type: contentType,
        reported_by: adminId,
        moderation_reason: reason,
        status: 'flagged',
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    // Log the admin action
    await logAdminAction(
      adminId,
      'FLAG',
      contentType.toUpperCase(),
      contentId,
      undefined,
      { reason, flaggedAt: new Date().toISOString() }
    );
  } catch (error) {
    console.error('Error flagging content:', error);
    throw error;
  }
};

/**
 * Log admin actions for audit trail
 * @param adminId Admin user ID performing the action
 * @param actionType Type of action performed
 * @param resourceType Type of resource affected
 * @param resourceId ID of the resource affected
 * @param oldValues Previous values (for updates)
 * @param newValues New values (for updates)
 */
export const logAdminAction = async (
  adminId: string,
  actionType: string,
  resourceType: string,
  resourceId: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> => {
  try {
    // Insert into admin_audit_log table
    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging admin action:', error);
    }
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

/**
 * Get event metrics for admin dashboard
 * @returns Event metrics data
 */
export const getEventMetrics = async (): Promise<any> => {
  try {
    // Call the get_admin_event_metrics RPC function
    const { data, error } = await supabase.rpc('get_admin_event_metrics');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting event metrics:', error);
    throw error;
  }
};

/**
 * Scan content for inappropriate material
 * @param content Content to scan
 * @param contentType Type of content being scanned
 * @returns Scan results with flags if inappropriate content is detected
 */
export const scanContent = async (
  content: string,
  contentType: string
): Promise<{ isInappropriate: boolean; flags: string[] }> => {
  try {
    // Call the scan_content RPC function
    const { data, error } = await supabase.rpc('scan_content', {
      content_text: content,
      content_type: contentType
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error scanning content:', error);
    // Default to safe if scanning fails
    return { isInappropriate: false, flags: [] };
  }
};