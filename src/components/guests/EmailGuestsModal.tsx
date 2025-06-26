import React, { useState } from 'react';
import { Mail, Send, X, AlertTriangle } from 'lucide-react';
import { GuestDetails } from '../../types/models';

interface EmailGuestsModalProps {
  onClose: () => void;
  onSendEmail: (emailData: any) => void;
  selectedGuests: GuestDetails[];
}

const EmailGuestsModal: React.FC<EmailGuestsModalProps> = ({ onClose, onSendEmail, selectedGuests }) => {
  const [emailType, setEmailType] = useState('invitation');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onSendEmail({
        type: emailType,
        subject,
        message,
        recipients: selectedGuests.map(guest => ({
          id: guest.id,
          name: guest.name,
          email: guest.email
        }))
      });
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'email');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'invitation':
        return 'Invitation initiale';
      case 'reminder':
        return 'Rappel RSVP';
      case 'update':
        return 'Mise à jour';
      case 'custom':
        return 'Message personnalisé';
      default:
        return type;
    }
  };

  const getDefaultSubject = (type: string) => {
    switch (type) {
      case 'invitation':
        return 'Vous êtes invité(e) à notre mariage !';
      case 'reminder':
        return 'Rappel: Merci de confirmer votre présence';
      case 'update':
        return 'Mise à jour importante concernant notre mariage';
      case 'custom':
        return '';
      default:
        return '';
    }
  };

  const getDefaultMessage = (type: string) => {
    switch (type) {
      case 'invitation':
        return `Cher/Chère [Nom de l'invité],\n\nNous sommes heureux de vous inviter à notre mariage qui se tiendra le [Date] à [Lieu].\n\nMerci de confirmer votre présence avant le [Date limite RSVP].\n\nBien à vous,\n[Noms des mariés]`;
      case 'reminder':
        return `Cher/Chère [Nom de l'invité],\n\nNous n'avons pas encore reçu votre réponse concernant notre mariage qui se tiendra le [Date].\n\nMerci de confirmer votre présence dès que possible.\n\nBien à vous,\n[Noms des mariés]`;
      case 'update':
        return `Cher/Chère [Nom de l'invité],\n\nNous souhaitons vous informer d'une mise à jour importante concernant notre mariage :\n\n[Détails de la mise à jour]\n\nMerci de votre compréhension.\n\nBien à vous,\n[Noms des mariés]`;
      case 'custom':
        return '';
      default:
        return '';
    }
  };

  // Mettre à jour le sujet et le message lorsque le type d'email change
  React.useEffect(() => {
    setSubject(getDefaultSubject(emailType));
    setMessage(getDefaultMessage(emailType));
  }, [emailType]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-primary font-serif">
            Envoyer un email
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>{selectedGuests.length}</strong> invité{selectedGuests.length > 1 ? 's' : ''} sélectionné{selectedGuests.length > 1 ? 's' : ''}
            </p>
            {selectedGuests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedGuests.slice(0, 5).map(guest => (
                  <span key={guest.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {guest.name}
                  </span>
                ))}
                {selectedGuests.length > 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{selectedGuests.length - 5} autres
                  </span>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Erreur</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="form-label">
              Type d'email
            </label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="form-input"
            >
              <option value="invitation">Invitation initiale</option>
              <option value="reminder">Rappel RSVP</option>
              <option value="update">Mise à jour</option>
              <option value="custom">Message personnalisé</option>
            </select>
          </div>

          <div>
            <label className="form-label">
              Objet
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-input"
              placeholder={`${getEmailTypeLabel(emailType)}: Votre invitation`}
              required
            />
          </div>

          <div>
            <label className="form-label">
              Message
            </label>
            <textarea
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-input"
              placeholder="Votre message personnalisé..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Utilisez [Nom de l'invité] pour insérer automatiquement le nom de chaque invité.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h5 className="text-sm font-medium text-blue-800">Aperçu pour {selectedGuests[0]?.name || 'l\'invité'}</h5>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="font-medium">Objet: {subject}</p>
                  <p className="mt-1 whitespace-pre-line">{message.replace(/\[Nom de l'invité\]/g, selectedGuests[0]?.name || '[Nom de l\'invité]')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !subject.trim() || !message.trim()}
            >
              {isLoading ? (
                <span>Envoi en cours...</span>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  <span>Envoyer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailGuestsModal;