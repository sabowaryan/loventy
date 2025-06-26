import React from 'react';
import { 
  Settings, 
  Download, 
  Copy, 
  Trash2,
  Eye,
  Send
} from 'lucide-react';

interface AdvancedSettingsProps {
  invitationData: {
    id: string;
    status: 'draft' | 'published' | 'sent';
  };
  onPublish: () => void;
  onSendInvitation: () => void;
  onDuplicate?: () => void;
  onExportPDF?: () => void;
  onDelete?: () => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ 
  invitationData,
  onPublish,
  onSendInvitation,
  onDuplicate,
  onExportPDF,
  onDelete
}) => {
  return (
    <div className="space-y-8">
      {/* Paramètres de publication */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Paramètres de publication
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-[#131837]">Statut de l'invitation</h4>
              <p className="text-sm text-gray-600">
                {invitationData.status === 'draft' && 'Brouillon - Non visible par les invités'}
                {invitationData.status === 'published' && 'Publiée - Visible via le lien'}
                {invitationData.status === 'sent' && 'Envoyée - Invitations distribuées'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              invitationData.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              invitationData.status === 'published' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {invitationData.status === 'draft' && 'Brouillon'}
              {invitationData.status === 'published' && 'Publiée'}
              {invitationData.status === 'sent' && 'Envoyée'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-[#131837]">Lien public</h4>
              <p className="text-sm text-gray-600">URL d'accès à votre invitation</p>
            </div>
            <div className="flex items-center space-x-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                loventy.org/i/{invitationData.id}
              </code>
              <button 
                className="p-2 text-gray-400 hover:text-[#D4A5A5] transition-colors"
                onClick={() => navigator.clipboard.writeText(`loventy.org/i/${invitationData.id}`)}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-[#131837]">Actions</h4>
              <p className="text-sm text-gray-600">Publier ou envoyer votre invitation</p>
            </div>
            <div className="flex items-center space-x-2">
              {invitationData.status === 'draft' ? (
                <button
                  onClick={onPublish}
                  className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Publier</span>
                </button>
              ) : (
                <button
                  onClick={onSendInvitation}
                  className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center space-x-1"
                >
                  <Send className="h-4 w-4" />
                  <span>Envoyer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions avancées */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4">
          Actions avancées
        </h3>
        
        <div className="space-y-3">
          <button 
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onExportPDF}
          >
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <div className="font-medium text-[#131837]">Exporter en PDF</div>
                <div className="text-sm text-gray-600">Télécharger une version PDF</div>
              </div>
            </div>
          </button>
          
          <button 
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onDuplicate}
          >
            <div className="flex items-center space-x-3">
              <Copy className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <div className="font-medium text-[#131837]">Dupliquer l'invitation</div>
                <div className="text-sm text-gray-600">Créer une copie de cette invitation</div>
              </div>
            </div>
          </button>
          
          <button 
            className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
            onClick={onDelete}
          >
            <div className="flex items-center space-x-3">
              <Trash2 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Supprimer l'invitation</div>
                <div className="text-sm">Cette action est irréversible</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;