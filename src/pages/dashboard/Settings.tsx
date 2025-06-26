import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Crown, 
  Globe, 
  Smartphone, 
  Palette, 
  Save,
  AlertCircle,
  CheckCircle,
  Camera,
  Upload,
  Settings as SettingsIcon,
  Heart,
  LogOut,
  Calendar,
  Clock,
  Languages,
  Moon,
  Sun,
  FileText,
  Archive,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useStripe } from '../../hooks/useStripe';
import { supabase } from '../../lib/supabase';
import SubscriptionStatus from '../../components/SubscriptionStatus';
import ProfileTab from '../../components/settings/ProfileTab';
import AccountTab from '../../components/settings/AccountTab';
import NotificationsTab from '../../components/settings/NotificationsTab';
import PrivacyTab from '../../components/settings/PrivacyTab';
import PreferencesTab from '../../components/settings/PreferencesTab';
import BillingTab from '../../components/settings/BillingTab';
import DataTab from '../../components/settings/DataTab';
import DeleteAccountModal from '../../components/settings/DeleteAccountModal';

const Settings: React.FC = () => {
  usePageTitle('Paramètres');
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { user, signOut, refreshUserData } = useAuth();
  const { isPremiumUser } = usePermissions();
  const { getSubscription } = useStripe();
  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'account', name: 'Compte', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Confidentialité', icon: Lock },
    { id: 'preferences', name: 'Préférences', icon: SettingsIcon },
    { id: 'billing', name: 'Facturation', icon: CreditCard },
    { id: 'data', name: 'Données', icon: Download }
  ];

  const handleSave = async (section: string, data: any) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Different handling based on section
      switch (section) {
        case 'profile':
          await updateProfile(data);
          break;
        case 'account':
          await updateAccount(data);
          break;
        case 'notifications':
          await updateNotifications(data);
          break;
        case 'privacy':
          await updatePrivacy(data);
          break;
        case 'preferences':
          await updatePreferences(data);
          break;
        default:
          throw new Error('Section non reconnue');
      }
      
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès !' });
      
      // Refresh user data after update
      await refreshUserData();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    const { error } = await supabase
      .from('users')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        avatar_url: data.avatarUrl
      })
      .eq('id', user?.id);

    if (error) throw error;
  };

  const updateAccount = async (data: any) => {
    if (data.newPassword) {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (error) throw error;
    }
  };

  const updateNotifications = async (data: any) => {
    // In a real app, this would update notification preferences in the database
    // For now, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const updatePrivacy = async (data: any) => {
    // In a real app, this would update privacy settings in the database
    // For now, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const updatePreferences = async (data: any) => {
    // In a real app, this would update user preferences in the database
    // For now, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would delete the user's account
      // For now, we'll just simulate success and sign out
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await signOut();
      navigate('/');
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du compte' });
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E1E1E] font-serif mb-2">
            Paramètres
          </h1>
          <p className="text-gray-600">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>

        {/* Message de feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#D4A5A5]/10 text-[#D4A5A5] border-r-2 border-[#D4A5A5]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#D4A5A5]'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <ProfileTab 
                user={user} 
                onSave={(data) => handleSave('profile', data)} 
                isLoading={isLoading} 
              />
            )}
            
            {activeTab === 'account' && (
              <AccountTab 
                onSave={(data) => handleSave('account', data)} 
                isLoading={isLoading}
                onDeleteAccount={() => setShowDeleteModal(true)}
              />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationsTab 
                onSave={(data) => handleSave('notifications', data)} 
                isLoading={isLoading} 
              />
            )}
            
            {activeTab === 'privacy' && (
              <PrivacyTab 
                onSave={(data) => handleSave('privacy', data)} 
                isLoading={isLoading} 
              />
            )}
            
            {activeTab === 'preferences' && (
              <PreferencesTab 
                onSave={(data) => handleSave('preferences', data)} 
                isLoading={isLoading} 
              />
            )}
            
            {activeTab === 'billing' && (
              <BillingTab 
                isPremiumUser={isPremiumUser()} 
              />
            )}
            
            {activeTab === 'data' && (
              <DataTab />
            )}
          </div>
        </div>
      </div>

      {/* Modal de suppression de compte */}
      <DeleteAccountModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Settings;