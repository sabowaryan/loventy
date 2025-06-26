import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { getProductByPriceId } from '../stripe-config';
import { usePageTitle } from '../hooks/usePageTitle';

const SuccessPage: React.FC = () => {
  usePageTitle('Paiement réussi');
  
  const [searchParams] = useSearchParams();
  const { getSubscription } = useStripe();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const planPriceId = searchParams.get('plan');
  const product = planPriceId ? getProductByPriceId(planPriceId) : null;

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const sub = await getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    // Wait a moment for the webhook to process
    const timer = setTimeout(loadSubscription, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">
            Finalisation de votre abonnement...
          </h2>
          <p className="text-gray-600">
            Nous mettons à jour votre compte, veuillez patienter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-primary mb-4 font-serif">
            Paiement réussi !
          </h1>
          
          {product && (
            <div className="bg-secondary/10 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Crown className="h-5 w-5 text-secondary" />
                <span className="font-semibold text-secondary">{product.name}</span>
              </div>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          )}
          
          <p className="text-gray-600 mb-8">
            Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.
          </p>

          {subscription && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-primary mb-2">Détails de l'abonnement</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Statut: <span className="capitalize font-medium">{subscription.subscription_status}</span></p>
                {subscription.current_period_end && (
                  <p>
                    Prochain renouvellement: {' '}
                    <span className="font-medium">
                      {new Date(subscription.current_period_end * 1000).toLocaleDateString('fr-FR')}
                    </span>
                  </p>
                )}
                {subscription.payment_method_brand && subscription.payment_method_last4 && (
                  <p>
                    Méthode de paiement: {' '}
                    <span className="font-medium capitalize">
                      {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full btn-accent inline-flex items-center justify-center"
            >
              Accéder au tableau de bord
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            
            <Link
              to="/templates"
              className="w-full btn-secondary inline-flex items-center justify-center"
            >
              Créer une invitation
            </Link>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Besoin d'aide ? {' '}
            <a href="mailto:support@loventy.com" className="text-secondary hover:underline">
              Contactez notre support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;