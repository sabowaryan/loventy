import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Save, Loader2, Shield, Smartphone, Clock, MapPin, Laptop, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AccountTabProps {
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
  onDeleteAccount: () => void;
}

interface Session {
  id: string;
  created_at: string;
  last_active: string;
  device: string;
  browser: string;
  location: string;
  ip_address: string;
  current: boolean;
}

const AccountTab: React.FC<AccountTabProps> = ({ onSave, isLoading, onDeleteAccount }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showTwoFactorForm, setShowTwoFactorForm] = useState(false);
  const [showSessionsForm, setShowSessionsForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch active sessions
  useEffect(() => {
    if (showSessionsForm) {
      fetchSessions();
    }
  }, [showSessionsForm]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use mock data
      const mockSessions: Session[] = [
        {
          id: '1',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          last_active: new Date().toISOString(),
          device: 'Desktop',
          browser: 'Chrome',
          location: 'Paris, France',
          ip_address: '192.168.1.1',
          current: true
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
          last_active: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          device: 'Mobile',
          browser: 'Safari',
          location: 'Lyon, France',
          ip_address: '192.168.1.2',
          current: false
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
          last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
          device: 'Tablet',
          browser: 'Firefox',
          location: 'Marseille, France',
          ip_address: '192.168.1.3',
          current: false
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Handle password mismatch error
      return;
    }
    
    await onSave({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    // Reset form on success
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // In a real app, this would call an API to revoke the session
      console.log(`Revoking session ${sessionId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      // In a real app, this would call an API to revoke all other sessions
      console.log('Revoking all other sessions');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state - keep only current session
      setSessions(prev => prev.filter(session => session.current));
    } catch (error) {
      console.error('Error revoking all sessions:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
    } else if (diffHour > 0) {
      return `il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
    } else if (diffMin > 0) {
      return `il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    } else {
      return 'à l\'instant';
    }
  };

  const getPasswordStrength = () => {
    const password = passwordData.newPassword;
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Fort', color: 'bg-green-500' };
    }
    return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="space-y-8">
      {/* Sécurité du compte */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Sécurité du compte</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Mot de passe</h4>
              <p className="text-sm text-gray-600">Dernière modification il y a 3 mois</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-4 py-2 border border-[#D4A5A5] text-[#D4A5A5] rounded-lg hover:bg-[#D4A5A5]/5 transition-colors"
            >
              {showPasswordForm ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Force du mot de passe</span>
                      <span className={`font-medium ${
                        passwordStrength.strength === 1 ? 'text-red-600' :
                        passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 transition-colors ${
                      passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#D4A5A5]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.currentPassword || !passwordData.newPassword}
                  className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Authentification à deux facteurs</h4>
              <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
            </div>
            <button 
              onClick={() => setShowTwoFactorForm(!showTwoFactorForm)}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Configurer
            </button>
          </div>

          {showTwoFactorForm && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-[#1E1E1E]">Authentification par application</h4>
                  <p className="text-sm text-gray-600">Utilisez une application comme Google Authenticator ou Authy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-[#1E1E1E]">Authentification par SMS</h4>
                  <p className="text-sm text-gray-600">Recevez un code par SMS à chaque connexion</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Cette fonctionnalité sera bientôt disponible. Nous travaillons actuellement à son implémentation pour renforcer la sécurité de votre compte.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTwoFactorForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-[#1E1E1E]">Sessions actives</h4>
              <p className="text-sm text-gray-600">Gérez vos sessions de connexion</p>
            </div>
            <button 
              onClick={() => setShowSessionsForm(!showSessionsForm)}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showSessionsForm ? 'Masquer' : 'Voir tout'}
            </button>
          </div>

          {showSessionsForm && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-[#1E1E1E]">Vos sessions actives</h4>
                <button
                  onClick={handleRevokeAllOtherSessions}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Déconnecter toutes les autres sessions
                </button>
              </div>
              
              {isLoadingSessions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4A5A5]" />
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map(session => (
                    <div key={session.id} className={`p-4 border rounded-lg ${session.current ? 'border-[#D4A5A5] bg-[#D4A5A5]/5' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            session.device === 'Desktop' ? 'bg-blue-100' :
                            session.device === 'Mobile' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {session.device === 'Desktop' ? (
                              <Laptop className={`h-5 w-5 ${
                                session.device === 'Desktop' ? 'text-blue-600' :
                                session.device === 'Mobile' ? 'text-green-600' : 'text-purple-600'
                              }`} />
                            ) : (
                              <Smartphone className={`h-5 w-5 ${
                                session.device === 'Desktop' ? 'text-blue-600' :
                                session.device === 'Mobile' ? 'text-green-600' : 'text-purple-600'
                              }`} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h5 className="font-medium text-[#1E1E1E]">
                                {session.browser} sur {session.device}
                              </h5>
                              {session.current && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-[#D4A5A5]/20 text-[#D4A5A5] rounded-full">
                                  Session actuelle
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                <span>{session.location}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>Actif {getTimeSince(session.last_active)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Connecté le {formatDate(session.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        {!session.current && (
                          <button
                            onClick={() => handleRevokeSession(session.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Révoquer cette session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  Si vous ne reconnaissez pas une session, déconnectez-la immédiatement et changez votre mot de passe.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone de danger */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-6">Zone de danger</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-800">Supprimer le compte</h4>
              <p className="text-sm text-red-600">Cette action est irréversible</p>
            </div>
            <button
              onClick={onDeleteAccount}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;