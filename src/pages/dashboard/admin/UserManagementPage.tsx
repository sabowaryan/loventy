import React from 'react';
import { UserManagement } from '../../../components/admin/users';
import AdminLayout from '../../../components/layouts/AdminLayout';

/**
 * User management page for admin dashboard
 */
const UserManagementPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <UserManagement />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagementPage;