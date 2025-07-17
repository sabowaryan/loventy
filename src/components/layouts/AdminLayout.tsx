import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLayoutProps } from '../../types/admin';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import AdminHeader from '../admin/AdminHeader';
import AdminNavigation from '../admin/AdminNavigation';
import AdminBreadcrumbs from '../admin/AdminBreadcrumbs';

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const { metrics, alerts, loading } = useSystemHealth();

  // Update health status based on metrics
  useEffect(() => {
    if (loading || !metrics) return;

    // Determine health status based on metrics
    if (metrics.errorRate > 5 || 
        metrics.serviceStatus.database !== 'operational' || 
        metrics.serviceStatus.authentication !== 'operational') {
      setHealthStatus('critical');
    } else if (metrics.errorRate > 1 || 
              metrics.apiResponseTime > 500 || 
              metrics.serviceStatus.storage !== 'operational' || 
              metrics.serviceStatus.email !== 'operational' || 
              metrics.serviceStatus.payments !== 'operational') {
      setHealthStatus('warning');
    } else {
      setHealthStatus('healthy');
    }
  }, [metrics, loading]);

  // Check if admin has access
  if (!isAdmin()) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="mt-2 text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
          <Link to="/dashboard" className="mt-6 inline-block px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">
            Retour au tableau de bord
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Admin header with system status */}
      <AdminHeader 
        healthStatus={healthStatus} 
        metrics={metrics} 
        alerts={alerts}
        loading={loading}
      />

      {/* Admin navigation */}
      <AdminNavigation />
      
      {/* Breadcrumbs */}
      <AdminBreadcrumbs />

      {/* Admin content */}
      <div className="p-6">
        {children}
      </div>
    </DashboardLayout>
  );
};

export default AdminLayout;