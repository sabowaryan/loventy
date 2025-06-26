import React from 'react';
import { TrendingUp, Users, Mail, HardDrive, FileText, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { formatLimit, isUnlimited } from '../stripe-config';

interface UsageDisplayProps {
  showUpgrade?: boolean;
  compact?: boolean;
}

const UsageDisplay: React.FC<UsageDisplayProps> = ({ 
  showUpgrade = true, 
  compact = false 
}) => {
  const { limits, isLoading, quotas, features } = usePlanLimits();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!limits) {
    return null;
  }

  const usageItems = [
    {
      label: 'Invitations ce mois',
      quota: quotas.invitation,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Invités total',
      quota: quotas.guest,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Emails envoyés',
      quota: quotas.email,
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Stockage utilisé',
      quota: quotas.storage,
      icon: HardDrive,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 75) return 'bg-amber-100';
    return 'bg-green-100';
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
            Utilisation
          </h3>
          {!limits.isActive && (
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              Plan gratuit
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          {usageItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 truncate">{item.label}</span>
              <span className="font-medium whitespace-nowrap">
                {item.quota?.used}{item.quota?.unit || ''} / {formatLimit(item.quota?.total || 0, item.quota?.unit || '')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Utilisation de votre plan
        </h3>
        
        {!limits.isActive && (
          <span className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
            Plan gratuit
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {usageItems.map((item, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                {item.quota?.used}{item.quota?.unit || ''} / {formatLimit(item.quota?.total || 0, item.quota?.unit || '')}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className={`w-full rounded-full h-2 ${getProgressBgColor(item.quota?.percent || 0)}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(item.quota?.percent || 0)}`}
                  style={{ width: `${Math.min(item.quota?.percent || 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{item.quota?.percent || 0}% utilisé</span>
                {item.quota?.percent && item.quota.percent >= 90 && !item.quota.isUnlimited && (
                  <span className="text-red-600 font-medium">Limite proche</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showUpgrade && !limits.isActive && (
        <div className="bg-gradient-to-r from-[#D4A5A5] to-[#C5D2C2] rounded-lg p-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="font-semibold mb-1 flex items-center">
                <Crown className="h-4 w-4 mr-2" />
                Passez Premium
              </h4>
              <p className="text-sm opacity-90">
                Débloquez plus de fonctionnalités et augmentez vos limites
              </p>
            </div>
            <Link
              to="/pricing"
              className="bg-white text-[#D4A5A5] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
            >
              Voir les plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageDisplay;