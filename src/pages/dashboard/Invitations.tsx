// src/pages/dashboard/Invitations.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Send,
  Copy,
  Trash2,
  Calendar,
  Users,
  Clock,
  Crown,
  Heart,
  Sparkles,
  Download,
  Share2,
  BarChart3,
  Loader2,
  AlertTriangle,
  ChevronDown,
  X // Import for clear search button
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { usePageTitle } from '../../hooks/usePageTitle';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useInvitations } from '../../hooks/useInvitations';
import PlanLimitWarning from '../../components/PlanLimitWarning';
import Modal from '../../components/Modal';
import type { InvitationDetails } from '../../types/models';

// Component for the status badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusInfo = useCallback((status: string) => {
    switch (status) {
      case 'draft':
        return { text: 'Brouillon', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Edit className="h-3 w-3" /> };
      case 'published':
        return { text: 'Publiée', color: 'notification-info', icon: <Eye className="h-3 w-3" /> };
      case 'sent':
        return { text: 'Envoyée', color: 'notification-success', icon: <Send className="h-3 w-3" /> };
      case 'archived':
        return { text: 'Archivée', color: 'notification-warning', icon: <Clock className="h-3 w-3" /> };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Edit className="h-3 w-3" /> };
    }
  }, []);

  const { text, color, icon } = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {icon}
      <span className="ml-1">{text}</span>
    </span>
  );
};

// Component for a single invitation card
const InvitationCard: React.FC<{
  invitation: InvitationDetails;
  selectedInvitations: string[];
  handleSelectInvitation: (id: string) => void;
  handleCopyLink: (invitation: InvitationDetails) => void;
  handleDeleteInvitation: (id: string) => void;
  handleDuplicateInvitation: (id: string, title: string) => void;
  handlePublishInvitation: (id: string) => void;
  canEditInvitations: () => boolean;
  canSendInvitations: () => boolean;
  canDeleteInvitations: () => boolean;
  showActionMenu: string | null;
  toggleActionMenu: (id: string) => void;
  copySuccess: string | null;
}> = React.memo(({
  invitation,
  selectedInvitations,
  handleSelectInvitation,
  handleCopyLink,
  handleDeleteInvitation,
  handleDuplicateInvitation,
  handlePublishInvitation,
  canEditInvitations,
  canSendInvitations,
  canDeleteInvitations,
  showActionMenu,
  toggleActionMenu,
  copySuccess,
}) => {
  const navigate = useNavigate();

  const calculateResponseRate = useMemo(() => {
    const totalResponses = invitation.confirmed_guests + invitation.declined_guests;
    return invitation.total_guests === 0 ? 0 : Math.round((totalResponses / invitation.total_guests) * 100);
  }, [invitation.confirmed_guests, invitation.declined_guests, invitation.total_guests]);

  const formattedDate = useMemo(() => {
    if (!invitation.event_date) return 'Date non définie';
    return new Date(invitation.event_date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [invitation.event_date]);
  
  const progressPercentConfirmed = invitation.total_guests > 0 ? (invitation.confirmed_guests / invitation.total_guests) * 100 : 0;
  const progressPercentDeclined = invitation.total_guests > 0 ? (invitation.declined_guests / invitation.total_guests) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden group flex flex-col h-full">
      {/* Header avec sélection et menu */}
      <div className="p-4 sm:p-6 pb-4 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedInvitations.includes(invitation.id)}
              onChange={() => handleSelectInvitation(invitation.id)}
              className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              aria-label={`Sélectionner l'invitation ${invitation.title}`}
            />
            <div>
              <h3 className="text-lg font-semibold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                {invitation.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <StatusBadge status={invitation.status} />
                {invitation.is_premium_template && (
                  <Crown className="h-4 w-4 text-secondary" aria-label="Modèle premium" />
                )}
              </div>
            </div>
          </div>
          
          {/* Menu d'actions pour desktop */}
          <div className="hidden sm:block relative action-menu">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => toggleActionMenu(invitation.id)}
              aria-label="Menu d'actions"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            
            {showActionMenu === invitation.id && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  to={`/invitation/${invitation.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" /> Aperçu
                </Link>
                {canEditInvitations() && (
                  <Link
                    to={`/editor/${invitation.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Modifier
                  </Link>
                )}
                <button
                  onClick={() => handleCopyLink(invitation)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copier le lien
                </button>
                <button
                  onClick={() => handleDuplicateInvitation(invitation.id, invitation.title)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" /> Dupliquer
                </button>
                {invitation.status === 'draft' && (
                  <button
                    onClick={() => handlePublishInvitation(invitation.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" /> Publier
                  </button>
                )}
                {canSendInvitations() && invitation.status === 'published' && (
                  <button
                    onClick={() => navigate(`/dashboard/guests?invitation=${invitation.id}&action=send`)}
                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" /> Envoyer
                  </button>
                )}
                <hr className="my-1 border-gray-200" />
                {canDeleteInvitations() && (
                  <button
                    onClick={() => handleDeleteInvitation(invitation.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
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
              {formattedDate} {invitation.event_time ? ` à ${invitation.event_time}` : ''}
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
            <div className="text-base sm:text-lg font-semibold text-secondary">{calculateResponseRate}%</div>
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
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${progressPercentConfirmed}%` }}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${progressPercentDeclined}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions en bas de la carte */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => handleCopyLink(invitation)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white"
            title="Copier le lien"
            aria-label="Copier le lien de l'invitation"
          >
            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white" title="Partager" aria-label="Partager l'invitation">
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white" title="Statistiques" aria-label="Voir les statistiques">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          
          {/* Message de succès de copie */}
          {copySuccess === invitation.id && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md transition-opacity duration-300">
              Lien copié !
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Actions pour tous les écrans */}
          <Link
            to={`/invitation/${invitation.id}`}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white"
            title="Aperçu"
            aria-label="Aperçu de l'invitation"
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
          {canEditInvitations() && (
            <Link
              to={`/editor/${invitation.id}`}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white"
              title="Modifier"
              aria-label="Modifier l'invitation"
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
              aria-label="Plus d'actions"
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
                aria-label="Publier l'invitation"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            
            {canSendInvitations() && invitation.status === 'published' && (
              <button
                className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-white"
                title="Envoyer"
                onClick={() => navigate(`/dashboard/guests?invitation=${invitation.id}&action=send`)}
                aria-label="Envoyer l'invitation"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
            
            {canDeleteInvitations() && (
              <button
                onClick={() => handleDeleteInvitation(invitation.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white"
                title="Supprimer"
                aria-label="Supprimer l'invitation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

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
  useAuth();
  const { canCreateInvitations, canEditInvitations, canDeleteInvitations, canSendInvitations, isPremiumUser } = usePermissions();
  const { canCreateInvitation } = usePlanLimits();
  
  const [sortBy, sortOrder] = useMemo(() => sortValue.split('-') as ['date' | 'name' | 'status', 'asc' | 'desc'], [sortValue]);
  
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

  // Reset selection when filters change or invitations are reloaded
  useEffect(() => {
    setSelectedInvitations([]);
  }, [invitations, statusFilter, searchTerm, sortValue]);

  // Close action menu when clicking outside
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

  // Clear copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const handleSelectInvitation = useCallback((id: string) => {
    setSelectedInvitations(prev =>
      prev.includes(id)
        ? prev.filter(invId => invId !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedInvitations.length === invitations.length) {
      setSelectedInvitations([]);
    } else {
      setSelectedInvitations(invitations.map(inv => inv.id));
    }
  }, [selectedInvitations, invitations]);

  const handleDeleteInvitation = useCallback((id: string) => {
    setInvitationToDelete(id);
    setShowActionMenu(null);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = async () => {
    if (invitationToDelete) {
      setIsDeleting(true);
      try {
        const success = await deleteInvitation(invitationToDelete);
        if (success) {
          setInvitationToDelete(null);
          setShowDeleteModal(false);
          refreshInvitations(); // Refresh data after deletion
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDuplicateInvitation = useCallback((id: string, title: string) => {
    setInvitationToDuplicate(id);
    setDuplicateTitle(`Copie de ${title}`);
    setShowActionMenu(null);
    setShowDuplicateModal(true);
  }, []);

  const confirmDuplicate = async () => {
    if (invitationToDuplicate && duplicateTitle) {
      setIsDuplicating(true);
      try {
        const newInvitationId = await duplicateInvitation(invitationToDuplicate, duplicateTitle);
        if (newInvitationId) {
          setInvitationToDuplicate(null);
          setShowDuplicateModal(false);
          refreshInvitations(); // Refresh data after duplication
          navigate(`/editor/${newInvitationId}`); // Redirect to the new invitation
        }
      } finally {
        setIsDuplicating(false);
      }
    }
  };

  const handlePublishInvitation = useCallback(async (id: string) => {
    setShowActionMenu(null);
    await updateInvitationStatus(id, 'published');
  }, [updateInvitationStatus]);

  const handleCopyLink = useCallback((invitation: InvitationDetails) => {
    const url = `${window.location.origin}/invitation/${invitation.id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(invitation.id);
    setShowActionMenu(null);
  }, []);

  const toggleActionMenu = useCallback((id: string) => {
    setShowActionMenu(showActionMenu === id ? null : id);
  }, [showActionMenu]);

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
      {(!searchTerm && statusFilter === 'all') && canCreateInvitations() && (
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

  // Loading and Error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent py-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary mb-4" />
          <span className="text-lg text-gray-600">Chargement des invitations...</span>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-primary font-serif mb-2">
              Mes invitations
            </h1>
            <p className="text-gray-600 max-w-xl">
              Gérez vos invitations de mariage et suivez les réponses de vos invités en un coup d'œil.
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            {canCreateInvitations() && canCreateInvitation ? (
              <Link
                to="/templates"
                className="btn-accent w-full sm:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span>Nouvelle invitation</span>
              </Link>
            ) : (
              <Link
                to="/pricing"
                className="btn-primary w-full sm:w-auto"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une invitation par titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full"
                aria-label="Rechercher une invitation"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input w-full sm:w-auto"
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
                className="form-input w-full sm:w-auto"
                aria-label="Trier par"
              >
                <option value="date-desc">Plus récentes</option>
                <option value="date-asc">Plus anciennes</option>
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="status-asc">Statut (A-Z)</option>
                <option value="status-desc">Statut (Z-A)</option>
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
                  <button className="btn-secondary-outline">
                    <Download className="h-4 w-4 mr-2" /> Exporter
                  </button>
                  <button
                    className="btn-danger-outline"
                    onClick={() => {
                      if (selectedInvitations.length === 1) {
                        handleDeleteInvitation(selectedInvitations[0]);
                      }
                    }}
                    disabled={selectedInvitations.length !== 1}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
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
            {/* Sélection globale pour desktop */}
            <div className="hidden sm:flex items-center justify-between mb-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  selectedInvitations={selectedInvitations}
                  handleSelectInvitation={handleSelectInvitation}
                  handleCopyLink={handleCopyLink}
                  handleDeleteInvitation={handleDeleteInvitation}
                  handleDuplicateInvitation={handleDuplicateInvitation}
                  handlePublishInvitation={handlePublishInvitation}
                  canEditInvitations={canEditInvitations}
                  canSendInvitations={canSendInvitations}
                  canDeleteInvitations={canDeleteInvitations}
                  showActionMenu={showActionMenu}
                  toggleActionMenu={toggleActionMenu}
                  copySuccess={copySuccess}
                />
              ))}
            </div>
          </>
        )}

        {/* Upgrade Prompt pour les utilisateurs non-premium */}
        {!isPremiumUser() && (
          <div className="mt-12 gradient-secondary rounded-2xl p-6 sm:p-8 text-center text-white shadow-lg">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-white/90" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2 font-serif">Débloquez tout le potentiel de Loventy</h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Invitations illimitées, modèles premium, analytics avancées et bien plus encore.
            </p>
            <Link
              to="/pricing"
              className="inline-block px-6 sm:px-8 py-3 bg-white text-secondary font-semibold rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-lg"
            >
              Voir les tarifs
            </Link>
          </div>
        )}
      </div>

      {/* Modal de suppression */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer l'invitation"
        description="Êtes-vous sûr de vouloir supprimer cette invitation ? Cette action est irréversible."
        icon={<Trash2 className="h-5 w-5 text-red-600" />}
        confirmText={isDeleting ? 'Suppression...' : 'Supprimer'}
        onConfirm={confirmDelete}
        isConfirming={isDeleting}
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />

      {/* Modal de duplication */}
      <Modal
        show={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title="Dupliquer l'invitation"
        icon={<Copy className="h-5 w-5 text-blue-600" />}
        confirmText={isDuplicating ? 'Duplication...' : 'Dupliquer'}
        onConfirm={confirmDuplicate}
        isConfirming={isDuplicating}
        confirmButtonClass="bg-blue-600 hover:bg-blue-700 text-white"
        isForm
      >
        <div className="mb-6">
          <label htmlFor="duplicate-title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la nouvelle invitation
          </label>
          <input
            id="duplicate-title"
            type="text"
            value={duplicateTitle}
            onChange={(e) => setDuplicateTitle(e.target.value)}
            className="form-input w-full"
            placeholder="Copie de mon invitation"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Invitations;
