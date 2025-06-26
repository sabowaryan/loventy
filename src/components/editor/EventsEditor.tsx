import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Edit,
  Save,
  X,
  CloudSun
} from 'lucide-react';
import { InvitationEvent } from '../../types/models';

interface EventsEditorProps {
  events: InvitationEvent[];
  onAddEvent: (event: Partial<InvitationEvent>) => void;
  onUpdateEvent: (id: string, event: Partial<InvitationEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onReorderEvents: (id: string, direction: 'up' | 'down') => void;
}

const EventsEditor: React.FC<EventsEditorProps> = ({ 
  events, 
  onAddEvent, 
  onUpdateEvent, 
  onDeleteEvent,
  onReorderEvents
}) => {
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<InvitationEvent>>({
    event_type: 'ceremony',
    title: '',
    event_time: '',
    location_name: '',
    address: '',
    description: '',
    display_order: events.length
  });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.event_time || !newEvent.location_name || !newEvent.address) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    onAddEvent(newEvent);
    
    // Reset form
    setNewEvent({
      event_type: 'ceremony',
      title: '',
      event_time: '',
      location_name: '',
      address: '',
      description: '',
      display_order: events.length + 1
    });
  };

  const eventTypeOptions = [
    { value: 'ceremony', label: 'Cérémonie' },
    { value: 'reception', label: 'Réception' },
    { value: 'cocktail', label: 'Cocktail' },
    { value: 'dinner', label: 'Dîner' },
    { value: 'party', label: 'Soirée' },
    { value: 'other', label: 'Autre' }
  ];

  const getEventTypeLabel = (type: string) => {
    return eventTypeOptions.find(option => option.value === type)?.label || type;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'ceremony':
        return 'bg-blue-100 text-blue-800';
      case 'reception':
        return 'bg-green-100 text-green-800';
      case 'cocktail':
        return 'bg-purple-100 text-purple-800';
      case 'dinner':
        return 'bg-amber-100 text-amber-800';
      case 'party':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Liste des événements */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Programme des événements
        </h3>
        
        {events.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Aucun événement ajouté</p>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Ajoutez des événements pour créer le programme de votre mariage (cérémonie, cocktail, dîner, etc.)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div 
                key={event.id} 
                className={`border rounded-lg overflow-hidden ${
                  editingEventId === event.id ? 'border-[#D4A5A5]' : 'border-gray-200'
                }`}
              >
                {editingEventId === event.id ? (
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-[#131837]">Modifier l'événement</h4>
                      <button 
                        onClick={() => setEditingEventId(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
                        <select
                          value={event.event_type}
                          onChange={(e) => onUpdateEvent(event.id, { event_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                        >
                          {eventTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input
                          type="text"
                          value={event.title}
                          onChange={(e) => onUpdateEvent(event.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                          placeholder="Cérémonie religieuse"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                        <input
                          type="time"
                          value={event.event_time}
                          onChange={(e) => onUpdateEvent(event.id, { event_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                        <input
                          type="text"
                          value={event.location_name}
                          onChange={(e) => onUpdateEvent(event.id, { location_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                          placeholder="Église Saint-Joseph"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                          type="text"
                          value={event.address}
                          onChange={(e) => onUpdateEvent(event.id, { address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                          placeholder="123 Rue de la Paix, 75001 Paris"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnelle)</label>
                        <textarea
                          value={event.description || ''}
                          onChange={(e) => onUpdateEvent(event.id, { description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                          placeholder="Informations supplémentaires sur cet événement"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h5 className="font-medium text-[#131837] mb-2 flex items-center">
                        <CloudSun className="h-4 w-4 mr-1 text-[#D4A5A5]" />
                        Plan B (en cas de mauvais temps)
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lieu alternatif</label>
                          <input
                            type="text"
                            value={event.plan_b_location_name || ''}
                            onChange={(e) => onUpdateEvent(event.id, { plan_b_location_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                            placeholder="Salle des fêtes"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse alternative</label>
                          <input
                            type="text"
                            value={event.plan_b_address || ''}
                            onChange={(e) => onUpdateEvent(event.id, { plan_b_address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                            placeholder="456 Avenue du Soleil, 75001 Paris"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description du plan B</label>
                          <textarea
                            value={event.plan_b_description || ''}
                            onChange={(e) => onUpdateEvent(event.id, { plan_b_description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                            placeholder="En cas de pluie, la cérémonie se déroulera à l'intérieur"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        onClick={() => setEditingEventId(null)}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => setEditingEventId(null)}
                        className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="p-4 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                          {getEventTypeLabel(event.event_type)}
                        </span>
                        <h4 className="font-medium text-[#131837]">{event.title}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{event.event_time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{event.location_name}</span>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400 mt-0.5" />
                          <span className="line-clamp-1">{event.address}</span>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-2 italic">{event.description}</p>
                      )}
                      
                      {(event.plan_b_location_name || event.plan_b_address) && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <div className="flex items-center mb-1">
                            <CloudSun className="h-3 w-3 mr-1" />
                            <span className="font-medium">Plan B</span>
                          </div>
                          {event.plan_b_location_name && <p>{event.plan_b_location_name}</p>}
                          {event.plan_b_address && <p>{event.plan_b_address}</p>}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex md:flex-col items-center justify-end p-2 md:p-4 md:border-l border-gray-100 space-x-2 md:space-x-0 md:space-y-2">
                      <button
                        onClick={() => onReorderEvents(event.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Monter"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onReorderEvents(event.id, 'down')}
                        disabled={index === events.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Descendre"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingEventId(event.id)}
                        className="p-1 text-gray-400 hover:text-[#D4A5A5]"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout d'événement */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Ajouter un événement
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
              <select
                value={newEvent.event_type}
                onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              >
                {eventTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Cérémonie religieuse"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
              <input
                type="time"
                value={newEvent.event_time}
                onChange={(e) => setNewEvent({...newEvent, event_time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
              <input
                type="text"
                value={newEvent.location_name}
                onChange={(e) => setNewEvent({...newEvent, location_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Église Saint-Joseph"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input
                type="text"
                value={newEvent.address}
                onChange={(e) => setNewEvent({...newEvent, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="123 Rue de la Paix, 75001 Paris"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnelle)</label>
              <textarea
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Informations supplémentaires sur cet événement"
              />
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h5 className="font-medium text-[#131837] mb-2 flex items-center">
              <CloudSun className="h-4 w-4 mr-1 text-[#D4A5A5]" />
              Plan B (en cas de mauvais temps)
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu alternatif</label>
                <input
                  type="text"
                  value={newEvent.plan_b_location_name || ''}
                  onChange={(e) => setNewEvent({...newEvent, plan_b_location_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="Salle des fêtes"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse alternative</label>
                <input
                  type="text"
                  value={newEvent.plan_b_address || ''}
                  onChange={(e) => setNewEvent({...newEvent, plan_b_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="456 Avenue du Soleil, 75001 Paris"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description du plan B</label>
                <textarea
                  value={newEvent.plan_b_description || ''}
                  onChange={(e) => setNewEvent({...newEvent, plan_b_description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="En cas de pluie, la cérémonie se déroulera à l'intérieur"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={handleAddEvent}
              className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter l'événement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsEditor;