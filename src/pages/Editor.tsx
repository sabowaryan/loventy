// src/pages/Editor.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  useParams,
  useNavigate
} from 'react-router-dom';
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
  Layers,
  Undo2, // Import for Undo button
  Redo2 // Import for Redo button
} from 'lucide-react';
import {
  usePageTitle
} from '../hooks/usePageTitle';
import {
  useAuth
} from '../contexts/AuthContext';
import {
  useInvitationDesign
} from '../hooks/useInvitationDesign';
import {
  useInvitation
} from '../hooks/useInvitation';
import {
  defaultDesignSettings
} from '../utils/designConstants';
import InvitationPreview from '../components/invitation/InvitationPreview';
import {
  ExtendedInvitationData
} from '../types/models';

// Import the new useHistory hook
import { useHistory } from '../hooks/useHistory';

// Import editor sections
import EditorSidebar from '../components/editor/EditorSidebar';
import EditorContent from '../components/editor/EditorContent';
import EditorHeader from '../components/editor/EditorHeader'; // Import the new EditorHeader

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New states for auto-save feedback
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveCountdown, setAutoSaveCountdown] = useState(180); // 3 minutes in seconds

  // Use the useInvitation hook to load and manage data
  const {
    invitation,
    events,
    quizzes,
    questions,
    posts,
    comments,
    media, // Destructure media
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
    deleteComment,
    deleteMedia // Destructure deleteMedia
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
  } = useInvitationDesign({ invitationId: templateId || '', initialDesignSettings: defaultDesignSettings });

  // Replace useState with useHistory for localInvitationData
  const {
    current: localInvitationData,
    add,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory<ExtendedInvitationData | null>(null);

  // Ref to track the last 'invitation' object from useInvitation that was added to history
  const lastAddedInvitationRef = useRef<ExtendedInvitationData | null>(null);

  // Synchronize localInvitationData with the invitation loaded from useInvitation
  // This useEffect should only push 'invitation' to history when it changes from the DB source
  useEffect(() => {
    if (invitation && JSON.stringify(invitation) !== JSON.stringify(lastAddedInvitationRef.current)) {
      add(invitation);
      lastAddedInvitationRef.current = invitation;
    }
  }, [invitation, add]); // Removed localInvitationData from dependencies

  // Function to save
  const handleSave = useCallback(async (showNotification = true) => {
    if (!localInvitationData) return; // Ensure localInvitationData is not null

    setErrorMessage(null); // Clear previous errors
    try {
      // Save design settings
      await saveDesignSettings();
      // Save invitation data using the current state from history
      await updateInvitation(localInvitationData);

      setLastSaved(new Date());
      setHasUnsavedChanges(false); // Reset unsaved changes flag
      setAutoSaveCountdown(180); // Reset countdown

      if (showNotification) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      let userFriendlyMessage = 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.';
      if (error.message) {
        userFriendlyMessage = `Erreur: ${error.message}`;
      }
      setErrorMessage(userFriendlyMessage);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  }, [localInvitationData, saveDesignSettings, updateInvitation]); // Dependencies for useCallback

  // Handle input changes
  const handleInputChange = (field: keyof ExtendedInvitationData, value: any) => {
    if (!localInvitationData) return;

    let processedValue = value;

    // Convert empty strings to null for date and time fields
    if (['eventDate', 'eventTime', 'rsvpDate'].includes(field as string)) {
      if (value === '') {
        processedValue = null;
      }
    }

    // Update the local state immediately for a reactive UI
    const updatedData = {
      ...localInvitationData,
      [field]: processedValue
    };
    // Use the add function from useHistory
    add(updatedData);

    setHasUnsavedChanges(true); // Set unsaved changes flag
    setAutoSaveCountdown(180); // Reset countdown on any change
  };

  // Auto-save functionality (fixed interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveCountdown((prev) => {
        if (prev <= 1) {
          // Time to auto-save
          if (hasUnsavedChanges && localInvitationData) { // Only auto-save if there are unsaved changes
            handleSave(false); // Trigger auto-save without notification
          }
          return 180; // Reset countdown for the next cycle
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, localInvitationData, handleSave]); // Dependencies for the interval

  const handlePublish = async () => {
    if (!localInvitationData) return;

    await handleSave();
    await updateInvitation({ status: 'published' });
    console.log('Invitation publiée');
  };

  const handleSendInvitation = async () => {
    if (!localInvitationData) return;

    await handleSave();
    navigate(`/dashboard/guests?invitation=${localInvitationData.id}&action=send`);
  };

  const handleImageUpload = async (sectionId: string, imageType: 'background' | 'couple' | 'decorative', file: File) => {
    try {
      const imageUrl = await uploadImage(sectionId, imageType, file);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Display loading state while data is being fetched
  if (isInvitationLoading || localInvitationData === null) { // Check for null explicitly
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4A5A5] mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  // Display error message if loading failed
  if (invitationError) {
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
    <div className="min-h-screen bg-[#FAF9F7] pt-16"> {/* Added pt-16 for fixed header */}
      {/* Fixed Header */}
      <EditorHeader
        invitationTitle={localInvitationData.title}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        autoSaveCountdown={autoSaveCountdown}
        isInvitationSaving={isInvitationSaving}
        isSavingDesign={isSavingDesign}
        handleSave={handleSave}
        setShowPreview={setShowPreview}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        handlePublish={handlePublish}
        handleSendInvitation={handleSendInvitation}
        invitationStatus={localInvitationData.status}
        navigate={navigate}
        showSuccessMessage={showSuccessMessage}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_350px] gap-6 lg:h-[calc(100vh - 112px)]"> {/* Adjusted grid-cols */}
          {/* Combined Sidebar */}
          <div className="hidden lg:block h-full">
            <EditorSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          {/* Main Content - Editor */}
          <div className="lg:col-span-1 lg:flex lg:flex-col h-full"> {/* Adjusted col-span */}
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-grow h-full">
              <div className="p-6 h-full overflow-y-auto">
                <EditorContent
                  activeTab={activeTab}
                  activeSection={activeSection}
                  invitation={localInvitationData} // Pass localInvitationData
                  events={events}
                  quizzes={quizzes}
                  questions={questions}
                  posts={posts}
                  comments={comments}
                  media={media} // Pass media
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
                  onDeleteMedia={deleteMedia} // Pass deleteMedia
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
          <div className="lg:col-span-1 h-full"> {/* Adjusted col-span */}
            <div className="sticky top-24 h-full">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#131837] flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-[#D4A5A5]" />
                    Aperçu en direct
                  </h3>

                  {/* Mobile Device Selector */}
                  {/* Removed device selector buttons from here */}
                </div>

                <div className="overflow-hidden rounded-lg flex-grow">
                  {localInvitationData && (
                    <InvitationPreview
                      invitationData={localInvitationData} // Pass localInvitationData
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

      {/* Full-screen Preview Modal */}
      {showPreview && localInvitationData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl">
            <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
              {/* Device Selector in Modal */}
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
              invitationData={localInvitationData} // Pass localInvitationData
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
