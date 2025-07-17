import React from 'react';

interface EventAnalyticsProps {
  data: any;
  eventId: string;
}

/**
 * Component for displaying event analytics and engagement metrics
 */
const EventAnalytics: React.FC<EventAnalyticsProps> = ({ data, eventId }) => {
  // If no data is provided, show loading or empty state
  if (!data) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
        <p className="mt-1 text-sm text-gray-500">Analytics data for this event is not available or still being processed.</p>
      </div>
    );
  }

  // Extract analytics data with fallback values
  const analytics = {
    totalViews: data.total_views || 0,
    uniqueVisitors: data.unique_visitors || 0,
    rsvpRate: data.rsvp_rate || 0,
    totalRsvps: data.total_rsvps || 0,
    confirmedGuests: data.confirmed_guests || 0,
    declinedGuests: data.declined_guests || 0,
    pendingGuests: data.pending_guests || 0,
    averageTimeOnPage: data.average_time_on_page || 0,
    bounceRate: data.bounce_rate || 0,
    mobileVisitors: data.mobile_visitors || 0,
    desktopVisitors: data.desktop_visitors || 0,
    topReferrers: data.top_referrers || [],
    dailyViews: data.daily_views || [],
    guestEngagement: data.guest_engagement || {}
  };

  // Calculate percentages
  const mobilePercentage = analytics.totalViews > 0 ? Math.round((analytics.mobileVisitors / analytics.totalViews) * 100) : 0;
  const desktopPercentage = 100 - mobilePercentage;
  const rsvpPercentage = Math.round(analytics.rsvpRate * 100);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalViews.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unique Visitors</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.uniqueVisitors.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">RSVP Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{rsvpPercentage}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Time on Page</dt>
                  <dd className="text-lg font-medium text-gray-900">{Math.round(analytics.averageTimeOnPage / 60)}m</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Breakdown */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">RSVP Breakdown</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.confirmedGuests}</div>
              <div className="text-sm text-gray-500">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.declinedGuests}</div>
              <div className="text-sm text-gray-500">Declined</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{analytics.pendingGuests}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Device Breakdown</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.mobileVisitors}</div>
              <div className="text-sm text-gray-500">Mobile ({mobilePercentage}%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.desktopVisitors}</div>
              <div className="text-sm text-gray-500">Desktop ({desktopPercentage}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      {analytics.topReferrers.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Referrers</h3>
            <div className="space-y-3">
              {analytics.topReferrers.slice(0, 5).map((referrer: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {referrer.source || 'Direct'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {referrer.visits} visits
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Views Chart (Simple representation) */}
      {analytics.dailyViews.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Daily Views (Last 7 Days)</h3>
            <div className="space-y-2">
              {analytics.dailyViews.slice(-7).map((day: any, index: number) => {
                const maxViews = Math.max(...analytics.dailyViews.map((d: any) => d.views));
                const barWidth = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-20 text-sm text-gray-500">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-900 text-right">
                      {day.views}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Additional Metrics</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Bounce Rate</dt>
              <dd className="mt-1 text-sm text-gray-900">{Math.round(analytics.bounceRate * 100)}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total RSVPs</dt>
              <dd className="mt-1 text-sm text-gray-900">{analytics.totalRsvps}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;