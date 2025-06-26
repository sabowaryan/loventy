import React, { useState, useEffect } from 'react';
import { Crown, Download, CreditCard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStripe } from '../../hooks/useStripe';
import SubscriptionStatus from '../../components/SubscriptionStatus';

interface BillingTabProps {
  isPremiumUser: boolean;
}

const BillingTab: React.FC<BillingTabProps> = ({ isPremiumUser }) => {
  const { getOrders } = useStripe();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orderData = await getOrders();
        setOrders(orderData || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [getOrders]);

  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return 'Date inconnue';
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | null | undefined, currency: string | null | undefined) => {
    if (!amount) return 'Prix indisponible';
    
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency?.toUpperCase() || 'EUR'
      }).format(amount / 100);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${(amount / 100).toFixed(2)} €`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Subscription Status Component */}
      <SubscriptionStatus />

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Historique de facturation</h3>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4A5A5]" />
            </div>
          ) : orders && orders.length > 0 ? (
            orders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-[#1E1E1E]">{order.checkout_session_id || `Commande #${index + 1}`}</div>
                  <div className="text-sm text-gray-600">{order.order_date ? formatDate(order.order_date) : 'Date inconnue'}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-[#1E1E1E]">
                      {formatCurrency(order.amount_total, order.currency)}
                    </div>
                    <div className="text-sm text-green-600">{order.payment_status || 'Statut inconnu'}</div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-[#D4A5A5] transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune facture disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Prompt */}
      {!isPremiumUser && (
        <div className="bg-gradient-to-r from-[#D4A5A5] to-[#C5D2C2] rounded-lg p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="font-semibold mb-1 flex items-center">
                <Crown className="h-4 w-4 mr-2" />
                Passez Premium
              </h4>
              <p className="text-sm opacity-90">
                Débloquez plus de fonctionnalités et augmentez vos limites
              </p>
            </div>
            <Link
              to="/pricing"
              className="bg-white text-[#D4A5A5] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
            >
              Voir les plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingTab;