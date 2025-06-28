import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
  Filter,
  X,
  ChevronDown,
  ArrowRight,
  Users,
  Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useEvents, Event } from '../hooks/useEvents';
import PlanLimitWarning from '../components/PlanLimitWarning';
import Modal from '../components/Modal';

const Events: React.FC = () => {
  usePageTitle('Mes événements');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState<string>('date-asc');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: 'Nouvel événement',
    description: '',
    type: 'wedding',
    location: '',
    event_date: new Date().toISOString().split('T')[0],
    rsvp_deadline: '',
    is_private: true,
    cover_color: '#D4A5A5'
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremiumUser } = usePermissions();
  const { canCreateEvent, quotas } = usePlanLimits();
  
  // State for sortBy and sortOrder
  const [sortBy, setSortBy] = useState<'event_date' | 'title' | 'type'>('event_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Update sortBy and sortOrder when sortValue changes
  useEffect(() => {
    const [field, order] = sortValue.split('-') as ['date' | 'name' | 'type', 'asc' | 'desc'];
    if (field === 'date') {
      setSortBy('event_date');
    } else if (field === 'name') {
      setSortBy('title');
    } else {
      setSortBy('type');
    }
    setSortOrder(order);
  }, [sortValue]);

  const { 
    events, 
    isLoading, 
    error, 
    refreshEvents, 
    deleteEvent,
    createEvent
  } = useEvents({
    searchTerm: searchTerm || undefined,
    sortBy: sortBy,
    sortOrder: sortOrder
  });

  // Reset selection when filters change or events are reloaded
  useEffect(() => {
    setSelectedEvents([]);
  }, [events, searchTerm, sortValue]);

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

  const handleSelectEvent = (id: string) => {
    setSelectedEvents(prev =>
      prev.includes(id)
        ? prev.filter(eventId => eventId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(event => event.id));
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEventToDelete(id);
    setShowActionMenu(null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      setIsDeleting(true);
      try {
        const success = await deleteEvent(eventToDelete);
        if (success) {
          setEventToDelete(null);
          setShowDeleteModal(false);
          refreshEvents(); // Refresh data after deletion
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCopyLink = (event: Event) => {
    const url = `${window.location.origin}/event/${event.id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(event.id);
    setShowActionMenu(null);
  };

  const toggleActionMenu = (id: string) => {
    setShowActionMenu(showActionMenu === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCreateEvent = async () => {
    if (!canCreateEvent) return;
    
    try {
      const createdEvent = await createEvent(newEvent);
      if (createdEvent) {
        setShowCreateModal(false);
        refreshEvents();
        // Optionally navigate to the event detail page
        navigate(`/dashboard/events`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-[#D4A5A5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Calendar className="h-12 w-12 text-[#D4A5A5]" />
      </div>
      <h3 className="text-xl font-semibold text-primary mb-3 font-serif">
        Aucun événement trouvé
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {searchTerm 
          ? `Aucun événement ne correspond à vos critères de recherche.`
          : 'Commencez par créer votre premier événement.'
        }
      </p>
      {canCreateEvent && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2 inline-block" />
          Créer mon premier événement
        </button>
      )}
    </div>
  );

  // Loading and Error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent py-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A5A5] mb-4" />
          <span className="text-lg text-gray-600">Chargement des événements...</span>
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
              onClick={refreshEvents}
              className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
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
              Mes événements
            </h1>
            <p className="text-gray-600 max-w-xl">
              Gérez vos événements et créez des invitations pour chacun d'entre eux.
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            {canCreateEvent ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-accent w-full sm:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span>Nouvel événement</span>
              </button>
            ) : (
              <div className="text-center">
                <PlanLimitWarning type="event" showUpgrade={false} />
              </div>
            )}
          </div>
        </div>

        {/* Quota d'événements */}
        {quotas.event && (
          <div className="card mb-6 p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Utilisation des événements</h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Événements ce mois</span>
                  <span className="text-sm font-medium">
                    {quotas.event.used} / {quotas.event.isUnlimited ? '∞' : quotas.event.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quotas.event.percent >= 90 ? 'bg-red-500' :
                      quotas.event.percent >= 70 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(quotas.event.percent, 100)}%` }}
                  />
                </div>
              </div>
              
              {!quotas.event.isUnlimited && quotas.event.percent >= 80 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-2 md:max-w-xs">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">Vous approchez de votre limite d'événements</p>
                    <Link to="/pricing" className="text-xs text-amber-600 font-medium hover:text-amber-800">
                      Passer au plan supérieur
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="card mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="relative flex-1 max-w-lg w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement par titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full"
                aria-label="Rechercher un événement"
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
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="form-input w-full sm:w-auto"
                aria-label="Trier par"
              >
                <option value="date-asc">Date (croissant)</option>
                <option value="date-desc">Date (décroissant)</option>
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="type-asc">Type (A-Z)</option>
                <option value="type-desc">Type (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Actions en lot */}
          {selectedEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedEvents.length} événement{selectedEvents.length > 1 ? 's' : ''} sélectionné{selectedEvents.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setSelectedEvents([])}
                    className="text-sm text-[#D4A5A5] hover:text-[#D4A5A5]/80 transition-colors"
                  >
                    Désélectionner tout
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    className="px-3 py-1.5 text-sm border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => {
                      if (selectedEvents.length === 1) {
                        handleDeleteEvent(selectedEvents[0]);
                      }
                    }}
                    disabled={selectedEvents.length !== 1}
                  >
                    <Trash2 className="h-4 w-4 mr-2 inline-block" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des événements */}
        {events.length === 0 ? (
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
                  checked={selectedEvents.length === events.length && events.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
                  aria-label="Sélectionner tous les événements"
                />
                <span className="text-sm text-gray-600">
                  Sélectionner tout ({events.length})
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {events.length} événement{events.length > 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Grille des événements - responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.map((event) => (
                <div key={event.id} className="card hover:shadow-lg transition-all duration-200 overflow-hidden group flex flex-col h-full">
                  {/* Header avec sélection et menu */}
                  <div className="p-4 sm:p-6 pb-4 flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => handleSelectEvent(event.id)}
                          className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
                          aria-label={`Sélectionner l'événement ${event.title}`}
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-primary group-hover:text-[#D4A5A5] transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {event.is_private ? (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full border border-gray-200">
                                Privé
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full border border-green-200">
                                Public
                              </span>
                            )}
                            {event.type && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                                {event.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu d'actions pour desktop */}
                      <div className="hidden sm:block relative action-menu">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => toggleActionMenu(event.id)}
                          aria-label="Menu d'actions"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>
                        
                        {showActionMenu === event.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <Link
                              to={`/event/${event.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-2" /> Aperçu
                            </Link>
                            <Link
                              to={`/event/edit/${event.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-2" /> Modifier
                            </Link>
                            <button
                              onClick={() => handleCopyLink(event)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                            >
                              <Copy className="h-4 w-4 mr-2" /> Copier le lien
                            </button>
                            <Link
                              to={`/templates?event=${event.id}`}
                              className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Créer une invitation
                            </Link>
                            <hr className="my-1 border-gray-200" />
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informations de l'événement */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-[#D4A5A5] flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(event.event_date)}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-[#D4A5A5] flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      {event.rsvp_deadline && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-[#D4A5A5] flex-shrink-0" />
                          <span className="truncate">RSVP avant le {formatDate(event.rsvp_deadline)}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {event.description && (
                      <div className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {event.description}
                      </div>
                    )}
                  </div>

                  {/* Actions en bas de la carte */}
                  <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleCopyLink(event)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-[#D4A5A5] transition-colors rounded-lg hover:bg-white"
                        title="Copier le lien"
                        aria-label="Copier le lien de l'événement"
                      >
                        <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      
                      {/* Message de succès de copie */}
                      {copySuccess === event.id && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md transition-opacity duration-300">
                          Lien copié !
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {/* Actions pour tous les écrans */}
                      <Link
                        to={`/event/${event.id}`}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-[#D4A5A5] transition-colors rounded-lg hover:bg-white"
                        title="Aperçu"
                        aria-label="Aperçu de l'événement"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Link>
                      
                      <Link
                        to={`/event/edit/${event.id}`}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-[#D4A5A5] transition-colors rounded-lg hover:bg-white"
                        title="Modifier"
                        aria-label="Modifier l'événement"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Link>
                      
                      {/* Menu d'actions pour mobile */}
                      <div className="sm:hidden relative">
                        <button
                          onClick={() => toggleActionMenu(event.id)}
                          className="p-1.5 text-gray-400 hover:text-[#D4A5A5] transition-colors rounded-lg hover:bg-white"
                          title="Plus d'actions"
                          aria-label="Plus d'actions"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      {/* Actions supplémentaires pour desktop */}
                      <div className="hidden sm:flex items-center space-x-2">
                        <Link
                          to={`/templates?event=${event.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-white"
                          title="Créer une invitation"
                          aria-label="Créer une invitation pour cet événement"
                        >
                          <Mail className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white"
                          title="Supprimer"
                          aria-label="Supprimer l'événement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bouton pour créer une invitation */}
                  <div className="px-4 sm:px-6 py-3 bg-white border-t border-gray-100">
                    <Link
                      to={`/templates?event=${event.id}`}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Créer une invitation</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Upgrade Prompt pour les utilisateurs non-premium */}
        {!isPremiumUser() && (
          <div className="mt-12 gradient-secondary rounded-2xl p-6 sm:p-8 text-center text-white">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-white/90" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2 font-serif">Besoin de plus d'événements ?</h3>
            <p className="text-base sm:text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Passez au plan premium pour créer jusqu'à 5 événements par mois ou un nombre illimité avec notre plan Prestige.
            </p>
            <Link
              to="/pricing"
              className="inline-block px-6 sm:px-8 py-3 bg-white text-[#E16939] font-semibold rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-lg"
            >
              Découvrir nos plans
            </Link>
          </div>
        )}
      </div>

      {/* Modal de suppression */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer l'événement"
        description="Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible et supprimera également toutes les invitations associées."
        icon={<Trash2 className="h-5 w-5 text-red-600" />}
        confirmText={isDeleting ? 'Suppression...' : 'Supprimer'}
        onConfirm={confirmDelete}
        isConfirming={isDeleting}
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />

      {/* Modal de création d'événement */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer un nouvel événement"
        icon={<Calendar className="h-5 w-5 text-[#D4A5A5]" />}
        confirmText="Créer l'événement"
        onConfirm={handleCreateEvent}
        confirmButtonClass="bg-[#D4A5A5] hover:bg-[#D4A5A5]/90 text-white"
        isForm
      >
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'événement *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="Mariage de Sarah & Alex"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
              rows={3}
              className="form-input w-full"
              placeholder="Une description de votre événement..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                Date de l'événement *
              </label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={newEvent.event_date}
                onChange={handleInputChange}
                className="form-input w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type d'événement
              </label>
              <select
                id="type"
                name="type"
                value={newEvent.type}
                onChange={handleInputChange}
                className="form-input w-full"
              >
                <option value="wedding">Mariage</option>
                <option value="engagement">Fiançailles</option>
                <option value="anniversary">Anniversaire</option>
                <option value="birthday">Fête d'anniversaire</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={newEvent.location}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="Domaine des Roses, Paris"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rsvp_deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Date limite RSVP
              </label>
              <input
                type="date"
                id="rsvp_deadline"
                name="rsvp_deadline"
                value={newEvent.rsvp_deadline}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
            
            <div>
              <label htmlFor="cover_color" className="block text-sm font-medium text-gray-700 mb-1">
                Couleur de couverture
              </label>
              <input
                type="color"
                id="cover_color"
                name="cover_color"
                value={newEvent.cover_color}
                onChange={handleInputChange}
                className="form-input w-full h-10"
              />
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="is_private"
              name="is_private"
              checked={newEvent.is_private}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
            />
            <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
              Événement privé
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Events;