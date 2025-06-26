import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { InvitationRSVPQuestion, InvitationRSVPAnswer } from '../types/models';

export const useRSVPQuestions = (invitationId: string) => {
  const [questions, setQuestions] = useState<InvitationRSVPQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les questions
  const loadQuestions = useCallback(async () => {
    if (!invitationId) {
      setQuestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('invitation_rsvp_questions')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error loading RSVP questions:', err);
      setError('Impossible de charger les questions');
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  // Charger les questions au montage et quand l'invitation change
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Créer une question
  const createQuestion = useCallback(async (questionData: Partial<InvitationRSVPQuestion>) => {
    if (!invitationId) {
      throw new Error('ID d\'invitation non défini');
    }

    try {
      // Déterminer l'ordre d'affichage
      const { data: maxOrderData } = await supabase
        .from('invitation_rsvp_questions')
        .select('display_order')
        .eq('invitation_id', invitationId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? (maxOrderData[0].display_order || 0) + 1 
        : 0;

      const { data, error } = await supabase
        .from('invitation_rsvp_questions')
        .insert({
          invitation_id: invitationId,
          question: questionData.question || 'Nouvelle question',
          question_type: questionData.question_type || 'text',
          options: questionData.options || null,
          is_required: questionData.is_required !== undefined ? questionData.is_required : false,
          display_order: nextOrder
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadQuestions();
      return data;
    } catch (err) {
      console.error('Error creating RSVP question:', err);
      throw err;
    }
  }, [invitationId, loadQuestions]);

  // Mettre à jour une question
  const updateQuestion = useCallback(async (questionId: string, questionData: Partial<InvitationRSVPQuestion>) => {
    try {
      const { data, error } = await supabase
        .from('invitation_rsvp_questions')
        .update(questionData)
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      
      await loadQuestions();
      return data;
    } catch (err) {
      console.error('Error updating RSVP question:', err);
      throw err;
    }
  }, [loadQuestions]);

  // Supprimer une question
  const deleteQuestion = useCallback(async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('invitation_rsvp_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      
      await loadQuestions();
      return true;
    } catch (err) {
      console.error('Error deleting RSVP question:', err);
      throw err;
    }
  }, [loadQuestions]);

  // Réordonner les questions
  const reorderQuestions = useCallback(async (questionIds: string[]) => {
    try {
      // Mettre à jour l'ordre d'affichage de chaque question
      const updates = questionIds.map((id, index) => ({
        id,
        display_order: index
      }));

      const { error } = await supabase
        .from('invitation_rsvp_questions')
        .upsert(updates);

      if (error) throw error;
      
      await loadQuestions();
      return true;
    } catch (err) {
      console.error('Error reordering RSVP questions:', err);
      throw err;
    }
  }, [loadQuestions]);

  // Obtenir les réponses pour une question
  const getQuestionAnswers = useCallback(async (questionId: string): Promise<InvitationRSVPAnswer[]> => {
    try {
      const { data, error } = await supabase
        .from('invitation_rsvp_answers')
        .select(`
          *,
          guests (
            name,
            email,
            status
          )
        `)
        .eq('question_id', questionId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading question answers:', err);
      throw err;
    }
  }, []);

  // Obtenir toutes les réponses pour une invitation
  const getAllAnswers = useCallback(async (): Promise<Record<string, InvitationRSVPAnswer[]>> => {
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('invitation_rsvp_questions')
        .select('id')
        .eq('invitation_id', invitationId);

      if (questionsError) throw questionsError;
      
      if (!questionsData || questionsData.length === 0) {
        return {};
      }

      const questionIds = questionsData.map(q => q.id);
      
      const { data, error } = await supabase
        .from('invitation_rsvp_answers')
        .select(`
          *,
          guests (
            name,
            email,
            status
          )
        `)
        .in('question_id', questionIds);

      if (error) throw error;

      // Organiser les réponses par question
      const answersByQuestion = (data || []).reduce((acc, answer) => {
        if (!acc[answer.question_id]) {
          acc[answer.question_id] = [];
        }
        
        acc[answer.question_id].push(answer);
        return acc;
      }, {} as Record<string, InvitationRSVPAnswer[]>);

      return answersByQuestion;
    } catch (err) {
      console.error('Error loading all answers:', err);
      throw err;
    }
  }, [invitationId]);

  // Soumettre une réponse
  const submitAnswer = useCallback(async (questionId: string, guestId: string, answer: string) => {
    try {
      // Vérifier si une réponse existe déjà
      const { data: existingData, error: checkError } = await supabase
        .from('invitation_rsvp_answers')
        .select('id')
        .eq('question_id', questionId)
        .eq('guest_id', guestId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingData) {
        // Mettre à jour la réponse existante
        const { data, error } = await supabase
          .from('invitation_rsvp_answers')
          .update({ answer })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Créer une nouvelle réponse
        const { data, error } = await supabase
          .from('invitation_rsvp_answers')
          .insert({
            question_id: questionId,
            guest_id: guestId,
            answer
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      throw err;
    }
  }, []);

  return {
    questions,
    isLoading,
    error,
    refreshQuestions: loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    getQuestionAnswers,
    getAllAnswers,
    submitAnswer
  };
};