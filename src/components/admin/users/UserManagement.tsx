import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import UserList from './UserList';
import UserDetails from './UserDetails';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import { User } from '../../../types/auth';

/**
 * Main user management component for admin dashboard
 * Provides search, filtering, and user management capabilities
 */
const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    error,
    searchUsers,
    filterUsers,
    suspendUser,
    reactivateUser,
    getUserDetails
  } = useUserManagement();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Update total items when users data changes
  useEffect(() => {
    // In a real implementation, this would come from the API response
    // For now, we'll use the users array length as a placeholder
    setTotalItems(users.length);
  }, [users]);

  // State for selected user and modal visibility
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'suspend' | 'reactivate' | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Handle user selection for details view
  const handleViewDetails = async (userId: string) => {
    setSelectedUserId(userId);
    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const userDetails = await getUserDetails(userId);
      setSelectedUser(userDetails);
      setIsDetailsModalOpen(true);
    } catch (err: any) {
      setDetailsError(err.message || 'Failed to load user details');
      console.error('Error loading user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle user selection for actions (suspend/reactivate)
  const handleUserAction = (userId: string, action: 'suspend' | 'reactivate') => {
    setSelectedUserId(userId);
    setActionType(action);
    setIsActionsModalOpen(true);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (filterUsers) {
      filterUsers({
        page,
        pageSize
      });
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    if (filterUsers) {
      filterUsers({
        page: 1,
        pageSize: newPageSize
      });
    }
  };

  // Handle search input
  const handleSearch = (query: string) => {
    searchUsers(query);
  };

  // Handle filter changes
  const handleFilterChange = (filters: Record<string, any>) => {
    setCurrentPage(1); // Reset to first page when filters change
    if (filterUsers) {
      filterUsers({
        ...filters,
        page: 1,
        pageSize
      });
    } else {
      console.warn('Filter functionality is not available');
      // Fallback behavior if needed
    }
  };

  // Handle user suspension
  const handleSuspendUser = async (userId: string, reason: string) => {
    await suspendUser(userId, reason);
    setIsActionsModalOpen(false);
  };

  // Handle user reactivation
  const handleReactivateUser = async (userId: string) => {
    await reactivateUser(userId);
    setIsActionsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
      </div>

      {/* Filters and search */}
      <UserFilters 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange}
        onPageSizeChange={handlePageSizeChange}
        pageSize={pageSize}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* User list */}
      <UserList
        users={users}
        loading={loading}
        onViewDetails={handleViewDetails}
        onSuspendUser={(userId) => handleUserAction(userId, 'suspend')}
        onReactivateUser={(userId) => handleUserAction(userId, 'reactivate')}
        totalItems={totalItems}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* User details modal */}
      {isDetailsModalOpen && selectedUser && (
        <UserDetails
          user={selectedUser}
          loading={detailsLoading}
          error={detailsError}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

      {/* User actions modal */}
      {isActionsModalOpen && selectedUserId && actionType && (
        <UserActions
          userId={selectedUserId}
          actionType={actionType}
          isOpen={isActionsModalOpen}
          onClose={() => setIsActionsModalOpen(false)}
          onSuspend={handleSuspendUser}
          onReactivate={handleReactivateUser}
        />
      )}
    </div>
  );
};

export default UserManagement;