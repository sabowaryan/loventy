import React, { useState } from 'react';
import { Check, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../hooks/useStripe';

interface PricingCardProps {
  title: string;
  price: number;
  priceId: string;
  features: string[];
  popular?: boolean;
  buttonText?: string;
  description?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  priceId,
  features,
  popular = false,
  buttonText = 'Choose Plan',
  description
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { createCheckoutSession } = useStripe();

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }

    setIsLoading(true);
    
    try {
      await createCheckoutSession({
        priceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success?plan=${priceId}`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative card hover:shadow-xl transition-all duration-200 ${
      popular ? 'scale-105 shadow-lg border-secondary' : ''
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="badge-secondary">
            Le plus populaire
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 ${
          popular ? 'bg-secondary/10' : 'bg-primary/10'
        } rounded-full mb-4`}>
          <Crown className={`h-8 w-8 ${popular ? 'text-secondary' : 'text-primary'}`} />
        </div>
        
        <h3 className="text-2xl font-bold text-primary mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        
        <div className="mb-6">
          <span className="text-4xl font-bold text-primary">{price}€</span>
          {price > 0 && (
            <span className="text-gray-600 ml-2">par mois</span>
          )}
        </div>
        
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`w-full ${
            popular ? 'btn-accent' : 'btn-primary'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Redirection...
            </div>
          ) : (
            buttonText
          )}
        </button>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-semibold text-primary mb-3">Fonctionnalités incluses:</h4>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`p-1 ${popular ? 'bg-secondary/10' : 'bg-primary/10'} rounded-full`}>
              <Check className={`h-4 w-4 ${popular ? 'text-secondary' : 'text-primary'}`} />
            </div>
            <span className="text-gray-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingCard;