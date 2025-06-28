export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  mode: 'subscription' | 'payment';
  features: string[];
  limits: {
    invitations: number;
    guests: number;
    templates: number;
    storage: number; // in MB
    emailsPerMonth: number;
    customDomain: boolean;
    analytics: boolean;
    support: 'basic' | 'priority' | 'dedicated';
  };
  popular?: boolean;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  buttonColor?: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SU6j0JE6Csfvh8',
    priceId: 'price_1RZ8WFAmXOVRZkyi8pzlw8Gr',
    name: 'Loventy-Decouverte',
    description: 'Parfait pour commencer',
    price: 0.00,
    mode: 'subscription',
    features: [
      '2 modèles gratuits',
      '3 invitations par mois',
      '50 invités maximum',
      'Envoi par email uniquement',
      'Suivi RSVP basique',
      'Logo Loventy visible'
    ],
    limits: {
      invitations: 3,
      guests: 50,
      templates: 2,
      storage: 10,
      emailsPerMonth: 100,
      customDomain: false,
      analytics: false,
      support: 'basic'
    },
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    buttonColor: 'bg-gray-600',
    popular: false
  },
  {
    id: 'prod_SU6py0r0ukMf2z',
    priceId: 'price_1RZ8beAmXOVRZkyiLPc5T1N6',
    name: 'Loventy-Essentiel',
    description: 'Idéal pour les petits mariages',
    price: 19.99,
    mode: 'subscription',
    features: [
      '10 modèles premium',
      '25 invitations par mois',
      '300 invités maximum',
      'Tous les canaux d\'envoi',
      'Suppression du watermark',
      'Support prioritaire',
      'Export PDF des invitations',
      'Statistiques basiques'
    ],
    limits: {
      invitations: 25,
      guests: 300,
      templates: 10,
      storage: 100,
      emailsPerMonth: 1000,
      customDomain: false,
      analytics: true,
      support: 'priority'
    },
    color: 'text-[#D4A5A5]',
    bgColor: 'bg-[#D4A5A5]/5',
    borderColor: 'border-[#D4A5A5]',
    buttonColor: 'bg-[#D4A5A5]',
    popular: true
  },
  {
    id: 'prod_SU6tw5V8tpTC4a',
    priceId: 'price_1RZ8fpAmXOVRZkyizFbIXhpN',
    name: 'Loventy-Prestige',
    description: 'Pour les grands événements',
    price: 39.99,
    mode: 'subscription',
    features: [
      'Tous les modèles inclus',
      'Invitations illimitées',
      'Invités illimités',
      'Page personnalisée',
      'Relances automatiques',
      'RSVP avancé avec formulaires',
      'Analytics détaillées',
      'Support dédié',
      'API pour intégrations',
      'Domaine personnalisé'
    ],
    limits: {
      invitations: -1, // -1 = illimité
      guests: -1,
      templates: -1,
      storage: 1000,
      emailsPerMonth: -1,
      customDomain: true,
      analytics: true,
      support: 'dedicated'
    },
    color: 'text-[#C5D2C2]',
    bgColor: 'bg-[#C5D2C2]/5',
    borderColor: 'border-[#C5D2C2]',
    buttonColor: 'bg-[#C5D2C2]',
    popular: false
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

// Fonction pour obtenir les limites par défaut (plan gratuit)
export const getDefaultLimits = (): StripeProduct['limits'] => {
  return stripeProducts[0].limits; // Plan Découverte
};

// Fonction pour vérifier si une limite est illimitée
export const isUnlimited = (limit: number): boolean => {
  return limit === -1;
};

// Fonction pour formater les limites pour l'affichage
export const formatLimit = (limit: number, unit: string = ''): string => {
  if (isUnlimited(limit)) {
    return 'Illimité';
  }
  return `${limit}${unit}`;
};