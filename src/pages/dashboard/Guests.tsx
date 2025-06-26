import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Mail, 
  Phone, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  X, 
  Users, 
  Send, 
  FileText, 
  AlertCircle,
  Crown,
  UserPlus,
  MessageSquare,
  Calendar,
  MapPin,
  Heart,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { usePageTitle } from '../../hooks/usePageTitle';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import PlanLimitWarning from '../../components/PlanLimitWarning';
import GuestList from '../../components/guests/GuestList';
import GuestStats from '../../components/guests/GuestStats';
import GuestFilters from '../../components/guests/GuestFilters';
import AddGuestModal from '../../components/guests/AddGuestModal';
import ImportGuestsModal from '../../components/guests/ImportGuestsModal';
import DeleteGuestModal from '../../components/guests/DeleteGuestModal';
import EmailGuestsModal from '../../components/guests/EmailGuestsModal';
import GuestActionMenu from '../../components/guests/GuestActionMenu';
import { useInvitationGuests } from '../../hooks/useInvitationGuests';
import type { GuestDetails } from '../../types/models';

const Guests: React.FC = () => {
  usePageTitle('Gestion des invités');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canManageGuests, canExportGuests, canImportGuests, isPremiumUser } = usePermissions();
  const { limits, canAddGuest } = usePlanLimits();
  
  // État pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invitationFilter, setInvitationFilter] = useState<string>('all');
  
  // État pour les modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // État pour les actions sur les invités
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [guestToDelete, setGuestToDelete] = useState<string | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [guestToPreview, setGuestToPreview] = useState<string | null>(null);
  
  // Récupérer les invités depuis le hook
  const { 
    guests, 
    isLoading, 
    error, 
    refreshGuests, 
    createGuest, 
    updateGuest, 
    deleteGuest, 
    importGuests,
    getGuestStats
  } = useInvitationGuests();
  
  // Filtrer les invités
  const [filteredGuests, setFilteredGuests] = useState<GuestDetails[]>([]);
  
  // Vérifier si on a une action d'envoi d'email depuis les paramètres d'URL
  useEffect(() => {
    const action = searchParams.get('action');
    const invitationId = searchParams.get('invitation');
    
    if (action === 'send' && invitationId) {
      // Filtrer les invités pour cette invitation
      setInvitationFilter(invitationId);
      // Ouvrir la modale d'envoi d'email
      setShowEmailModal(true);
      // Nettoyer l'URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);
  
  // Filtrer les invités en fonction des critères
  useEffect(() => {
    let filtered = [...guests];
    
    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.invitation_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrage par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(guest => guest.status === statusFilter);
    }
    
    // Filtrage par invitation
    if (invitationFilter !== 'all') {
      filtered = filtered.filter(guest => guest.invitation_id === invitationFilter);
    }
    
    setFilteredGuests(filtered);
  }, [guests, searchTerm, statusFilter, invitationFilter]);
  
  // Récupérer les invitations uniques pour le filtre
  const invitations = Array.from(new Set(guests.map(guest => guest.invitation_id)))
    .map(id => {
      const guest = guests.find(g => g.invitation_id === id);
      return {
        id,
        title: guest?.invitation_title || 'Invitation sans titre'
      };
    });
  
  // Gérer la sélection des invités
  const handleSelectGuest = (id: string) => {
    setSelectedGuests(prev =>
      prev.includes(id)
        ? prev.filter(guestId => guestId !== id)
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map(guest => guest.id));
    }
  };
  
  // Gérer la suppression d'un invité
  const handleDeleteGuest = (id: string) => {
    setGuestToDelete(id);
    setShowDeleteModal(true);
    setActiveActionMenu(null);
  };
  
  const confirmDelete = async () => {
    if (guestToDelete) {
      try {
        await deleteGuest(guestToDelete);
        setGuestToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'invité:', error);
      }
    }
  };
  
  // Gérer l'export CSV
  const handleExport = () => {
    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Statut', 'Invitation', 'Date de réponse'].join(','),
      ...filteredGuests.map(guest => [
        guest.name,
        guest.email,
        guest.phone || '',
        guest.status === 'confirmed' ? 'Confirmé' : guest.status === 'pending' ? 'En attente' : 'Décliné',
        guest.invitation_title || '',
        guest.responded_at ? new Date(guest.responded_at).toLocaleDateString('fr-FR') : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invites.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  // Gérer l'ajout d'un invité
  const handleAddGuest = async (guestData: Partial<GuestDetails>) => {
    try {
      await createGuest(guestData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'invité:', error);
    }
  };
  
  // Gérer l'import d'invités
  const handleImportGuests = async (guestsData: Partial<GuestDetails>[], invitationId: string) => {
    try {
      await importGuests(guestsData, invitationId);
      setShowImportModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'import des invités:', error);
    }
  };
  
  // Gérer l'envoi d'email
  const handleSendEmail = async (emailData: any) => {
    // Logique d'envoi d'email
    console.log('Envoi d\'email:', emailData);
    setShowEmailModal(false);
  };
  
  // Gérer la prévisualisation d'une invitation spécifique à un invité
  const handlePreviewInvitation = (guestId: string) => {
    setGuestToPreview(guestId);
    setActiveActionMenu(null);
    
    // Rediriger vers la page de prévisualisation avec l'ID de l'invité
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      navigate(`/invitation/${guest.invitation_id}?guest=${guestId}`);
    }
  };
  
  // Gérer la mise à jour du statut d'un invité
  const handleUpdateGuestStatus = async (guestId: string, status: 'confirmed' | 'pending' | 'declined') => {
    try {
      await updateGuest(guestId, { status });
      setActiveActionMenu(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };
  
  // Gérer l'envoi d'un email à un invité spécifique
  const handleSendEmailToGuest = (guestId: string) => {
    setSelectedGuests([guestId]);
    setShowEmailModal(true);
    setActiveActionMenu(null);
  };
  
  // Obtenir les statistiques
  const stats = getGuestStats();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refreshGuests}
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
              Gestion des invités
            </h1>
            <p className="text-gray-600">
              Gérez votre liste d'invités et suivez leurs réponses
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {canExportGuests() && (
              <button
                onClick={handleExport}
                className="btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Exporter</span>
              </button>
            )}
            
            {canImportGuests() && isPremiumUser() && (
              <button
                onClick={() => setShowImportModal(true)}
                className="btn-secondary"
              >
                <Upload className="h-4 w-4 mr-2" />
                <span>Importer</span>
              </button>
            )}
            
            {canManageGuests() && canAddGuest ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-accent"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span>Ajouter un invité</span>
              </button>
            ) : (
              <div className="text-center">
                <PlanLimitWarning type="guest" showUpgrade={false} />
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <GuestStats stats={stats} />

        {/* Filtres */}
        <GuestFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          invitationFilter={invitationFilter}
          setInvitationFilter={setInvitationFilter}
          invitations={invitations}
          selectedGuests={selectedGuests}
          setSelectedGuests={setSelectedGuests}
          onSendEmail={() => setShowEmailModal(true)}
        />

        {/* Liste des invités */}
        <GuestList 
          guests={filteredGuests}
          selectedGuests={selectedGuests}
          onSelectGuest={handleSelectGuest}
          onSelectAll={handleSelectAll}
          onDeleteGuest={handleDeleteGuest}
          onPreviewInvitation={handlePreviewInvitation}
          onUpdateStatus={handleUpdateGuestStatus}
          onSendEmail={handleSendEmailToGuest}
          activeActionMenu={activeActionMenu}
          setActiveActionMenu={setActiveActionMenu}
        />

        {/* Upgrade Prompt pour les utilisateurs non-premium */}
        {!isPremiumUser() && (
          <div className="mt-8 gradient-secondary rounded-2xl p-8 text-center text-white">
            <Crown className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2 font-serif">Fonctionnalités Premium</h3>
            <p className="text-lg opacity-90 mb-6">
              Import CSV, emails automatiques, analytics avancées et bien plus encore
            </p>
            <Link to="/pricing" className="inline-block px-8 py-3 bg-white text-secondary font-semibold rounded-full hover:bg-gray-50 transition-colors duration-200">
              Découvrir Premium
            </Link>
          </div>
        )}
      </div>

      {/* Modales */}
      {showAddModal && (
        <AddGuestModal 
          onClose={() => setShowAddModal(false)} 
          onAddGuest={handleAddGuest}
          invitations={invitations}
        />
      )}
      
      {showImportModal && (
        <ImportGuestsModal 
          onClose={() => setShowImportModal(false)} 
          onImportGuests={handleImportGuests}
          invitations={invitations}
        />
      )}
      
      {showDeleteModal && guestToDelete && (
        <DeleteGuestModal 
          onClose={() => setShowDeleteModal(false)} 
          onConfirmDelete={confirmDelete}
          guestName={guests.find(g => g.id === guestToDelete)?.name || 'cet invité'}
        />
      )}
      
      {showEmailModal && (
        <EmailGuestsModal 
          onClose={() => setShowEmailModal(false)} 
          onSendEmail={handleSendEmail}
          selectedGuests={selectedGuests.map(id => guests.find(g => g.id === id)).filter(Boolean) as GuestDetails[]}
        />
      )}
    </div>
  );
};

export default Guests;