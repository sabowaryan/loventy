import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const UserWelcome: React.FC = () => {
  const { user } = useAuth();
  const { isPremiumUser } = usePermissions();

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
              ? 'Bienvenue sur Loventy ! Créez votre première invitation de mariage.' 
              : 'Prêt à créer de magnifiques invitations pour votre grand jour ?'
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
            <Link
              to="/templates"
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-3 text-center font-medium transition-colors"
            >
              🎨 Choisir un modèle
            </Link>
            <Link
              to="/dashboard/invitations"
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-3 text-center font-medium transition-colors"
            >
              📋 Voir mes invitations
            </Link>
            {!isPremiumUser() && (
              <Link
                to="/pricing"
                className="flex-1 bg-yellow-500/30 hover:bg-yellow-500/40 rounded-lg px-4 py-3 text-center font-medium transition-colors"
              >
                ⭐ Découvrir Premium
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWelcome;