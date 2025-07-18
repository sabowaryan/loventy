import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserListItem, UserManagementHook } from '../types/admin';
import { User, AdminUserDetails } from '../types/auth';
import { formatUserListItem, logAdminAction, getUserActivityLogs, getUserStats, searchUsers as searchUsersUtil } from '../utils/userManagement';
import { validateUserData, validateSuspensionReason, mapErrorMessage } from '../utils/userValidation';
import { transformUserListItem, transformAdminUserDetails } from '../utils/userTransform';

/**
 * Hook for managing users in the admin dashboard
 * Provides functionality for searching, filtering, and performing admin actions on users
 */
export const useUserManagement = (): UserManagementHook => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, hasAdminPermission } = useAuth();

  // Current filters state
  const [filters, setFilters] = useState<{
    query: string;
    status: 'all' | 'active' | 'suspended' | 'pending';
    subscription: 'all' | 'free' | 'premium';
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    page: number;
    pageSize: number;
  }>({
    query: '',
    status: 'all',
    subscription: 'all',
    sortBy: 'created_at',
    sortDirection: 'desc',
    page: 1,
    pageSize: 10,
  });

  /**
   * Fetch users based on current filters
   */
  const fetchUsers = useCallback(async () => {
    if (!isAdmin()) {
      setError('Unauthorized: Admin access required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the utility function to search users with current filters
      const { data, total } = await searchUsersUtil(filters.query, {
        status: filters.status,
        subscription: filters.subscription,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        page: filters.page,
        pageSize: filters.pageSize
      });

      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin]);

  // Initial fetch on mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Search users by query string
   */
  const searchUsers = async (query: string): Promise<void> => {
    setFilters(prev => ({ ...prev, query, page: 1 }));
  };

  /**
   * Apply filters to user list
   */
  const filterUsers = async (newFilters: Partial<typeof filters>): Promise<void> => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  /**
   * Suspend a user account
   */
  const suspendUser = async (userId: string, reason: string): Promise<void> => {
    if (!isAdmin()) {
      setError('Unauthorized: Admin access required');
      return;
    }

    if (!hasAdminPermission('users', 'suspend')) {
      setError('Insufficient permissions to suspend users');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user details for audit log
      const currentUser = await supabase.auth.getUser();
      const adminId = currentUser.data.user?.id;

      if (!adminId) {
        throw new Error('Admin ID not available');
      }

      // Call the admin_suspend_user RPC function
      const { data, error: suspendError } = await supabase.rpc('admin_suspend_user', {
        user_uuid: userId,
        admin_uuid: adminId,
        suspension_reason: reason
      });

      if (suspendError) {
        throw new Error(suspendError.message);
      }

      // Log the admin action with additional context
      await logAdminAction(
        adminId,
        'SUSPEND',
        'USER',
        userId,
        undefined,
        { reason, suspendedAt: new Date().toISOString() }
      );

      // Refresh the user list to reflect changes
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to suspend user');
      console.error('Error suspending user:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reactivate a suspended user account
   */
  const reactivateUser = async (userId: string): Promise<void> => {
    if (!isAdmin()) {
      setError('Unauthorized: Admin access required');
      return;
    }

    if (!hasAdminPermission('users', 'reactivate')) {
      setError('Insufficient permissions to reactivate users');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user details for audit log
      const currentUser = await supabase.auth.getUser();
      const adminId = currentUser.data.user?.id;

      if (!adminId) {
        throw new Error('Admin ID not available');
      }

      // Call the admin_reactivate_user RPC function
      const { data, error: reactivateError } = await supabase.rpc('admin_reactivate_user', {
        user_uuid: userId,
        admin_uuid: adminId
      });

      if (reactivateError) {
        throw new Error(reactivateError.message);
      }

      // Log the admin action with additional context
      await logAdminAction(
        adminId,
        'REACTIVATE',
        'USER',
        userId,
        undefined,
        { reactivatedAt: new Date().toISOString() }
      );

      // Refresh the user list to reflect changes
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to reactivate user');
      console.error('Error reactivating user:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get detailed information about a specific user
   */
  const getUserDetails = async (userId: string): Promise<User> => {
    if (!isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Get detailed user information using the auth context method
      const { getAdminUserDetails } = useAuth();
      const userDetails = await getAdminUserDetails(userId);

      if (!userDetails) {
        throw new Error('User not found');
      }

      return userDetails;
    } catch (err: any) {
      setError(err.message || 'Failed to get user details');
      console.error('Error getting user details:', err);
      throw err;
    }
  };

  /**
   * Get user activity logs
   */
  const getUserActivity = async (userId: string): Promise<any[]> => {
    if (!isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Use the utility function to get paginated activity logs
      // But only return the data array to match the interface
      const result = await getUserActivityLogs(userId, 1, 50);
      return result.data || [];
    } catch (err: any) {
      console.error('Error getting user activity:', err);
      throw err;
    }
  };

  /**
   * Update user information
   */
  const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!isAdmin()) {
      setError('Unauthorized: Admin access required');
      return;
    }

    if (!hasAdminPermission('users', 'edit')) {
      setError('Insufficient permissions to edit users');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user details for audit log
      const currentUser = await supabase.auth.getUser();
      const adminId = currentUser.data.user?.id;

      if (!adminId) {
        throw new Error('Admin ID not available');
      }

      // Get current user data for comparison in audit log
      const { data: currentData, error: fetchError } = await supabase
        .from('users')
        .select('first_name, last_name, avatar_url')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Prepare update data
      const updateData = {
        first_name: updates.first_name,
        last_name: updates.last_name,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString()
      };

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Log the admin action with old and new values
      await logAdminAction(
        adminId,
        'UPDATE',
        'USER',
        userId,
        {
          first_name: currentData?.first_name,
          last_name: currentData?.last_name,
          avatar_url: currentData?.avatar_url
        },
        {
          first_name: updates.first_name,
          last_name: updates.last_name,
          avatar_url: updates.avatar_url
        }
      );

      // Refresh the user list to reflect changes
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a user account (soft delete)
   */
  const deleteUser = async (userId: string): Promise<void> => {
    if (!isAdmin()) {
      setError('Unauthorized: Admin access required');
      return;
    }

    if (!hasAdminPermission('users', 'delete')) {
      setError('Insufficient permissions to delete users');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user details for audit log
      const currentUser = await supabase.auth.getUser();
      const adminId = currentUser.data.user?.id;

      if (!adminId) {
        throw new Error('Admin ID not available');
      }

      // Get user details before deletion for audit log
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Call the admin_delete_user RPC function
      const { data, error: deleteError } = await supabase.rpc('admin_delete_user', {
        user_uuid: userId,
        admin_uuid: adminId
      });

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Log the admin action with user details
      await logAdminAction(
        adminId,
        'DELETE',
        'USER',
        userId,
        {
          email: userData?.email,
          first_name: userData?.first_name,
          last_name: userData?.last_name
        },
        { deletedAt: new Date().toISOString() }
      );

      // Refresh the user list to reflect changes
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    searchUsers,
    suspendUser,
    reactivateUser,
    getUserDetails
  };
};

export default useUserManagement;