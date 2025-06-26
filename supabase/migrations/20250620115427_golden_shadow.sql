/*
# Création des tables pour les quiz

1. Nouvelles tables
   - Création de la table invitation_quizzes pour stocker les quiz
   - Création de la table quiz_questions pour stocker les questions
   - Création de la table quiz_answers pour stocker les réponses des invités

2. Sécurité
   - Ajout de politiques RLS pour la gestion des quiz
   - Ajout de triggers pour la mise à jour automatique de updated_at
*/

-- Créer la table invitation_quizzes
CREATE TABLE IF NOT EXISTS public.invitation_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  reward_message TEXT DEFAULT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.invitation_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB DEFAULT NULL,
  correct_answer TEXT DEFAULT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table quiz_answers
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  answer_text TEXT DEFAULT NULL,
  is_correct BOOLEAN DEFAULT NULL,
  answered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ajouter une contrainte de vérification pour question_type
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_question_type_check
  CHECK (question_type = ANY (ARRAY['text'::text, 'multiple_choice'::text, 'true_false'::text]));

-- Créer des index
CREATE INDEX idx_invitation_quizzes_invitation_id ON public.invitation_quizzes(invitation_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX idx_quiz_answers_guest_id ON public.quiz_answers(guest_id);

-- Activer RLS
ALTER TABLE public.invitation_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Ajouter des politiques pour invitation_quizzes
CREATE POLICY "Users can manage own quizzes" 
ON public.invitation_quizzes
FOR ALL
TO authenticated
USING (
  invitation_id IN (
    SELECT id FROM public.invitations WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  invitation_id IN (
    SELECT id FROM public.invitations WHERE user_id = auth.uid()
  )
);

-- Ajouter des politiques pour quiz_questions
CREATE POLICY "Users can manage own quiz questions" 
ON public.quiz_questions
FOR ALL
TO authenticated
USING (
  quiz_id IN (
    SELECT q.id FROM public.invitation_quizzes q
    JOIN public.invitations i ON q.invitation_id = i.id
    WHERE i.user_id = auth.uid()
  )
)
WITH CHECK (
  quiz_id IN (
    SELECT q.id FROM public.invitation_quizzes q
    JOIN public.invitations i ON q.invitation_id = i.id
    WHERE i.user_id = auth.uid()
  )
);

-- Ajouter des politiques pour quiz_answers
CREATE POLICY "Users can view answers to their quizzes" 
ON public.quiz_answers
FOR SELECT
TO authenticated
USING (
  question_id IN (
    SELECT qq.id FROM public.quiz_questions qq
    JOIN public.invitation_quizzes q ON qq.quiz_id = q.id
    JOIN public.invitations i ON q.invitation_id = i.id
    WHERE i.user_id = auth.uid()
  )
);

CREATE POLICY "Guests can submit answers" 
ON public.quiz_answers
FOR INSERT
TO public
WITH CHECK (true);

-- Créer des triggers pour mettre à jour updated_at
CREATE TRIGGER update_invitation_quizzes_updated_at
BEFORE UPDATE ON public.invitation_quizzes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Ajouter des commentaires
COMMENT ON TABLE public.invitation_quizzes IS 'Quiz interactifs sur les mariés';
COMMENT ON TABLE public.quiz_questions IS 'Questions des quiz';
COMMENT ON TABLE public.quiz_answers IS 'Réponses des invités aux quiz';
COMMENT ON COLUMN public.quiz_questions.question_type IS 'Type de question (text, multiple_choice, true_false)';
COMMENT ON COLUMN public.quiz_questions.options IS 'Options pour les questions à choix multiples au format JSON';
COMMENT ON COLUMN public.quiz_questions.correct_answer IS 'Réponse correcte à la question';
COMMENT ON COLUMN public.invitation_quizzes.reward_message IS 'Message affiché aux invités qui réussissent le quiz';