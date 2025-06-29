import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Layers
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';
import { useInvitationDesign } from '../hooks/useInvitationDesign';
import { useInvitation } from '../hooks/useInvitation';
import { defaultDesignSettings } from '../utils/designConstants';
import { debounce } from '../utils/debounce';
import InvitationPreview from '../components/invitation/InvitationPreview';
import { ExtendedInvitationData } from '../types/models';

// Import editor sections
import EditorSidebar from '../components/editor/EditorSidebar';
import EditorContent from '../components/editor/EditorContent';

const Editor: React.FC = () => {
  usePageTitle('Éditeur d\'invitation');

  const { templateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState('details');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New state for error message

  // Utiliser le hook useInvitation pour charger et gérer les données
  const {
    invitation,
    events,
    quizzes,
    questions,
    posts,
    comments,
    isLoading: isInvitationLoading,
    error: invitationError,
    isSaving: isInvitationSaving,
    updateInvitation,
    addEvent,
    updateEvent,
    deleteEvent,
    reorderEvents,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    toggleSocialWall,
    toggleModeration,
    approvePost,
    rejectPost,
    deletePost,
    approveComment,
    rejectComment,
    deleteComment
  } = useInvitation({ invitationId: templateId });

  // Use the invitation design hook
  const {
    designSettings,
    isSaving: isSavingDesign,
    error: designError,
    isUploading,
    updateDesignSettings,
    saveDesignSettings,
    uploadImage
  } = useInvitationDesign({
    invitationId: templateId || '',
    initialDesignSettings: defaultDesignSettings
  });

  // Créer une version debounced de updateInvitation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateInvitation = useCallback(
    debounce((updates: Partial<ExtendedInvitationData>) => {
      updateInvitation(updates);
    }, 1000), // Délai de 1 seconde
    [updateInvitation]
  );

  // Auto-save functionality
  useEffect(() => {
    if (!invitation) return;

    const autoSave = setTimeout(() => {
      handleSave(false);
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [invitation, designSettings]);

  const handleInputChange = (field: keyof ExtendedInvitationData, value: any) => {
    if (!invitation) return;

    // Mettre à jour l'état local immédiatement pour une UI réactive
    // mais utiliser la version debounced pour l'API
    debouncedUpdateInvitation({
      [field]: value
    });
  };

  const handleSave = async (showNotification = true) => {
    if (!invitation) return;

    setErrorMessage(null); // Clear previous errors
    try {
      // Sauvegarder les paramètres de design
      await saveDesignSettings();

      setLastSaved(new Date());

      if (showNotification) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error: any) { // Explicitly type error as 'any' for message property
      console.error('Erreur lors de la sauvegarde:', error);
      let userFriendlyMessage = 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.';

      if (error.message && (error.message.includes('NetworkError') || error.message.includes('Failed to fetch') || error.message.includes('timeout'))) {
        userFriendlyMessage = 'Problème de connexion réseau. Veuillez vérifier votre internet et réessayer.';
      } else if (error.message) {
        userFriendlyMessage = `Erreur: ${error.message}`;
      }
      setErrorMessage(userFriendlyMessage);
      setTimeout(() => setErrorMessage(null), 5000); // Clear error message after 5 seconds
    }
  };

  const handlePublish = async () => {
    if (!invitation) return;

    await handleSave();
    await updateInvitation({ status: 'published' });
    console.log('Invitation publiée');
  };

  const handleSendInvitation = async () => {
    if (!invitation) return;

    await handleSave();
    navigate(`/dashboard/guests?invitation=${invitation.id}&action=send`);
  };

  const handleImageUpload = async (sectionId: string, imageType: 'background' | 'couple', file: File) => {
    try {
      const imageUrl = await uploadImage(sectionId, imageType, file);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Afficher un état de chargement pendant que les données sont récupérées
  if (isInvitationLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A5A5] mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si le chargement a échoué
  if (invitationError && !invitation) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#131837] mb-3">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">{invitationError}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={() => navigate('/dashboard/invitations')}
                className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retour aux invitations
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header fixe */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Navigation gauche */}
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
                  {invitation?.title || 'Nouvelle invitation'}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>
                    {lastSaved ? `Sauvegardé ${lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : 'Non sauvegardé'}
                  </span>
                  {(isInvitationSaving || isSavingDesign) && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-[#D4A5A5] rounded-full animate-pulse"></div>
                      <span>Sauvegarde...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center space-x-3">
              {/* Sélecteur d'appareil pour l'aperçu */}
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

              {invitation?.status === 'draft' ? (
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
      </div>

      {/* Message de succès */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5" />
          <span>Invitation sauvegardée avec succès !</span>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="ml-2 hover:bg-green-600 rounded p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Message d'erreur */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Sidebar - Navigation */}
          <div className="xl:col-span-2">
            <EditorSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          {/* Main Content - Editor */}
          <div className="xl:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <EditorContent
                  activeTab={activeTab}
                  activeSection={activeSection}
                  invitation={invitation}
                  events={events}
                  quizzes={quizzes}
                  questions={questions}
                  posts={posts}
                  comments={comments}
                  onInputChange={handleInputChange}
                  onAddEvent={addEvent}
                  onUpdateEvent={updateEvent}
                  onDeleteEvent={deleteEvent}
                  onReorderEvents={reorderEvents}
                  onAddQuiz={addQuiz}
                  onUpdateQuiz={updateQuiz}
                  onDeleteQuiz={deleteQuiz}
                  onAddQuestion={addQuestion}
                  onUpdateQuestion={updateQuestion}
                  onDeleteQuestion={deleteQuestion}
                  onReorderQuestions={reorderQuestions}
                  onToggleSocialWall={toggleSocialWall}
                  onToggleModeration={toggleModeration}
                  onApprovePost={approvePost}
                  onRejectPost={rejectPost}
                  onDeletePost={deletePost}
                  onApproveComment={approveComment}
                  onRejectComment={rejectComment}
                  onDeleteComment={deleteComment}
                  designSettings={designSettings}
                  onDesignChange={updateDesignSettings}
                  onImageUpload={handleImageUpload}
                  isUploading={isUploading}
                  onPublish={handlePublish}
                  onSendInvitation={handleSendInvitation}
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="xl:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#131837] flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-[#D4A5A5]" />
                    Aperçu en direct
                  </h3>

                  {/* Sélecteur d'appareil mobile */}
                  <div className="lg:hidden flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    {[
                      { id: 'desktop', icon: Monitor },
                      { id: 'mobile', icon: Smartphone }
                    ].map(({ id, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setPreviewDevice(id as any)}
                        className={`p-1 rounded transition-colors ${
                          previewDevice === id
                            ? 'bg-white text-[#D4A5A5] shadow-sm'
                            : 'text-gray-500'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg">
                  {invitation && (
                    <InvitationPreview
                      invitationData={invitation}
                      designSettings={designSettings}
                      previewDevice={previewDevice}
                      events={events}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'aperçu plein écran */}
      {showPreview && invitation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl">
            <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
              {/* Sélecteur d'appareil dans le modal */}
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-lg p-1">
                {[
                  { id: 'desktop', icon: Monitor },
                  { id: 'tablet', icon: Tablet },
                  { id: 'mobile', icon: Smartphone }
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPreviewDevice(id as any)}
                    className={`p-2 rounded transition-colors ${
                      previewDevice === id
                        ? 'bg-white text-[#D4A5A5] shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <InvitationPreview
              invitationData={invitation}
              designSettings={designSettings}
              isFullscreen
              previewDevice={previewDevice}
              events={events}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
