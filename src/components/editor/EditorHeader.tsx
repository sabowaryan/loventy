// src/components/editor/EditorHeader.tsx
import React from 'react';
import {
  Save,
  Eye,
  Send,
  ArrowLeft,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Undo2,
  Redo2
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface EditorHeaderProps {
  invitationTitle: string;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  autoSaveCountdown: number;
  isInvitationSaving: boolean;
  isSavingDesign: boolean;
  handleSave: (showNotification?: boolean) => Promise<void>;
  setShowPreview: (show: boolean) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  handlePublish: () => Promise<void>;
  handleSendInvitation: () => Promise<void>;
  invitationStatus: ExtendedInvitationData['status'];
  navigate: (path: string) => void;
  showSuccessMessage: boolean;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  invitationTitle,
  hasUnsavedChanges,
  lastSaved,
  autoSaveCountdown,
  isInvitationSaving,
  isSavingDesign,
  handleSave,
  setShowPreview,
  previewDevice,
  setPreviewDevice,
  undo,
  redo,
  canUndo,
  canRedo,
  handlePublish,
  handleSendInvitation,
  invitationStatus,
  navigate,
  showSuccessMessage,
  errorMessage,
  setErrorMessage
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/invitations')}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#D4A5A5] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>

            <div className="border-l border-gray-200 pl-4">
              <h1 className="text-lg font-semibold text-[#131837] truncate max-w-xs">
                {invitationTitle || 'Nouvelle invitation'}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {hasUnsavedChanges ? (
                  <span className="text-amber-600 font-medium">Modifications non sauvegardées</span>
                ) : (
                  <>
                    <span>
                      {lastSaved ? `Sauvegardé ${lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : 'Non sauvegardé'}
                    </span>
                    <span className="ml-2">
                      (Auto-save dans {autoSaveCountdown}s)
                    </span>
                  </>
                )}
                {(isInvitationSaving || isSavingDesign) && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[#D4A5A5] rounded-full animate-pulse"></div>
                    <span>Sauvegarde...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Undo/Redo Buttons */}
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-200 text-[#131837] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Annuler"
            >
              <Undo2 className="h-4 w-4" />
              <span className="hidden sm:inline">Annuler</span>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-200 text-[#131837] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Rétablir"
            >
              <Redo2 className="h-4 w-4" />
              <span className="hidden sm:inline">Rétablir</span>
            </button>

            {/* Device Selector for Preview */}
            <div className="hidden lg:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Smartphone }
              ].map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPreviewDevice(id as any)}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === id
                      ? 'bg-white text-[#D4A5A5] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-[#131837] rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Aperçu</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={isInvitationSaving || isSavingDesign}
              className="flex items-center space-x-2 px-4 py-2 bg-[#131837] text-white rounded-lg hover:bg-[#1e2347] transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Sauvegarder</span>
            </button>

            {invitationStatus === 'draft' ? (
              <button
                onClick={handlePublish}
                className="flex items-center space-x-2 px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Publier</span>
              </button>
            ) : (
              <button
                onClick={handleSendInvitation}
                className="flex items-center space-x-2 px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5" />
          <span>Invitation sauvegardée avec succès !</span>
          <button
            onClick={() => setShowPreview(false)} // Assuming this is meant to dismiss the success message
            className="ml-2 hover:bg-green-600 rounded p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)} // Allow user to dismiss error
            className="ml-2 hover:bg-red-600 rounded p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorHeader;

