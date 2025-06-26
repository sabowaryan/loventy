import React, { useState, useEffect } from 'react';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionStatus: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { getSubscription, cancelSubscription, updatePaymentMethod } = useStripe();

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (err) {
      console.error('Error loading subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await cancelSubscription();
      setSuccess('Votre abonnement sera annulé à la fin de la période de facturation.');
      await loadSubscription(); // Recharger les données d'abonnement
      setShowCancelModal(false);
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Impossible d\'annuler l\'abonnement. Veuillez réessayer plus tard.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      await updatePaymentMethod();
      // La redirection se fait automatiquement
    } catch (err) {
      console.error('Error updating payment method:', err);
      setError('Impossible de mettre à jour le mode de paiement. Veuillez réessayer plus tard.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'past_due':
        return 'text-amber-600';
      case 'canceled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'past_due':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'canceled':
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Crown className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-primary">Plan Gratuit</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Vous utilisez actuellement le plan gratuit avec des fonctionnalités limitées.
        </p>
        <a href="/pricing" className="btn-accent">
          Passer Premium
        </a>
      </div>
    );
  }

  return (
    <div className="card">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon(subscription.subscription_status || 'unknown')}
        <h3 className="text-lg font-semibold text-primary">Abonnement Premium</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Statut:</span>
          <span className={`font-medium capitalize ${getStatusColor(subscription.subscription_status || 'unknown')}`}>
            {subscription.subscription_status === 'active' ? 'Actif' : 
             subscription.subscription_status === 'past_due' ? 'Paiement en retard' :
             subscription.subscription_status === 'canceled' ? 'Annulé' :
             subscription.subscription_status || 'Inconnu'}
          </span>
        </div>
        
        {subscription.current_period_end && (
          <div className="flex justify-between">
            <span className="text-gray-600">
              {subscription.cancel_at_period_end ? 'Se termine le:' : 'Renouvellement:'}
            </span>
            <span className="font-medium">
              {formatDate(subscription.current_period_end)}
            </span>
          </div>
        )}
        
        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Paiement:</span>
            <span className="font-medium capitalize">
              {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
            </span>
          </div>
        )}
      </div>
      
      {subscription.cancel_at_period_end && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            Votre abonnement sera annulé à la fin de la période de facturation.
          </p>
        </div>
      )}

      {subscription.subscription_status === 'active' && !subscription.cancel_at_period_end && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => handleUpdatePayment()}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <CreditCard className="h-4 w-4 mr-2 inline-block" />
            <span>Mettre à jour le paiement</span>
          </button>
          
          <button 
            onClick={() => setShowCancelModal(true)}
            className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            <X className="h-4 w-4 mr-2 inline-block" />
            <span>Annuler l'abonnement</span>
          </button>
        </div>
      )}

      {/* Modal de confirmation d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-primary mb-4">Confirmer l'annulation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler votre abonnement ? Vous aurez toujours accès aux fonctionnalités premium jusqu'au {formatDate(subscription.current_period_end)}.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Traitement...</span>
                  </div>
                ) : (
                  <span>Confirmer l'annulation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;