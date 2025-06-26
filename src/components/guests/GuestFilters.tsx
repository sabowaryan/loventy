import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface GuestFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  invitationFilter: string;
  setInvitationFilter: (invitation: string) => void;
  invitations: Array<{ id: string, title: string }>;
  selectedGuests: string[];
  setSelectedGuests: (guests: string[]) => void;
  onSendEmail: () => void;
}

const GuestFilters: React.FC<GuestFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  invitationFilter,
  setInvitationFilter,
  invitations,
  selectedGuests,
  setSelectedGuests,
  onSendEmail
}) => {
  return (
    <div className="card mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un invité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 pr-10"
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Confirmés</option>
            <option value="pending">En attente</option>
            <option value="declined">Déclinés</option>
          </select>

          <select
            value={invitationFilter}
            onChange={(e) => setInvitationFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">Toutes les invitations</option>
            {invitations.map(invitation => (
              <option key={invitation.id} value={invitation.id}>
                {invitation.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions sur la sélection */}
      {selectedGuests.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedGuests.length} invité{selectedGuests.length > 1 ? 's' : ''} sélectionné{selectedGuests.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedGuests([])}
                className="text-sm text-secondary hover:text-secondary/80 transition-colors"
              >
                Désélectionner tout
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={onSendEmail}
                className="px-3 py-1.5 text-sm btn-accent"
              >
                Envoyer email
              </button>
              <button className="px-3 py-1.5 text-sm border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestFilters;