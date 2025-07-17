import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href: string;
  current: boolean;
}

const AdminBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Generate breadcrumb items based on current path
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Dashboard', href: '/dashboard', current: false },
  ];
  
  // Map path segments to readable names
  const pathNames: Record<string, string> = {
    'admin': 'Administration',
    'users': 'Utilisateurs',
    'events': 'Événements',
    'system': 'Système',
    'security': 'Sécurité',
    'finances': 'Finances',
    'support': 'Support',
    'moderation': 'Modération',
    'config': 'Configuration',
    'stats': 'Statistiques'
  };
  
  // Build breadcrumb path
  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    breadcrumbs.push({
      name: pathNames[segment] || segment,
      href: currentPath,
      current: isLast
    });
  });

  return (
    <nav className="flex px-6 py-3 text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <div>
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
              <Home className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </div>
        </li>
        
        {breadcrumbs.slice(1).map((breadcrumb) => (
          <li key={breadcrumb.href}>
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <Link
                to={breadcrumb.href}
                className={`ml-2 ${
                  breadcrumb.current
                    ? 'font-medium text-secondary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={breadcrumb.current ? 'page' : undefined}
              >
                {breadcrumb.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default AdminBreadcrumbs;