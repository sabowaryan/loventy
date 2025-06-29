// src/components/editor/EditorContent.tsx
import React from 'react';
import {
  ExtendedInvitationData,
  InvitationDesignSettings,
  InvitationEvent,
  InvitationQuiz,
  QuizQuestion,
  SocialWallPost,
  SocialWallComment,
  MediaDetails
} from '../../types/models';

// Import all editor components
import GeneralInfoEditor from './GeneralInfoEditor';
import WelcomeMessageEditor from './WelcomeMessageEditor';
import EventsEditor from './EventsEditor';
import ContactLinksEditor from './ContactLinksEditor';
import PoliciesEditor from './PoliciesEditor';
import AdditionalInfoEditor from './AdditionalInfoEditor';
import RsvpEditor from './RsvpEditor';
import HoneymoonFundEditor from './HoneymoonFundEditor';
import MusicEditor from './MusicEditor';
import QuizEditor from './QuizEditor';
import SocialWallEditor from './SocialWallEditor';
import MediaManager from './MediaManager';
import SectionDesignEditor from './SectionDesignEditor';
import AdvancedSettings from './AdvancedSettings';
import ThemeEditor from './ThemeEditor';
import LayoutEditor from './LayoutEditor';

interface EditorContentProps {
  activeTab: string;
  activeSection: string;
  invitation: ExtendedInvitationData | null;
  events: InvitationEvent[];
  quizzes: InvitationQuiz[];
  questions: QuizQuestion[];
  posts: SocialWallPost[];
  comments: SocialWallComment[];
  media: MediaDetails[]; // New prop for media
  onInputChange: (field: keyof ExtendedInvitationData, value: any) => void;
  onAddEvent: (event: Partial<InvitationEvent>) => void;
  onUpdateEvent: (id: string, event: Partial<InvitationEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onReorderEvents: (id: string, direction: 'up' | 'down') => void;
  onAddQuiz: (quiz: Partial<InvitationQuiz>) => void;
  onUpdateQuiz: (id: string, quiz: Partial<InvitationQuiz>) => void;
  onDeleteQuiz: (id: string) => void;
  onAddQuestion: (question: Partial<QuizQuestion>) => void;
  onUpdateQuestion: (id: string, question: Partial<QuizQuestion>) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestions: (id: string, direction: 'up' | 'down') => void;
  onToggleSocialWall: (enabled: boolean) => void;
  onToggleModeration: (enabled: boolean) => void;
  onApprovePost: (id: string) => void;
  onRejectPost: (id: string) => void;
  onDeletePost: (id: string) => void;
  onApproveComment: (id: string) => void;
  onRejectComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
  onDeleteMedia: (mediaId: string, filePath: string) => Promise<boolean>; // New prop for deleting media
  designSettings: InvitationDesignSettings;
  onDesignChange: (newSettings: InvitationDesignSettings) => void;
  onImageUpload: (sectionId: string, imageType: 'background' | 'couple', file: File) => Promise<string>;
  isUploading: boolean;
  onPublish: () => void;
  onSendInvitation: () => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
  activeTab,
  activeSection,
  invitation,
  events,
  quizzes,
  questions,
  posts,
  comments,
  media, // Destructure media
  onInputChange,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onReorderEvents,
  onAddQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onToggleSocialWall,
  onToggleModeration,
  onApprovePost, // This is the prop received by EditorContent
  onRejectPost,   // This is the prop received by EditorContent
  onDeletePost,   // This is the prop received by EditorContent
  onApproveComment, // This is the prop received by EditorContent
  onRejectComment,   // This is the prop received by EditorContent
  onDeleteComment,   // This is the prop received by EditorContent
  onDeleteMedia, // Destructure onDeleteMedia
  designSettings,
  onDesignChange,
  onImageUpload,
  isUploading,
  onPublish,
  onSendInvitation
}) => {
  if (!invitation) return null;

  // Render the appropriate editor component based on active tab and section
  const renderContent = () => {
    // Content tab
    if (activeTab === 'content') {
      switch (activeSection) {
        case 'details':
          return <GeneralInfoEditor invitationData={invitation} onInputChange={onInputChange} />;
        case 'welcome':
          return <WelcomeMessageEditor invitationData={invitation} onInputChange={onInputChange} />;
        case 'events':
          return (
            <EventsEditor
              events={events}
              onAddEvent={onAddEvent}
              onUpdateEvent={onUpdateEvent}
              onDeleteEvent={onDeleteEvent}
              onReorderEvents={onReorderEvents}
            />
          );
        case 'contact':
          return <ContactLinksEditor invitationData={invitation} onInputChange={onInputChange} />;
        case 'policies':
          return <PoliciesEditor invitationData={invitation} onInputChange={onInputChange} />;
        case 'additional':
          return <AdditionalInfoEditor invitationData={invitation} onInputChange={onInputChange} />;
        case 'rsvp':
          return <RsvpEditor invitationData={invitation} onInputChange={onInputChange} />;
        case 'honeymoon':
          return <HoneymoonFundEditor invitationData={invitation} onInputChange={onInputChange} />;
        default:
          return <GeneralInfoEditor invitationData={invitation} onInputChange={onInputChange} />;
      }
    }

    // Design tab
    if (activeTab === 'design') {
      switch (activeSection) {
        case 'theme':
          return (
            <ThemeEditor
              designSettings={designSettings}
              onDesignChange={onDesignChange}
            />
          );
        case 'layout':
          return (
            <LayoutEditor
              designSettings={designSettings}
              onDesignChange={onDesignChange}
            />
          );
        case 'section-design': // New section for detailed section design
          return (
            <SectionDesignEditor
              designSettings={designSettings}
              onDesignChange={onDesignChange}
              onImageUpload={onImageUpload}
              isUploading={isUploading}
            />
          );
        case 'media':
          return (
            <MediaManager
              onImageUpload={onImageUpload}
              isUploading={isUploading}
              invitationId={invitation.id}
              media={media} // Pass media data
              onDeleteMedia={onDeleteMedia} // Pass deleteMedia function
              onRefreshMedia={() => {/* Refresh media - handled by useInvitation hook */}}
            />
          );
        default:
          // Fallback to theme editor if no specific section is selected for design
          return (
            <ThemeEditor
              designSettings={designSettings}
              onDesignChange={onDesignChange}
            />
          );
      }
    }

    // Interactive tab
    if (activeTab === 'interactive') {
      switch (activeSection) {
        case 'music':
          return <MusicEditor invitationData={invitation} onInputChange={onInputChange} />;
        case 'quiz':
          return (
            <QuizEditor
              quizzes={quizzes}
              questions={questions}
              onAddQuiz={onAddQuiz}
              onUpdateQuiz={onUpdateQuiz}
              onDeleteQuiz={onDeleteQuiz}
              onAddQuestion={onAddQuestion}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onReorderQuestions={onReorderQuestions}
            />
          );
        case 'social':
          return (
            <SocialWallEditor
              enabled={invitation.socialWallEnabled}
              moderationEnabled={invitation.socialWallModerationEnabled}
              posts={posts}
              comments={comments}
              onToggleEnabled={onToggleSocialWall}
              onToggleModeration={onToggleModeration}
              onApprovePost={onApprovePost} // Use the prop received by EditorContent
              onRejectPost={onRejectPost}   // Use the prop received by EditorContent
              onDeletePost={onDeletePost}   // Use the prop received by EditorContent
              onApproveComment={onApproveComment} // Use the prop received by EditorContent
              onRejectComment={onRejectComment}   // Use the prop received by EditorContent
              onDeleteComment={onDeleteComment}   // Use the prop received by EditorContent
            />
          );
        default:
          return <MusicEditor invitationData={invitation} onInputChange={onInputChange} />;
      }
    }

    // Settings tab
    if (activeTab === 'settings') {
      return (
        <AdvancedSettings
          invitationData={invitation}
          onPublish={onPublish}
          onSendInvitation={onSendInvitation}
          onDuplicate={() => {/* Duplicate invitation */}}
          onExportPDF={() => {/* Export to PDF */}}
          onDelete={() => {/* Delete invitation */}}
        />
      );
    }

    // Default fallback
    return <GeneralInfoEditor invitationData={invitation} onInputChange={onInputChange} />;
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default EditorContent;
