import React, { useState } from 'react';
import { X, User, Mail, Calendar, Save } from 'lucide-react';

interface EditGuestModalProps {
  guest: {
    id: string;
    name: string;
    email?: string;
    table_name?: string;
  };
  onSave: (guest: { id: string; name: string; email?: string; table_name?: string }) => void;
  onClose: () => void;
}

const EditGuestModal: React.FC<EditGuestModalProps> = ({ guest, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: guest.name || '',
    email: guest.email || '',
    table_name: guest.table_name || ''
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.table_name) {
      alert('Nom et table sont obligatoires');
      return;
    }
    onSave({ id: guest.id, ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-2 xs:p-4 sm:p-8 w-full max-w-[98vw] xs:max-w-md sm:max-w-lg mx-2 xs:mx-4 border border-gray-100 animate-fade-in relative max-h-[95vh] overflow-y-auto transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-primary font-serif tracking-tight">
            Éditer l'invité
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="form-label font-medium text-gray-700 flex items-center gap-1">
              <User className="inline h-4 w-4 text-blue-400" />
              Nom complet <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className="form-input w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400"
              placeholder="Marie Dubois"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label font-medium text-gray-700 flex items-center gap-1">
              <Mail className="inline h-4 w-4 text-blue-400" />
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              className="form-input w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400"
              placeholder="marie@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="form-label font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="inline h-4 w-4 text-blue-400" />
              Table <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.table_name}
              onChange={e => handleChange('table_name', e.target.value)}
              className="form-input w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400"
              placeholder="Table Marbre"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 w-full sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium order-1 sm:order-none"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto btn-accent py-3 text-base font-semibold flex items-center justify-center gap-2 order-2 sm:order-none"
            >
              <Save className="h-5 w-5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGuestModal;
