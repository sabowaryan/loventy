import React, { useState } from 'react';
import { Upload, X, FileText, AlertTriangle, Check } from 'lucide-react';
import { GuestDetails } from '../../types/models';

interface ImportGuestsModalProps {
  onClose: () => void;
  onImportGuests: (guests: Partial<GuestDetails>[], invitationId: string) => void;
  invitations: Array<{ id: string, title: string }>;
}

const ImportGuestsModal: React.FC<ImportGuestsModalProps> = ({ onClose, onImportGuests, invitations }) => {
  const [file, setFile] = useState<File | null>(null);
  const [invitationId, setInvitationId] = useState<string>(invitations.length > 0 ? invitations[0].id : '');
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Veuillez sélectionner un fichier CSV');
        setFile(null);
        setPreviewData([]);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Lire le fichier pour prévisualisation
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const rows = text.split('\n').map(row => row.split(','));
          
          // Vérifier l'en-tête
          const header = rows[0];
          if (!header.includes('nom') && !header.includes('name')) {
            setError('Le fichier CSV doit contenir une colonne "nom" ou "name"');
            setPreviewData([]);
            return;
          }
          
          if (!header.includes('email')) {
            setError('Le fichier CSV doit contenir une colonne "email"');
            setPreviewData([]);
            return;
          }
          
          setPreviewData(rows.slice(0, 6)); // Afficher les 5 premières lignes + en-tête
        } catch (err) {
          setError('Erreur lors de la lecture du fichier');
          setPreviewData([]);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !invitationId) {
      setError('Veuillez sélectionner un fichier CSV et une invitation');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const header = rows[0];
      
      // Trouver les index des colonnes
      const nameIndex = header.findIndex(col => col.toLowerCase().includes('nom') || col.toLowerCase().includes('name'));
      const emailIndex = header.findIndex(col => col.toLowerCase().includes('email'));
      const phoneIndex = header.findIndex(col => col.toLowerCase().includes('phone') || col.toLowerCase().includes('tel'));
      
      if (nameIndex === -1 || emailIndex === -1) {
        setError('Format de fichier invalide');
        setIsLoading(false);
        return;
      }
      
      // Convertir les données en objets invités
      const guests = rows.slice(1)
        .filter(row => row.length >= Math.max(nameIndex, emailIndex) + 1 && row[nameIndex] && row[emailIndex])
        .map(row => ({
          name: row[nameIndex].trim(),
          email: row[emailIndex].trim(),
          phone: phoneIndex !== -1 && phoneIndex < row.length ? row[phoneIndex].trim() : undefined,
          status: 'pending',
          invitation_id: invitationId
        }));
      
      if (guests.length === 0) {
        setError('Aucun invité valide trouvé dans le fichier');
        setIsLoading(false);
        return;
      }
      
      await onImportGuests(guests, invitationId);
    } catch (err) {
      setError('Erreur lors de l\'importation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-primary font-serif">
            Importer des invités
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="form-label">
              Invitation
            </label>
            <select
              value={invitationId}
              onChange={(e) => setInvitationId(e.target.value)}
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
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-secondary transition-colors ${
              file ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
                const input = document.getElementById('csv-upload') as HTMLInputElement;
                if (input) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(droppedFile);
                  input.files = dataTransfer.files;
                  const event = new Event('change', { bubbles: true });
                  input.dispatchEvent(event);
                }
              } else {
                setError('Veuillez déposer un fichier CSV');
              }
            }}
          >
            {file ? (
              <>
                <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 font-medium mb-2">Fichier sélectionné</p>
                <p className="text-green-600">{file.name}</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Glissez votre fichier CSV ici ou cliquez pour parcourir</p>
                <p className="text-sm text-gray-500">Format accepté: CSV (max 5MB)</p>
              </>
            )}
            <input 
              type="file" 
              id="csv-upload"
              accept=".csv" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => document.getElementById('csv-upload')?.click()}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sélectionner un fichier
            </button>
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

          {previewData.length > 0 && (
            <div>
              <h4 className="font-medium text-primary mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-secondary" />
                Aperçu des données
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData[0].map((header, i) => (
                        <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 5 && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                  Affichage des 5 premières lignes sur {previewData.length - 1} au total
                </p>
              )}
            </div>
          )}

          <div className="notification-info rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Format requis :</h4>
            <p className="text-sm text-blue-700 mb-2">Votre fichier CSV doit contenir les colonnes suivantes :</p>
            <code className="text-xs bg-blue-100 px-2 py-1 rounded">
              nom,email,telephone
            </code>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button 
              onClick={handleImport}
              disabled={!file || !invitationId || isLoading}
              className="flex-1 btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Importation...' : 'Importer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportGuestsModal;