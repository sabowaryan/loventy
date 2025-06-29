// src/hooks/useInvitation.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ExtendedInvitationData,
  InvitationEvent,
  InvitationQuiz,
  QuizQuestion,
  SocialWallPost,
  SocialWallComment,
  MediaDetails
} from '../types/models';

interface UseInvitationProps {
  invitationId?: string;
}

export const useInvitation = ({ invitationId }: UseInvitationProps) => {
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<ExtendedInvitationData | null>(null);
  const [events, setEvents] = useState<InvitationEvent[]>([]);
  const [quizzes, setQuizzes] = useState<InvitationQuiz[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [posts, setPosts] = useState<SocialWallPost[]>([]);
  const [comments, setComments] = useState<SocialWallComment[]>([]);
  const [media, setMedia] = useState<MediaDetails[]>([]); // New state for media
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger l'invitation
  const loadInvitation = useCallback(async () => {
    if (!invitationId || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Charger les données de l'invitation
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (invitationError) throw invitationError;

      // Charger les événements associés
      const { data: eventsData, error: eventsError } = await supabase
        .from('invitation_events')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('display_order', { ascending: true });

      if (eventsError) throw eventsError;

      // Charger les quiz associés
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('invitation_quizzes')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('display_order', { ascending: true });

      if (quizzesError) throw quizzesError;

      // Charger les questions de quiz
      let questionsData: QuizQuestion[] = [];
      if (quizzesData && quizzesData.length > 0) {
        const quizIds = quizzesData.map(quiz => quiz.id);
        const { data: questions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .in('quiz_id', quizIds)
          .order('display_order', { ascending: true });

        if (questionsError) throw questionsError;
        questionsData = questions || [];
      }

      // Charger les posts du mur social
      const { data: postsData, error: postsError } = await supabase
        .from('social_wall_posts')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Charger les commentaires du mur social
      let commentsData: SocialWallComment[] = [];
      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(post => post.id);
        const { data: comments, error: commentsError } = await supabase
          .from('social_wall_comments')
          .select('*')
          .in('post_id', postIds)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;
        commentsData = comments || [];
      }

      // Charger les médias associés à l'invitation
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_details') // Fetch from the media_details view
        .select('*')
        .eq('invitation_id', invitationId)
        .order('created_at', { ascending: false });

      if (mediaError) throw mediaError;

      // Convertir les données de l'invitation au format ExtendedInvitationData
      const extendedInvitation: ExtendedInvitationData = {
        id: invitationData.id,
        title: invitationData.title,
        templateId: invitationData.template_id,
        brideName: invitationData.bride_name,
        groomName: invitationData.groom_name,
        eventDate: invitationData.event_date, // Removed || ''
        eventTime: invitationData.event_time, // Removed || ''
        venue: invitationData.venue,
        address: invitationData.address,
        message: invitationData.message,
        dressCode: invitationData.dress_code,
        rsvpDate: invitationData.rsvp_deadline, // Removed || ''
        status: invitationData.status as 'draft' | 'published' | 'sent' | 'archived',

        // Informations de contact
        phoneContact: invitationData.contact_phone,
        emailContact: invitationData.contact_email,
        weddingWebsite: invitationData.wedding_website,
        registryLink: invitationData.registry_link,
        additionalInfo: invitationData.additional_info,

        // Nouveaux champs
        announcementTitle: invitationData.announcement_title,
        formalMessageIntro: invitationData.formal_message_intro,
        hostName: invitationData.host_name,
        contactPersonName: invitationData.contact_person_name,

        // Informations de transport
        parkingInfo: invitationData.parking_info,
        publicTransportInfo: invitationData.public_transport_info,
        shuttleInfo: invitationData.shuttle_info,

        // Hébergement
        accommodationSuggestions: invitationData.accommodation_suggestions,
        preferredHotelName: invitationData.preferred_hotel_name,
        preferredHotelCode: invitationData.preferred_hotel_code,

        // Politiques
        childrenPolicy: invitationData.children_policy as 'welcome' | 'not_admitted' | 'limited',
        giftPolicy: invitationData.gift_policy,

        // Cagnotte lune de miel
        honeymoonFundEnabled: invitationData.honeymoon_fund_enabled,
        honeymoonFundMessage: invitationData.honeymoon_fund_message,
        honeymoonFundTargetAmount: invitationData.honeymoon_fund_target_amount,

        // Message du couple
        coupleMessageType: invitationData.couple_message_type as 'video' | 'audio' | 'text',
        coupleMessageContent: invitationData.couple_message_content,
        coupleValuesStatement: invitationData.couple_values_statement,
        coupleQuote: invitationData.couple_quote,

        // Musique et divertissement
        playlistUrl: invitationData.playlist_url,
        allowSongSuggestions: invitationData.allow_song_suggestions,

        // Fonctionnalités interactives
        countdownEnabled: invitationData.countdown_enabled,
        quizEnabled: invitationData.quiz_enabled,
        socialWallEnabled: invitationData.social_wall_enabled,
        socialWallModerationEnabled: invitationData.social_wall_moderation_enabled,
        virtualKeepsakeEnabled: invitationData.virtual_keepsake_enabled
      };

      // Mettre à jour l'état
      setInvitation(extendedInvitation);
      setEvents(eventsData || []);
      setQuizzes(quizzesData || []);
      setQuestions(questionsData);
      setPosts(postsData || []);
      setComments(commentsData);
      setMedia(mediaData || []); // Set media data
    } catch (err) {
      console.error('Error loading invitation:', err);
      setError('Impossible de charger les données de l\'invitation');
    } finally {
      setIsLoading(false);
    }
  }, [invitationId, user]);

  // Charger l'invitation au montage
  useEffect(() => {
    loadInvitation();
  }, [loadInvitation]);

  // Mettre à jour l'invitation
  const updateInvitation = useCallback(async (updates: Partial<ExtendedInvitationData>) => {
    if (!invitation || !invitationId || !user) return;

    setIsSaving(true);
    setError(null);

    try {
      // Convertir les données du format ExtendedInvitationData au format de la base de données
      const dbUpdates: any = {};

      // Helper to convert empty strings to null for date and time fields
      const toNullIfEmpty = (value: any) => (value === '' ? null : value);

      // Mapper les champs
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.brideName !== undefined) dbUpdates.bride_name = updates.brideName;
      if (updates.groomName !== undefined) dbUpdates.groom_name = updates.groomName;
      if (updates.eventDate !== undefined) dbUpdates.event_date = toNullIfEmpty(updates.eventDate);
      if (updates.eventTime !== undefined) dbUpdates.event_time = toNullIfEmpty(updates.eventTime);
      if (updates.venue !== undefined) dbUpdates.venue = updates.venue;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.message !== undefined) dbUpdates.message = updates.message;
      if (updates.dressCode !== undefined) dbUpdates.dress_code = updates.dressCode;
      if (updates.rsvpDate !== undefined) dbUpdates.rsvp_deadline = toNullIfEmpty(updates.rsvpDate);
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      // Informations de contact
      if (updates.phoneContact !== undefined) dbUpdates.contact_phone = updates.phoneContact;
      if (updates.emailContact !== undefined) dbUpdates.contact_email = updates.emailContact;
      if (updates.weddingWebsite !== undefined) dbUpdates.wedding_website = updates.weddingWebsite;
      if (updates.registryLink !== undefined) dbUpdates.registry_link = updates.registryLink;
      if (updates.additionalInfo !== undefined) dbUpdates.additional_info = updates.additionalInfo;

      // Nouveaux champs
      if (updates.announcementTitle !== undefined) dbUpdates.announcement_title = updates.announcementTitle;
      if (updates.formalMessageIntro !== undefined) dbUpdates.formal_message_intro = updates.formalMessageIntro;
      if (updates.hostName !== undefined) dbUpdates.host_name = updates.hostName;
      if (updates.contactPersonName !== undefined) dbUpdates.contact_person_name = updates.contactPersonName;

      // Informations de transport
      if (updates.parkingInfo !== undefined) dbUpdates.parking_info = updates.parkingInfo;
      if (updates.publicTransportInfo !== undefined) dbUpdates.public_transport_info = updates.publicTransportInfo;
      if (updates.shuttleInfo !== undefined) dbUpdates.shuttle_info = updates.shuttleInfo;

      // Hébergement
      if (updates.accommodationSuggestions !== undefined) dbUpdates.accommodation_suggestions = updates.accommodationSuggestions;
      if (updates.preferredHotelName !== undefined) dbUpdates.preferred_hotel_name = updates.preferredHotelName;
      if (updates.preferredHotelCode !== undefined) dbUpdates.preferred_hotel_code = updates.preferredHotelCode;

      // Politiques
      if (updates.childrenPolicy !== undefined) dbUpdates.children_policy = updates.childrenPolicy;
      if (updates.giftPolicy !== undefined) dbUpdates.gift_policy = updates.giftPolicy;

      // Cagnotte lune de miel
      if (updates.honeymoonFundEnabled !== undefined) dbUpdates.honeymoon_fund_enabled = updates.honeymoonFundEnabled;
      if (updates.honeymoonFundMessage !== undefined) dbUpdates.honeymoon_fund_message = updates.honeymoonFundMessage;
      if (updates.honeymoonFundTargetAmount !== undefined) dbUpdates.honeymoon_fund_target_amount = updates.honeymoonFundTargetAmount;

      // Message du couple
      if (updates.coupleMessageType !== undefined) dbUpdates.couple_message_type = updates.coupleMessageType;
      if (updates.coupleMessageContent !== undefined) dbUpdates.couple_message_content = updates.coupleMessageContent;
      if (updates.coupleValuesStatement !== undefined) dbUpdates.couple_values_statement = updates.coupleValuesStatement;
      if (updates.coupleQuote !== undefined) dbUpdates.couple_quote = updates.coupleQuote;

      // Musique et divertissement
      if (updates.playlistUrl !== undefined) dbUpdates.playlist_url = updates.playlistUrl;
      if (updates.allowSongSuggestions !== undefined) dbUpdates.allow_song_suggestions = updates.allowSongSuggestions;

      // Fonctionnalités interactives
      if (updates.countdownEnabled !== undefined) dbUpdates.countdown_enabled = updates.countdownEnabled;
      if (updates.quizEnabled !== undefined) dbUpdates.quiz_enabled = updates.quizEnabled;
      if (updates.socialWallEnabled !== undefined) dbUpdates.social_wall_enabled = updates.socialWallEnabled;
      if (updates.socialWallModerationEnabled !== undefined) dbUpdates.social_wall_moderation_enabled = updates.socialWallModerationEnabled;
      if (updates.virtualKeepsakeEnabled !== undefined) dbUpdates.virtual_keepsake_enabled = updates.virtualKeepsakeEnabled;

      // Ajouter la date de mise à jour
      dbUpdates.updated_at = new Date().toISOString();

      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('invitations')
        .update(dbUpdates)
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setInvitation(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating invitation:', err);
      setError('Impossible de mettre à jour l\'invitation');
    } finally {
      setIsSaving(false);
    }
  }, [invitation, invitationId, user]);

  // Ajouter un événement
  const addEvent = useCallback(async (eventData: Partial<InvitationEvent>) => {
    if (!invitationId || !user) return null;

    setIsSaving(true);
    setError(null);

    try {
      // Préparer les données pour l'insertion
      const newEvent = {
        invitation_id: invitationId,
        event_type: eventData.event_type || 'ceremony',
        title: eventData.title || '',
        event_time: eventData.event_time || '',
        location_name: eventData.location_name || '',
        address: eventData.address || '',
        description: eventData.description || null,
        plan_b_location_name: eventData.plan_b_location_name || null,
        plan_b_address: eventData.plan_b_address || null,
        plan_b_description: eventData.plan_b_description || null,
        display_order: eventData.display_order || events.length
      };

      // Insérer dans la base de données
      const { data, error: insertError } = await supabase
        .from('invitation_events')
        .insert(newEvent)
        .select()
        .single();

      if (insertError) throw insertError;

      // Mettre à jour l'état local
      setEvents(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Impossible d\'ajouter l\'événement');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user, events]);

  // Mettre à jour un événement
  const updateEvent = useCallback(async (eventId: string, updates: Partial<InvitationEvent>) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('invitation_events')
        .update(updates)
        .eq('id', eventId)
        .eq('invitation_id', invitationId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setEvents(prev => prev.map(event =>
        event.id === eventId ? { ...event, ...updates } : event
      ));
      return true;
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Impossible de mettre à jour l\'événement');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Supprimer un événement
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('invitation_events')
        .delete()
        .eq('id', eventId)
        .eq('invitation_id', invitationId);

      if (deleteError) throw deleteError;

      // Mettre à jour l'état local
      setEvents(prev => prev.filter(event => event.id !== eventId));
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Impossible de supprimer l\'événement');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Réordonner les événements
  const reorderEvents = useCallback(async (eventId: string, direction: 'up' | 'down') => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Trouver l'index de l'événement à déplacer
      const currentIndex = events.findIndex(event => event.id === eventId);
      if (currentIndex === -1) return false;

      // Déterminer le nouvel index
      let newIndex = currentIndex;
      if (direction === 'up' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < events.length - 1) {
        newIndex = currentIndex + 1;
      } else {
        return false; // Pas de changement nécessaire
      }

      // Créer un nouvel ordre
      const newEvents = [...events];
      const [movedEvent] = newEvents.splice(currentIndex, 1);
      newEvents.splice(newIndex, 0, movedEvent);

      // Mettre à jour les display_order
      const updates = newEvents.map((event, index) => ({
        id: event.id,
        display_order: index
      }));

      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('invitation_events')
        .upsert(updates);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setEvents(newEvents);
      return true;
    } catch (err) {
      console.error('Error reordering events:', err);
      setError('Impossible de réordonner les événements');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user, events]);

  // Ajouter un quiz
  const addQuiz = useCallback(async (quizData: Partial<InvitationQuiz>) => {
    if (!invitationId || !user) return null;

    setIsSaving(true);
    setError(null);

    try {
      // Préparer les données pour l'insertion
      const newQuiz = {
        invitation_id: invitationId,
        title: quizData.title || 'Nouveau quiz',
        description: quizData.description || null,
        is_active: quizData.is_active !== undefined ? quizData.is_active : true,
        reward_message: quizData.reward_message || null,
        display_order: quizData.display_order || quizzes.length
      };

      // Insérer dans la base de données
      const { data, error: insertError } = await supabase
        .from('invitation_quizzes')
        .insert(newQuiz)
        .select()
        .single();

      if (insertError) throw insertError;

      // Mettre à jour l'état local
      setQuizzes(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding quiz:', err);
      setError('Impossible d\'ajouter le quiz');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user, quizzes]);

  // Mettre à jour un quiz
  const updateQuiz = useCallback(async (quizId: string, updates: Partial<InvitationQuiz>) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('invitation_quizzes')
        .update(updates)
        .eq('id', quizId)
        .eq('invitation_id', invitationId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setQuizzes(prev => prev.map(quiz =>
        quiz.id === quizId ? { ...quiz, ...updates } : quiz
      ));
      return true;
    } catch (err) {
      console.error('Error updating quiz:', err);
      setError('Impossible de mettre à jour le quiz');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Supprimer un quiz
  const deleteQuiz = useCallback(async (quizId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('invitation_quizzes')
        .delete()
        .eq('id', quizId)
        .eq('invitation_id', invitationId);

      if (deleteError) throw deleteError;

      // Mettre à jour l'état local
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      setQuestions(prev => prev.filter(question => question.quiz_id !== quizId));
      return true;
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Impossible de supprimer le quiz');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Ajouter une question
  const addQuestion = useCallback(async (questionData: Partial<QuizQuestion>) => {
    if (!invitationId || !user || !questionData.quiz_id) return null;

    setIsSaving(true);
    setError(null);

    try {
      // Préparer les données pour l'insertion
      const newQuestion = {
        quiz_id: questionData.quiz_id,
        question_text: questionData.question_text || 'Nouvelle question',
        question_type: questionData.question_type || 'text',
        options: questionData.options || null,
        correct_answer: questionData.correct_answer || null,
        display_order: questionData.display_order || questions.filter(q => q.quiz_id === questionData.quiz_id).length
      };

      // Insérer dans la base de données
      const { data, error: insertError } = await supabase
        .from('quiz_questions')
        .insert(newQuestion)
        .select()
        .single();

      if (insertError) throw insertError;

      // Mettre à jour l'état local
      setQuestions(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Impossible d\'ajouter la question');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user, questions]);

  // Mettre à jour une question
  const updateQuestion = useCallback(async (questionId: string, updates: Partial<QuizQuestion>) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('quiz_questions')
        .update(updates)
        .eq('id', questionId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setQuestions(prev => prev.map(question =>
        question.id === questionId ? { ...question, ...updates } : question
      ));
      return true;
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Impossible de mettre à jour la question');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Supprimer une question
  const deleteQuestion = useCallback(async (questionId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (deleteError) throw deleteError;

      // Mettre à jour l'état local
      setQuestions(prev => prev.filter(question => question.id !== questionId));
      return true;
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Impossible de supprimer la question');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Réordonner les questions
  const reorderQuestions = useCallback(async (questionId: string, direction: 'up' | 'down') => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Trouver la question à déplacer
      const questionToMove = questions.find(q => q.id === questionId);
      if (!questionToMove) return false;

      // Filtrer les questions du même quiz
      const quizQuestions = questions.filter(q => q.quiz_id === questionToMove.quiz_id);
      const currentIndex = quizQuestions.findIndex(q => q.id === questionId);
      if (currentIndex === -1) return false;

      // Déterminer le nouvel index
      let newIndex = currentIndex;
      if (direction === 'up' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < quizQuestions.length - 1) {
        newIndex = currentIndex + 1;
      } else {
        return false; // Pas de changement nécessaire
      }

      // Créer un nouvel ordre
      const newQuizQuestions = [...quizQuestions];
      const [movedQuestion] = newQuizQuestions.splice(currentIndex, 1);
      newQuizQuestions.splice(newIndex, 0, movedQuestion);

      // Mettre à jour les display_order
      const updates = newQuizQuestions.map((question, index) => ({
        id: question.id,
        display_order: index
      }));

      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('quiz_questions')
        .upsert(updates);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      const newQuestions = [...questions];
      for (const q of newQuestions) {
        if (q.quiz_id === questionToMove.quiz_id) {
          const updatedQuestion = updates.find(u => u.id === q.id);
          if (updatedQuestion) {
            q.display_order = updatedQuestion.display_order;
          }
        }
      }
      setQuestions(newQuestions);
      return true;
    } catch (err) {
      console.error('Error reordering questions:', err);
      setError('Impossible de réordonner les questions');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user, questions]);

  // Activer/désactiver le mur social
  const toggleSocialWall = useCallback(async (enabled: boolean) => {
    if (!invitation) return false;
    return await updateInvitation({ socialWallEnabled: enabled });
  }, [invitation, updateInvitation]);

  // Activer/désactiver la modération du mur social
  const toggleModeration = useCallback(async (enabled: boolean) => {
    if (!invitation) return false;
    return await updateInvitation({ socialWallModerationEnabled: enabled });
  }, [invitation, updateInvitation]);

  // Approuver un post
  const approvePost = useCallback(async (postId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('social_wall_posts')
        .update({ is_approved: true })
        .eq('id', postId)
        .eq('invitation_id', invitationId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, is_approved: true } : post
      ));
      return true;
    } catch (err) {
      console.error('Error approving post:', err);
      setError('Impossible d\'approuver la publication');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Rejeter un post
  const rejectPost = useCallback(async (postId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('social_wall_posts')
        .delete()
        .eq('id', postId)
        .eq('invitation_id', invitationId);

      if (deleteError) throw deleteError;

      // Mettre à jour l'état local
      setPosts(prev => prev.filter(post => post.id !== postId));
      return true;
    } catch (err) {
      console.error('Error rejecting post:', err);
      setError('Impossible de rejeter la publication');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Supprimer un post
  const deletePost = useCallback(async (postId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('social_wall_posts')
        .delete()
        .eq('id', postId)
        .eq('invitation_id', invitationId);

      if (deleteError) throw deleteError;

      // Mettre à jour l'état local
      setPosts(prev => prev.filter(post => post.id !== postId));
      // Supprimer également les commentaires associés
      setComments(prev => prev.filter(comment => comment.post_id !== postId));
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Impossible de supprimer la publication');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Approuver un commentaire
  const approveComment = useCallback(async (commentId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('social_wall_comments')
        .update({ is_approved: true })
        .eq('id', commentId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setComments(prev => prev.map(comment =>
        comment.id === commentId ? { ...comment, is_approved: true } : comment
      ));
      return true;
    } catch (err) {
      console.error('Error approving comment:', err);
      setError('Impossible d\'approuver le commentaire');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Rejeter un commentaire
  const rejectComment = useCallback(async (commentId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('social_wall_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      // Mettre à jour l'état local
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      return true;
    } catch (err) {
      console.error('Error rejecting comment:', err);
      setError('Impossible de rejeter le commentaire');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Supprimer un commentaire
  const deleteComment = useCallback(async (commentId: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('social_wall_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      // Mettre à jour l'état local
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Impossible de supprimer le commentaire');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);

  // Delete media
  const deleteMedia = useCallback(async (mediaId: string, filePath: string) => {
    if (!invitationId || !user) return false;

    setIsSaving(true);
    setError(null);

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('invitation-media')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('invitation_media')
        .delete()
        .eq('id', mediaId)
        .eq('invitation_id', invitationId);

      if (dbError) throw dbError;

      // Delete from user_files table
      const { error: userFileError } = await supabase
        .from('user_files')
        .delete()
        .eq('file_path', filePath)
        .eq('user_id', user.id);

      if (userFileError) throw userFileError;

      // Update local state
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      return true;
    } catch (err) {
      console.error('Error deleting media:', err);
      setError('Impossible de supprimer le média');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [invitationId, user]);


  return {
    invitation,
    events,
    quizzes,
    questions,
    posts,
    comments,
    media, // Return media
    isLoading,
    error,
    isSaving,

    // Méthodes pour l'invitation
    loadInvitation,
    updateInvitation,

    // Méthodes pour les événements
    addEvent,
    updateEvent,
    deleteEvent,
    reorderEvents,

    // Méthodes pour les quiz
    addQuiz,
    updateQuiz,
    deleteQuiz,

    // Méthodes pour les questions
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,

    // Méthodes pour le mur social
    toggleSocialWall,
    toggleModeration,
    approvePost,
    rejectPost,
    deletePost,
    approveComment,
    rejectComment,
    deleteComment,

    // Méthodes pour les médias
    deleteMedia // Return deleteMedia
  };
};

``````typescript
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
  onApprovePost,
  onRejectPost,
  onDeletePost,
  onApproveComment,
  onRejectComment,
  onDeleteComment,
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
        case 'section-design': // New section for detailed section design
          return (
            <SectionDesignEditor
              designSettings={designSettings}
              onDesignChange={onDesignChange}
              onImageUpload={onImageUpload}
              isUploading={isUploading}
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
              onApprovePost={approvePost}
              onRejectPost={rejectPost}
              onDeletePost={deletePost}
              onApproveComment={approveComment}
              onRejectComment={rejectComment}
              onDeleteComment={deleteComment}
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
      <h2 className="text-2xl font-semibold text-[#131837] mb-6">
        {activeTab === 'content' && 'Contenu de l\'invitation'}
        {activeTab === 'design' && 'Design et apparence'}
        {activeTab === 'interactive' && 'Fonctionnalités interactives'}
        {activeTab === 'settings' && 'Paramètres avancés'}
      </h2>

      {renderContent()}
    </div>
  );
};

export default EditorContent;

``````typescript
// src/components/editor/MediaManager.tsx
import React, { useState, useMemo } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Loader2,
  Heart,
  Search,
  X,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { MediaDetails } from '../../types/models';

interface MediaManagerProps {
  onImageUpload: (sectionId: string, imageType: 'background' | 'couple' | 'decorative', file: File) => Promise<string>;
  isUploading: boolean;
  invitationId: string;
  media: MediaDetails[]; // Now receives actual media data
  onRefreshMedia: () => void;
  onDeleteMedia: (mediaId: string, filePath: string) => Promise<boolean>; // New prop for deleting media
}

const MediaManager: React.FC<MediaManagerProps> = ({ 
  onImageUpload, 
  isUploading, 
  invitationId,
  media = [],
  onRefreshMedia,
  onDeleteMedia
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'gallery' | 'background' | 'couple' | 'decorative'>('gallery');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video' | 'audio'>('all');
  const [selectedImage, setSelectedImage] = useState<MediaDetails | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Filter media based on search term and type
  const filteredMedia = useMemo(() => {
    let filtered = media;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.media_type === filterType);
    }

    return filtered;
  }, [media, searchTerm, filterType]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      // Determine sectionId based on uploadType for onImageUpload
      const sectionIdMap: Record<typeof uploadType, string> = {
        gallery: 'gallery',
        background: 'hero', // Assuming background images are for hero section
        couple: 'hero',     // Assuming couple images are for hero section
        decorative: 'hero'  // Assuming decorative elements are for hero section
      };
      const sectionId = sectionIdMap[uploadType];

      await onImageUpload(sectionId, uploadType as any, selectedFile); // Cast uploadType to match expected type
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setShowUploadForm(false);
      onRefreshMedia(); // Refresh media list after upload
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteMedia = async (mediaId: string, filePath: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible.')) {
      try {
        await onDeleteMedia(mediaId, filePath);
        onRefreshMedia(); // Refresh media list after deletion
      } catch (error) {
        console.error('Error deleting media:', error);
        alert('Erreur lors de la suppression du média.');
      }
    }
  };

  const openImageModal = (image: MediaDetails) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setShowImageModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Gallery Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#131837] flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-[#D4A5A5]" />
            Galerie d'images
          </h3>
          
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-3 py-1.5 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors text-sm flex items-center"
          >
            {showUploadForm ? (
              <>
                <X className="h-4 w-4 mr-1" />
                <span>Annuler</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                <span>Ajouter une image</span>
              </>
            )}
          </button>
        </div>
        
        {showUploadForm ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D4A5A5] transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {selectedFile ? `Fichier sélectionné: ${selectedFile.name}` : 'Glissez une image ou cliquez pour parcourir'}
              </p>
              <p className="text-sm text-gray-500 mb-4">PNG, JPG jusqu'à 5MB</p>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                id="gallery-upload"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label
                htmlFor="gallery-upload"
                className={`inline-block px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors cursor-pointer ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Choisir une image
              </label>
            </div>
            
            {selectedFile && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Titre de l'image
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                    placeholder="Notre photo de couple"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Description (optionnelle)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                    placeholder="Une description de cette image..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Type d'image
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  >
                    <option value="gallery">Image de galerie</option>
                    <option value="background">Image de fond</option>
                    <option value="couple">Image de couple</option>
                    <option value="decorative">Élément décoratif</option>
                  </select>
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="w-full py-3 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Téléchargement en cours...</span>
                    </div>
                  ) : (
                    'Télécharger l\'image'
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher des médias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="photo">Photos</option>
                <option value="video">Vidéos</option>
                <option value="audio">Audios</option>
              </select>
            </div>

            {filteredMedia.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune image</h4>
                <p className="text-gray-500 mb-4">Ajoutez des images pour personnaliser votre invitation</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2 inline-block" />
                  Ajouter une image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <div key={item.id} className="group relative rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={item.file_url || ''} 
                      alt={item.title || 'Image'} 
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => openImageModal(item)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <button 
                          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                          onClick={() => openImageModal(item)}
                          title="Prévisualiser"
                        >
                          <Eye className="h-4 w-4 text-gray-700" />
                        </button>
                        <button 
                          className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                          onClick={() => handleDeleteMedia(item.id, item.file_path || '')}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs truncate">
                        {item.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Predefined Images Gallery */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4">
          Images prédéfinies
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Fleurs roses', url: 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg' },
            { name: 'Feuillage vert', url: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg' },
            { name: 'Marbre blanc', url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg' },
            { name: 'Texture dorée', url: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg' },
            { name: 'Fleurs blanches', url: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg' },
            { name: 'Roses rouges', url: 'https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg' },
            { name: 'Eucalyptus', url: 'https://images.pexels.com/photos/4505161/pexels-photo-4505161.jpeg' },
            { name: 'Anneaux dorés', url: 'https://images.pexels.com/photos/256737/pexels-photo-256737.jpeg' }
          ].map((image, index) => (
            <button
              key={index}
              className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#D4A5A5] transition-colors"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {image.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
            <img 
              src={selectedImage.file_url || ''} 
              alt={selectedImage.title || 'Aperçu de l\'image'} 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            {selectedImage.title && (
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-semibold text-lg text-[#131837]">{selectedImage.title}</h4>
                {selectedImage.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedImage.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Type: {selectedImage.media_type} | Taille: {(selectedImage.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;

