import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Send, 
  Copy, 
  Trash2, 
  Calendar, 
  Users, 
  Mail, 
  CheckCircle, 
  Clock, 
  X,
  Crown,
  Heart,
  Sparkles,
  Download,
  Share2,
  BarChart3,
  Loader2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { usePageTitle } from '../../hooks/usePageTitle';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useInvitations } from '../../hooks/useInvitations';
import PlanLimitWarning from '../../components/PlanLimitWarning';
import type { InvitationDetails } from '../../types/models';

const Invitations: React.FC = () => {
  usePageTitle('Mes invitations');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortValue, setSortValue] = useState<string>('date-desc');
  const [selectedInvitations, setSelectedInvitations] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [invitationToDuplicate, setInvitationToDuplicate] = useState<string | null>(null);
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { canCreateInvitations, canEditInvitations, canDeleteInvitations, canSendInvitations, isPremiumUser } = usePermissions();
  const { canCreateInvitation } = usePlanLimits();
  
  // Extraire les valeurs de tri
  const [sortBy, sortOrder] = sortValue.split('-') as ['date' | 'name' | 'status', 'asc' | 'desc'];
  
  // Utiliser le hook useInvitations pour charger les invitations depuis la base de données
  const { 
    invitations, 
    isLoading, 
    error, 
    refreshInvitations, 
    deleteInvitation,
    duplicateInvitation,
    updateInvitationStatus
  } = useInvitations({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    searchTerm: searchTerm || undefined,
    sortBy: sortBy === 'date' ? 'created_at' : 
            sortBy === 'name' ? 'title' : 'status',
    sortOrder: sortOrder
  });

  // Réinitialiser la sélection quand les invitations changent
  useEffect(() => {
    setSelectedInvitations([]);
  }, [invitations]);

  // Fermer le menu d'action quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionMenu && !(event.target as Element).closest('.action-menu')) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionMenu]);

  // Effacer le message de succès de copie après 2 secondes
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'published':
        return 'notification-info';
      case 'sent':
        return 'notification-success';
      case 'archived':
        return 'notification-warning';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-3 w-3" />;
      case 'published':
        return <Eye className="h-3 w-3" />;
      case 'sent':
        return <Send className="h-3 w-3" />;
      case 'archived':
        return <Clock className="h-3 w-3" />;
      default:
        return <Edit className="h-3 w-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'published':
        return 'Publiée';
      case 'sent':
        return 'Envoyée';
      case 'archived':
        return 'Archivée';
      default:
        return status;
    }
  };

  const handleSelectInvitation = (id: string) => {
    setSelectedInvitations(prev =>
      prev.includes(id)
        ? prev.filter(invId => invId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvitations.length === invitations.length) {
      setSelectedInvitations([]);
    } else {
      setSelectedInvitations(invitations.map(inv => inv.id));
    }
  };

  const handleDeleteInvitation = (id: string) => {
    setInvitationToDelete(id);
    setShowActionMenu(null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (invitationToDelete) {
      setIsDeleting(true);
      try {
        const success = await deleteInvitation(invitationToDelete);
        if (success) {
          setInvitationToDelete(null);
          setShowDeleteModal(false);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDuplicateInvitation = (id: string, title: string) => {
    setInvitationToDuplicate(id);
    setDuplicateTitle(`Copie de ${title}`);
    setShowActionMenu(null);
    setShowDuplicateModal(true);
  };

  const confirmDuplicate = async () => {
    if (invitationToDuplicate && duplicateTitle) {
      setIsDuplicating(true);
      try {
        const newInvitationId = await duplicateInvitation(invitationToDuplicate, duplicateTitle);
        if (newInvitationId) {
          setInvitationToDuplicate(null);
          setShowDuplicateModal(false);
          // Optionnel : rediriger vers la nouvelle invitation
          // navigate(`/editor/${newInvitationId}`);
        }
      } finally {
        setIsDuplicating(false);
      }
    }
  };

  const handlePublishInvitation = async (id: string) => {
    setShowActionMenu(null);
    await updateInvitationStatus(id, 'published');
  };

  const handleCopyLink = (invitation: InvitationDetails) => {
    const url = `${window.location.origin}/invitation/${invitation.id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(invitation.id);
    setShowActionMenu(null);
  };

  const calculateResponseRate = (invitation: InvitationDetails) => {
    const totalResponses = invitation.confirmed_guests + invitation.declined_guests;
    if (invitation.total_guests === 0) return 0;
    return Math.round((totalResponses / invitation.total_guests) * 100);
  };

  const toggleActionMenu = (id: string) => {
    setShowActionMenu(showActionMenu === id ? null : id);
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="h-12 w-12 text-secondary" />
      </div>
      <h3 className="text-xl font-semibold text-primary mb-3 font-serif">
        Aucune invitation trouvée
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {searchTerm || statusFilter !== 'all' 
          ? 'Aucune invitation ne correspond à vos critères de recherche.'
          : 'Commencez par créer votre première invitation de mariage.'
        }
      </p>
      {(!searchTerm && statusFilter === 'all') && canCreateInvitations && (
        <Link
          to="/templates"
          className="btn-accent"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span>Créer ma première invitation</span>
        </Link>
      )}
    </div>
  );

  const InvitationCard = ({ invitation }: { invitation: InvitationDetails }) => (
    <div className="card hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Header avec sélection */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedInvitations.includes(invitation.id)}
              onChange={() => handleSelectInvitation(invitation.id)}
              className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
            />
            <div>
              <h3 className="text-lg font-semibold text-primary group-hover:text-secondary transition-colors">
                {invitation.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invitation.status)}`}>
                  {getStatusIcon(invitation.status)}
                  <span className="ml-1">{getStatusText(invitation.status)}</span>
                </span>
                {invitation.is_premium_template && (
                  <Crown className="h-4 w-4 text-secondary" title="Modèle Premium" />
                )}
              </div>
            </div>
          </div>
          
          {/* Menu actions */}
          <div className="relative action-menu">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => toggleActionMenu(invitation.id)}
              aria-label="Menu d'actions"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
            
            {showActionMenu === invitation.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  to={`/invitation/${invitation.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Aperçu
                </Link>
                
                {canEditInvitations && (
                  <Link
                    to={`/editor/${invitation.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Link>
                )}
                
                <button
                  onClick={() => handleCopyLink(invitation)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier le lien
                </button>
                
                <button
                  onClick={() => handleDuplicateInvitation(invitation.id, invitation.title)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Dupliquer
                </button>
                
                {invitation.status === 'draft' && (
                  <button
                    onClick={() => handlePublishInvitation(invitation.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Publier
                  </button>
                )}
                
                {canSendInvitations && invitation.status === 'published' && (
                  <button 
                    onClick={() => {
                      setShowActionMenu(null);
                      navigate(`/dashboard/guests?invitation=${invitation.id}&action=send`);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </button>
                )}
                
                <hr className="my-1 border-gray-200" />
                
                {canDeleteInvitations && (
                  <button
                    onClick={() => handleDeleteInvitation(invitation.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Informations de l'événement */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary-light flex-shrink-0" />
            <span className="truncate">
              {invitation.event_date ? new Date(invitation.event_date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Date non définie'} 
              {invitation.event_time ? ` à ${invitation.event_time}` : ''}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary-light flex-shrink-0" />
            <span className="truncate">{invitation.venue || 'Lieu non défini'}</span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-primary">{invitation.total_guests}</div>
            <div className="text-xs text-gray-500">Invités</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-green-600">{invitation.confirmed_guests}</div>
            <div className="text-xs text-gray-500">Confirmés</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-secondary">{calculateResponseRate(invitation)}%</div>
            <div className="text-xs text-gray-500">Réponses</div>
          </div>
        </div>

        {/* Barre de progression des réponses */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression des réponses</span>
            <span>{invitation.confirmed_guests + invitation.declined_guests} / {invitation.total_guests}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500"
                style={{ width: `${invitation.total_guests > 0 ? (invitation.confirmed_guests / invitation.total_guests) * 100 : 0}%` }}
              />
              <div 
                className="bg-red-500"
                style={{ width: `${invitation.total_guests > 0 ? (invitation.declined_guests / invitation.total_guests) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => handleCopyLink(invitation)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white"
              title="Copier le lien"
            >
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white" title="Partager">
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white" title="Statistiques">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            
            {/* Message de succès de copie */}
            {copySuccess === invitation.id && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                Lien copié !
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to={`/invitation/${invitation.id}`}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white"
              title="Aperçu"
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
            {canEditInvitations && (
              <Link
                to={`/editor/${invitation.id}`}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white"
                title="Modifier"
              >
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            )}
            
            {/* Menu d'actions pour mobile */}
            <div className="sm:hidden relative">
              <button
                onClick={() => toggleActionMenu(invitation.id)}
                className="p-1.5 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white"
                title="Plus d'actions"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {/* Actions supplémentaires pour desktop */}
            <div className="hidden sm:flex items-center space-x-2">
              {invitation.status === 'draft' && (
                <button 
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-white" 
                  title="Publier"
                  onClick={() => handlePublishInvitation(invitation.id)}
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              
              {canSendInvitations && invitation.status === 'published' && (
                <button 
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-white" 
                  title="Envoyer"
                  onClick={() => navigate(`/dashboard/guests?invitation=${invitation.id}&action=send`)}
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
              
              {canDeleteInvitations && (
                <button
                  onClick={() => handleDeleteInvitation(invitation.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <span className="ml-2 text-gray-600">Chargement des invitations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-accent py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refreshInvitations}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-serif mb-2">
              Mes invitations
            </h1>
            <p className="text-gray-600">
              Gérez vos invitations de mariage et suivez les réponses de vos invités
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {canCreateInvitations && canCreateInvitation ? (
              <Link
                to="/templates"
                className="btn-accent"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span>Nouvelle invitation</span>
              </Link>
            ) : (
              <Link
                to="/pricing"
                className="btn-primary"
              >
                <Crown className="h-5 w-5 mr-2" />
                <span>Passer Premium</span>
              </Link>
            )}
          </div>
        </div>

        {/* Plan Limit Warning */}
        {!canCreateInvitation && (
          <div className="mb-6">
            <PlanLimitWarning type="invitation" />
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une invitation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                aria-label="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillons</option>
                <option value="published">Publiées</option>
                <option value="sent">Envoyées</option>
                <option value="archived">Archivées</option>
              </select>

              <select
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="form-input"
                aria-label="Trier par"
              >
                <option value="date-desc">Plus récentes</option>
                <option value="date-asc">Plus anciennes</option>
                <option value="name-asc">Nom A-Z</option>
                <option value="name-desc">Nom Z-A</option>
                <option value="status-asc">Statut A-Z</option>
                <option value="status-desc">Statut Z-A</option>
              </select>
            </div>
          </div>

          {/* Actions en lot */}
          {selectedInvitations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedInvitations.length} invitation{selectedInvitations.length > 1 ? 's' : ''} sélectionnée{selectedInvitations.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setSelectedInvitations([])}
                    className="text-sm text-secondary hover:text-secondary/80 transition-colors"
                  >
                    Désélectionner tout
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Exporter
                  </button>
                  <button 
                    className="px-3 py-1.5 text-sm border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => {
                      if (selectedInvitations.length === 1) {
                        handleDeleteInvitation(selectedInvitations[0]);
                      }
                    }}
                    disabled={selectedInvitations.length !== 1}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des invitations */}
        {invitations.length === 0 ? (
          <div className="card">
            <EmptyState />
          </div>
        ) : (
          <>
            {/* Sélection globale */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedInvitations.length === invitations.length && invitations.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  aria-label="Sélectionner toutes les invitations"
                />
                <span className="text-sm text-gray-600">
                  Sélectionner tout ({invitations.length})
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                {invitations.length} invitation{invitations.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Grille des invitations - responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {invitations.map((invitation) => (
                <InvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </div>
          </>
        )}

        {/* Upgrade Prompt pour les utilisateurs non-premium */}
        {!isPremiumUser() && (
          <div className="mt-8 gradient-secondary rounded-2xl p-6 sm:p-8 text-center text-white">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2 font-serif">Débloquez tout le potentiel de Loventy</h3>
            <p className="text-base sm:text-lg opacity-90 mb-6">
              Invitations illimitées, modèles premium, analytics avancées et bien plus encore
            </p>
            <Link
              to="/pricing"
              className="inline-block px-6 sm:px-8 py-3 bg-white text-secondary font-semibold rounded-full hover:bg-gray-50 transition-colors duration-200"
            >
              Découvrir Premium
            </Link>
          </div>
        )}
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                Supprimer l'invitation
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette invitation ? Cette action est irréversible.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="sm:flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="sm:flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de duplication */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Copy className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                Dupliquer l'invitation
              </h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#131837] mb-2">
                Titre de la nouvelle invitation
              </label>
              <input
                type="text"
                value={duplicateTitle}
                onChange={(e) => setDuplicateTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Copie de mon invitation"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="sm:flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDuplicating}
              >
                Annuler
              </button>
              <button
                onClick={confirmDuplicate}
                className="sm:flex-1 px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                disabled={isDuplicating || !duplicateTitle.trim()}
              >
                {isDuplicating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Duplication...</span>
                  </>
                ) : (
                  'Dupliquer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;