import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteGuestModalProps {
  onClose: () => void;
  onConfirmDelete: () => void;
  guestName: string;
}

const DeleteGuestModal: React.FC<DeleteGuestModalProps> = ({ onClose, onConfirmDelete, guestName }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary">
            Supprimer l'invité
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer <span className="font-medium">{guestName}</span> ? Cette action est irréversible.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirmDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGuestModal;