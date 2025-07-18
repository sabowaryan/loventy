import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Bell,
  User,
  Crown,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { AdminLayoutProps } from '../../types/admin';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import LoventyLogo from '../LoventyLogo';
import AdminHeader from '../admin/AdminHeader';
import AdminNavigation from '../admin/AdminNavigation';
import AdminBreadcrumbs from '../admin/AdminBreadcrumbs';

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { isPremiumUser } = usePermissions();
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
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="p-8 text-center bg-white rounded-lg shadow-lg max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="mt-2 text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
          <Link to="/dashboard" className="mt-6 inline-block px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || 'Utilisateur';
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-accent">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Admin Sidebar - Fixed */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>

        {/* Sidebar Header - Fixed */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <Link to="/" className="flex items-center space-x-2 group">
            <LoventyLogo className="h-8 w-8 text-secondary fill-current group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl font-bold text-primary font-serif">Loventy</span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">ADMIN</span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Back to Dashboard Link */}
        <div className="px-4 py-3 border-b border-gray-100">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au tableau de bord</span>
          </Link>
        </div>

        {/* Admin Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto mt-4">
          <AdminNavigation />
        </nav>

        {/* User section - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getUserDisplayName()}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
                <span title="Administrateur">
                  <Crown className="h-3 w-3 text-red-600" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar - Fixed */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-400" />
            </button>

            {/* Admin Header with system status */}
            <div className="flex-1">
              <AdminHeader
                healthStatus={healthStatus}
                metrics={metrics}
                alerts={alerts}
                loading={loading}
              />
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-gray-50">
                <Bell className="h-5 w-5" />
                {alerts && alerts.length > 0 && (
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
                )}
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2 p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-gray-50"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <div className="flex items-center space-x-1">
                      <p className="text-xs text-gray-500">
                        Administrateur
                      </p>
                      <Crown className="h-3 w-3 text-red-600" />
                    </div>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                      <p className="text-sm font-medium text-gray-900">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500">Administrateur</p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon profil
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Tableau de bord utilisateur
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <AdminBreadcrumbs />

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;