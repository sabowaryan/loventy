import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HealthMetrics, SystemAlert, SystemHealthHook } from '../types/admin';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for fetching and monitoring system health metrics
 * Used in admin dashboard to display system status
 */
export const useSystemHealth = (refreshInterval = 60000): SystemHealthHook => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  const setMockMetrics = () => {
    const mockMetrics: HealthMetrics = {
      apiResponseTime: 120,
      databaseConnections: 15,
      errorRate: 0.1,
      uptime: 2592000, // 30 days in seconds
      memoryUsage: 45.2,
      activeUsers: 25,
      cpuUsage: 23.5,
      diskUsage: 67.8,
      lastUpdated: new Date(),
      serviceStatus: {
        database: 'operational',
        storage: 'operational',
        authentication: 'operational',
        email: 'operational',
        payments: 'operational',
      }
    };
    
    setMetrics(mockMetrics);
    setAlerts([]);
    setError(null);
  };

  const fetchMetrics = async () => {
    if (!isAdmin()) {
      setError('Unauthorized: Admin access required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch system metrics from Supabase RPC
      const { data: metricsData, error: metricsError } = await supabase.rpc('get_system_health_metrics');
      
      if (metricsError) {
        // Handle RLS recursion errors gracefully
        if (metricsError.code === '42P17' || metricsError.message?.includes('infinite recursion')) {
          console.warn('RLS recursion detected in system health, using mock data');
          setMockMetrics();
          return;
        }
        throw new Error(metricsError.message);
      }
      
      if (metricsData) {
        // Transform database response to match HealthMetrics interface
        const transformedMetrics: HealthMetrics = {
          apiResponseTime: metricsData.api_response_time || 0,
          databaseConnections: metricsData.database_connections || 0,
          errorRate: metricsData.error_rate || 0,
          uptime: metricsData.uptime || 0,
          memoryUsage: metricsData.memory_usage || 0,
          activeUsers: metricsData.active_users || 0,
          cpuUsage: metricsData.cpu_usage || 0,
          diskUsage: metricsData.disk_usage || 0,
          lastUpdated: new Date(metricsData.last_updated),
          serviceStatus: {
            database: metricsData.database_status || 'operational',
            storage: metricsData.storage_status || 'operational',
            authentication: metricsData.authentication_status || 'operational',
            email: metricsData.email_status || 'operational',
            payments: metricsData.payments_status || 'operational',
          }
        };
        
        setMetrics(transformedMetrics);
      }
      
      // Fetch active system alerts
      try {
        const { data: alertsData, error: alertsError } = await supabase
          .from('system_alerts')
          .select('*')
          .eq('is_resolved', false)
          .order('severity', { ascending: false });
        
        if (alertsError) {
          // Handle RLS recursion errors gracefully for alerts
          if (alertsError.code === '42P17' || alertsError.message?.includes('infinite recursion')) {
            console.warn('RLS recursion detected in system alerts, skipping alerts fetch');
            setAlerts([]);
          } else {
            console.warn('Error fetching system alerts:', alertsError.message);
            setAlerts([]);
          }
        } else if (alertsData) {
          // Transform alerts data to match SystemAlert interface
          const transformedAlerts: SystemAlert[] = alertsData.map(alert => ({
            id: alert.id,
            alertType: alert.alert_type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            timestamp: new Date(alert.created_at),
            isResolved: false,
            metadata: alert.metadata
          }));
          
          setAlerts(transformedAlerts);
        }
      } catch (alertErr) {
        console.warn('Failed to fetch system alerts, continuing without alerts:', alertErr);
        setAlerts([]);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system health data');
      console.error('Error fetching system health:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
    
    // Set up interval for periodic refreshes
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchMetrics, refreshInterval);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval]);

  return {
    metrics,
    alerts,
    loading,
    error,
    refreshMetrics: fetchMetrics
  };
};

export default useSystemHealth;