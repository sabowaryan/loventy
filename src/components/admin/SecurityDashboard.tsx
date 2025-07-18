/**
 * Tableau de bord de sécurité pour les administrateurs
 * Affiche les logs d'audit, les tentatives de connexion et les sessions actives
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Lock, 
  Eye, 
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { useSecurity } from '../auth/SecurityProvider';

interface AuditLog {
  id: string;
  action: string;
  user_id?: string;
  user_email?: string;
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'error';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface SecurityStats {
  totalLogins: number;
  failedLogins: number;
  blockedIPs: number;
  activeSessions: number;
  suspiciousActivity: number;
}

export const SecurityDashboard: React.FC = () => {
  const { isAdmin } = useAdmin();
  const { logAction } = useSecurity();
  
  // État local
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalLogins: 0,
    failedLogins: 0,
    blockedIPs: 0,
    activeSessions: 0,
    suspiciousActivity: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'attempts' | 'sessions'>('overview');
  const [filters, setFilters] = useState({
    severity: 'all',
    dateRange: '24h',
    searchTerm: ''
  });

  // Chargement des données
  useEffect(() => {
    if (isAdmin) {
      loadSecurityData();
    }
  }, [isAdmin, filters]);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des données (à remplacer par de vrais appels API)
      await Promise.all([
        loadAuditLogs(),
        loadLoginAttempts(),
        loadSecurityStats()
      ]);
      
      await logAction('security_dashboard_accessed', {
        admin_id: 'current_user_id',
        filters: filters
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données de sécurité:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    // Simulation de données d'audit
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        action: 'login_success',
        user_email: 'user@example.com',
        details: { ip_address: '192.168.1.1' },
        severity: 'info',
        ip_address: '192.168.1.1',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        action: 'login_failed',
        user_email: 'attacker@example.com',
        details: { reason: 'invalid_password', attempts: 3 },
        severity: 'warning',
        ip_address: '10.0.0.1',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setAuditLogs(mockLogs);
  };

  const loadLoginAttempts = async () => {
    // Simulation de tentatives de connexion
    const mockAttempts: LoginAttempt[] = [
      {
        id: '1',
        email: 'user@example.com',
        success: true,
        ip_address: '192.168.1.1',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        email: 'attacker@example.com',
        success: false,
        ip_address: '10.0.0.1',
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    setLoginAttempts(mockAttempts);
  };

  const loadSecurityStats = async () => {
    // Simulation de statistiques
    setStats({
      totalLogins: 1247,
      failedLogins: 23,
      blockedIPs: 5,
      activeSessions: 89,
      suspiciousActivity: 3
    });
  };

  const exportLogs = async () => {
    try {
      await logAction('security_logs_exported', {
        admin_id: 'current_user_id',
        export_type: 'csv',
        filters: filters
      });
      
      // Simuler l'export
      const csvContent = auditLogs.map(log => 
        `${log.created_at},${log.action},${log.user_email || ''},${log.severity},${log.ip_address || ''}`
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
        <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            Tableau de bord sécurité
          </h1>
          <p className="text-gray-600 mt-1">Surveillance et audit des activités de sécurité</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadSecurityData}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connexions totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogins}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Échecs de connexion</p>
              <p className="text-2xl font-bold text-red-600">{stats.failedLogins}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">IPs bloquées</p>
              <p className="text-2xl font-bold text-orange-600">{stats.blockedIPs}</p>
            </div>
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions actives</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeSessions}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activité suspecte</p>
              <p className="text-2xl font-bold text-purple-600">{stats.suspiciousActivity}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
              { id: 'logs', label: 'Logs d\'audit', icon: Eye },
              { id: 'attempts', label: 'Tentatives de connexion', icon: Lock },
              { id: 'sessions', label: 'Sessions actives', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Filtres */}
          {(activeTab === 'logs' || activeTab === 'attempts') && (
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="all">Toutes les sévérités</option>
                  <option value="info">Info</option>
                  <option value="warning">Avertissement</option>
                  <option value="error">Erreur</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="1h">Dernière heure</option>
                  <option value="24h">Dernières 24h</option>
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm w-64"
                />
              </div>
            </div>
          )}

          {/* Contenu des onglets */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Activité récente</h3>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{log.action}</span>
                        <span className="text-gray-500">{formatDate(log.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Alertes de sécurité</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-yellow-600">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Tentatives de connexion multiples détectées
                    </div>
                    <div className="flex items-center text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      IP suspecte bloquée: 10.0.0.1
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date/Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sévérité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user_email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attempts' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date/Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loginAttempts.map(attempt => (
                    <tr key={attempt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(attempt.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attempt.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attempt.success 
                            ? 'text-green-600 bg-green-50' 
                            : 'text-red-600 bg-red-50'
                        }`}>
                          {attempt.success ? 'Succès' : 'Échec'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attempt.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sessions actives</h3>
              <p className="text-gray-600">Fonctionnalité en cours de développement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;