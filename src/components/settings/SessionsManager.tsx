import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, MapPin, Clock, Trash2, Loader2, Shield } from 'lucide-react';

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

interface SessionsManagerProps {
  onClose: () => void;
}

const SessionsManager: React.FC<SessionsManagerProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
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
        },
        {
          id: '4',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          last_active: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          device: 'Desktop',
          browser: 'Edge',
          location: 'Toulouse, France',
          ip_address: '192.168.1.4',
          current: false
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevoking(true);
    try {
      // In a real app, this would call an API to revoke the session
      console.log(`Revoking session ${sessionId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error revoking session:', error);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsRevoking(true);
    try {
      // In a real app, this would call an API to revoke all other sessions
      console.log('Revoking all other sessions');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state - keep only current session
      setSessions(prev => prev.filter(session => session.current));
    } catch (error) {
      console.error('Error revoking all sessions:', error);
    } finally {
      setIsRevoking(false);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] flex items-center">
          <Shield className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Sessions actives
        </h3>
        <button
          onClick={handleRevokeAllOtherSessions}
          disabled={isRevoking || sessions.filter(s => !s.current).length === 0}
          className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRevoking ? (
            <div className="flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span>Déconnexion...</span>
            </div>
          ) : (
            'Déconnecter toutes les autres sessions'
          )}
        </button>
      </div>
      
      {isLoading ? (
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
                    <p className="text-xs text-gray-500 mt-1">
                      IP: {session.ip_address}
                    </p>
                  </div>
                </div>
                
                {!session.current && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={isRevoking}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Révoquer cette session"
                  >
                    {isRevoking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          Si vous ne reconnaissez pas une session, déconnectez-la immédiatement et changez votre mot de passe.
        </p>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default SessionsManager;