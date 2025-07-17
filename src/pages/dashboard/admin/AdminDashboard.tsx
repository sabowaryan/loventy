import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  Activity,
  Shield,
  MessageSquare,
  Settings
} from 'lucide-react';
import { AdminStats } from '../../../types/admin';
import { supabase } from '../../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        
        // Fetch admin statistics from Supabase RPC
        const { data, error } = await supabase.rpc('get_admin_stats');
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
          // Transform data to match AdminStats interface
          const transformedStats: AdminStats = {
            totalUsers: data.total_users || 0,
            activeUsers: data.active_users || 0,
            totalEvents: data.total_events || 0,
            monthlyRevenue: data.monthly_revenue || 0,
            systemHealth: data.system_health || 'healthy',
            newUsersLast30Days: data.new_users_last_30_days || 0,
            newEventsLast30Days: data.new_events_last_30_days || 0,
            activeSubscriptions: data.active_subscriptions || 0,
            averageResponseTime: data.average_response_time || 0,
            storageUsed: data.storage_used || 0,
            totalStorage: data.total_storage || 0
          };
          
          setStats(transformedStats);
        }
        
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch admin statistics');
        console.error('Error fetching admin stats:', err);
        
        // Set mock data for development
        setStats({
          totalUsers: 1250,
          activeUsers: 876,
          totalEvents: 3421,
          monthlyRevenue: 8750,
          systemHealth: 'healthy',
          newUsersLast30Days: 124,
          newEventsLast30Days: 342,
          activeSubscriptions: 456,
          averageResponseTime: 120,
          storageUsed: 256000000,
          totalStorage: 1073741824
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  // Admin quick access cards
  const adminCards = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les comptes, suspensions et activités',
      icon: Users,
      link: '/dashboard/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Supervision des événements',
      description: 'Surveiller et modérer les événements',
      icon: Calendar,
      link: '/dashboard/admin/events',
      color: 'bg-green-500'
    },
    {
      title: 'Santé du système',
      description: 'Surveiller les performances et métriques',
      icon: Activity,
      link: '/dashboard/admin/system',
      color: 'bg-purple-500'
    },
    {
      title: 'Sécurité et audit',
      description: 'Journaux d\'audit et alertes de sécurité',
      icon: Shield,
      link: '/dashboard/admin/security',
      color: 'bg-red-500'
    },
    {
      title: 'Gestion financière',
      description: 'Abonnements et transactions',
      icon: CreditCard,
      link: '/dashboard/admin/finances',
      color: 'bg-yellow-500'
    },
    {
      title: 'Support et communication',
      description: 'Tickets et annonces',
      icon: MessageSquare,
      link: '/dashboard/admin/support',
      color: 'bg-indigo-500'
    },
    {
      title: 'Modération de contenu',
      description: 'Révision et modération du contenu',
      icon: AlertTriangle,
      link: '/dashboard/admin/moderation',
      color: 'bg-orange-500'
    },
    {
      title: 'Configuration',
      description: 'Paramètres et options système',
      icon: Settings,
      link: '/dashboard/admin/config',
      color: 'bg-teal-500'
    }
  ];

  // Format storage size
  const formatStorage = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Tableau de bord administrateur</h1>
        <p className="text-gray-600">Bienvenue dans l'espace d'administration de Loventy.</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Utilisateurs</h2>
          <p className="text-3xl font-bold">
            {loading ? '--' : stats?.totalUsers.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Chargement...' : `+${stats?.newUsersLast30Days} derniers 30j`}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Événements</h2>
          <p className="text-3xl font-bold">
            {loading ? '--' : stats?.totalEvents.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Chargement...' : `+${stats?.newEventsLast30Days} derniers 30j`}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Revenus mensuels</h2>
          <p className="text-3xl font-bold">
            {loading ? '--' : formatCurrency(stats?.monthlyRevenue || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Chargement...' : `${stats?.activeSubscriptions} abonnements actifs`}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Stockage</h2>
          <p className="text-3xl font-bold">
            {loading ? '--' : formatStorage(stats?.storageUsed || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Chargement...' : `sur ${formatStorage(stats?.totalStorage || 0)}`}
          </p>
        </div>
      </div>

      {/* System health indicator */}
      <div className={`p-4 rounded-lg ${
        !stats ? 'bg-gray-100' :
        stats.systemHealth === 'healthy' ? 'bg-green-50 border border-green-200' :
        stats.systemHealth === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center">
          <div className={`h-4 w-4 rounded-full mr-3 ${
            !stats ? 'bg-gray-400' :
            stats.systemHealth === 'healthy' ? 'bg-green-500' :
            stats.systemHealth === 'warning' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          <div>
            <h3 className="font-medium">
              {!stats ? 'Chargement...' :
               stats.systemHealth === 'healthy' ? 'Tous les systèmes opérationnels' :
               stats.systemHealth === 'warning' ? 'Performance dégradée' :
               'Problèmes critiques détectés'}
            </h3>
            <p className="text-sm text-gray-600">
              {!stats ? '' :
               stats.systemHealth === 'healthy' ? 'Temps de réponse moyen: ' + stats.averageResponseTime + 'ms' :
               stats.systemHealth === 'warning' ? 'Vérifiez la page de santé du système pour plus de détails' :
               'Action immédiate requise - voir la page de santé du système'}
            </p>
          </div>
          <div className="ml-auto">
            <Link 
              to="/dashboard/admin/system" 
              className="text-sm font-medium text-secondary hover:underline"
            >
              Détails
            </Link>
          </div>
        </div>
      </div>

      {/* Admin quick access */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accès rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((card, index) => (
            <Link 
              key={index}
              to={card.link}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 flex flex-col"
            >
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Erreur lors du chargement des données</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;