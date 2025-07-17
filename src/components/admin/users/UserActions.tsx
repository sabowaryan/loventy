import React, { useState } from 'react';
import { validateSuspensionReason } from '../../../utils/userValidation';

interface UserActionsProps {
  userId: string;
  actionType: 'suspend' | 'reactivate';
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (userId: string, reason: string) => Promise<void>;
  onReactivate: (userId: string) => Promise<void>;
}

/**
 * Modal component for user actions like suspend and reactivate
 */
const UserActions: React.FC<UserActionsProps> = ({
  userId,
  actionType,
  isOpen,
  onClose,
  onSuspend,
  onReactivate
}) => {
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // If modal is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (actionType === 'suspend') {
      // Validate suspension reason
      const validation = validateSuspensionReason(reason);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid suspension reason');
        return;
      }

      setLoading(true);
      try {
        await onSuspend(userId, reason);
      } catch (err: any) {
        setError(err.message || 'Failed to suspend user');
      } finally {
        setLoading(false);
      }
    } else if (actionType === 'reactivate') {
      setLoading(true);
      try {
        await onReactivate(userId);
      } catch (err: any) {
        setError(err.message || 'Failed to reactivate user');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
              actionType === 'suspend' ? 'bg-red-100' : 'bg-green-100'
            } sm:mx-0 sm:h-10 sm:w-10`}>
              {actionType === 'suspend' ? (
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {actionType === 'suspend' ? 'Suspend User' : 'Reactivate User'}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {actionType === 'suspend'
                    ? 'Are you sure you want to suspend this user? They will no longer be able to access their account until reactivated.'
                    : 'Are you sure you want to reactivate this user? They will regain access to their account.'}
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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

          <form onSubmit={handleSubmit}>
            {/* Suspension reason input (only for suspend action) */}
            {actionType === 'suspend' && (
              <div className="mt-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Suspension Reason <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Provide a detailed reason for suspending this user"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This reason will be recorded in the audit log and may be visible to the user.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${
                  actionType === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
                disabled={loading || (actionType === 'suspend' && !reason.trim())}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {actionType === 'suspend' ? 'Suspend User' : 'Reactivate User'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserActions;