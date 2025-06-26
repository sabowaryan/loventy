import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  X, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  MoreVertical,
  Eye,
  Send,
  CheckSquare,
  XSquare,
  Users,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { GuestDetails } from '../../types/models';
import GuestActionMenu from './GuestActionMenu';

interface GuestListProps {
  guests: GuestDetails[];
  selectedGuests: string[];
  onSelectGuest: (id: string) => void;
  onSelectAll: () => void;
  onDeleteGuest: (id: string) => void;
  onPreviewInvitation: (id: string) => void;
  onUpdateStatus: (id: string, status: 'confirmed' | 'pending' | 'declined') => void;
  onSendEmail: (id: string) => void;
  activeActionMenu: string | null;
  setActiveActionMenu: (id: string | null) => void;
}

const GuestList: React.FC<GuestListProps> = ({
  guests,
  selectedGuests,
  onSelectGuest,
  onSelectAll,
  onDeleteGuest,
  onPreviewInvitation,
  onUpdateStatus,
  onSendEmail,
  activeActionMenu,
  setActiveActionMenu
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'notification-success';
      case 'pending':
        return 'notification-warning';
      case 'declined':
        return 'notification-error';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'declined':
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
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
      default:
        return status;
    }
  };

  if (guests.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-primary mb-3 font-serif">
            Aucun invité trouvé
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Commencez par ajouter vos premiers invités ou modifiez vos critères de recherche.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedGuests.length === guests.length && guests.length > 0}
              onChange={onSelectAll}
              className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">
              Sélectionner tout ({guests.length})
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            {guests.length} invité{guests.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {guests.map((guest) => (
          <div key={guest.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedGuests.includes(guest.id)}
                  onChange={() => onSelectGuest(guest.id)}
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-primary">{guest.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(guest.status)}`}>
                      {getStatusIcon(guest.status)}
                      <span className="ml-1">{getStatusText(guest.status)}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{guest.email}</span>
                      </div>
                      {guest.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{guest.invitation_title}</span>
                    </div>
                    
                    {guest.responded_at && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Répondu le {new Date(guest.responded_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                  
                  {guest.response_message && (
                    <div className="flex items-center space-x-1 mt-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="italic text-sm text-gray-600">"{guest.response_message}"</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => onSendEmail(guest.id)}
                  className="p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white" 
                  title="Envoyer email"
                >
                  <Mail className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => onPreviewInvitation(guest.id)}
                  className="p-2 text-gray-400 hover:text-secondary transition-colors rounded-lg hover:bg-white" 
                  title="Prévisualiser l'invitation"
                >
                  <Eye className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => onDeleteGuest(guest.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setActiveActionMenu(activeActionMenu === guest.id ? null : guest.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {activeActionMenu === guest.id && (
                    <GuestActionMenu 
                      guest={guest}
                      onClose={() => setActiveActionMenu(null)}
                      onPreviewInvitation={() => onPreviewInvitation(guest.id)}
                      onUpdateStatus={(status) => onUpdateStatus(guest.id, status)}
                      onSendEmail={() => onSendEmail(guest.id)}
                      onDelete={() => onDeleteGuest(guest.id)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestList;