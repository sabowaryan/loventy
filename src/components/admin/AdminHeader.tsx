import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, Search } from 'lucide-react';
import { HealthMetrics, SystemAlert } from '../../types/admin';

interface AdminHeaderProps {
  healthStatus: 'healthy' | 'warning' | 'critical';
  metrics?: HealthMetrics | null;
  alerts?: SystemAlert[];
  loading?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  healthStatus, 
  metrics, 
  alerts = [],
  loading = false 
}) => {
  // Get the count of unresolved critical alerts
  const criticalAlertsCount = alerts.filter(
    alert => alert.severity === 'critical' || alert.severity === 'high'
  ).length;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">Administration</h1>
          
          {/* Search bar */}
          <div className="hidden md:flex ml-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* System status indicator */}
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2 hidden md:inline">État du système:</span>
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${
                loading ? 'bg-gray-300' :
                healthStatus === 'healthy' ? 'bg-green-500' : 
                healthStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm">
                {loading ? 'Chargement...' :
                 healthStatus === 'healthy' ? 'Opérationnel' : 
                 healthStatus === 'warning' ? 'Dégradé' : 'Critique'}
              </span>
            </div>
            {healthStatus !== 'healthy' && !loading && (
              <Link to="/dashboard/admin/system" className="text-sm text-secondary hover:underline ml-2">
                Détails
              </Link>
            )}
          </div>
          
          {/* Alerts button */}
          <div className="relative">
            <button className="relative p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-gray-50">
              <Bell className="h-5 w-5" />
              {criticalAlertsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {criticalAlertsCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Critical alert indicator */}
          {criticalAlertsCount > 0 && (
            <Link 
              to="/dashboard/admin/system" 
              className="hidden md:flex items-center text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {criticalAlertsCount} alerte{criticalAlertsCount > 1 ? 's' : ''} critique{criticalAlertsCount > 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;