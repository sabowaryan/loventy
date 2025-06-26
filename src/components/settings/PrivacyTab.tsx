import React, { useState } from 'react';
import { Save, Loader2, Shield, Eye, Users, Globe } from 'lucide-react';

interface PrivacyTabProps {
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

const PrivacyTab: React.FC<PrivacyTabProps> = ({ onSave, isLoading }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    allowSearchEngines: false,
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataSharing: 'minimal',
    cookiePreferences: {
      necessary: true,
      functional: true,
      analytics: true,
      advertising: false
    }
  });

  const handleToggle = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleCookieToggle = (cookieType: keyof typeof privacySettings.cookiePreferences) => {
    if (cookieType === 'necessary') return; // Necessary cookies cannot be disabled
    
    setPrivacySettings(prev => ({
      ...prev,
      cookiePreferences: {
        ...prev.cookiePreferences,
        [cookieType]: !prev.cookiePreferences[cookieType]
      }
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(privacySettings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Paramètres de confidentialité */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Paramètres de confidentialité
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Visibilité du profil
            </label>
            <select
              name="profileVisibility"
              value={privacySettings.profileVisibility}
              onChange={handleSelectChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            >
              <option value="public">Public - Visible par tous</option>
              <option value="contacts">Contacts - Visible par vos contacts uniquement</option>
              <option value="private">Privé - Visible uniquement par vous</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-[#1E1E1E]">Indexation par les moteurs de recherche</h4>
                <p className="text-sm text-gray-600">Autoriser les moteurs de recherche à indexer votre profil</p>
              </div>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="allowSearchEngines"
                checked={privacySettings.allowSearchEngines}
                onChange={() => handleToggle('allowSearchEngines')}
                className="sr-only"
                disabled={isLoading || privacySettings.profileVisibility === 'private'}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.allowSearchEngines ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors ${
                  privacySettings.profileVisibility === 'private' ? 'opacity-50' : ''
                }`}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.allowSearchEngines ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-[#1E1E1E]">Statut en ligne</h4>
                <p className="text-sm text-gray-600">Montrer quand vous êtes en ligne</p>
              </div>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="showOnlineStatus"
                checked={privacySettings.showOnlineStatus}
                onChange={() => handleToggle('showOnlineStatus')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.showOnlineStatus ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.showOnlineStatus ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-[#1E1E1E]">Messages directs</h4>
                <p className="text-sm text-gray-600">Autoriser les autres utilisateurs à vous envoyer des messages</p>
              </div>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="allowDirectMessages"
                checked={privacySettings.allowDirectMessages}
                onChange={() => handleToggle('allowDirectMessages')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.allowDirectMessages ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.allowDirectMessages ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Partage de données
            </label>
            <select
              name="dataSharing"
              value={privacySettings.dataSharing}
              onChange={handleSelectChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            >
              <option value="none">Aucun - Ne pas partager mes données</option>
              <option value="minimal">Minimal - Partager uniquement les données nécessaires</option>
              <option value="full">Complet - Partager toutes les données pour une expérience personnalisée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Préférences de cookies */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Préférences de cookies</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Cookies nécessaires</h4>
              <p className="text-sm text-gray-600">Essentiels au fonctionnement du site</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#D4A5A5] opacity-50">
              <input
                type="checkbox"
                checked={true}
                disabled={true}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Cookies fonctionnels</h4>
              <p className="text-sm text-gray-600">Améliorent les fonctionnalités du site</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="functionalCookies"
                checked={privacySettings.cookiePreferences.functional}
                onChange={() => handleCookieToggle('functional')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.cookiePreferences.functional ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.cookiePreferences.functional ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Cookies d'analyse</h4>
              <p className="text-sm text-gray-600">Nous aident à comprendre comment vous utilisez le site</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="analyticsCookies"
                checked={privacySettings.cookiePreferences.analytics}
                onChange={() => handleCookieToggle('analytics')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.cookiePreferences.analytics ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.cookiePreferences.analytics ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Cookies publicitaires</h4>
              <p className="text-sm text-gray-600">Utilisés pour vous montrer des publicités pertinentes</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="advertisingCookies"
                checked={privacySettings.cookiePreferences.advertising}
                onChange={() => handleCookieToggle('advertising')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.cookiePreferences.advertising ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  privacySettings.cookiePreferences.advertising ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              <span>Sauvegarder</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PrivacyTab;