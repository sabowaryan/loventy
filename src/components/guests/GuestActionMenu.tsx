import React from 'react';
import { 
  Eye, 
  Send, 
  CheckSquare, 
  XSquare, 
  Clock, 
  Edit, 
  Trash2,
  ExternalLink,
  Copy
} from 'lucide-react';
import { GuestDetails } from '../../types/models';

interface GuestActionMenuProps {
  guest: GuestDetails;
  onClose: () => void;
  onPreviewInvitation: () => void;
  onUpdateStatus: (status: 'confirmed' | 'pending' | 'declined') => void;
  onSendEmail: () => void;
  onDelete: () => void;
}

const GuestActionMenu: React.FC<GuestActionMenuProps> = ({
  guest,
  onClose,
  onPreviewInvitation,
  onUpdateStatus,
  onSendEmail,
  onDelete
}) => {
  // Fonction pour copier le lien d'invitation
  const copyInvitationLink = () => {
    const url = `${window.location.origin}/invitation/${guest.invitation_id}?guest=${guest.id}`;
    navigator.clipboard.writeText(url);
    alert('Lien copié dans le presse-papiers !');
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
      <button
        onClick={onPreviewInvitation}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
      >
        <Eye className="h-4 w-4 mr-2 text-gray-500" />
        Prévisualiser l'invitation
      </button>
      
      <button
        onClick={copyInvitationLink}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
      >
        <Copy className="h-4 w-4 mr-2 text-gray-500" />
        Copier le lien d'invitation
      </button>
      
      <button
        onClick={onSendEmail}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
      >
        <Send className="h-4 w-4 mr-2 text-gray-500" />
        Envoyer un email
      </button>
      
      <hr className="my-1 border-gray-200" />
      
      <div className="px-4 py-1">
        <span className="text-xs font-medium text-gray-500">Changer le statut</span>
      </div>
      
      <button
        onClick={() => onUpdateStatus('confirmed')}
        disabled={guest.status === 'confirmed'}
        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center ${
          guest.status === 'confirmed' ? 'text-green-600 font-medium' : 'text-gray-700'
        }`}
      >
        <CheckSquare className={`h-4 w-4 mr-2 ${guest.status === 'confirmed' ? 'text-green-600' : 'text-gray-500'}`} />
        Confirmé
      </button>
      
      <button
        onClick={() => onUpdateStatus('pending')}
        disabled={guest.status === 'pending'}
        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center ${
          guest.status === 'pending' ? 'text-amber-600 font-medium' : 'text-gray-700'
        }`}
      >
        <Clock className={`h-4 w-4 mr-2 ${guest.status === 'pending' ? 'text-amber-600' : 'text-gray-500'}`} />
        En attente
      </button>
      
      <button
        onClick={() => onUpdateStatus('declined')}
        disabled={guest.status === 'declined'}
        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center ${
          guest.status === 'declined' ? 'text-red-600 font-medium' : 'text-gray-700'
        }`}
      >
        <XSquare className={`h-4 w-4 mr-2 ${guest.status === 'declined' ? 'text-red-600' : 'text-gray-500'}`} />
        Décliné
      </button>
      
      <hr className="my-1 border-gray-200" />
      
      <button
        onClick={onDelete}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Supprimer
      </button>
    </div>
  );
};

export default GuestActionMenu;