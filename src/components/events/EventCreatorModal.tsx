import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, MapPin, Clock, AlertTriangle, Loader2, Check } from 'lucide-react';
import { useEvents, Event } from '../../hooks/useEvents';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import PlanLimitWarning from '../../components/PlanLimitWarning';

interface EventCreatorModalProps {
  onClose: () => void;
  onEventSelected: (eventId: string) => void;
  templateId?: string;
}

const EventCreatorModal: React.FC<EventCreatorModalProps> = ({ onClose, onEventSelected, templateId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    location: '',
    event_date: new Date().toISOString().split('T')[0],
    is_private: true
  });

  const { events, isLoading, error, createEvent, canCreateEvent } = useEvents();
  const { quotas } = usePlanLimits();

  // Vérifier si l'utilisateur peut créer un événement
  useEffect(() => {
    const checkEventLimit = async () => {
      setIsCheckingLimit(true);
      const canCreateNewEvent = await canCreateEvent();
      setCanCreate(canCreateNewEvent);
      setIsCheckingLimit(false);
    };

    checkEventLimit();
  }, [canCreateEvent]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreate) {
      return;
    }
    
    try {
      const createdEvent = await createEvent(newEvent);
      if (createdEvent) {
        onEventSelected(createdEvent.id);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#131837]">
              {showCreateForm ? 'Créer un nouvel événement' : 'Sélectionner un événement'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isCheckingLimit ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4A5A5]" />
            </div>
          ) : (
            <>
              {!showCreateForm ? (
                <>
                  {/* Quota d'événements */}
                  {quotas.event && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
                  )}

                  {/* Liste des événements existants */}
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#D4A5A5]" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
                      >
                        Réessayer
                      </button>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Vous n'avez pas encore créé d'événement</p>
                      {canCreate ? (
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2 inline-block" />
                          Créer mon premier événement
                        </button>
                      ) : (
                        <PlanLimitWarning type="event" />
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        {events.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => onEventSelected(event.id)}
                            className="p-4 border border-gray-200 rounded-lg hover:border-[#D4A5A5] hover:bg-[#D4A5A5]/5 transition-colors text-left flex flex-col"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-[#131837]">{event.title}</h3>
                              {event.is_private && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  Privé
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{formatDate(event.event_date)}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {canCreate && (
                        <div className="flex justify-center">
                          <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2 inline-block" />
                            Créer un nouvel événement
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {!canCreate ? (
                    <div className="mb-6">
                      <PlanLimitWarning type="event" />
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => setShowCreateForm(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Retour à la liste
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateEvent} className="space-y-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                          Titre de l'événement *
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={newEvent.title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                          placeholder="Mariage de Sarah & Alex"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={newEvent.description || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                          placeholder="Une description de votre événement..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                            Date de l'événement *
                          </label>
                          <input
                            type="date"
                            id="event_date"
                            name="event_date"
                            value={newEvent.event_date}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                            Type d'événement
                          </label>
                          <select
                            id="type"
                            name="type"
                            value={newEvent.type || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                          >
                            <option value="">Sélectionner un type</option>
                            <option value="wedding">Mariage</option>
                            <option value="engagement">Fiançailles</option>
                            <option value="anniversary">Anniversaire</option>
                            <option value="birthday">Fête d'anniversaire</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                          Lieu
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={newEvent.location || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                          placeholder="Domaine des Roses, Paris"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="rsvp_deadline" className="block text-sm font-medium text-gray-700 mb-2">
                            Date limite RSVP
                          </label>
                          <input
                            type="date"
                            id="rsvp_deadline"
                            name="rsvp_deadline"
                            value={newEvent.rsvp_deadline || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="cover_color" className="block text-sm font-medium text-gray-700 mb-2">
                            Couleur de couverture
                          </label>
                          <input
                            type="color"
                            id="cover_color"
                            name="cover_color"
                            value={newEvent.cover_color || '#D4A5A5'}
                            onChange={handleInputChange}
                            className="w-full h-11 px-4 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_private"
                          name="is_private"
                          checked={newEvent.is_private !== false}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
                        />
                        <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
                          Événement privé
                        </label>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer l'événement
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCreatorModal;