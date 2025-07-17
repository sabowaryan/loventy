import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle, 
  BarChart2, 
  Shield, 
  CreditCard, 
  MessageSquare,
  FileText,
  Settings,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminNavigationProps {
  className?: string;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ className = '' }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  
  // Admin navigation items with permission checks
  const adminNavItems = [
    { 
      name: 'Utilisateurs', 
      href: '/dashboard/admin/users', 
      icon: Users,
      permission: 'admin.users.read'
    },
    { 
      name: 'Événements', 
      href: '/dashboard/admin/events', 
      icon: FileText,
      permission: 'admin.events.read'
    },
    { 
      name: 'Système', 
      href: '/dashboard/admin/system', 
      icon: Activity,
      permission: 'admin.system.read'
    },
    { 
      name: 'Sécurité', 
      href: '/dashboard/admin/security', 
      icon: Shield,
      permission: 'admin.security.read'
    },
    { 
      name: 'Finances', 
      href: '/dashboard/admin/finances', 
      icon: CreditCard,
      permission: 'admin.finances.read'
    },
    { 
      name: 'Support', 
      href: '/dashboard/admin/support', 
      icon: MessageSquare,
      permission: 'admin.support.read'
    },
    { 
      name: 'Modération', 
      href: '/dashboard/admin/moderation', 
      icon: AlertTriangle,
      permission: 'admin.moderation.read'
    },
    { 
      name: 'Configuration', 
      href: '/dashboard/admin/config', 
      icon: Settings,
      permission: 'admin.config.read'
    },
    { 
      name: 'Statistiques', 
      href: '/dashboard/admin/stats', 
      icon: BarChart2,
      permission: 'admin.stats.read'
    }
  ];

  // Filter navigation items based on permissions
  const filteredNavItems = adminNavItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 overflow-x-auto">
        <nav className="flex space-x-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                isActive(item.href)
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminNavigation;