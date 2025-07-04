import { Guest, WeddingData } from '../lib/database';

// Wedding data types and default values
export interface WeddingDetails {
  id: string;
  groomName: string;
  brideName: string;
  couplePhoto: string;
  weddingDate: {
    day: string;
    month: string;
    year: string;
    dayOfWeek: string;
    time: string;
  };
  ceremony: {
    time: string;
    venue: string;
    address: string;
  };
  reception: {
    time: string;
    venue: string;
    address: string;
  };
}

export interface GuestInfo {
  name: string;
  table: string;
}

export interface DrinkOptions {
  alcoholic: string[];
  nonAlcoholic: string[];
}

export interface WeddingTexts {
  welcome: {
    invitationMessage: string;
  };
  invitation: {
    title: string;
    personalTitle: string;
    guestLabel: string;
    tableLabel: string;
    loveQuote: string;
    mainMessage: string;
    dateMessage: string;
  };
  program: {
    title: string;
    ceremonyTitle: string;
    receptionTitle: string;
    welcomeMessage: string;
  };
  guestbook: {
    title: string;
    subtitle: string;
    placeholder: string;
    saveButton: string;
  };
  preferences: {
    title: string;
    subtitle: string;
    description: string;
    limitation: string;
    alcoholicTitle: string;
    nonAlcoholicTitle: string;
  };
  cancellation: {
    title: string;
    description: string;
    timeLimit: string;
    cancelButton: string;
    modalTitle: string;
    modalMessage: string;
    keepButton: string;
    confirmButton: string;
    successMessage: string;
  };
}

export interface WeddingSection {
  id: string;
  title: string;
  background: string;
}

// Default data
export const weddingDetails: WeddingData = {
  id: '',
  groom_name: "Isaac",
  bride_name: "Feza",
  couple_photo: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  wedding_day: "09",
  wedding_month: "NOVEMBRE",
  wedding_year: "2024",
  wedding_day_of_week: "SAMEDI",
  wedding_time: "15:30",
  ceremony_time: "15h30",
  ceremony_venue: "Église ciel ouvert",
  ceremony_address: "Av. KONGAWI n°12, Q/Kinsuka-pecheur, C/Ngaliema",
  reception_time: "20h00",
  reception_venue: "Salle de fête food market (macampagne)",
  reception_address: "Av.Nguma, Réf. église Catholique saint Luc"
};

export const guestInfo: Guest = {
  id: '',
  wedding_id: '',
  name: "Monsieur et Madame MUKENDI",
  table_name: "Table Marbre",
  email: '',
  rsvp_status: 'pending',
  invitation_link: '',
  message_sender: ''
};

export const drinkOptions: DrinkOptions = {
  alcoholic: ['Bière', 'Vin rouge', 'Vin blanc', 'Champagne', 'Whisky', 'Vodka'],
  nonAlcoholic: ['Eau', 'Jus de fruits', 'Soda', 'Café', 'Thé', 'Jus de gingembre']
};

export const weddingTexts: WeddingTexts = {
  welcome: {
    invitationMessage: "Request the pleasure of your company at the ceremony of their wedding"
  },
  invitation: {
    title: "Notre Invitation",
    personalTitle: "Votre Invitation Personnalisée",
    guestLabel: "Invité(e) :",
    tableLabel: "Table :",
    loveQuote: "Parce que notre amour est fort et sincère, Parce qu'il mérite d'être célébré.",
    mainMessage: "Isaac et Feza ont le plaisir de vous inviter à leur mariage religieux 💍 accompagné d'une soirée festive 🥂",
    dateMessage: "Le samedi 09 Novembre 2024"
  },
  program: {
    title: "Programme de la Journée",
    ceremonyTitle: "Bénédiction Nuptiale",
    receptionTitle: "Soirée Dansante",
    welcomeMessage: "Cordiale Bienvenue ✨"
  },
  guestbook: {
    title: "Livre d'or",
    subtitle: "Laissez un petit mot aux mariés pour immortaliser ce moment",
    placeholder: "Écrivez votre message ici...",
    saveButton: "Enregistrer le message"
  },
  preferences: {
    title: "Vos Préférences",
    subtitle: "Que désirez-vous boire 🍻 ?",
    description: "Aidez les mariés dans la planification en suggérant vos goûts",
    limitation: "(Deux choix maximum par catégorie)",
    alcoholicTitle: "Boissons alcoolisées",
    nonAlcoholicTitle: "Boissons non alcoolisées"
  },
  cancellation: {
    title: "Annulation d'invitation",
    description: "En cas d'indisponibilité, cliquez sur le bouton ci-dessous pour annuler votre invitation",
    timeLimit: "4 jours avant la manifestation",
    cancelButton: "Annuler l'invitation",
    modalTitle: "Annuler l'invitation",
    modalMessage: "Êtes-vous sûr de vouloir annuler votre invitation ? Cette action ne peut pas être annulée.",
    keepButton: "Garder l'invitation",
    confirmButton: "Confirmer l'annulation",
    successMessage: "Invitation annulée avec succès"
  }
};

export const weddingSections: WeddingSection[] = [
  {
    id: 'welcome',
    title: 'Bienvenue',
    background: 'url("https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
  },
  {
    id: 'invitation',
    title: 'Invitation',
    background: 'url("https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
  },
  {
    id: 'program',
    title: 'Programme',
    background: 'url("https://images.pexels.com/photos/169192/pexels-photo-169192.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
  },
  {
    id: 'guestbook',
    title: 'Livre d\'or',
    background: 'url("https://images.pexels.com/photos/207907/pexels-photo-207907.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
  },
  {
    id: 'preferences',
    title: 'Préférences',
    background: 'url("https://images.pexels.com/photos/56005/fiji-beach-sand-palm-trees-56005.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
  },
  {
    id: 'cancellation',
    title: 'Annulation',
    background: 'url("https://images.pexels.com/photos/1172675/pexels-photo-1172675.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
  }
]; 