import React, { useState, useEffect } from 'react';
import { User, AdminUserDetails } from '../../../types/auth';
import { formatDate, timeAgo } from '../../../utils/userFilters';
import { formatFileSize, formatSubscriptionStatus, formatUserStatus } from '../../../utils/userTransform';
import { useUserManagement } from '../../../hooks/useUserManagement';

interface UserDetailsProps {
    user: User;
    loading: boolean;
    error: string | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal component for displaying detailed user information
 */
const UserDetails: React.FC<UserDetailsProps> = ({
    user,
    loading,
    error,
    isOpen,
    onClose
}) => {
    const { getUserActivity } = useUserManagement();
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [activityLoading, setActivityLoading] = useState<boolean>(false);
    const [activityError, setActivityError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'subscriptions' | 'events'>('profile');

    // Load user activity logs when tab changes to activity
    useEffect(() => {
        if (activeTab === 'activity' && user && getUserActivity) {
            setActivityLoading(true);
            setActivityError(null);

            getUserActivity(user.id)
                .then((result) => {
                    setActivityLogs(result || []);
                })
                .catch((err) => {
                    setActivityError(err.message || 'Failed to load activity logs');
                    console.error('Error loading activity logs:', err);
                })
                .finally(() => {
                    setActivityLoading(false);
                });
        } else if (activeTab === 'activity' && !getUserActivity) {
            setActivityError('Activity tracking functionality is not available');
            setActivityLoading(false);
        }
    }, [activeTab, user, getUserActivity]);

    // If modal is not open, don't render anything
    if (!isOpen) {
        return null;
    }

    // Loading state
    if (loading) {
        return (
            <div className="fixed inset-0 overflow-y-auto z-50">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                        <div className="flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="fixed inset-0 overflow-y-auto z-50">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                        <div>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-5">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Error Loading User Details</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">{error}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6">
                            <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Determine if we have admin details or just basic user details
    const isAdminDetails = 'eventsCount' in user;
    const adminUser = user as AdminUserDetails;

    return (
        <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                            {user.avatarUrl ? (
                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                            ) : (
                                <span className="text-indigo-600 text-lg font-medium">
                                    {user.firstName ? user.firstName.charAt(0) : ''}
                                    {user.lastName ? user.lastName.charAt(0) : ''}
                                </span>
                            )}
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6 border-b border-gray-200">
                        <div className="flex -mb-px">
                            <button
                                className={`${activeTab === 'profile'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
                                onClick={() => setActiveTab('profile')}
                            >
                                Profile
                            </button>
                            <button
                                className={`${activeTab === 'activity'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
                                onClick={() => setActiveTab('activity')}
                            >
                                Activity
                            </button>
                            {isAdminDetails && (
                                <>
                                    <button
                                        className={`${activeTab === 'subscriptions'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
                                        onClick={() => setActiveTab('subscriptions')}
                                    >
                                        Subscription
                                    </button>
                                    <button
                                        className={`${activeTab === 'events'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        onClick={() => setActiveTab('events')}
                                    >
                                        Events
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="mt-6">
                        {/* Profile tab */}
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">User Information</h4>
                                    <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">ID</dt>
                                            <dd className="text-gray-900 font-medium">{user.id}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Email</dt>
                                            <dd className="text-gray-900">{user.email}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">First Name</dt>
                                            <dd className="text-gray-900">{user.firstName || 'N/A'}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Last Name</dt>
                                            <dd className="text-gray-900">{user.lastName || 'N/A'}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Status</dt>
                                            <dd className="text-gray-900">{formatUserStatus(user.status)}</dd>
                                        </div>
                                        {user.status === 'suspended' && user.suspensionReason && (
                                            <div className="py-3 flex justify-between text-sm">
                                                <dt className="text-gray-500">Suspension Reason</dt>
                                                <dd className="text-gray-900">{user.suspensionReason}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Account Information</h4>
                                    <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Created</dt>
                                            <dd className="text-gray-900">{formatDate(user.createdAt)}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Last Updated</dt>
                                            <dd className="text-gray-900">{formatDate(user.updatedAt)}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Last Login</dt>
                                            <dd className="text-gray-900">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</dd>
                                        </div>
                                        {isAdminDetails && (
                                            <>
                                                <div className="py-3 flex justify-between text-sm">
                                                    <dt className="text-gray-500">Subscription</dt>
                                                    <dd className="text-gray-900">{formatSubscriptionStatus(adminUser.subscriptionStatus)}</dd>
                                                </div>
                                                <div className="py-3 flex justify-between text-sm">
                                                    <dt className="text-gray-500">Events Created</dt>
                                                    <dd className="text-gray-900">{adminUser.eventsCount}</dd>
                                                </div>
                                                <div className="py-3 flex justify-between text-sm">
                                                    <dt className="text-gray-500">Guests Added</dt>
                                                    <dd className="text-gray-900">{adminUser.guestsCount}</dd>
                                                </div>
                                                <div className="py-3 flex justify-between text-sm">
                                                    <dt className="text-gray-500">Storage Used</dt>
                                                    <dd className="text-gray-900">{formatFileSize(adminUser.storageUsedBytes)}</dd>
                                                </div>
                                            </>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        )}

                        {/* Activity tab */}
                        {activeTab === 'activity' && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Recent Activity</h4>

                                {activityLoading ? (
                                    <div className="flex justify-center py-6">
                                        <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : activityError ? (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{activityError}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : activityLogs.length === 0 ? (
                                    <div className="text-center py-6">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
                                        <p className="mt-1 text-sm text-gray-500">This user has no recorded activity yet.</p>
                                    </div>
                                ) : (
                                    <div className="flow-root mt-6">
                                        <ul className="-mb-8">
                                            {activityLogs.map((activity, activityIdx) => (
                                                <li key={activity.id || activityIdx}>
                                                    <div className="relative pb-8">
                                                        {activityIdx !== activityLogs.length - 1 ? (
                                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                                        ) : null}
                                                        <div className="relative flex space-x-3">
                                                            <div>
                                                                <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                                                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        {activity.activity_type.replace(/_/g, ' ')}
                                                                        {activity.details && activity.details.event_title && (
                                                                            <span className="font-medium text-gray-900"> {activity.details.event_title}</span>
                                                                        )}
                                                                        {activity.details && activity.details.guest_name && (
                                                                            <span className="font-medium text-gray-900"> {activity.details.guest_name}</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                    <time dateTime={activity.activity_date}>{timeAgo(activity.activity_date)}</time>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Subscription tab */}
                        {activeTab === 'subscriptions' && isAdminDetails && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Subscription Information</h4>
                                <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                                    <div className="py-3 flex justify-between text-sm">
                                        <dt className="text-gray-500">Subscription Status</dt>
                                        <dd className="text-gray-900">{formatSubscriptionStatus(adminUser.subscriptionStatus)}</dd>
                                    </div>
                                    {adminUser.subscriptionEndDate && (
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Subscription End Date</dt>
                                            <dd className="text-gray-900">{formatDate(adminUser.subscriptionEndDate)}</dd>
                                        </div>
                                    )}
                                    <div className="py-3 flex justify-between text-sm">
                                        <dt className="text-gray-500">Total Revenue</dt>
                                        <dd className="text-gray-900">${adminUser.totalRevenue.toFixed(2)}</dd>
                                    </div>
                                </dl>

                                {/* Placeholder for subscription management actions */}
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-gray-500">Subscription Management</h4>
                                    <div className="mt-2 flex space-x-4">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            View Invoices
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Manage Subscription
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Events tab */}
                        {activeTab === 'events' && isAdminDetails && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Event Statistics</h4>
                                <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                                    <div className="py-3 flex justify-between text-sm">
                                        <dt className="text-gray-500">Total Events</dt>
                                        <dd className="text-gray-900">{adminUser.eventsCount}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between text-sm">
                                        <dt className="text-gray-500">Events (Last 30 Days)</dt>
                                        <dd className="text-gray-900">{adminUser.eventsLast30Days}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between text-sm">
                                        <dt className="text-gray-500">Total Guests</dt>
                                        <dd className="text-gray-900">{adminUser.guestsCount}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between text-sm">
                                        <dt className="text-gray-500">Guests (Last 30 Days)</dt>
                                        <dd className="text-gray-900">{adminUser.guestsLast30Days}</dd>
                                    </div>
                                </dl>

                                {/* Placeholder for event management actions */}
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-gray-500">Event Management</h4>
                                    <div className="mt-2 flex space-x-4">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            View Events
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            View Guests
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer actions */}
                    <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;