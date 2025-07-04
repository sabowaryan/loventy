import React, { useState } from 'react';
import { X, Plus, User, Mail, Phone, Calendar, MessageSquare, Upload } from 'lucide-react';
import { GuestDetails } from '../../types/models';
import { v4 as uuidv4 } from 'uuid';
import Papa, { ParseResult } from 'papaparse';

interface AddGuestModalProps {
  onClose: () => void;
  onAddGuest: (guest: Partial<GuestDetails>) => void;
  invitations: Array<{ id: string, title: string }>;
  weddingDetails: { groomName: string; brideName: string };
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({ onClose, onAddGuest, invitations, weddingDetails }) => {
  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    table_name: '',
  });
  const [csvGuests, setCsvGuests] = useState<Array<{ name: string; email: string; table_name: string }>>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [previewId] = useState(() => uuidv4());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestData.name || !guestData.table_name) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const id = uuidv4();
    const invitation_id = `/i/${id}`;
    const additional_notes = getPersonalMessage(guestData.name, `https://loventy.org${invitation_id}`);
    onAddGuest({
      id,
      name: guestData.name,
      email: guestData.email,
      table_name: guestData.table_name,
      invitation_id,
      additional_notes
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>) => {
        const data = results.data as Array<any>;
        const valid = data.every(row => row.name && row.table_name);
        if (!valid) {
          setCsvError('Le CSV doit contenir les colonnes name, table_name');
          setCsvGuests([]);
        } else {
          setCsvError(null);
          setCsvGuests(data.map(row => ({
            name: row.name,
            email: row.email,
            table_name: row.table_name
          })));
        }
      },
      error: () => setCsvError('Erreur lors de la lecture du CSV')
    });
  };

  const handleAddCsvGuests = () => {
    csvGuests.forEach(guest => {
      const id = uuidv4();
      const invitation_id = `/i/${id}`;
      const additional_notes = getPersonalMessage(guest.name, `https://loventy.org${invitation_id}`);
      onAddGuest({
        id,
        name: guest.name,
        email: guest.email,
        table_name: guest.table_name,
        invitation_id,
        additional_notes
      });
    });
    setCsvGuests([]);
    onClose();
  };

  // Génération du lien et du message pour l'invité manuel
  const previewLink = guestData.name && guestData.table_name ? `/i/${previewId}` : '';
  const previewMessage = previewLink ? getPersonalMessage(guestData.name, `https://loventy.org${previewLink}`) : '';

  // Génération du message élégant et professionnel
  function getPersonalMessage(name: string, link: string) {
    return `Cher(e) ${name},\n\nVous êtes convié(e) au mariage de ${weddingDetails.groomName} & ${weddingDetails.brideName}.\n\nNous avons le plaisir de vous transmettre votre accès exclusif à l'invitation :\n${link}\n\nNous serions honorés de vous compter parmi nos invités pour partager ce moment unique.\n\nAvec toute notre amitié,\n${weddingDetails.groomName} & ${weddingDetails.brideName}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-2 xs:p-4 sm:p-8 w-full max-w-[98vw] xs:max-w-md sm:max-w-lg mx-2 xs:mx-4 border border-gray-100 animate-fade-in relative max-h-[95vh] overflow-y-auto transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-primary font-serif tracking-tight">
            Ajouter un invité
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
              value={guestData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
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
              value={guestData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              value={guestData.table_name}
              onChange={e => handleInputChange('table_name', e.target.value)}
              className="form-input w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400"
              placeholder="Table Marbre"
            />
          </div>

          {/* Aperçu du message et du lien généré */}
          {guestData.name && guestData.table_name && (
            <div className="bg-gradient-to-br from-blue-50 to-rose-50 border border-blue-200 rounded-xl p-4 my-2 text-sm shadow-sm">
              <div className="mb-1 font-semibold text-blue-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Aperçu du message à envoyer
              </div>
              <pre className="text-blue-900 break-words whitespace-pre-wrap font-sans text-xs sm:text-sm bg-white/60 rounded p-2 border border-blue-100 overflow-x-auto">
                {previewMessage}
              </pre>
              <div className="mt-1 text-xs text-blue-500">Lien unique : <span className="font-mono break-all">{previewLink}</span></div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <label className="form-label font-medium text-gray-700 flex items-center gap-1 mb-1">
              <Upload className="inline h-4 w-4 text-blue-400" />
              Importer une liste CSV
            </label>
            <div className="relative flex items-center">
              <input type="file" accept=".csv" onChange={handleCsvUpload} className="form-input w-full px-2 py-2 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 transition" />
              <span className="absolute right-3 text-blue-400 pointer-events-none"><Upload className="w-4 h-4" /></span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Colonnes attendues : <span className="font-mono">name, table_name, email (optionnel)</span></div>
            {csvError && <div className="text-red-500 text-sm mt-1">{csvError}</div>}
            {csvGuests.length > 0 && (
              <div className="mt-2">
                <div className="text-sm text-gray-700 mb-2">{csvGuests.length} invités détectés</div>
                <div className="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2 mb-2">
                  {csvGuests.map((guest, idx) => {
                    const id = uuidv4();
                    const link = `/i/${id}`;
                    const msg = getPersonalMessage(guest.name, `https://loventy.org${link}`);
                    return (
                      <div key={idx} className="mb-2 border-b pb-1 last:border-b-0 last:pb-0">
                        <div className="font-semibold text-blue-700">{guest.name}</div>
                        <div className="text-xs text-blue-500">{guest.email ? guest.email + ' — ' : ''}Table : {guest.table_name}</div>
                        <pre className="text-xs text-blue-900 break-words whitespace-pre-wrap font-sans bg-white/60 rounded p-1 border border-blue-100 overflow-x-auto">{msg}</pre>
                        <div className="text-[10px] text-blue-400">Lien : {link}</div>
                      </div>
                    );
                  })}
                </div>
                <button type="button" className="btn-accent w-full py-3 text-base font-semibold" onClick={handleAddCsvGuests}>Ajouter tous les invités du CSV</button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 w-full sm:justify-between">
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
              <Plus className="h-5 w-5" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGuestModal;