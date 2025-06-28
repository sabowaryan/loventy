import React from 'react';
import { AlertTriangle, Crown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { formatLimit } from '../stripe-config';

interface PlanLimitWarningProps {
  type: 'invitation' | 'guest' | 'email' | 'storage' | 'event';
  className?: string;
  showUpgrade?: boolean;
}

const PlanLimitWarning: React.FC<PlanLimitWarningProps> = ({ 
  type, 
  className = '', 
  showUpgrade = true 
}) => {
  const { checkLimit, getLimitMessage, quotas } = usePlanLimits();

  // Si la limite n'est pas atteinte ou si les quotas ne sont pas chargés, ne rien afficher
  if (checkLimit(type) || !quotas[type]) {
    return null;
  }

  const getTypeInfo = () => {
    switch (type) {
      case 'invitation':
        return {
          title: 'Limite d\'invitations atteinte',
          description: 'Vous avez atteint votre limite mensuelle d\'invitations.',
          icon: AlertTriangle
        };
      case 'guest':
        return {
          title: 'Limite d\'invités atteinte',
          description: 'Vous avez atteint votre limite d\'invités.',
          icon: AlertTriangle
        };
      case 'email':
        return {
          title: 'Limite d\'emails atteinte',
          description: 'Vous avez atteint votre limite mensuelle d\'envois d\'emails.',
          icon: AlertTriangle
        };
      case 'storage':
        return {
          title: 'Limite de stockage atteinte',
          description: 'Vous avez atteint votre limite de stockage.',
          icon: AlertTriangle
        };
      case 'event':
        return {
          title: 'Limite d\'événements atteinte',
          description: 'Vous avez atteint votre limite mensuelle d\'événements.',
          icon: AlertTriangle
        };
      default:
        return {
          title: 'Limite atteinte',
          description: 'Vous avez atteint une limite de votre plan.',
          icon: AlertTriangle
        };
    }
  };

  const { title, description, icon: Icon } = getTypeInfo();
  const limitMessage = getLimitMessage(type);
  const quota = quotas[type];

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-800 mb-1">
            {title}
          </h3>
          <p className="text-sm text-amber-700 mb-2">
            {description}
          </p>
          <p className="text-xs text-amber-600 mb-3">
            {limitMessage}
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-amber-200 rounded-full h-2 mb-3">
            <div 
              className="bg-amber-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${quota?.percent || 0}%` }}
            />
          </div>

          {showUpgrade && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                to="/pricing"
                className="inline-flex items-center px-3 py-2 bg-[#D4A5A5] text-white text-sm font-medium rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
              >
                <Crown className="h-4 w-4 mr-2" />
                Passer Premium
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-3 py-2 border border-amber-300 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Voir l'utilisation
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanLimitWarning;