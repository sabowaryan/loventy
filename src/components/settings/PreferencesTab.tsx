import React, { useState } from 'react';
import { Save, Loader2, Globe, Calendar, Clock, Moon, Sun, Palette } from 'lucide-react';

interface PreferencesTabProps {
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({ onSave, isLoading }) => {
  const [preferences, setPreferences] = useState({
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    theme: 'light',
    colorScheme: 'default',
    defaultTemplate: 'elegant-gold'
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Préférences régionales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6 flex items-center">
          <Globe className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Préférences régionales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Langue
            </label>
            <select
              name="language"
              value={preferences.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Fuseau horaire
            </label>
            <select
              name="timezone"
              value={preferences.timezone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            >
              <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              <option value="Australia/Sydney">Australia/Sydney (UTC+10)</option>
              <option value="Africa/Kinshasa">Africa/Kinshasa (UTC+1)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Préférences d'affichage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6 flex items-center">
          <Palette className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Préférences d'affichage
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Format de date
            </label>
            <select
              name="dateFormat"
              value={preferences.dateFormat}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
              <option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2025)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Format d'heure
            </label>
            <select
              name="timeFormat"
              value={preferences.timeFormat}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            >
              <option value="24h">24h (14:30)</option>
              <option value="12h">12h (2:30 PM)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Thème
            </label>
            <select
              name="theme"
              value={preferences.theme}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Schéma de couleurs
            </label>
            <select
              name="colorScheme"
              value={preferences.colorScheme}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            >
              <option value="default">Défaut (Rose)</option>
              <option value="blue">Bleu</option>
              <option value="green">Vert</option>
              <option value="purple">Violet</option>
              <option value="orange">Orange</option>
            </select>
          </div>
        </div>
      </div>

      {/* Préférences de modèle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Préférences de modèle</h3>
        
        <div>
          <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
            Modèle par défaut
          </label>
          <select
            name="defaultTemplate"
            value={preferences.defaultTemplate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
            disabled={isLoading}
          >
            <option value="elegant-gold">Élégance Dorée</option>
            <option value="jardin-secret">Jardin Secret</option>
            <option value="minimaliste-chic">Minimaliste Chic</option>
            <option value="romance-vintage">Romance Vintage</option>
            <option value="aquarelle-bleue">Aquarelle Bleue</option>
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Ce modèle sera utilisé par défaut lors de la création d'une nouvelle invitation.
          </p>
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

export default PreferencesTab;