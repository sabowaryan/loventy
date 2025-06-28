import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, CheckCircle, Clock, BarChart3, Download, Eye, Send, Edit, X, Crown, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useInvitations } from '../hooks/useInvitations';
import { useInvitationGuests } from '../hooks/useInvitationGuests';
import UserWelcome from '../components/UserWelcome';
import UsageDisplay from '../components/UsageDisplay';
import FeatureToggle from '../components/FeatureToggle';
import FeatureVariant from '../components/FeatureVariant';
import { useFeature } from '../hooks/useFeature';

const Dashboard: React.FC = () => {
  usePageTitle('Tableau de bord');
  
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const {
    canCreateInvitations,
    canEditInvitations,
    canDeleteInvitations,
    canSendInvitations,
    canManageGuests,
    canExportGuests,
    canAccessPremiumTemplates,
    canViewAnalytics,
    canViewAdvancedAnalytics,
    isPremiumUser,
    isAdmin
  } = usePermissions();
  const { canCreateInvitation } = usePlanLimits();
  const { isEnabled } = useFeature();

  // Utiliser les hooks pour récupérer les données réelles
  const { 
    invitations, 
    isLoading: invitationsLoading, 
    error: invitationsError 
  } = useInvitations({ limit: 3, sortBy: 'created_at', sortOrder: 'desc' });
  
  const { 
    guests, 
    isLoading: guestsLoading, 
    error: guestsError,
    getGuestStats 
  } = useInvitationGuests();

  const [stats, setStats] = useState({
    totalInvitations: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    pendingGuests: 0,
    responseRate: 0
  });

  // Calculer les statistiques à partir des données réelles
  useEffect(() => {
    if (!invitationsLoading && !guestsLoading) {
      const guestStats = getGuestStats();
      
      setStats({
        totalInvitations: invitations.length,
        totalGuests: guestStats.total,
        confirmedGuests: guestStats.confirmed,
        pendingGuests: guestStats.pending,
        responseRate: guestStats.confirmationRate
      });
    }
  }, [invitations, guests, invitationsLoading, guestsLoading, getGuestStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'notification-success';
      case 'pending':
        return 'notification-warning';
      case 'declined':
        return 'notification-error';
      case 'sent':
        return 'notification-info';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'declined':
        return <X className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      case 'published':
        return <Eye className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'declined':
        return 'Décliné';
      case 'sent':
        return 'Envoyée';
      case 'draft':
        return 'Brouillon';
      case 'published':
        return 'Publiée';
      default:
        return status;
    }
  };

  const StatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Invitations</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{stats.totalInvitations}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Confirmées</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{stats.confirmedGuests}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">En attente</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{stats.pendingGuests}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Taux réponse</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{stats.responseRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Actions rapides</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureToggle featureKey="enable_events" fallback={
          canCreateInvitations && canCreateInvitation && (
            <Link
              to="/templates"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-colors group"
            >
              <div className="flex-shrink-0 p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                <Plus className="h-5 w-5 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-primary truncate">Nouvelle invitation</div>
                <div className="text-sm text-gray-600 truncate">Créer une invitation</div>
              </div>
            </Link>
          )
        }>
          <Link
            to="/events"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-colors group"
          >
            <div className="flex-shrink-0 p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-primary truncate">Gérer les événements</div>
              <div className="text-sm text-gray-600 truncate">Créer ou modifier</div>
            </div>
          </Link>
        </FeatureToggle>
        
        <Link
          to="/dashboard/invitations"
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-colors group"
        >
          <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-primary truncate">Mes invitations</div>
            <div className="text-sm text-gray-600 truncate">Gérer mes invitations</div>
          </div>
        </Link>

        {canManageGuests && (
          <Link
            to="/dashboard/guests"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-colors group"
          >
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-primary truncate">Gérer les invités</div>
              <div className="text-sm text-gray-600 truncate">Liste des invités</div>
            </div>
          </Link>
        )}

        {canViewAnalytics && (
          <Link
            to="/dashboard/analytics"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-colors group"
          >
            <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-primary truncate">Statistiques</div>
              <div className="text-sm text-gray-600 truncate">Voir les analyses</div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );

  const RecentInvitations = () => {
    if (invitationsLoading) {
      return (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (invitationsError) {
      return (
        <div className="card p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h4>
            <p className="text-gray-500 mb-4">Impossible de charger vos invitations.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-primary">Invitations récentes</h3>
          <Link
            to="/dashboard/invitations"
            className="text-sm text-secondary hover:text-secondary/80 font-medium"
          >
            Voir tout
          </Link>
        </div>
        
        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune invitation</h4>
            <p className="text-gray-500 mb-4">Commencez par créer votre première invitation</p>
            <FeatureToggle featureKey="enable_events" fallback={
              canCreateInvitations && canCreateInvitation && (
                <Link
                  to="/templates"
                  className="btn-accent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une invitation
                </Link>
              )
            }>
              <Link
                to="/events"
                className="btn-accent"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Créer un événement
              </Link>
            </FeatureToggle>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-primary truncate">{invitation.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invitation.status)}`}>
                        {getStatusIcon(invitation.status)}
                        <span className="ml-1">{getStatusText(invitation.status)}</span>
                      </span>
                      {invitation.is_premium_template && (
                        <Crown className="h-4 w-4 text-secondary flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center space-x-1 truncate">
                          <span className="truncate">{invitation.template_name || 'Modèle personnalisé'}</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center space-x-1 truncate">
                          <span className="truncate">{invitation.total_guests} invités</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center space-x-1 truncate">
                          <span className="truncate">{invitation.confirmed_guests} confirmés</span>
                        </div>
                      </div>
                      
                      {invitation.event_date && (
                        <div className="flex items-center space-x-1 text-gray-500 truncate">
                          <span className="truncate">
                            {new Date(invitation.event_date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          {invitation.venue && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline truncate">{invitation.venue}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <Link
                      to={`/invitation/${invitation.id}`}
                      className="p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white" 
                      title="Prévisualiser l'invitation"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    
                    {canEditInvitations && (
                      <Link
                        to={`/editor/${invitation.id}`}
                        className="p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white" 
                        title="Modifier l'invitation"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // État de chargement global
  const isLoading = invitationsLoading || guestsLoading;
  const hasError = invitationsError || guestsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center py-8 px-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">
            Nous n'avons pas pu charger vos données. Veuillez vérifier votre connexion et réessayer.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <UserWelcome />

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <QuickActions />
            <RecentInvitations />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <UsageDisplay compact={true} />
            
            {/* Tips & Help */}
            <div className="card">
              <h3 className="text-lg font-semibold text-primary mb-4">💡 Conseils</h3>
              <div className="space-y-3 text-sm">
                <FeatureVariant variableKey="dashboard_tips" defaultValue={[
                  {
                    title: "Personnalisez vos invitations",
                    text: "Ajoutez votre photo de couple pour un rendu plus personnel",
                    type: "info"
                  },
                  {
                    title: "Suivez les réponses",
                    text: "Relancez gentiment les invités qui n'ont pas encore répondu",
                    type: "success"
                  }
                ]}>
                  {(tips) => (
                    <>
                      {tips.map((tip, index) => (
                        <div key={index} className={`p-3 notification-${tip.type} rounded-lg`}>
                          <p className={`font-medium text-${tip.type === 'info' ? 'blue' : tip.type === 'success' ? 'green' : 'yellow'}-900 mb-1`}>{tip.title}</p>
                          <p className={`text-${tip.type === 'info' ? 'blue' : tip.type === 'success' ? 'green' : 'yellow'}-700`}>{tip.text}</p>
                        </div>
                      ))}
                    </>
                  )}
                </FeatureVariant>
                
                {!isPremiumUser() && (
                  <div className="p-3 notification-warning rounded-lg">
                    <p className="font-medium text-yellow-900 mb-1">Passez Premium</p>
                    <p className="text-yellow-700">Débloquez tous les modèles et fonctionnalités avancées</p>
                    <Link
                      to="/pricing"
                      className="inline-block mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-medium hover:bg-yellow-300 transition-colors"
                    >
                      Voir les plans
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;