import React, { useState } from 'react';
import { X, Plus, User, Mail, Phone, Calendar } from 'lucide-react';
import { GuestDetails } from '../../types/models';

interface AddGuestModalProps {
  onClose: () => void;
  onAddGuest: (guest: Partial<GuestDetails>) => void;
  invitations: Array<{ id: string, title: string }>;
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({ onClose, onAddGuest, invitations }) => {
  const [guestData, setGuestData] = useState<Partial<GuestDetails>>({
    name: '',
    email: '',
    phone: '',
    invitation_id: invitations.length > 0 ? invitations[0].id : '',
    status: 'pending',
    guest_type: 'solo',
    dietary_restrictions: '',
    plus_one: false,
    plus_one_name: '',
    plus_one_email: '',
    plus_one_phone: '',
    additional_notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestData.name || !guestData.email || !guestData.invitation_id) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    onAddGuest(guestData);
  };

  const handleInputChange = (field: keyof GuestDetails, value: any) => {
    setGuestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-primary font-serif">
            Ajouter un invité
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              <User className="inline h-4 w-4 mr-1" />
              Nom complet *
            </label>
            <input
              type="text"
              required
              value={guestData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
              placeholder="Marie Dubois"
            />
          </div>

          <div>
            <label className="form-label">
              <Mail className="inline h-4 w-4 mr-1" />
              Email *
            </label>
            <input
              type="email"
              required
              value={guestData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              placeholder="marie@email.com"
            />
          </div>

          <div>
            <label className="form-label">
              <Phone className="inline h-4 w-4 mr-1" />
              Téléphone
            </label>
            <input
              type="tel"
              value={guestData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="form-input"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div>
            <label className="form-label">
              <Calendar className="inline h-4 w-4 mr-1" />
              Invitation *
            </label>
            <select 
              value={guestData.invitation_id || ''}
              onChange={(e) => handleInputChange('invitation_id', e.target.value)}
              className="form-input"
              required
            >
              <option value="">Sélectionner une invitation</option>
              {invitations.map(invitation => (
                <option key={invitation.id} value={invitation.id}>
                  {invitation.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">
              Statut
            </label>
            <select
              value={guestData.status || 'pending'}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="form-input"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="declined">Décliné</option>
            </select>
          </div>

          <div>
            <label className="form-label">
              Type d'invité
            </label>
            <select
              value={guestData.guest_type || 'solo'}
              onChange={(e) => handleInputChange('guest_type', e.target.value)}
              className="form-input"
            >
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="family">Famille</option>
            </select>
          </div>

          <div>
            <label className="form-label">
              Restrictions alimentaires
            </label>
            <input
              type="text"
              value={guestData.dietary_restrictions || ''}
              onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
              className="form-input"
              placeholder="Végétarien, allergies, etc."
            />
          </div>

          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="plus_one"
              checked={guestData.plus_one || false}
              onChange={(e) => handleInputChange('plus_one', e.target.checked)}
              className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
            />
            <label htmlFor="plus_one" className="ml-2 block text-sm text-gray-700">
              Accompagnant(e)
            </label>
          </div>

          {guestData.plus_one && (
            <div className="space-y-4 pl-6 border-l-2 border-gray-100">
              <div>
                <label className="form-label">
                  Nom de l'accompagnant(e)
                </label>
                <input
                  type="text"
                  value={guestData.plus_one_name || ''}
                  onChange={(e) => handleInputChange('plus_one_name', e.target.value)}
                  className="form-input"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="form-label">
                  Email de l'accompagnant(e)
                </label>
                <input
                  type="email"
                  value={guestData.plus_one_email || ''}
                  onChange={(e) => handleInputChange('plus_one_email', e.target.value)}
                  className="form-input"
                  placeholder="jean@email.com"
                />
              </div>
            </div>
          )}

          <div>
            <label className="form-label">
              Notes additionnelles
            </label>
            <textarea
              value={guestData.additional_notes || ''}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              rows={3}
              className="form-input"
              placeholder="Informations supplémentaires sur cet invité..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGuestModal;