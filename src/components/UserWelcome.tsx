import React from 'react';
import { Plus, Users, Mail, CheckCircle, Clock, BarChart3, Download, Eye, Send, Edit, X, Crown, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useEvents } from '../hooks/useEvents';
import { useFeature } from '../hooks/useFeature';

const UserWelcome: React.FC = () => {
  const { user } = useAuth();
  const { isPremiumUser } = usePermissions();
  const { canCreateEvent, canCreateInvitation } = usePlanLimits();
  const { events, isLoading: eventsLoading } = useEvents({ limit: 1 });
  const { isEnabled } = useFeature();

  if (!user) return null;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getUserDisplayName = () => {
    if (user.firstName) {
      return user.firstName;
    }
    return user.email.split('@')[0];
  };

  const isNewUser = () => {
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24; // Nouveau si créé dans les dernières 24h
  };

  const hasEvents = events && events.length > 0;

  return (
    <div className="bg-gradient-to-r from-[#D4A5A5] to-[#C5D2C2] rounded-2xl p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-2xl font-bold font-serif">
              {getWelcomeMessage()} {getUserDisplayName()} !
            </h1>
            {isNewUser() && (
              <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Nouveau</span>
              </div>
            )}
            {isPremiumUser() && (
              <div className="flex items-center space-x-1 bg-yellow-500/20 rounded-full px-3 py-1">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Premium</span>
              </div>
            )}
          </div>
          
          <p className="text-lg opacity-90">
            {isNewUser() 
              ? 'Bienvenue sur Loventy ! Commencez par créer un événement pour vos invitations.' 
              : hasEvents 
                ? 'Prêt à créer de magnifiques invitations pour votre grand jour ?' 
                : 'Créez votre premier événement pour commencer à envoyer des invitations.'
            }
          </p>
        </div>

        <div className="flex-shrink-0 ml-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${getUserDisplayName()}`}
              className="w-16 h-16 rounded-full border-4 border-white/20 shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/20">
              <Heart className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {isNewUser() && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex flex-col sm:flex-row gap-3">
            {canCreateEvent ? (
              <Link
                to="/events"
                className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-3 text-center font-medium transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2 inline-block" />
                Créer un événement
              </Link>
            ) : (
              <Link
                to="/pricing"
                className="flex-1 bg-yellow-500/30 hover:bg-yellow-500/40 rounded-lg px-4 py-3 text-center font-medium transition-colors"
              >
                <Crown className="h-4 w-4 mr-2 inline-block" />
                Débloquer plus d'événements
              </Link>
            )}
            
            {hasEvents && canCreateInvitation && (
              <Link
                to="/templates"
                className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-3 text-center font-medium transition-colors"
              >
                <Mail className="h-4 w-4 mr-2 inline-block" />
                Créer une invitation
              </Link>
            )}
            
            <Link
              to="/dashboard/guests"
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-3 text-center font-medium transition-colors"
            >
              <Users className="h-4 w-4 mr-2 inline-block" />
              Gérer les invités
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWelcome;

// Placeholder for the Sparkles component that was used in the original code
// but wasn't imported. Adding it here for the code to work.
const Sparkles: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 3v18M9 6l3-3 3 3M9 18l3 3 3-3M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3" />
    </svg>
  );
};