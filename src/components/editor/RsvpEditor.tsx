import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Edit,
  Save,
  X,
  CheckSquare
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface RsvpEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const RsvpEditor: React.FC<RsvpEditorProps> = ({ 
  invitationData, 
  onInputChange 
}) => {
  // État pour gérer les questions RSVP (simulé pour l'instant)
  const [questions, setQuestions] = useState<any[]>([
    {
      id: '1',
      question: 'Avez-vous des restrictions alimentaires ?',
      question_type: 'text',
      is_required: true,
      display_order: 0
    },
    {
      id: '2',
      question: 'Participerez-vous au brunch du lendemain ?',
      question_type: 'choice',
      options: { choices: ['Oui', 'Non', 'Peut-être'] },
      is_required: false,
      display_order: 1
    }
  ]);
  
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    question_type: 'text',
    options: { choices: ['', ''] },
    is_required: false
  });

  // Get today's date in YYYY-MM-DD format for default values
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const defaultDate = `${year}-${month}-${day}`;

  // Fonctions de gestion des questions (simulées)
  const handleAddQuestion = () => {
    // Simuler l'ajout d'une question
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, {
      id: newId,
      ...newQuestion,
      display_order: questions.length
    }]);
    
    // Réinitialiser le formulaire
    setNewQuestion({
      question: '',
      question_type: 'text',
      options: { choices: ['', ''] },
      is_required: false
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleReorderQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;
    
    const newQuestions = [...questions];
    
    if (direction === 'up' && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    } else if (direction === 'down' && index < questions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    }
    
    // Mettre à jour les display_order
    newQuestions.forEach((q, i) => {
      q.display_order = i;
    });
    
    setQuestions(newQuestions);
  };

  const handleUpdateQuestion = (id: string, updates: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedChoices = [...newQuestion.options.choices];
    updatedChoices[index] = value;
    
    setNewQuestion({
      ...newQuestion,
      options: { ...newQuestion.options, choices: updatedChoices }
    });
  };

  const handleAddOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: { 
        ...newQuestion.options, 
        choices: [...newQuestion.options.choices, ''] 
      }
    });
  };

  const handleRemoveOption = (index: number) => {
    if (newQuestion.options.choices.length <= 2) return;
    
    const updatedChoices = [...newQuestion.options.choices];
    updatedChoices.splice(index, 1);
    
    setNewQuestion({
      ...newQuestion,
      options: { ...newQuestion.options, choices: updatedChoices }
    });
  };

  return (
    <div className="space-y-8">
      {/* Paramètres RSVP */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Paramètres RSVP
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              Date limite RSVP
            </label>
            <input
              type="date"
              value={invitationData.rsvpDate || defaultDate}
              onChange={(e) => onInputChange('rsvpDate', e.target.value === '' ? null : e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Questions RSVP */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <CheckSquare className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Questions RSVP personnalisées
        </h3>
        
        {questions.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Aucune question personnalisée</p>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Ajoutez des questions pour recueillir des informations supplémentaires de vos invités (régime alimentaire, préférences, etc.)
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {questions.map((question, index) => (
              <div 
                key={question.id} 
                className={`border rounded-lg overflow-hidden ${
                  editingQuestionId === question.id ? 'border-[#D4A5A5]' : 'border-gray-200'
                }`}
              >
                {editingQuestionId === question.id ? (
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-[#131837]">Modifier la question</h4>
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
                        value={question.question}
                        onChange={(e) => handleUpdateQuestion(question.id, { question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                        placeholder="Avez-vous des restrictions alimentaires ?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
                      <select
                        value={question.question_type}
                        onChange={(e) => handleUpdateQuestion(question.id, { question_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                      >
                        <option value="text">Texte libre</option>
                        <option value="choice">Choix multiples</option>
                        <option value="boolean">Oui/Non</option>
                      </select>
                    </div>
                    
                    {question.question_type === 'choice' && question.options && question.options.choices && (
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
                                  handleUpdateQuestion(question.id, { 
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
                                  handleUpdateQuestion(question.id, { 
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
                              handleUpdateQuestion(question.id, { 
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
                    
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.is_required}
                        onChange={(e) => handleUpdateQuestion(question.id, { is_required: e.target.checked })}
                        className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${question.id}`} className="ml-2 block text-sm text-gray-700">
                        Question obligatoire
                      </label>
                    </div>
                    
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
                           question.question_type === 'choice' ? 'Choix multiples' : 
                           'Oui/Non'}
                        </span>
                        <h4 className="font-medium text-[#131837]">{question.question}</h4>
                        {question.is_required && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Obligatoire
                          </span>
                        )}
                      </div>
                      
                      {question.question_type === 'choice' && question.options && question.options.choices && (
                        <div className="mt-2 space-y-1">
                          {question.options.choices.map((choice: string, i: number) => (
                            <div key={i} className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                              <span className="text-sm text-gray-700">{choice || `Option ${i+1}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex md:flex-col items-center justify-end p-2 md:p-4 md:border-l border-gray-100 space-x-2 md:space-x-0 md:space-y-2">
                      <button
                        onClick={() => handleReorderQuestion(question.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Monter"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReorderQuestion(question.id, 'down')}
                        disabled={index === questions.length - 1}
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
                        onClick={() => handleDeleteQuestion(question.id)}
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

        {/* Formulaire d'ajout de question */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h4 className="text-md font-semibold text-[#131837] mb-4 flex items-center">
            <Plus className="h-4 w-4 mr-2 text-[#D4A5A5]" />
            Ajouter une question
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                placeholder="Avez-vous des restrictions alimentaires ?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
              <select
                value={newQuestion.question_type}
                onChange={(e) => setNewQuestion({...newQuestion, question_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              >
                <option value="text">Texte libre</option>
                <option value="choice">Choix multiples</option>
                <option value="boolean">Oui/Non</option>
              </select>
            </div>
            
            {newQuestion.question_type === 'choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                <div className="space-y-2">
                  {newQuestion.options.choices.map((choice: string, index: number) => (
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
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new-question-required"
                checked={newQuestion.is_required}
                onChange={(e) => setNewQuestion({...newQuestion, is_required: e.target.checked})}
                className="h-4 w-4 text-[#D4A5A5] focus:ring-[#D4A5A5] border-gray-300 rounded"
              />
              <label htmlFor="new-question-required" className="ml-2 block text-sm text-gray-700">
                Question obligatoire
              </label>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestion.question.trim()}
                className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter la question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default RsvpEditor;
