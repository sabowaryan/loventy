import React, { useState, useEffect, useCallback } from 'react';
import { useEventOversight } from '../../../hooks/useEventOversight';
import EventFilters from './EventFilters';
import EventList from './EventList';
import ContentModerationPanel from './ContentModerationPanel';
import EventAnalytics from './EventAnalytics';
import { ModerationItem } from '../../../types/admin';
import { contentTypeOptions, moderationStatusOptions } from '../../../utils/eventFilters';

/**
 * Main component for event oversight and content moderation
 */
const EventOversight: React.FC = () => {
  // Get event oversight hook
  const {
    events,
    loading,
    error,
    searchEvents,
    filterEvents,
    flagEvent,
    approveEvent,
    getEventAnalytics,
    getContentModerationItems,
    totalCount
  } = useEventOversight();

  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showModeration, setShowModeration] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [moderationLoading, setModerationLoading] = useState<boolean>(false);
  const [moderationTotalCount, setModerationTotalCount] = useState<number>(0);
  const [moderationCurrentPage, setModerationCurrentPage] = useState<number>(1);
  const [moderationFilters, setModerationFilters] = useState({
    contentType: 'all',
    status: 'pending'
  });

  // Handle search
  const handleSearch = (query: string) => {
    searchEvents(query);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filters: Record<string, any>) => {
    filterEvents({ ...filters, page: currentPage, pageSize });
  };

  // Handle date range changes
  const handleDateRangeChange = (dateRange: { start?: Date; end?: Date } | null) => {
    if (dateRange) {
      filterEvents({ dateRange, page: currentPage, pageSize });
    } else {
      filterEvents({ dateRange: undefined, page: currentPage, pageSize });
    }
  };

  // Handle page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    filterEvents({ page: 1, pageSize: newPageSize });
    setCurrentPage(1);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    filterEvents({ page, pageSize });
  };

  // Handle event details view
  const handleViewDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    // Additional logic for viewing event details
    // This could open a modal or navigate to a details page
  };

  // Handle flagging an event
  const handleFlagEvent = (eventId: string) => {
    // This would typically open a modal to get the reason
    // For simplicity, we'll use a prompt
    const reason = prompt('Please enter a reason for flagging this event:');
    if (reason) {
      flagEvent(eventId, reason);
    }
  };

  // Handle approving an event
  const handleApproveEvent = (eventId: string) => {
    approveEvent(eventId);
  };

  // Handle viewing event analytics
  const handleViewAnalytics = async (eventId: string) => {
    try {
      setShowAnalytics(true);
      setSelectedEventId(eventId);
      const data = await getEventAnalytics(eventId);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching event analytics:', error);
    }
  };

  // Load moderation items
  const loadModerationItems = async () => {
    try {
      setModerationLoading(true);
      const { data, total } = await getContentModerationItems({
        contentType: moderationFilters.contentType as any,
        status: moderationFilters.status as any,
        page: moderationCurrentPage,
        pageSize
      });
      setModerationItems(data);
      setModerationTotalCount(total);
    } catch (error) {
      console.error('Error loading moderation items:', error);
    } finally {
      setModerationLoading(false);
    }
  };

  // Handle moderation filter changes
  const handleModerationFilterChange = (filters: Record<string, any>) => {
    setModerationFilters({ ...moderationFilters, ...filters });
    setModerationCurrentPage(1);
  };

  // Handle moderation page changes
  const handleModerationPageChange = (page: number) => {
    setModerationCurrentPage(page);
  };

  // Handle approving content
  const handleApproveContent = async (itemId: string) => {
    try {
      // This would call an API to approve the content
      console.log('Approving content:', itemId);
      // After approval, reload the moderation items
      await loadModerationItems();
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  // Handle rejecting content
  const handleRejectContent = async (itemId: string, reason: string) => {
    try {
      // This would call an API to reject the content
      console.log('Rejecting content:', itemId, 'Reason:', reason);
      // After rejection, reload the moderation items
      await loadModerationItems();
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  // Handle viewing content
  const handleViewContent = (contentId: string, contentType: string) => {
    // This would open a modal or navigate to view the content
    console.log(`Viewing ${contentType} content with ID: ${contentId}`);
  };

  // Load moderation items when filters change
  useEffect(() => {
    if (showModeration) {
      loadModerationItems();
    }
  }, [moderationFilters, moderationCurrentPage, showModeration]);

  // Toggle moderation panel
  const toggleModerationPanel = () => {
    setShowModeration(!showModeration);
    if (!showModeration) {
      loadModerationItems();
    }
  };

  // Close analytics panel
  const closeAnalytics = () => {
    setShowAnalytics(false);
    setAnalyticsData(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Event Oversight</h1>
        <div className="flex space-x-4">
          <button
            onClick={toggleModerationPanel}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              showModeration
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {showModeration ? 'Hide Moderation Panel' : 'Show Moderation Panel'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Event filters */}
      <EventFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onPageSizeChange={handlePageSizeChange}
        onDateRangeChange={handleDateRangeChange}
        pageSize={pageSize}
      />

      {/* Event list */}
      <EventList
        events={events}
        loading={loading}
        onViewDetails={handleViewDetails}
        onFlagEvent={handleFlagEvent}
        onApproveEvent={handleApproveEvent}
        onViewAnalytics={handleViewAnalytics}
        totalItems={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Content moderation panel */}
      {showModeration && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Content Moderation</h2>
            <div className="flex space-x-4">
              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 sr-only">
                  Content Type
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={moderationFilters.contentType}
                  onChange={(e) => handleModerationFilterChange({ contentType: e.target.value })}
                >
                  {contentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="moderationStatus" className="block text-sm font-medium text-gray-700 sr-only">
                  Status
                </label>
                <select
                  id="moderationStatus"
                  name="moderationStatus"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={moderationFilters.status}
                  onChange={(e) => handleModerationFilterChange({ status: e.target.value })}
                >
                  {moderationStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <ContentModerationPanel
            items={moderationItems}
            loading={moderationLoading}
            onApprove={handleApproveContent}
            onReject={handleRejectContent}
            onViewContent={handleViewContent}
            totalItems={moderationTotalCount}
            pageSize={pageSize}
            currentPage={moderationCurrentPage}
            onPageChange={handleModerationPageChange}
          />
        </div>
      )}

      {/* Event analytics */}
      {showAnalytics && selectedEventId && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Event Analytics</h3>
              <button
                onClick={closeAnalytics}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              {analyticsData ? (
                <EventAnalytics data={analyticsData} eventId={selectedEventId} />
              ) : (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventOversight;