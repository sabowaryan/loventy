import { supabase } from '../lib/supabase';
import { UserListItem } from '../types/admin';
import { User } from '../types/auth';

/**
 * Format user data from database to UserListItem format
 */
export const formatUserListItem = (user: any): UserListItem => {
  return {
    id: user.id,
    email: user.email,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    status: user.status as 'active' | 'suspended' | 'pending',
    subscriptionType: user.subscription_status === 'premium' ? 'premium' : 'free',
    lastLogin: user.last_login_at ? new Date(user.last_login_at) : new Date(user.created_at),
    eventsCount: user.events_count || 0,
    joinDate: new Date(user.created_at),
  };
};

/**
 * Log admin action to audit log
 */
export const logAdminAction = async (
  adminId: string,
  actionType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'SUSPEND' | 'REACTIVATE',
  resourceType: 'USER' | 'EVENT' | 'SYSTEM' | 'CONTENT',
  resourceId: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> => {
  try {
    await supabase.from('admin_audit_log').insert({
      admin_id: adminId,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: null, // This would be captured server-side
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw here to prevent breaking the main operation
  }
};

/**
 * Get user activity logs with pagination
 */
export const getUserActivityLogs = async (
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: any[]; total: number }> => {
  try {
    // Get total count first
    const { count, error: countError } = await supabase
      .rpc('get_user_activity_count', { user_uuid: userId });
    
    if (countError) {
      throw new Error(countError.message);
    }
    
    // Get paginated activity data
    const { data, error } = await supabase
      .rpc('get_user_activity', {
        user_uuid: userId,
        page_number: page,
        page_size: pageSize
      });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      data: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_statistics', { user_uuid: userId });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || {};
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

/**
 * Search users with advanced filtering
 */
export const searchUsers = async (
  query: string = '',
  filters: {
    status?: 'all' | 'active' | 'suspended' | 'pending';
    subscription?: 'all' | 'free' | 'premium';
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ data: UserListItem[]; total: number }> => {
  try {
    const {
      status = 'all',
      subscription = 'all',
      sortBy = 'created_at',
      sortDirection = 'desc',
      page = 1,
      pageSize = 10
    } = filters;
    
    // Get total count with filters
    let countQuery = supabase
      .from('admin_user_overview')
      .select('id', { count: 'exact' });
    
    // Apply status filter if not 'all'
    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    
    // Apply subscription filter if not 'all'
    if (subscription !== 'all') {
      countQuery = countQuery.eq('subscription_status', subscription);
    }
    
    // Apply search query if provided
    if (query) {
      countQuery = countQuery.or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      throw new Error(countError.message);
    }
    
    // Get paginated data with filters
    let dataQuery = supabase
      .from('admin_user_overview')
      .select('*');
    
    // Apply status filter if not 'all'
    if (status !== 'all') {
      dataQuery = dataQuery.eq('status', status);
    }
    
    // Apply subscription filter if not 'all'
    if (subscription !== 'all') {
      dataQuery = dataQuery.eq('subscription_status', subscription);
    }
    
    // Apply search query if provided
    if (query) {
      dataQuery = dataQuery.or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
    }
    
    // Apply sorting
    dataQuery = dataQuery.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dataQuery = dataQuery.range(from, to);
    
    const { data, error } = await dataQuery;
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Transform data to UserListItem format
    const formattedData = (data || []).map(formatUserListItem);
    
    return {
      data: formattedData,
      total: count || 0
    };
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};