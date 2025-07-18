/**
 * Utilitaires pour les filtres d'événements dans l'interface d'administration
 */

import { FilterOption, EventStatus, EventStatusColor, ContentType, ModerationStatus } from '../types/admin';

/**
 * Options pour les types de contenu dans la modération
 */
export const contentTypeOptions: FilterOption[] = [
  { value: 'all', label: 'Tous les types' },
  { value: 'event', label: 'Événements' },
  { value: 'message', label: 'Messages' },
  { value: 'image', label: 'Images' },
  { value: 'profile', label: 'Profils' },
];

/**
 * Options pour les statuts de modération
 */
export const moderationStatusOptions: FilterOption[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Rejeté' },
  { value: 'flagged', label: 'Signalé' },
];

/**
 * Options pour les statuts d'événements
 */
export const eventStatusOptions: FilterOption[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'active', label: 'Actif' },
  { value: 'completed', label: 'Terminé' },
  { value: 'flagged', label: 'Signalé' },
  { value: 'suspended', label: 'Suspendu' },
];

/**
 * Options pour le tri des événements
 */
export const sortOptions: FilterOption[] = [
  { value: 'event_date', label: 'Date de l\'événement' },
  { value: 'created_at', label: 'Date de création' },
  { value: 'title', label: 'Titre' },
  { value: 'guest_count', label: 'Nombre d\'invités' },
  { value: 'owner_name', label: 'Propriétaire' },
];

/**
 * Options pour la direction du tri
 */
export const sortDirectionOptions: FilterOption[] = [
  { value: 'desc', label: 'Décroissant' },
  { value: 'asc', label: 'Croissant' },
];

/**
 * Options pour la taille des pages
 */
export const pageSizeOptions: FilterOption[] = [
  { value: '10', label: '10 par page' },
  { value: '25', label: '25 par page' },
  { value: '50', label: '50 par page' },
  { value: '100', label: '100 par page' },
];

/**
 * Obtient la couleur associée à un statut d'événement
 * @param status Statut de l'événement
 * @returns Couleur correspondante
 */
export const getEventStatusColor = (status: EventStatus): EventStatusColor => {
  switch (status) {
    case 'active':
      return 'green';
    case 'completed':
      return 'blue';
    case 'flagged':
      return 'red';
    case 'suspended':
      return 'yellow';
    default:
      return 'blue';
  }
};

/**
 * Obtient la couleur associée à un statut de modération
 * @param status Statut de modération
 * @returns Couleur correspondante
 */
export const getModerationStatusColor = (status: ModerationStatus): string => {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    case 'flagged':
      return 'red';
    default:
      return 'gray';
  }
};

/**
 * Obtient la couleur associée à un type de contenu
 * @param contentType Type de contenu
 * @returns Couleur correspondante
 */
export const getContentTypeColor = (contentType: ContentType): string => {
  switch (contentType) {
    case 'event':
      return 'blue';
    case 'message':
      return 'green';
    case 'image':
      return 'purple';
    case 'profile':
      return 'indigo';
    default:
      return 'gray';
  }
};

/**
 * Obtient le libellé français d'un statut d'événement
 * @param status Statut de l'événement
 * @returns Libellé en français
 */
export const getEventStatusLabel = (status: EventStatus): string => {
  switch (status) {
    case 'active':
      return 'Actif';
    case 'completed':
      return 'Terminé';
    case 'flagged':
      return 'Signalé';
    case 'suspended':
      return 'Suspendu';
    default:
      return 'Inconnu';
  }
};

/**
 * Obtient le libellé français d'un type de contenu
 * @param contentType Type de contenu
 * @returns Libellé en français
 */
export const getContentTypeLabel = (contentType: ContentType): string => {
  switch (contentType) {
    case 'all':
      return 'Tous les types';
    case 'event':
      return 'Événement';
    case 'message':
      return 'Message';
    case 'image':
      return 'Image';
    case 'profile':
      return 'Profil';
    default:
      return 'Inconnu';
  }
};

/**
 * Obtient le libellé français d'un statut de modération
 * @param status Statut de modération
 * @returns Libellé en français
 */
export const getModerationStatusLabel = (status: ModerationStatus): string => {
  switch (status) {
    case 'all':
      return 'Tous les statuts';
    case 'pending':
      return 'En attente';
    case 'approved':
      return 'Approuvé';
    case 'rejected':
      return 'Rejeté';
    case 'flagged':
      return 'Signalé';
    default:
      return 'Inconnu';
  }
};

/**
 * Formate une date pour l'affichage
 * @param date Date à formater
 * @returns Date formatée
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formate une date et heure pour l'affichage
 * @param date Date à formater
 * @returns Date et heure formatées
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formate une durée relative (ex: "il y a 2 heures")
 * @param date Date à comparer avec maintenant
 * @returns Durée relative formatée
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'À l\'instant';
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 30) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateObj);
  }
};

/**
 * Valide une plage de dates
 * @param startDate Date de début
 * @param endDate Date de fin
 * @returns True si la plage est valide
 */
export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate;
};

/**
 * Crée une plage de dates pour les filtres
 * @param period Période prédéfinie
 * @returns Plage de dates
 */
export const createDateRange = (period: 'today' | 'week' | 'month' | 'year'): { start: Date; end: Date } => {
  const now = new Date();
  const start = new Date();
  const end = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
};

/**
 * Débounce une fonction pour éviter les appels trop fréquents
 * @param func Fonction à débouncer
 * @param wait Délai d'attente en millisecondes
 * @returns Fonction débouncée
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};