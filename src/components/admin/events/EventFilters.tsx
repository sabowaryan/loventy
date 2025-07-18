import React, { useState, useEffect } from 'react';
import {
  eventStatusOptions,
  sortOptions,
  sortDirectionOptions
} from '../../../utils/eventFilters';

interface EventFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onDateRangeChange?: (dateRange: { start?: Date; end?: Date } | null) => void;
  pageSize?: number;
}

/**
 * Component for filtering and searching events
 */
const EventFilters: React.FC<EventFiltersProps> = ({ 
  onSearch, 
  onFilterChange, 
  onPageSizeChange,
  onDateRangeChange,
  pageSize = 10 
}) => {
  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [status, setStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('event_date');
  const [sortDirection, setSortDirection] = useState<string>('desc');
  const [itemsPerPage, setItemsPerPage] = useState<number>(pageSize);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, onSearch]);

  // Handle filter changes
  const handleFilterChange = () => {
    onFilterChange({
      status,
      sortBy,
      sortDirection
    });
  };

  // Handle date range changes
  const handleDateRangeChange = () => {
    if (onDateRangeChange) {
      if (startDate || endDate) {
        const dateRange: { start?: Date; end?: Date } = {};
        if (startDate) dateRange.start = new Date(startDate);
        if (endDate) dateRange.end = new Date(endDate);
        onDateRangeChange(dateRange);
      } else {
        onDateRangeChange(null);
      }
    }
  };

  // Apply filters when they change
  useEffect(() => {
    handleFilterChange();
  }, [status, sortBy, sortDirection]);

  // Apply date range when dates change
  useEffect(() => {
    handleDateRangeChange();
  }, [startDate, endDate]);

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-4 md:gap-6">
        {/* Search input */}
        <div className="md:col-span-4">
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex items-stretch flex-grow focus-within:z-10">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                placeholder="Search events by title, owner name, or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              onClick={() => onSearch(searchQuery)}
            >
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Filter dropdowns and date range */}
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Page size selector */}
          <div className="sm:col-span-1">
            <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700">
              Items Per Page
            </label>
            <select
              id="pageSize"
              name="pageSize"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={itemsPerPage}
              onChange={(e) => {
                const newPageSize = parseInt(e.target.value, 10);
                setItemsPerPage(newPageSize);
                if (onPageSizeChange) {
                  onPageSizeChange(newPageSize);
                }
              }}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
          
          {/* Status filter */}
          <div className="sm:col-span-1">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {eventStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by filter */}
          <div className="sm:col-span-1">
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort direction filter */}
          <div className="sm:col-span-1">
            <label htmlFor="sortDirection" className="block text-sm font-medium text-gray-700">
              Sort Direction
            </label>
            <select
              id="sortDirection"
              name="sortDirection"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
            >
              {sortDirectionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start date filter */}
          <div className="sm:col-span-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End date filter */}
          <div className="sm:col-span-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;