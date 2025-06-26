import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ExtendedInvitationData, 
  InvitationEvent, 
  InvitationQuiz, 
  QuizQuestion,
  SocialWallPost,
  SocialWallComment
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

      // Convertir les données de l'invitation au format ExtendedInvitationData
      const extendedInvitation: ExtendedInvitationData = {
        id: invitationData.id,
        title: invitationData.title,
        templateId: invitationData.template_id,
        brideName: invitationData.bride_name || '',
        groomName: invitationData.groom_name || '',
        eventDate: invitationData.event_date || '',
        eventTime: invitationData.event_time || '',
        venue: invitationData.venue || '',
        address: invitationData.address || '',
        message: invitationData.message || '',
        dressCode: invitationData.dress_code || '',
        rsvpDate: invitationData.rsvp_deadline || '',
        status: invitationData.status as 'draft' | 'published' | 'sent' | 'archived',
        
        // Informations de contact
        phoneContact: invitationData.contact_phone || '',
        emailContact: invitationData.contact_email || '',
        weddingWebsite: invitationData.wedding_website || '',
        registryLink: invitationData.registry_link || '',
        additionalInfo: invitationData.additional_info || '',
        
        // Nouveaux champs
        announcementTitle: invitationData.announcement_title || '',
        formalMessageIntro: invitationData.formal_message_intro || '',
        hostName: invitationData.host_name || '',
        contactPersonName: invitationData.contact_person_name || '',
        
        // Informations de transport
        parkingInfo: invitationData.parking_info || '',
        publicTransportInfo: invitationData.public_transport_info || '',
        shuttleInfo: invitationData.shuttle_info || '',
        
        // Hébergement
        accommodationSuggestions: invitationData.accommodation_suggestions || [],
        preferredHotelName: invitationData.preferred_hotel_name || '',
        preferredHotelCode: invitationData.preferred_hotel_code || '',
        
        // Politiques
        childrenPolicy: invitationData.children_policy as 'welcome' | 'not_admitted' | 'limited',
        giftPolicy: invitationData.gift_policy || '',
        
        // Cagnotte lune de miel
        honeymoonFundEnabled: invitationData.honeymoon_fund_enabled || false,
        honeymoonFundMessage: invitationData.honeymoon_fund_message || '',
        honeymoonFundTargetAmount: invitationData.honeymoon_fund_target_amount || 0,
        
        // Message du couple
        coupleMessageType: invitationData.couple_message_type as 'video' | 'audio' | 'text' || 'text',
        coupleMessageContent: invitationData.couple_message_content || '',
        coupleValuesStatement: invitationData.couple_values_statement || '',
        coupleQuote: invitationData.couple_quote || '',
        
        // Musique et divertissement
        playlistUrl: invitationData.playlist_url || '',
        allowSongSuggestions: invitationData.allow_song_suggestions || false,
        
        // Fonctionnalités interactives
        countdownEnabled: invitationData.countdown_enabled !== false, // default true
        quizEnabled: invitationData.quiz_enabled || false,
        socialWallEnabled: invitationData.social_wall_enabled || false,
        socialWallModerationEnabled: invitationData.social_wall_moderation_enabled !== false, // default true
        virtualKeepsakeEnabled: invitationData.virtual_keepsake_enabled || false
      };

      // Mettre à jour l'état
      setInvitation(extendedInvitation);
      setEvents(eventsData || []);
      setQuizzes(quizzesData || []);
      setQuestions(questionsData);
      setPosts(postsData || []);
      setComments(commentsData);
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

      // Mapper les champs
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.brideName !== undefined) dbUpdates.bride_name = updates.brideName;
      if (updates.groomName !== undefined) dbUpdates.groom_name = updates.groomName;
      if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate;
      if (updates.eventTime !== undefined) dbUpdates.event_time = updates.eventTime;
      if (updates.venue !== undefined) dbUpdates.venue = updates.venue;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.message !== undefined) dbUpdates.message = updates.message;
      if (updates.dressCode !== undefined) dbUpdates.dress_code = updates.dressCode;
      if (updates.rsvpDate !== undefined) dbUpdates.rsvp_deadline = updates.rsvpDate;
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

  return {
    invitation,
    events,
    quizzes,
    questions,
    posts,
    comments,
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
    deleteComment
  };
};