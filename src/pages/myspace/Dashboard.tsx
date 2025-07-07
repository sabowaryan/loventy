import React, { useState, useRef, useEffect } from 'react';
import { Clock, Edit3, MapPin, User, Wine, MailIcon, MessageSquare, Plus, Trash2, Edit, Clipboard, CheckCircle, X, Search, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { WeddingData } from '../../lib/database';
import {
  getGuests,
  addGuest,
  updateGuest,
  deleteGuest,
  getGuestPreferences,
  getGuestMessages,
  getAllLocalWeddings,
  saveWeddingData
} from '../../lib/database';
import InvitationEditModal from './InvitationEditModal';
import AddGuestModal from '../../components/guests/AddGuestModal';
import EditGuestModal from '../../components/guests/EditGuestModal';

interface AdminPanelProps {
  weddingDetails: WeddingData;
  onSave?: (data: { weddingDetails: WeddingData }) => void;
  onPreview?: () => void;
}

export default function AdminPanel({
  weddingDetails: initialWeddingDetails,
  onSave,
  onPreview
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('invitations');
  const [weddingDetails, setWeddingDetails] = useState<WeddingData>(initialWeddingDetails);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addGuestModalOpen, setAddGuestModalOpen] = useState(false);
  const [guests, setGuests] = useState<Array<any>>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editGuest, setEditGuest] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // États pour la pagination et la recherche
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const guestsPerPage = 12; // 3 colonnes x 4 rangées par défaut
  
  // État pour la stat cliquée
  const [clickedStat, setClickedStat] = useState<'all' | 'confirmed' | 'pending' | 'declined' | null>(null);
  
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
  const [guestPreferences, setGuestPreferences] = useState<{ alcoholic_drinks?: string; non_alcoholic_drinks?: string } | null>(null);
  const [guestMessages, setGuestMessages] = useState<Array<{ message: string; created_at?: string }> | null>(null);
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);

  // Ajout pour les invitations
  const [invitations, setInvitations] = useState<any[]>([]);
  const [currentInvPage, setCurrentInvPage] = useState(1);
  const invitationsPerPage = 6;
  const [selectedInvitation, setSelectedInvitation] = useState<any | null>(null);

  // Onglets
  const mainTabs = [
    { id: 'invitation', label: 'Invitation', icon: MailIcon },
  ];
  const [activeMainTab, setActiveMainTab] = useState('invitation');

  // Ajout de l'état pour les sous-onglets de l'invité sélectionné
  const [activeGuestSubTab, setActiveGuestSubTab] = useState<'livreor' | 'preferences'>('livreor');

  // Ajout de l'état pour le modal de suppression
  const [guestToDelete, setGuestToDelete] = useState<any | null>(null);
  
  // Ajout de l'état pour l'invitation à éditer
  const [invitationToEdit, setInvitationToEdit] = useState<any | null>(null);

  // Ajout de l'état pour la pagination du livre d'or
  const [currentMsgPage, setCurrentMsgPage] = useState(1);
  const messagesPerPage = 5;

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const data = await getGuests(weddingDetails.id ?? '');
        setGuests(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Erreur lors du chargement des invités:', error);
      }
    };
    fetchGuests();
  }, [refreshTrigger, weddingDetails.id]);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const data = await getAllLocalWeddings();
        setInvitations(data);
        setSelectedInvitation(null); // aucune sélection par défaut
      } catch (e) {
        setInvitations([]);
      }
    };
    fetchInvitations();
  }, [refreshTrigger]);

  // Pagination invitations
  const totalInvPages = Math.ceil(invitations.length / invitationsPerPage);
  const currentInvitations = invitations.slice(
    (currentInvPage - 1) * invitationsPerPage,
    currentInvPage * invitationsPerPage
  );

  // Quand une invitation est sélectionnée, charger ses invités
  useEffect(() => {
    if (selectedInvitation) {
      // Charger les invités pour l'invitation sélectionnée (système local)
      getGuests(selectedInvitation.id).then(setGuests);
    }
  }, [selectedInvitation]);

  // Ajout d'un effet pour charger dynamiquement les messages et préférences de l'invité sélectionné
  useEffect(() => {
    if (selectedGuest) {
      setGuestMessages(null);
      setGuestPreferences(null);
      (async () => {
        const [msgs, prefs] = await Promise.all([
          getGuestMessages(selectedGuest.id),
          getGuestPreferences(selectedGuest.id)
        ]);
        setGuestMessages(msgs);
        setGuestPreferences(prefs);
      })();
    } else {
      setGuestMessages(null);
      setGuestPreferences(null);
    }
  }, [selectedGuest]);

  // Réinitialiser la page à 1 quand l'invité ou les messages changent
  useEffect(() => {
    setCurrentMsgPage(1);
  }, [selectedGuest, guestMessages]);

  // Pagination des messages
  const totalMsgPages = guestMessages ? Math.ceil(guestMessages.length / messagesPerPage) : 1;
  const currentMessages = guestMessages ? guestMessages.slice((currentMsgPage - 1) * messagesPerPage, currentMsgPage * messagesPerPage) : [];

  const handleEditInvitation = (invitation?: any) => {
    // Si une invitation spécifique est passée, l'utiliser, sinon utiliser l'invitation sélectionnée
    const invitationToEdit = invitation || selectedInvitation;
    if (invitationToEdit) {
      setWeddingDetails(invitationToEdit.weddingData || weddingDetails);
      setEditModalOpen(true);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      await deleteGuest(id);
      setRefreshTrigger(prev => prev + 1); // Déclencher le rechargement
      showToast('success', 'Invité supprimé !');
    } catch (e) {
      showToast('error', "Erreur lors de la suppression de l'invité.");
    }
    setGuestToDelete(null);
  };

  const handleCopyMessage = (id: string, message: string) => {
    navigator.clipboard.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleEditGuest = (guest: any) => setEditGuest(guest);

  const handleSaveEditGuest = async (guest: any) => {
    try {
      await updateGuest({ ...guest, wedding_id: weddingDetails.id });
      setRefreshTrigger(prev => prev + 1);
      setEditGuest(null);
      showToast('success', 'Invité modifié !');
    } catch (e) {
      showToast('error', "Erreur lors de la modification de l'invité.");
    }
  };

  // Nouvelle version adaptée à Supabase
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const guest = guests.find(g => g.id === id);
      if (!guest) return;
      await updateGuest({
        id: guest.id,
        wedding_id: guest.wedding_id,
        name: guest.name,
        table_name: guest.table_name,
        email: guest.email,
        rsvp_status: newStatus,
        invitation_link: guest.invitation_link,
        message_sender: guest.message_sender
      });
      setRefreshTrigger(prev => prev + 1);
      showToast('success', 'Statut mis à jour !');
    } catch (e) {
      showToast('error', "Erreur lors de la mise à jour du statut.");
    }
  };

  // Fonctions de filtrage et pagination
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || guest.rsvp_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedGuests = [...filteredGuests].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'table':
        aValue = a.table_name.toLowerCase();
        bValue = b.table_name.toLowerCase();
        break;
      case 'status':
        aValue = a.rsvp_status || 'pending';
        bValue = b.rsvp_status || 'pending';
        break;
      case 'email':
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const totalPages = Math.ceil(sortedGuests.length / guestsPerPage);
  const startIndex = (currentPage - 1) * guestsPerPage;
  const endIndex = startIndex + guestsPerPage;
  const currentGuests = sortedGuests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Retour à la première page lors d'une recherche
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1); // Retour à la première page lors d'un changement de filtre
    // Mettre à jour la stat cliquée
    if (status === 'all') {
      setClickedStat('all');
    } else if (status === 'confirmed') {
      setClickedStat('confirmed');
    } else if (status === 'pending') {
      setClickedStat('pending');
    } else if (status === 'declined') {
      setClickedStat('declined');
    }
  };
  
  // Fonction pour gérer le clic sur une stat
  const handleStatClick = (stat: 'all' | 'confirmed' | 'pending' | 'declined') => {
    setClickedStat(stat);
    if (stat === 'all') {
      setFilterStatus('all');
    } else {
      setFilterStatus(stat);
    }
    setCurrentPage(1); // Retour à la première page
    
    // Scroll automatique vers le contenu après un court délai pour laisser le temps au filtre de s'appliquer
    setTimeout(() => {
      const guestsTable = document.getElementById('guests-table');
      if (guestsTable) {
        // Calculer dynamiquement la position exacte
        const header = document.querySelector('header') as HTMLElement;
        const statsSection = document.querySelector('.mb-8') as HTMLElement; // Section des stats
        const controlsSection = document.querySelector('.bg-white.rounded-xl.shadow-sm.border.border-gray-100.p-6.mb-6') as HTMLElement; // Section des contrôles
        
        let offset = 20; // Marge de base
        
        if (header) {
          offset += header.offsetHeight;
        }
        if (statsSection) {
          offset += statsSection.offsetHeight;
        }
        if (controlsSection) {
          offset += controlsSection.offsetHeight;
        }
        
        const elementTop = guestsTable.offsetTop - offset;
        
        window.scrollTo({
          top: Math.max(0, elementTop), // Éviter les valeurs négatives
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30 w-full">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-center py-3 gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
            <Edit3 className="w-7 h-7 sm:w-8 sm:h-8 text-rose-600" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 font-serif tracking-tight">Dashboard Mariage</h1>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-2">
            <button
              onClick={() => handleEditInvitation(selectedInvitation)}
              disabled={!selectedInvitation}
              className="btn-primary flex items-center justify-center space-x-2 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4" />
              <span>Éditer l'invitation</span>
            </button>
            <button
              onClick={() => setAddGuestModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg shadow-sm hover:bg-secondary-light transition-all duration-200 w-full sm:w-auto"
            >
              <User className="w-4 h-4" />
              <span>Ajouter un invité</span>
            </button>
          </div>
        </div>
      </header>
      {/* Modals */}
      {editModalOpen && (
        <InvitationEditModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setInvitationToEdit(null);
          }}
          initialDetails={invitationToEdit}
          onSave={async (newDetails) => {
            if (!newDetails.id) {
              await saveWeddingData(newDetails);
              showToast('success', 'Invitation créée avec succès !');
            } else {
              await saveWeddingData(newDetails);
              showToast('success', 'Invitation mise à jour avec succès !');
            }
            setEditModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
            setSelectedInvitation(null);
          }}
        />
      )}
      {addGuestModalOpen && (
        <AddGuestModal
          onClose={() => setAddGuestModalOpen(false)}
          onAddGuest={async (guest) => {
            if (!guest.id || !guest.name || !guest.table_name) return;
            try {
              await addGuest({
                ...guest,
                wedding_id: weddingDetails.id ?? '',
                name: guest.name ?? '',
                table_name: guest.table_name ?? ''
              });
              showToast('success', 'Invité ajouté avec succès !');
              setRefreshTrigger(prev => prev + 1); // Déclencher le rechargement
            } catch (e) {
              showToast('error', "Erreur lors de l'ajout de l'invité.");
            }
            setAddGuestModalOpen(false);
          }}
          invitations={[]}
          weddingDetails={{ groomName: weddingDetails.groom_name ?? '', brideName: weddingDetails.bride_name ?? '' }}
        />
      )}
      {editGuest && (
        <EditGuestModal
          guest={editGuest}
          onSave={handleSaveEditGuest}
          onClose={() => setEditGuest(null)}
        />
      )}
      {showPrefModal && selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-100 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Préférences de {selectedGuest.name}</h3>
            <div className="mb-2">
              <b>Boissons alcoolisées :</b>
              <ul className="list-disc ml-6 mt-1 text-sm">
                {(guestPreferences?.alcoholic_drinks ? JSON.parse(guestPreferences.alcoholic_drinks) : []).map((drink: string, idx: number) => (
                  <li key={idx}>{drink}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <b>Boissons non-alcoolisées :</b>
              <ul className="list-disc ml-6 mt-1 text-sm">
                {(guestPreferences?.non_alcoholic_drinks ? JSON.parse(guestPreferences.non_alcoholic_drinks) : []).map((drink: string, idx: number) => (
                  <li key={idx}>{drink}</li>
                ))}
              </ul>
            </div>
            <button onClick={() => setShowPrefModal(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Fermer</button>
          </div>
        </div>
      )}
      {showMsgModal && selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-100 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-green-700">Messages de {selectedGuest.name}</h3>
            {!guestMessages ? (
              <div className="text-gray-400 italic">Chargement...</div>
            ) : (
              <ul className="space-y-2">
                {guestMessages.length > 0 ? guestMessages.map((msg, idx) => (
                  <li key={idx} className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                    <div>{msg.message}</div>
                    {msg.created_at && <div className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</div>}
                  </li>
                )) : <li className="text-gray-500 text-sm">Aucun message</li>}
              </ul>
            )}
            <button onClick={() => setShowMsgModal(false)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Fermer</button>
          </div>
        </div>
      )}
      {/* Toast visuel */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-base transition-all duration-300 animate-fade-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      {/* Contenu principal minimal */}
      <main className="max-w-4xl mx-auto px-2 sm:px-8 py-8">
        <div className="text-center text-gray-400 italic py-8 text-base sm:text-lg">
          Sélectionnez une action ci-dessus pour commencer.
        </div>
        {/* Onglets principaux */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6">
          <div className="flex space-x-1">
            {mainTabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeMainTab === tab.id 
                    ? 'bg-secondary text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setActiveMainTab(tab.id);
                  // Réinitialiser la sélection si on clique sur l'onglet Invitation depuis l'onglet Invités
                  if (tab.id === 'invitation' && selectedInvitation) {
                    setSelectedInvitation(null);
                    setSelectedGuest(null);
                  }
                }}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
                {/* Indicateur de sous-navigation */}
                {activeMainTab === tab.id && selectedInvitation && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                    Invités
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Affichage de la liste des invitations locales si aucune invitation sélectionnée */}
        {activeMainTab === 'invitation' && !selectedInvitation && (
          <div>
            <h2 className="text-xl font-bold mb-6">Mes invitations</h2>
            {invitations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MailIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune invitation pour l'instant</h3>
                <p className="text-gray-500 mb-6">Commencez par créer votre première invitation</p>
                <button
                  onClick={() => { setEditModalOpen(true); setSelectedInvitation(null); }}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une invitation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.map(inv => (
                  <div 
                    key={inv.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                    onClick={() => setSelectedInvitation(inv)}
                  >
                    {/* Photo du couple */}
                    <div className="h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center relative">
                      {inv.couple_photo ? (
                        <img 
                          src={inv.couple_photo} 
                          alt={`${inv.groom_name || ''} et ${inv.bride_name || ''}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <User className="h-12 w-12 mb-2" />
                          <span className="text-sm">Photo du couple</span>
                        </div>
                      )}
                      {/* Bouton éditer en overlay */}
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setInvitationToEdit(inv);
                          setEditModalOpen(true); 
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200"
                        title="Éditer l'invitation"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    {/* Informations de l'invitation */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Mariage de {inv.groom_name || 'Prénom'} et de {inv.bride_name || 'Prénom'}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {inv.wedding_year && inv.wedding_month && inv.wedding_day && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{inv.wedding_day}/{inv.wedding_month}/{inv.wedding_year}</span>
                          </div>
                        )}
                        {(inv.ceremony_venue || inv.reception_venue) && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{inv.ceremony_venue || inv.reception_venue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Affichage de la liste des invités de l'invitation sélectionnée */}
        {activeMainTab === 'invitation' && selectedInvitation && !selectedGuest && (
          <div>
            {/* Indicateur de navigation */}
            <div className="flex items-center mb-4 text-sm text-gray-600">
              <button
                onClick={() => setSelectedInvitation(null)}
                className="flex items-center text-secondary hover:text-secondary-light transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour aux invitations
              </button>
              <span className="mx-2">/</span>
              <span className="font-medium text-gray-900">
                Mariage de {selectedInvitation.groom_name || 'Prénom'} et de {selectedInvitation.bride_name || 'Prénom'}
              </span>
              <span className="mx-2">/</span>
              <span className="text-secondary font-medium">Invités</span>
            </div>
            <h2 className="text-xl font-bold mb-6">Invités pour : Mariage de {selectedInvitation.groom_name || 'Prénom'} et de {selectedInvitation.bride_name || 'Prénom'}</h2>
            {/* Statistiques des invités */}
            <div className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => handleStatClick('all')}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer p-6 ${
                    clickedStat === 'all' 
                      ? 'border-blue-300 bg-blue-50 shadow-md' 
                      : 'border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg transition-colors ${
                      clickedStat === 'all' ? 'bg-blue-200' : 'bg-blue-100'
                    }`}>
                      <User className={`h-6 w-6 transition-colors ${
                        clickedStat === 'all' ? 'text-blue-700' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className={`text-2xl font-bold transition-colors ${
                        clickedStat === 'all' ? 'text-blue-700' : 'text-gray-900'
                      }`}>{guests.length}</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => handleStatClick('confirmed')}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer p-6 ${
                    clickedStat === 'confirmed' 
                      ? 'border-green-300 bg-green-50 shadow-md' 
                      : 'border-gray-100 hover:border-green-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg transition-colors ${
                      clickedStat === 'confirmed' ? 'bg-green-200' : 'bg-green-100'
                    }`}>
                      <CheckCircle className={`h-6 w-6 transition-colors ${
                        clickedStat === 'confirmed' ? 'text-green-700' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Confirmés</p>
                      <p className={`text-2xl font-bold transition-colors ${
                        clickedStat === 'confirmed' ? 'text-green-700' : 'text-gray-900'
                      }`}>{guests.filter(g => g.rsvp_status === 'confirmed').length}</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => handleStatClick('pending')}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer p-6 ${
                    clickedStat === 'pending' 
                      ? 'border-yellow-300 bg-yellow-50 shadow-md' 
                      : 'border-gray-100 hover:border-yellow-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg transition-colors ${
                      clickedStat === 'pending' ? 'bg-yellow-200' : 'bg-yellow-100'
                    }`}>
                      <Clock className={`h-6 w-6 transition-colors ${
                        clickedStat === 'pending' ? 'text-yellow-700' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">En attente</p>
                      <p className={`text-2xl font-bold transition-colors ${
                        clickedStat === 'pending' ? 'text-yellow-700' : 'text-gray-900'
                      }`}>{guests.filter(g => g.rsvp_status === 'pending').length}</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => handleStatClick('declined')}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer p-6 ${
                    clickedStat === 'declined' 
                      ? 'border-red-300 bg-red-50 shadow-md' 
                      : 'border-gray-100 hover:border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg transition-colors ${
                      clickedStat === 'declined' ? 'bg-red-200' : 'bg-red-100'
                    }`}>
                      <X className={`h-6 w-6 transition-colors ${
                        clickedStat === 'declined' ? 'text-red-700' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Annulés</p>
                      <p className={`text-2xl font-bold transition-colors ${
                        clickedStat === 'declined' ? 'text-red-700' : 'text-gray-900'
                      }`}>{guests.filter(g => g.rsvp_status === 'declined').length}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            {/* Contrôles de recherche et filtrage */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nom, email, table..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {/* Filtre par statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmés</option>
                    <option value="declined">Annulés</option>
                  </select>
                  {/* Indicateur visuel si une stat est sélectionnée */}
                  {clickedStat && clickedStat !== 'all' && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Filtre actif : {clickedStat === 'confirmed' ? 'Confirmés' : clickedStat === 'pending' ? 'En attente' : 'Annulés'}
                    </div>
                  )}
                </div>
                {/* Tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  >
                    <option value="name">Nom</option>
                    <option value="table">Table</option>
                    <option value="status">Statut</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                {/* Ordre de tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
                  <button
                    onClick={() => handleSortChange(sortBy)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <ArrowUp className="h-4 w-4" />
                        <span>Ascendant</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-4 w-4" />
                        <span>Descendant</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* Tableau des invités filtré, trié, paginé */}
            <div id="guests-table">
            {guests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun invité pour cette invitation</h3>
                <p className="text-gray-500 mb-4">Ajoutez des invités pour commencer à gérer vos RSVP</p>
                <button
                  onClick={() => setAddGuestModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un invité
                </button>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-500 mb-6">
                  Aucun invité ne correspond à votre recherche "{searchTerm}" avec le filtre "{filterStatus === 'all' ? 'Tous les statuts' : filterStatus}"
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setClickedStat(null);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-all duration-200"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <table className="min-w-full bg-white rounded-xl shadow-sm border border-gray-100">
                <thead>
                  <tr>
                    <th className="px-2 sm:px-4 py-2 text-left">Nom</th>
                    <th className="px-2 sm:px-4 py-2 text-left">Statut</th>
                    <th className="px-2 sm:px-4 py-2 text-left">Copier ce message</th>
                    <th className="px-2 sm:px-4 py-2 text-center sm:text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGuests.map(guest => (
                    <tr key={guest.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedGuest(guest)}>
                      <td className="px-2 sm:px-4 py-2 text-sm sm:text-base">{guest.name}</td>
                      <td className="px-2 sm:px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          guest.rsvp_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {guest.rsvp_status === 'confirmed' ? 'Confirmé' :
                           guest.rsvp_status === 'declined' ? 'Annulé' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        <button
                          onClick={e => { e.stopPropagation(); handleCopyMessage(guest.id, guest.message_sender || ''); }}
                          className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 p-2 sm:p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all duration-200 w-full sm:w-auto"
                          title="Copier le message"
                        >
                          <Clipboard className="h-4 w-4 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-xs">
                            {copiedId === guest.id ? (
                              <span className="text-green-600">Copié !</span>
                            ) : (
                              <span className="text-gray-400">Copier</span>
                            )}
                          </span>
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleEditGuest(guest)}
                            className="p-2 sm:p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Éditer l'invité"
                          >
                            <Edit className="h-5 w-5 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => setGuestToDelete(guest)}
                            className="p-2 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Supprimer l'invité"
                          >
                            <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredGuests.length)} sur {filteredGuests.length} invités
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Précédent
                  </button>
                  {/* Pages numérotées */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-secondary text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
        {/* Affichage des sous-onglets Livres d'or et Préférences pour l'invité sélectionné */}
        {activeMainTab === 'invitation' && selectedInvitation && selectedGuest && (
          <div>
            {/* Indicateur de navigation */}
            <div className="flex items-center mb-4 text-sm text-gray-600">
              <button
                onClick={() => setSelectedInvitation(null)}
                className="flex items-center text-secondary hover:text-secondary-light transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour aux invitations
              </button>
              <span className="mx-2">/</span>
              <span className="font-medium text-gray-900">
                Mariage de {selectedInvitation.groom_name || 'Prénom'} et de {selectedInvitation.bride_name || 'Prénom'}
              </span>
              <span className="mx-2">/</span>
              <button
                onClick={() => setSelectedGuest(null)}
                className="flex items-center text-secondary hover:text-secondary-light transition-colors"
              >
                Invités
              </button>
              <span className="mx-2">/</span>
              <span className="text-secondary font-medium">{selectedGuest.name}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <button
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeGuestSubTab === 'livreor' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveGuestSubTab('livreor')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Livres d'or
                  </button>
                  <button
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeGuestSubTab === 'preferences' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveGuestSubTab('preferences')}
                  >
                    <Wine className="w-4 h-4 mr-2" />
                    Préférences
                  </button>
                </div>
                                  <button
                    className="flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 font-medium"
                    onClick={() => setSelectedGuest(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                  </button>
              </div>
            </div>
            {activeGuestSubTab === 'livreor' && (
              <div>
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-700">Livre d'or de {selectedGuest.name}</h3>
                  <span className="ml-3 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">{guestMessages ? guestMessages.length : 0} message{guestMessages && guestMessages.length > 1 ? 's' : ''}</span>
                </div>
                {!guestMessages ? (
                  <div className="text-gray-400 italic">Chargement...</div>
                ) : guestMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
                    <div className="text-gray-500 text-base">Aucun message pour cet invité</div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {currentMessages.map((msg, idx) => (
                        <div key={idx} className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                          <MessageSquare className="h-6 w-6 text-green-400 mt-1" />
                          <div className="flex-1">
                            <div className="text-gray-800 text-sm mb-1">{msg.message}</div>
                            {msg.created_at && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">{new Date(msg.created_at).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Pagination des messages */}
                    {totalMsgPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <button
                          onClick={() => setCurrentMsgPage(currentMsgPage - 1)}
                          disabled={currentMsgPage === 1}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Précédent
                        </button>
                        <div className="text-sm text-gray-500">
                          Page {currentMsgPage} / {totalMsgPages}
                        </div>
                        <button
                          onClick={() => setCurrentMsgPage(currentMsgPage + 1)}
                          disabled={currentMsgPage === totalMsgPages}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {activeGuestSubTab === 'preferences' && (
              <div>
                <div className="flex items-center mb-4">
                  <Wine className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-700">Préférences de {selectedGuest.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Boissons alcoolisées */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col items-start shadow-sm w-full">
                    <div className="flex items-center mb-2">
                      <Wine className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="font-semibold text-blue-800">Boissons alcoolisées</span>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                        {guestPreferences && guestPreferences.alcoholic_drinks ? JSON.parse(guestPreferences.alcoholic_drinks).length : 0} choix
                      </span>
                    </div>
                    <ul className="list-disc ml-6 mt-1 text-sm">
                      {guestPreferences && guestPreferences.alcoholic_drinks && JSON.parse(guestPreferences.alcoholic_drinks).length > 0 ? (
                        JSON.parse(guestPreferences.alcoholic_drinks).map((drink: string, idx: number) => (
                          <li key={idx}>{drink}</li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic">Aucune préférence renseignée</li>
                      )}
                    </ul>
                  </div>
                  {/* Boissons non-alcoolisées */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col items-start shadow-sm w-full">
                    <div className="flex items-center mb-2">
                      <Wine className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="font-semibold text-blue-800">Boissons non-alcoolisées</span>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                        {guestPreferences && guestPreferences.non_alcoholic_drinks ? JSON.parse(guestPreferences.non_alcoholic_drinks).length : 0} choix
                      </span>
                    </div>
                    <ul className="list-disc ml-6 mt-1 text-sm">
                      {guestPreferences && guestPreferences.non_alcoholic_drinks && JSON.parse(guestPreferences.non_alcoholic_drinks).length > 0 ? (
                        JSON.parse(guestPreferences.non_alcoholic_drinks).map((drink: string, idx: number) => (
                          <li key={idx}>{drink}</li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic">Aucune préférence renseignée</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Modal de confirmation de suppression */}
        {guestToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-100 animate-fade-in">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <X className="h-12 w-12 text-red-500 mx-auto" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Supprimer l'invité ?</h3>
                <p className="mb-4 text-gray-600">Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{guestToDelete.name}</span> ?<br/>Cette action est <span className="text-red-600 font-semibold">irréversible</span>.</p>
                <div className="flex w-full gap-3 mt-2">
                  <button
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => setGuestToDelete(null)}
                  >
                    Annuler
                  </button>
                  <button
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
                    onClick={() => handleDeleteGuest(guestToDelete.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 