import React, { useState } from 'react';
import { 
  Brain, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Edit,
  Save,
  X,
  CheckSquare,
  MessageSquare,
  ToggleLeft,
  Award
} from 'lucide-react';
import { InvitationQuiz, QuizQuestion } from '../../types/models';

interface QuizEditorProps {
  quizzes: InvitationQuiz[];
  questions: QuizQuestion[];
  onAddQuiz: (quiz: Partial<InvitationQuiz>) => void;
  onUpdateQuiz: (id: string, quiz: Partial<InvitationQuiz>) => void;
  onDeleteQuiz: (id: string) => void;
  onAddQuestion: (question: Partial<QuizQuestion>) => void;
  onUpdateQuestion: (id: string, question: Partial<QuizQuestion>) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestions: (id: string, direction: 'up' | 'down') => void;
}

const QuizEditor: React.FC<QuizEditorProps> = ({
  quizzes,
  questions,
  onAddQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions
}) => {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(quizzes.length > 0 ? quizzes[0].id : null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  const [newQuiz, setNewQuiz] = useState<Partial<InvitationQuiz>>({
    title: '',
    description: '',
    is_active: true,
    reward_message: '',
    display_order: quizzes.length
  });
  
  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
    question_text: '',
    question_type: 'multiple_choice',
    options: { choices: ['', ''] },
    correct_answer: '',
    display_order: 0
  });

  const handleAddQuiz = () => {
    if (!newQuiz.title) {
      alert('Veuillez saisir un titre pour le quiz');
      return;
    }
    
    onAddQuiz(newQuiz);
    
    // Reset form
    setNewQuiz({
      title: '',
      description: '',
      is_active: true,
      reward_message: '',
      display_order: quizzes.length + 1
    });
  };

  const handleAddQuestion = () => {
    if (!activeQuizId) {
      alert('Veuillez d\'abord créer ou sélectionner un quiz');
      return;
    }
    
    if (!newQuestion.question_text) {
      alert('Veuillez saisir une question');
      return;
    }
    
    if (newQuestion.question_type === 'multiple_choice' && 
        (!newQuestion.options || !newQuestion.options.choices || newQuestion.options.choices.length < 2)) {
      alert('Veuillez ajouter au moins deux options pour une question à choix multiples');
      return;
    }
    
    onAddQuestion({
      ...newQuestion,
      quiz_id: activeQuizId,
      display_order: questions.filter(q => q.quiz_id === activeQuizId).length
    });
    
    // Reset form
    setNewQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      options: { choices: ['', ''] },
      correct_answer: '',
      display_order: questions.filter(q => q.quiz_id === activeQuizId).length + 1
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!newQuestion.options || !newQuestion.options.choices) {
      setNewQuestion({
        ...newQuestion,
        options: { choices: ['', ''] }
      });
      return;
    }
    
    const updatedChoices = [...newQuestion.options.choices];
    updatedChoices[index] = value;
    
    setNewQuestion({
      ...newQuestion,
      options: { ...newQuestion.options, choices: updatedChoices }
    });
  };

  const handleAddOption = () => {
    if (!newQuestion.options || !newQuestion.options.choices) {
      setNewQuestion({
        ...newQuestion,
        options: { choices: ['', ''] }
      });
      return;
    }
    
    setNewQuestion({
      ...newQuestion,
      options: { 
        ...newQuestion.options, 
        choices: [...newQuestion.options.choices, ''] 
      }
    });
  };

  const handleRemoveOption = (index: number) => {
    if (!newQuestion.options || !newQuestion.options.choices || newQuestion.options.choices.length <= 2) {
      return;
    }
    
    const updatedChoices = [...newQuestion.options.choices];
    updatedChoices.splice(index, 1);
    
    setNewQuestion({
      ...newQuestion,
      options: { ...newQuestion.options, choices: updatedChoices }
    });
  };

  const activeQuiz = quizzes.find(quiz => quiz.id === activeQuizId);
  const activeQuizQuestions = questions.filter(question => question.quiz_id === activeQuizId);

  return (
    <div className="space-y-8">
      {/* Liste des quiz */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Quiz interactifs
        </h3>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Aucun quiz créé</p>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Créez des quiz interactifs pour divertir vos invités et leur faire découvrir votre histoire
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {quizzes.map(quiz => (
                <button
                  key={quiz.id}
                  onClick={() => setActiveQuizId(quiz.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeQuizId === quiz.id 
                      ? 'bg-[#D4A5A5] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {quiz.title}
                  {!quiz.is_active && <span className="ml-1 opacity-60">(inactif)</span>}
                </button>
              ))}
            </div>
            
            {activeQuiz && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-[#131837]">{activeQuiz.title}</h4>
                    {activeQuiz.description && (
                      <p className="text-sm text-gray-600 mt-1">{activeQuiz.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingQuizId(activeQuiz.id)}
                      className="p-1 text-gray-400 hover:text-[#D4A5A5] transition-colors"
                      title="Modifier le quiz"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteQuiz(activeQuiz.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Supprimer le quiz"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {editingQuizId === activeQuiz.id && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre du quiz</label>
                        <input
                          type="text"
                          value={activeQuiz.title}
                          onChange={(e) => onUpdateQuiz(activeQuiz.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnelle)</label>
                        <textarea
                          value={activeQuiz.description || ''}
                          onChange={(e) => onUpdateQuiz(activeQuiz.id, { description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                          placeholder="Testez vos connaissances sur les mariés"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Award className="inline h-4 w-4 mr-1 text-[#D4A5A5]" />
                          Message de récompense
                        </label>
                        <textarea
                          value={activeQuiz.reward_message || ''}
                          onChange={(e) => onUpdateQuiz(activeQuiz.id, { reward_message: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                          placeholder="Félicitations ! Vous connaissez bien les mariés !"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="quizActive"
                            checked={activeQuiz.is_active}
                            onChange={(e) => onUpdateQuiz(activeQuiz.id, { is_active: e.target.checked })}
                            className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
                          />
                          <label htmlFor="quizActive" className="ml-2 block text-sm text-gray-700">
                            Quiz actif
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingQuizId(null)}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => setEditingQuizId(null)}
                        className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="p-4 border-t border-gray-200">
                  <h5 className="font-medium text-[#131837] mb-4">Questions ({activeQuizQuestions.length})</h5>
                  
                  {activeQuizQuestions.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucune question ajoutée à ce quiz</p>
                  ) : (
                    <div className="space-y-3">
                      {activeQuizQuestions.map((question, index) => (
                        <div 
                          key={question.id} 
                          className={`border rounded-lg overflow-hidden ${
                            editingQuestionId === question.id ? 'border-[#D4A5A5]' : 'border-gray-200'
                          }`}
                        >
                          {editingQuestionId === question.id ? (
                            <div className="p-4 space-y-4">
                              <div className="flex justify-between items-center mb-2">
                                <h6 className="font-medium text-[#131837]">Modifier la question</h6>
                                <button 
                                  onClick={() => setEditingQuestionId(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                <input
                                  type="text"
                                  value={question.question_text}
                                  onChange={(e) => onUpdateQuestion(question.id, { question_text: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                                  placeholder="Comment les mariés se sont-ils rencontrés ?"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
                                <select
                                  value={question.question_type}
                                  onChange={(e) => onUpdateQuestion(question.id, { question_type: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                                >
                                  <option value="text">Texte libre</option>
                                  <option value="multiple_choice">Choix multiples</option>
                                  <option value="true_false">Vrai ou Faux</option>
                                </select>
                              </div>
                              
                              {question.question_type === 'multiple_choice' && question.options && question.options.choices && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                                  <div className="space-y-2">
                                    {question.options.choices.map((choice: string, choiceIndex: number) => (
                                      <div key={choiceIndex} className="flex items-center space-x-2">
                                        <input
                                          type="text"
                                          value={choice}
                                          onChange={(e) => {
                                            const updatedChoices = [...question.options.choices];
                                            updatedChoices[choiceIndex] = e.target.value;
                                            onUpdateQuestion(question.id, { 
                                              options: { ...question.options, choices: updatedChoices } 
                                            });
                                          }}
                                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                                          placeholder={`Option ${choiceIndex + 1}`}
                                        />
                                        <button
                                          onClick={() => {
                                            if (question.options.choices.length <= 2) return;
                                            const updatedChoices = [...question.options.choices];
                                            updatedChoices.splice(choiceIndex, 1);
                                            onUpdateQuestion(question.id, { 
                                              options: { ...question.options, choices: updatedChoices } 
                                            });
                                          }}
                                          disabled={question.options.choices.length <= 2}
                                          className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}
                                    
                                    <button
                                      onClick={() => {
                                        const updatedChoices = [...question.options.choices, ''];
                                        onUpdateQuestion(question.id, { 
                                          options: { ...question.options, choices: updatedChoices } 
                                        });
                                      }}
                                      className="text-sm text-[#D4A5A5] hover:text-[#D4A5A5]/80 flex items-center"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Ajouter une option
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {question.question_type === 'true_false' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Réponse correcte</label>
                                  <select
                                    value={question.correct_answer || 'true'}
                                    onChange={(e) => onUpdateQuestion(question.id, { correct_answer: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                                  >
                                    <option value="true">Vrai</option>
                                    <option value="false">Faux</option>
                                  </select>
                                </div>
                              )}
                              
                              {question.question_type === 'multiple_choice' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Réponse correcte</label>
                                  <select
                                    value={question.correct_answer || ''}
                                    onChange={(e) => onUpdateQuestion(question.id, { correct_answer: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                                  >
                                    <option value="">Sélectionner la bonne réponse</option>
                                    {question.options && question.options.choices && question.options.choices.map((choice: string, i: number) => (
                                      <option key={i} value={choice}>{choice || `Option ${i+1}`}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              
                              <div className="flex justify-end space-x-2 pt-4">
                                <button
                                  onClick={() => setEditingQuestionId(null)}
                                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={() => setEditingQuestionId(null)}
                                  className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Enregistrer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col md:flex-row md:items-center">
                              <div className="p-4 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {question.question_type === 'text' ? 'Texte libre' : 
                                     question.question_type === 'multiple_choice' ? 'Choix multiples' : 
                                     'Vrai ou Faux'}
                                  </span>
                                  <h6 className="font-medium text-[#131837]">{question.question_text}</h6>
                                </div>
                                
                                {question.question_type === 'multiple_choice' && question.options && question.options.choices && (
                                  <div className="mt-2 space-y-1">
                                    {question.options.choices.map((choice: string, i: number) => (
                                      <div key={i} className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                          question.correct_answer === choice ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                        <span className="text-sm text-gray-700">{choice || `Option ${i+1}`}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {question.question_type === 'true_false' && (
                                  <div className="mt-2 text-sm text-gray-700">
                                    Réponse correcte: <span className="font-medium">{question.correct_answer === 'true' ? 'Vrai' : 'Faux'}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex md:flex-col items-center justify-end p-2 md:p-4 md:border-l border-gray-100 space-x-2 md:space-x-0 md:space-y-2">
                                <button
                                  onClick={() => onReorderQuestions(question.id, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  title="Monter"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onReorderQuestions(question.id, 'down')}
                                  disabled={index === activeQuizQuestions.length - 1}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  title="Descendre"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingQuestionId(question.id)}
                                  className="p-1 text-gray-400 hover:text-[#D4A5A5]"
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteQuestion(question.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout de quiz */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          {activeQuizId ? 'Ajouter une question' : 'Créer un nouveau quiz'}
        </h3>
        
        {!activeQuizId ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du quiz *</label>
                <input
                  type="text"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="Quiz sur les mariés"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnelle)</label>
                <textarea
                  value={newQuiz.description || ''}
                  onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="Testez vos connaissances sur les mariés"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Award className="inline h-4 w-4 mr-1 text-[#D4A5A5]" />
                  Message de récompense
                </label>
                <textarea
                  value={newQuiz.reward_message || ''}
                  onChange={(e) => setNewQuiz({...newQuiz, reward_message: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  placeholder="Félicitations ! Vous connaissez bien les mariés !"
                />
              </div>
              
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newQuizActive"
                    checked={newQuiz.is_active}
                    onChange={(e) => setNewQuiz({...newQuiz, is_active: e.target.checked})}
                    className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
                  />
                  <label htmlFor="newQuizActive" className="ml-2 block text-sm text-gray-700">
                    Quiz actif
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleAddQuiz}
                className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer le quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
              <input
                type="text"
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Comment les mariés se sont-ils rencontrés ?"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
              <select
                value={newQuestion.question_type}
                onChange={(e) => setNewQuestion({...newQuestion, question_type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              >
                <option value="text">Texte libre</option>
                <option value="multiple_choice">Choix multiples</option>
                <option value="true_false">Vrai ou Faux</option>
              </select>
            </div>
            
            {newQuestion.question_type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                <div className="space-y-2">
                  {newQuestion.options && newQuestion.options.choices && newQuestion.options.choices.map((choice: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveOption(index)}
                        disabled={newQuestion.options.choices.length <= 2}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={handleAddOption}
                    className="text-sm text-[#D4A5A5] hover:text-[#D4A5A5]/80 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une option
                  </button>
                </div>
              </div>
            )}
            
            {newQuestion.question_type === 'true_false' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Réponse correcte</label>
                <select
                  value={newQuestion.correct_answer || 'true'}
                  onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                >
                  <option value="true">Vrai</option>
                  <option value="false">Faux</option>
                </select>
              </div>
            )}
            
            {newQuestion.question_type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Réponse correcte</label>
                <select
                  value={newQuestion.correct_answer || ''}
                  onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                >
                  <option value="">Sélectionner la bonne réponse</option>
                  {newQuestion.options && newQuestion.options.choices && newQuestion.options.choices.map((choice: string, i: number) => (
                    <option key={i} value={choice}>{choice || `Option ${i+1}`}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter la question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizEditor;