import React, { useState } from 'react';
import { Save, Loader2, Bell, Mail, Smartphone, Calendar } from 'lucide-react';

interface NotificationsTabProps {
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ onSave, isLoading }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    marketingEmails: true,
    weeklyDigest: true,
    rsvpUpdates: true,
    reminderEmails: true
  });

  const handleToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(notificationSettings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Préférences de notification */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Préférences de notification
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-[#1E1E1E]">Notifications par email</h4>
                <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
              </div>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.emailNotifications ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-[#1E1E1E]">Notifications push</h4>
                <p className="text-sm text-gray-600">Recevoir des notifications sur votre appareil</p>
              </div>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="pushNotifications"
                checked={notificationSettings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.pushNotifications ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-[#1E1E1E]">Emails marketing</h4>
                <p className="text-sm text-gray-600">Recevoir des emails sur nos offres et nouveautés</p>
              </div>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="marketingEmails"
                checked={notificationSettings.marketingEmails}
                onChange={() => handleToggle('marketingEmails')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.marketingEmails ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Types de notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Types de notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Résumé hebdomadaire</h4>
              <p className="text-sm text-gray-600">Recevez un résumé de votre activité chaque semaine</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="weeklyDigest"
                checked={notificationSettings.weeklyDigest}
                onChange={() => handleToggle('weeklyDigest')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.weeklyDigest ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Mises à jour RSVP</h4>
              <p className="text-sm text-gray-600">Notifications lorsque vos invités répondent</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="rsvpUpdates"
                checked={notificationSettings.rsvpUpdates}
                onChange={() => handleToggle('rsvpUpdates')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.rsvpUpdates ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.rsvpUpdates ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Rappels</h4>
              <p className="text-sm text-gray-600">Rappels pour les dates importantes</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/20 focus:ring-offset-2">
              <input
                type="checkbox"
                id="reminderEmails"
                checked={notificationSettings.reminderEmails}
                onChange={() => handleToggle('reminderEmails')}
                className="sr-only"
                disabled={isLoading}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.reminderEmails ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                } absolute inset-0 rounded-full transition-colors`}
              />
              <span
                aria-hidden="true"
                className={`${
                  notificationSettings.reminderEmails ? 'translate-x-5' : 'translate-x-0'
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

export default NotificationsTab;