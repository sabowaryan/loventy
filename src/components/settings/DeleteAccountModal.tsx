import React from 'react';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-[#1E1E1E]">
            Supprimer le compte
          </h3>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Attention</p>
            <p className="text-sm text-red-700 mt-1">
              Cette action est irréversible. Toutes vos données, invitations et fichiers seront définitivement supprimés.
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Suppression...</span>
              </>
            ) : (
              'Supprimer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;