import React, { useState } from 'react';
import { Download, FileText, Archive, RefreshCw, Loader2 } from 'lucide-react';

const DataTab: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setIsExporting(true);
    setExportType(type);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a dummy file for download
      const dummyData = {
        exportType: type,
        timestamp: new Date().toISOString(),
        message: `Ceci est un exemple de fichier d'export ${type}`
      };
      
      const blob = new Blob([JSON.stringify(dummyData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loventy-${type}-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${type} data:`, error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Exportation de données */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6 flex items-center">
          <Download className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Exportation de données
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Vous pouvez exporter vos données à tout moment. Les fichiers seront au format JSON et peuvent être téléchargés immédiatement.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-[#D4A5A5] hover:bg-[#D4A5A5]/5 transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-medium text-[#1E1E1E]">Données du compte</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Exporte vos informations personnelles, paramètres et préférences.
              </p>
              <button
                onClick={() => handleExport('account')}
                disabled={isExporting}
                className="w-full px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isExporting && exportType === 'account' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Exportation...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Exporter</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-[#D4A5A5] hover:bg-[#D4A5A5]/5 transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-medium text-[#1E1E1E]">Invitations</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Exporte toutes vos invitations avec leurs détails et paramètres.
              </p>
              <button
                onClick={() => handleExport('invitations')}
                disabled={isExporting}
                className="w-full px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isExporting && exportType === 'invitations' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Exportation...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Exporter</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-[#D4A5A5] hover:bg-[#D4A5A5]/5 transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-medium text-[#1E1E1E]">Invités</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Exporte la liste de tous vos invités et leurs réponses.
              </p>
              <button
                onClick={() => handleExport('guests')}
                disabled={isExporting}
                className="w-full px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isExporting && exportType === 'guests' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Exportation...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Exporter</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-[#D4A5A5] hover:bg-[#D4A5A5]/5 transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Archive className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="font-medium text-[#1E1E1E]">Toutes les données</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Exporte l'ensemble de vos données dans un fichier complet.
              </p>
              <button
                onClick={() => handleExport('all')}
                disabled={isExporting}
                className="w-full px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isExporting && exportType === 'all' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Exportation...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Exporter tout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suppression de données */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Suppression de données</h3>
        
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Vous pouvez demander la suppression de certaines de vos données. Notez que cette action est irréversible.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-800">
              La suppression de vos données peut prendre jusqu'à 30 jours pour être complètement traitée dans nos systèmes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#1E1E1E] mb-2">Supprimer les invitations archivées</h4>
              <p className="text-sm text-gray-600 mb-4">
                Supprime définitivement toutes les invitations que vous avez archivées.
              </p>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Supprimer les archives
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#1E1E1E] mb-2">Supprimer l'historique d'activité</h4>
              <p className="text-sm text-gray-600 mb-4">
                Efface votre historique d'activité et de navigation sur la plateforme.
              </p>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Effacer l'historique
              </button>
            </div>
          </div>
          
          <div className="p-4 border border-red-200 rounded-lg bg-red-50 mt-6">
            <h4 className="font-medium text-red-800 mb-2">Supprimer toutes les données</h4>
            <p className="text-sm text-red-700 mb-4">
              Cette action supprimera définitivement toutes vos données et votre compte. Elle ne peut pas être annulée.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Demander la suppression complète
            </button>
          </div>
        </div>
      </div>

      {/* Téléchargement des données */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Téléchargement des données</h3>
        
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Vous pouvez télécharger une copie de toutes vos données personnelles que nous détenons.
          </p>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-[#1E1E1E]">Demander toutes mes données</h4>
                <p className="text-sm text-gray-600">
                  Nous préparerons un fichier contenant toutes vos données personnelles.
                </p>
              </div>
              <button className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>Demander</span>
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              La préparation de vos données peut prendre jusqu'à 48 heures. Vous recevrez un email avec un lien de téléchargement une fois que vos données seront prêtes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTab;