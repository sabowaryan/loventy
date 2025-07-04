import React, { useState, useEffect } from 'react';
import { Check, Crown, Heart, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { stripeProducts, formatLimit } from '../stripe-config';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePlanLimits } from '../hooks/usePlanLimits';
import PricingCard from '../components/PricingCard';

const Pricing: React.FC = () => {
  usePageTitle('Tarifs');
  
  const { user } = useAuth();
  const { getSubscription, isLoading } = useStripe();
  const { limits } = usePlanLimits();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    if (user) {
      loadCurrentSubscription();
    } else {
      setLoadingSubscription(false);
    }
  }, [user]);

  const loadCurrentSubscription = async () => {
    try {
      const subscription = await getSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const isCurrentPlan = (priceId: string) => {
    return currentSubscription?.price_id === priceId && 
           currentSubscription?.subscription_status === 'active';
  };

  const getButtonText = (product: any) => {
    if (!user) {
      return product.price === 0 ? 'Commencer gratuitement' : 'S\'inscrire pour continuer';
    }

    if (isCurrentPlan(product.priceId)) {
      return 'Plan actuel';
    }

    if (product.price === 0) {
      return 'Plan gratuit';
    }

    return 'Choisir ce plan';
  };

  const faq = [
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.'
    },
    {
      question: 'Que se passe-t-il si je dépasse ma limite d\'invitations ?',
      answer: 'Vous recevrez une notification avant d\'atteindre votre limite. Vous pourrez alors upgrader votre plan ou attendre le mois suivant.'
    },
    {
      question: 'Les invitations restent-elles accessibles après résiliation ?',
      answer: 'Oui, vos invitations déjà envoyées restent accessibles à vos invités. Seule la création de nouvelles invitations sera limitée.'
    },
    {
      question: 'Proposez-vous des remises pour les abonnements annuels ?',
      answer: 'Oui, nous offrons 2 mois gratuits sur tous nos plans avec un abonnement annuel.'
    }
  ];

  return (
    <div className="min-h-screen bg-accent py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-serif">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des tarifs transparents pour tous vos besoins. Commencez gratuitement et évoluez selon vos projets.
          </p>
          {user && loadingSubscription && (
            <div className="mt-4 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Chargement de votre abonnement...</span>
            </div>
          )}
        </div>

        {/* Current Subscription Status */}
        {user && currentSubscription && !loadingSubscription && (
          <div className="card max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-primary mb-2">Votre abonnement actuel</h3>
              <div className="flex items-center justify-center space-x-2">
                <Crown className="h-5 w-5 text-secondary" />
                <span className="text-secondary font-medium">
                  {stripeProducts.find(p => p.priceId === currentSubscription.price_id)?.name || 'Plan personnalisé'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Statut: <span className="capitalize">{currentSubscription.subscription_status}</span>
              </p>
              {currentSubscription.current_period_end && (
                <p className="text-sm text-gray-600">
                  {currentSubscription.cancel_at_period_end ? 'Se termine le' : 'Renouvellement le'}: {' '}
                  {new Date(currentSubscription.current_period_end * 1000).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Usage Display for Current User */}
        {user && limits && (
          <div className="card max-w-4xl mx-auto mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4 text-center">Votre utilisation actuelle</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {limits.usage.invitations}
                </div>
                <div className="text-sm text-gray-600">
                  Invitations ce mois
                </div>
                <div className="text-xs text-gray-500">
                  Limite: {formatLimit((limits as any).invitations)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {limits.usage.guests}
                </div>
                <div className="text-sm text-gray-600">
                  Invités total
                </div>
                <div className="text-xs text-gray-500">
                  Limite: {formatLimit((limits as any).guests)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {limits.usage.emailsSent}
                </div>
                <div className="text-sm text-gray-600">
                  Emails envoyés
                </div>
                <div className="text-xs text-gray-500">
                  Limite: {formatLimit((limits as any).emailsPerMonth)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {limits.usage.storageUsed} MB
                </div>
                <div className="text-sm text-gray-600">
                  Stockage utilisé
                </div>
                <div className="text-xs text-gray-500">
                  Limite: {formatLimit((limits as any).storage, ' MB')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stripeProducts.map((product, index) => (
            <PricingCard
              key={product.id}
              title={product.name}
              price={product.price}
              priceId={product.priceId}
              features={product.features}
              popular={product.popular}
              description={product.description}
              buttonText={getButtonText(product)}
            />
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="card text-center mb-16">
          <Heart className="h-12 w-12 text-secondary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-primary mb-2">
            Garantie satisfait ou remboursé
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Essayez Loventy sans risque pendant 30 jours. Si vous n'êtes pas entièrement satisfait, 
            nous vous remboursons intégralement, sans question.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-primary text-center mb-12 font-serif">
            Questions fréquentes
          </h2>
          
          <div className="space-y-6">
            {faq.map((item, index) => (
              <div key={index} className="card">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-primary mb-4 font-serif">
            Prêt à créer votre première invitation ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez des milliers de couples qui ont choisi Loventy
          </p>
          <Link
            to="/templates"
            className="btn-accent shadow-lg"
          >
            Commencer maintenant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;