import React, { useState, useRef, useEffect } from 'react';
import { Clock, Edit3, Calendar, MapPin, User, Wine,MailIcon, MessageSquare, Plus, Trash2, Download, Upload, Database, Edit, Clipboard, CheckCircle, X, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { WeddingData } from '../../lib/database';
import {
  getGuests,
  addGuest,
  updateGuest,
  deleteGuest,
  getGuestPreferences,
  getGuestMessages,
  getWeddingData,
  getGuestsByInvitationId
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
    // Charger les données de mariage au montage (système local)
    const fetchWeddingData = async () => {
      try {
        const data = await getWeddingData();
        if (data) {
          // Créer une invitation factice basée sur les données de mariage
          const fakeInvitation = {
            id: data.id || '1',
            title: `${data.bride_name} & ${data.groom_name}`,
            bride_name: data.bride_name,
            groom_name: data.groom_name,
            event_date: `${data.wedding_year}-${data.wedding_month}-${data.wedding_day}`,
            event_time: data.wedding_time,
            venue: data.ceremony_venue,
            address: data.ceremony_address,
            status: 'published',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString()
          };
          setInvitations([fakeInvitation]);
          setSelectedInvitation(fakeInvitation);
        } else {
          setInvitations([]);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des données de mariage:', e);
        setInvitations([]);
      }
    };
    fetchWeddingData();
  }, []);

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

  const handleEditInvitation = () => {
    setEditModalOpen(true);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  const handleDeleteGuest = async (id: string) => {
    if (!window.confirm("Supprimer cet invité ? Cette action est irréversible.")) return;
    try {
      await deleteGuest(id);
      setRefreshTrigger(prev => prev + 1); // Déclencher le rechargement
      showToast('success', 'Invité supprimé !');
    } catch (e) {
      showToast('error', "Erreur lors de la suppression de l'invité.");
    }
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

  // Onglets
  const tabs = [
    { id: 'invitations', label: 'Invitations', icon: MailIcon },
    { id: 'guest', label: 'Invités', icon: User },
    { id: 'couple', label: 'Couple', icon: User },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'drinks', label: 'Boissons', icon: Wine },
    { id: 'texts', label: 'Textes', icon: MessageSquare }
  ];

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
              onClick={handleEditInvitation}
              className="btn-primary flex items-center justify-center space-x-2 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-700 transition-colors w-full sm:w-auto"
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
          onClose={() => setEditModalOpen(false)}
          initialDetails={weddingDetails}
          onSave={(newDetails) => {
            setWeddingDetails(newDetails);
            setEditModalOpen(false);
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
            <ul className="space-y-2">
              {guestMessages && guestMessages.length > 0 ? guestMessages.map((msg, idx) => (
                <li key={idx} className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                  <div>{msg.message}</div>
                  {msg.created_at && <div className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</div>}
                </li>
              )) : <li className="text-gray-500 text-sm">Aucun message</li>}
            </ul>
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
        {/* Onglets */}
        <div className="flex space-x-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded ${activeTab === tab.id ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="inline-block mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu de l'onglet Invitations */}
        {activeTab === 'invitations' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mes invitations</h2>
            {invitations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MailIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune invitation pour l'instant</h3>
                <p className="text-gray-500 mb-6">Commencez par créer votre première invitation</p>
                <button
                  onClick={() => window.location.href = '/templates'}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une invitation
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentInvitations.map(inv => (
                    <div
                      key={inv.id}
                      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedInvitation?.id === inv.id ? 'ring-2 ring-secondary bg-secondary/5' : ''
                      }`}
                      onClick={() => setSelectedInvitation(inv)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 truncate flex-1">{inv.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          inv.status === 'published' ? 'bg-green-100 text-green-800' :
                          inv.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          inv.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {inv.status === 'published' ? 'Publiée' :
                           inv.status === 'draft' ? 'Brouillon' :
                           inv.status === 'sent' ? 'Envoyée' :
                           inv.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        {inv.bride_name && inv.groom_name && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>{inv.bride_name} & {inv.groom_name}</span>
                          </div>
                        )}
                        {inv.event_date && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(inv.event_date).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                        {inv.venue && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="truncate">{inv.venue}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        Créée le {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalInvPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <button 
                      onClick={() => setCurrentInvPage(p => Math.max(1, p - 1))} 
                      disabled={currentInvPage === 1}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-600">
                      {currentInvPage} / {totalInvPages}
                    </span>
                    <button 
                      onClick={() => setCurrentInvPage(p => Math.min(totalInvPages, p + 1))} 
                      disabled={currentInvPage === totalInvPages}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
            
            {/* Liste des invités de l'invitation sélectionnée */}
            {selectedInvitation && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Invités pour : {selectedInvitation.title}</h3>
                {guests.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun invité pour cette invitation</h4>
                    <p className="text-gray-500 mb-4">Ajoutez des invités pour commencer à gérer vos RSVP</p>
                    <button
                      onClick={() => setAddGuestModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un invité
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guests.map(guest => (
                      <div key={guest.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="font-medium text-gray-900">{guest.name}</div>
                        <div className="text-sm text-gray-500">{guest.email}</div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            guest.rsvp_status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : guest.rsvp_status === 'declined' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {guest.rsvp_status === 'confirmed' ? 'Confirmé' : 
                             guest.rsvp_status === 'declined' ? 'Annulé' : 'En attente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
                {/* Liste des invités et contrôles : affiché uniquement si onglet 'guest' */}
        {activeTab === 'guest' && (
        <div className="mb-8">
          {/* Statistiques des invités - visible uniquement dans l'onglet Invités */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{guests.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Confirmés</p>
                    <p className="text-2xl font-bold text-gray-900">{guests.filter(g => g.rsvp_status === 'confirmed').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">{guests.filter(g => g.rsvp_status === 'pending').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Annulés</p>
                    <p className="text-2xl font-bold text-gray-900">{guests.filter(g => g.rsvp_status === 'declined').length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Liste des invités</h2>
            <div className="text-sm text-gray-500">
              {filteredGuests.length} invité{filteredGuests.length > 1 ? 's' : ''} sur {guests.length} total
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
            
            {guests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun invité pour l'instant</h3>
                <p className="text-gray-500 mb-6">Commencez par ajouter vos premiers invités</p>
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
                  }}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-all duration-200"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentGuests.map(guest => (
                  <div key={guest.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* En-tête de la carte */}
                    <div className="p-4 sm:p-6 border-b border-accent-dark">
                      {/* Nom de l'invité - Pleine largeur */}
                      <div className="mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-primary break-words">
                          {guest.name}
                        </h3>
                      </div>
                      
                      {/* Informations et boutons sur la même ligne */}
                      <div className="flex items-start justify-between gap-3">
                        {/* Informations de l'invité */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center text-sm text-neutral-600 mb-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{guest.table_name}</span>
                          </div>
                          {guest.email && (
                            <div className="flex items-center text-sm text-neutral-600">
                              <MailIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{guest.email}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Boutons d'action */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditGuest(guest)}
                            className="p-1.5 sm:p-2 text-neutral-400 hover:text-secondary hover:bg-accent rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1"
                            title="Éditer l'invité"
                          >
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="p-1.5 sm:p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            title="Supprimer l'invité"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              setSelectedGuest(guest);
                              const prefs = await getGuestPreferences(guest.id);
                              setGuestPreferences(prefs);
                              setShowPrefModal(true);
                            }}
                            className="p-1.5 sm:p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            title="Voir préférences"
                          >
                            <Wine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              setSelectedGuest(guest);
                              const msgs = await getGuestMessages(guest.id);
                              setGuestMessages(msgs);
                              setShowMsgModal(true);
                            }}
                            className="p-1.5 sm:p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                            title="Voir messages"
                          >
                            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Corps de la carte */}
                    <div className="p-4 sm:p-6">
                      {/* Statut RSVP */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-primary mb-2">Statut RSVP</label>
                        <select
                          value={guest.rsvp_status || 'pending'}
                          onChange={e => handleStatusChange(guest.id, e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="declined">Annulé</option>
                        </select>
                      </div>

                      {/* Lien d'invitation */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-primary mb-2">Lien d'invitation</label>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={guest.invitationLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 text-sm text-secondary hover:text-secondary-light truncate"
                          >
                            {guest.invitationLink}
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(guest.invitationLink)}
                            className="p-1 text-neutral-400 hover:text-secondary transition-colors"
                            title="Copier le lien"
                          >
                            <Clipboard className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Message personnalisé */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-primary mb-2">Message personnalisé</label>
                        <button
                          onClick={() => handleCopyMessage(guest.id, guest.messageSender || guest.additional_notes || '')}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent border border-accent-dark rounded-lg hover:bg-accent-dark text-primary text-sm transition-all duration-200"
                        >
                          <Clipboard className="h-4 w-4" />
                          {copiedId === guest.id ? 'Copié !' : 'Copier le message'}
                        </button>
                      </div>

                      {/* Indicateur de statut visuel */}
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          guest.rsvp_status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : guest.rsvp_status === 'declined' 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {guest.rsvp_status === 'confirmed' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmé
                            </>
                          ) : guest.rsvp_status === 'declined' ? (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Annulé
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        )}
      </main>
    </div>
  );
} 