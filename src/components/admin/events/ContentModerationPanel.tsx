import React, { useState, useEffect } from 'react';
import { ModerationItem } from '../../../types/admin';
import { formatDateTime, getModerationStatusColor, getContentTypeColor } from '../../../utils/eventFilters';

interface ContentModerationPanelProps {
  items: ModerationItem[];
  loading: boolean;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, reason: string) => void;
  onViewContent: (contentId: string, contentType: string) => void;
  totalItems?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Component for content moderation panel with approval/rejection actions
 */
const ContentModerationPanel: React.FC<ContentModerationPanelProps> = ({
  items,
  loading,
  onApprove,
  onReject,
  onViewContent,
  totalItems = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange
}) => {
  // State for rejection modal
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = Math.min(((currentPage - 1) * pageSize) + 1, totalItems);
  const endItem = Math.min(startItem + pageSize - 1, totalItems);
  
  // Generate page numbers to display (show up to 5 pages)
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);
  
  useEffect(() => {
    const generatePageNumbers = () => {
      const pages: number[] = [];
      
      // Always show current page and up to 2 pages before and after
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    };
    
    setPageNumbers(generatePageNumbers());
  }, [currentPage, totalPages]);

  // Handle reject button click
  const handleRejectClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowRejectModal(true);
  };

  // Handle reject confirmation
  const handleRejectConfirm = () => {
    if (selectedItemId && rejectionReason.trim()) {
      onReject(selectedItemId, rejectionReason);
      setShowRejectModal(false);
      setSelectedItemId(null);
      setRejectionReason('');
    }
  };

  // Handle reject cancel
  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setSelectedItemId(null);
    setRejectionReason('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No moderation items found</h3>
            <p className="mt-1 text-sm text-gray-500">All content has been reviewed or no items match your filters.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reported By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    {item.contentPreview || 'No preview available'}
                  </div>
                  {item.automatedFlags && item.automatedFlags.length > 0 && (
                    <div className="mt-1">
                      {item.automatedFlags.map((flag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mr-1"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getContentTypeColor(item.contentType)}-100 text-${getContentTypeColor(item.contentType)}-800`}>
                    {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getModerationStatusColor(item.status)}-100 text-${getModerationStatusColor(item.status)}-800`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.reportedBy || 'System'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={item.reportReason}>
                    {item.reportReason || 'No reason provided'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(item.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewContent(item.contentId, item.contentType)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Content"
                    >
                      View
                    </button>
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(item.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Content"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject Content"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {item.reviewedBy && item.reviewedAt && (
                      <div className="text-xs text-gray-400">
                        Reviewed by {item.reviewedBy} on {formatDateTime(item.reviewedAt)}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button 
              onClick={() => onPageChange && onPageChange(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage <= 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage <= 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button 
              onClick={() => onPageChange && onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage >= totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage >= totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* Previous page button */}
                <button 
                  onClick={() => onPageChange && onPageChange(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage <= 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage <= 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {pageNumbers.map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange && onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                {/* Next page button */}
                <button 
                  onClick={() => onPageChange && onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage >= totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage >= totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reject Content</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this content:
              </p>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleRejectCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  rejectionReason.trim()
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentModerationPanel;