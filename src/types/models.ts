// src/types/models.ts
// Types pour les modèles d'invitation et tables connexes

export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InvitationTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id: string;
  is_premium: boolean;
  is_active: boolean;
  preview_image_url?: string;
  thumbnail_url?: string;
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  font_pairs: {
    heading: string;
    body: string;
  };
  layout_options: {
    layouts: string[];
  };
  default_settings: {
    layout: string;
    animation: string;
    showRSVP: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface TemplateImage {
  id: string;
  template_id: string;
  image_url: string;
  image_type: 'preview' | 'background' | 'detail';
  display_order: number;
  created_at: string;
}

interface InvitationTable {
  id: string;
  invitation_id: string;
  name: string;
  description?: string;
  capacity: number;
  is_vip: boolean;
  location_description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface InvitationGuestExtended {
  id: string;
  guest_id: string;
  table_id?: string;
  guest_type: 'solo' | 'couple' | 'family';
  dietary_restrictions?: string;
  plus_one: boolean;
  plus_one_name?: string;
  plus_one_email?: string;
  plus_one_phone?: string;
  whatsapp_number?: string;
  telegram_username?: string;
  age_group?: 'adult' | 'child' | 'infant';
  relationship?: string;
  side?: 'bride' | 'groom' | 'both';
  gift_registry_contribution: boolean;
  gift_description?: string;
  additional_notes?: string;
  created_at: string;
  updated_at: string;
}

interface InvitationMedia {
  id: string;
  invitation_id: string;
  user_id: string;
  media_type: 'couple_photo' | 'background' | 'gallery' | 'logo';
  file_id?: string;
  title?: string;
  description?: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface InvitationThankYou {
  id: string;
  invitation_id: string;
  guest_id?: string;
  message: string;
  author_name?: string;
  author_email?: string;
  is_public: boolean;
  is_approved: boolean;
  created_at: string;
}

interface InvitationRSVPQuestion {
  id: string;
  invitation_id: string;
  question: string;
  question_type: 'text' | 'choice' | 'boolean';
  options?: string[];
  is_required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface InvitationRSVPAnswer {
  id: string;
  question_id: string;
  guest_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationEvent {
  id: string;
  invitation_id: string;
  event_type: 'ceremony' | 'reception' | 'cocktail' | 'dinner' | 'party' | 'other';
  title: string;
  event_time: string;
  location_name: string;
  address: string;
  description?: string;
  plan_b_location_name?: string;
  plan_b_address?: string;
  plan_b_description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface InvitationQuiz {
  id: string;
  invitation_id: string;
  title: string;
  description?: string;
  is_active: boolean;
  reward_message?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'true_false';
  options?: any;
  correct_answer?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface QuizAnswer {
  id: string;
  question_id: string;
  guest_id: string;
  answer_text?: string;
  is_correct?: boolean;
  answered_at: string;
  created_at: string;
}

export interface SocialWallPost {
  id: string;
  invitation_id: string;
  guest_id?: string;
  author_name?: string;
  post_text?: string;
  media_url?: string;
  post_type: 'text' | 'photo' | 'video' | 'gif';
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialWallComment {
  id: string;
  post_id: string;
  guest_id?: string;
  author_name?: string;
  comment_text: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface SocialWallReaction {
  id: string;
  post_id?: string;
  comment_id?: string;
  guest_id?: string;
  reaction_type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
  created_at: string;
}

// Types pour les vues
export interface TemplateDetails extends InvitationTemplate {
  category_name: string;
  category_slug: string;
  category_icon?: string;
  usage_count: number;
  unique_users: number;
  total_views: number;
}

export interface InvitationDetails {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  template_name: string;
  is_premium_template: boolean;
  bride_name: string;
  groom_name: string;
  event_date: string;
  event_time: string;
  venue: string;
  address: string;
  message: string;
  dress_code: string;
  rsvp_deadline: string;
  status: 'draft' | 'published' | 'sent' | 'archived';
  view_count: number;
  last_viewed_at: string;
  created_at: string;
  updated_at: string;
  total_guests: number;
  confirmed_guests: number;
  pending_guests: number;
  declined_guests: number;
  confirmation_rate: number;
  table_count: number;
  media_count: number;
  thank_you_count: number;
  rsvp_question_count: number;
}

interface TableDetails {
  id: string;
  invitation_id: string;
  invitation_title: string;
  name: string;
  description?: string;
  capacity: number;
  is_vip: boolean;
  location_description?: string;
  notes?: string;
  assigned_guests: number;
  available_seats: number;
  confirmed_guests: number;
  pending_guests: number;
  declined_guests: number;
}

export interface GuestDetails {
  id: string;
  invitation_id: string;
  invitation_title: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'declined';
  response_message?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  table_id?: string;
  table_name?: string;
  guest_type: 'solo' | 'couple' | 'family';
  dietary_restrictions?: string;
  plus_one: boolean;
  plus_one_name?: string;
  plus_one_email?: string;
  plus_one_phone?: string;
  whatsapp_number?: string;
  telegram_username?: string;
  age_group?: 'adult' | 'child' | 'infant';
  relationship?: string;
  side?: 'bride' | 'groom' | 'both';
  gift_registry_contribution: boolean;
  gift_description?: string;
  additional_notes?: string;
  answered_questions: number;
  guest_group?: string;
  is_vip?: boolean;
  special_access_code?: string;
}

interface MediaDetails {
  id: string;
  invitation_id: string;
  invitation_title: string;
  user_id: string;
  media_type: 'couple_photo' | 'background' | 'gallery' | 'logo';
  file_id?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file_url?: string;
  title?: string;
  description?: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// Nouvelle interface pour les paramètres de design d'invitation
export interface InvitationDesignSettings {
  layout: 'vertical' | 'horizontal';
  colorPaletteId: string;
  fontFamilyId: string;
  sections: {
    hero: SectionDesign;
    details: SectionDesign;
    rsvp: SectionDesign;
    welcome: SectionDesign;
    program: SectionDesign;
    honeymoon: SectionDesign;
    music: SectionDesign;
    interactive: SectionDesign;
    contact: SectionDesign;
    policies: SectionDesign;
    additional: SectionDesign;
  };
  animations: {
    enabled: boolean;
    type: 'fade' | 'slide' | 'zoom' | 'none';
  };
  borders: {
    style: 'none' | 'solid' | 'dashed' | 'dotted';
    width: number;
    color: string | null;
  };
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface SectionDesign {
  style: 'classic' | 'modern' | 'rustic' | 'romantic';
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  backgroundImageWidth?: number | null; // New
  backgroundImageHeight?: number | null; // New
  backgroundPattern: string | null;
  backgroundOpacity: number;
  backgroundFit?: 'cover' | 'contain';
  coupleImageUrl?: string | null;
  coupleImageWidth?: number | null; // New
  coupleImageHeight?: number | null; // New
  coupleImageShape?: 'original' | 'rounded' | 'circle' | 'heart';
  coupleImageFit?: 'cover' | 'contain';
  visible?: boolean;
  decorativeElementUrl?: string | null;
  decorativeElementWidth?: number | null; // New
  decorativeElementHeight?: number | null; // New
}

export interface ExtendedInvitationData {
  id: string;
  title: string;
  templateId: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  address: string;
  message: string;
  dressCode: string;
  rsvpDate: string;
  status: 'draft' | 'published' | 'sent' | 'archived';
  
  // Informations de contact
  phoneContact: string;
  emailContact: string;
  weddingWebsite: string;
  registryLink: string;
  additionalInfo: string;
  
  // Nouveaux champs
  announcementTitle?: string;
  formalMessageIntro?: string;
  hostName?: string;
  contactPersonName?: string;
  
  // Informations de transport
  parkingInfo?: string;
  publicTransportInfo?: string;
  shuttleInfo?: string;
  
  // Hébergement
  accommodationSuggestions?: Array<{name: string, url: string, description: string, price: string}>;
  preferredHotelName?: string;
  preferredHotelCode?: string;
  
  // Politiques
  childrenPolicy: 'welcome' | 'not_admitted' | 'limited';
  giftPolicy?: string;
  
  // Cagnotte lune de miel
  honeymoonFundEnabled: boolean;
  honeymoonFundMessage?: string;
  honeymoonFundTargetAmount?: number;
  
  // Message du couple
  coupleMessageType?: 'video' | 'audio' | 'text';
  coupleMessageContent?: string;
  coupleValuesStatement?: string;
  coupleQuote?: string;
  
  // Musique et divertissement
  playlistUrl?: string;
  allowSongSuggestions: boolean;
  
  // Fonctionnalités interactives
  countdownEnabled: boolean;
  quizEnabled: boolean;
  socialWallEnabled: boolean;
  socialWallModerationEnabled: boolean;
  virtualKeepsakeEnabled: boolean;
  
}

