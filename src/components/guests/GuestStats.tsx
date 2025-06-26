import React from 'react';
import { Heart, CheckCircle, Clock, X, TrendingUp, Users } from 'lucide-react';

interface GuestStatsProps {
  stats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    confirmationRate: number;
    bySide: Record<string, number>;
  };
}

const GuestStats: React.FC<GuestStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Confirmés</p>
            <p className="text-2xl font-bold text-primary">{stats.confirmed}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">En attente</p>
            <p className="text-2xl font-bold text-primary">{stats.pending}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <X className="h-5 w-5 text-red-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Déclinés</p>
            <p className="text-2xl font-bold text-primary">{stats.declined}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Heart className="h-5 w-5 text-secondary" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Taux réponse</p>
            <p className="text-2xl font-bold text-primary">{stats.confirmationRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestStats;