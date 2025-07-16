# Document de Conception - Gestion d'Événements et d'Invitations

## Vue d'Ensemble

Le système de gestion d'événements et d'invitations pour Loventy est une solution complète qui permet aux utilisateurs de créer, personnaliser et gérer des événements de mariage avec un système d'invitations numériques intégré. La solution s'appuie sur l'architecture existante React/TypeScript/Supabase pour offrir une expérience utilisateur fluide et sécurisée.

Le système couvre l'ensemble du cycle de vie d'un événement : de la création initiale à la gestion des réponses RSVP, en passant par la conception d'invitations personnalisées et l'envoi automatisé. L'accent est mis sur la simplicité d'utilisation, la sécurité des accès temporaires, et le suivi en temps réel des statistiques d'événement.

## Architecture

### Architecture Globale

Le système suit une architecture client-serveur avec les composants suivants :

- **Frontend React** : Interface utilisateur responsive avec TypeScript
- **Supabase Backend** : Base de données PostgreSQL avec authentification et RLS
- **Système de Tokens** : Génération et validation de tokens d'accès temporaires
- **Service Email** : Intégration pour l'envoi d'invitations automatisées
- **Stockage de Fichiers** : Gestion des images et templates d'invitations

### Flux de Données Principal

1. **Création d'Événement** : Utilisateur → Validation → Base de données
2. **Conception d'Invitation** : Éditeur → Aperçu temps réel → Sauvegarde
3. **Gestion des Invités** : Import/Ajout → Génération de tokens → Base de données
4. **Envoi d'Invitations** : Déclenchement → Génération de liens → Service email
5. **Réponses RSVP** : Invité → Validation de token → Mise à jour statistiques

### Sécurité et Accès

- **Authentification** : Supabase Auth pour les propriétaires d'événements
- **Tokens Temporaires** : JWT avec expiration pour les invités
- **RLS (Row Level Security)** : Isolation des données par utilisateur
- **Validation des Accès** : Vérification des permissions à chaque opération

## Composants et Interfaces

### 1. Gestion des Événements

**EventManager Component**
- Formulaire de création avec validation en temps réel
- Interface de modification des détails d'événement
- Gestion des paramètres de confidentialité et d'accès

**EventDashboard Component**
- Vue d'ensemble des statistiques d'événement
- Navigation vers les différentes sections de gestion
- Indicateurs de progression et alertes

### 2. Éditeur d'Invitations

**InvitationEditor Component**
- Interface drag-and-drop pour la personnalisation
- Bibliothèque de templates prédéfinis
- Aperçu en temps réel avec différentes tailles d'écran
- Système de sauvegarde automatique

**TemplateLibrary Component**
- Catalogue de modèles organisés par catégories
- Système de prévisualisation rapide
- Filtres et recherche par style/couleur

### 3. Gestion des Invités

**GuestManager Component**
- Interface d'ajout individuel et en lot
- Import CSV avec validation et mapping des colonnes
- Édition en ligne des informations d'invités
- Système de groupes et catégories

**GuestList Component**
- Tableau avec tri et filtrage avancé
- Indicateurs visuels de statut RSVP
- Actions en lot (suppression, réenvoi)
- Export des données

### 4. Système d'Invitations

**InvitationSender Component**
- Interface de configuration d'envoi
- Prévisualisation des emails
- Planification d'envoi différé
- Suivi des statuts de livraison

**InvitationView Component**
- Affichage optimisé pour mobile
- Interface RSVP intégrée
- Validation de tokens en temps réel
- Gestion des erreurs d'accès

### 5. Système RSVP

**RSVPForm Component**
- Interface simple et intuitive
- Gestion des accompagnants
- Validation côté client et serveur
- Confirmation visuelle des réponses

**RSVPTracker Component**
- Tableau de bord des réponses
- Statistiques en temps réel
- Système de rappels automatiques
- Export des données de réponse

## Modèles de Données

### Event
```typescript
interface Event {
  id: string;
  user_id: string; // Propriétaire de l'événement
  name: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  invitation_design: InvitationDesign;
  rsvp_deadline: Date;
  max_guests_per_invite: number;
  created_at: Date;
  updated_at: Date;
}
```

### Guest
```typescript
interface Guest {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  access_token: string;
  token_expires_at: Date;
  rsvp_status: 'pending' | 'accepted' | 'declined';
  guest_count: number;
  rsvp_date?: Date;
  invitation_sent_at?: Date;
  invitation_viewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### InvitationDesign
```typescript
interface InvitationDesign {
  id: string;
  event_id: string;
  template_id: string;
  custom_text: Record<string, string>;
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  images: {
    background?: string;
    couple_photo?: string;
    decorative_elements: string[];
  };
  layout_config: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
```

### RSVPResponse
```typescript
interface RSVPResponse {
  id: string;
  guest_id: string;
  event_id: string;
  status: 'accepted' | 'declined';
  guest_count: number;
  dietary_restrictions?: string;
  special_requests?: string;
  response_date: Date;
  updated_at: Date;
}
```

## Gestion des Erreurs

### Stratégie de Gestion d'Erreurs

1. **Validation Côté Client** : Validation immédiate des formulaires avec messages contextuels
2. **Gestion des Erreurs Réseau** : Retry automatique et messages d'erreur utilisateur-friendly
3. **Tokens Expirés** : Redirection vers page d'information avec contact organisateur
4. **Erreurs de Base de Données** : Logging détaillé et messages génériques pour l'utilisateur
5. **Limites de Quota** : Notifications proactives et options de mise à niveau

### Types d'Erreurs Spécifiques

- **EventCreationError** : Validation des données d'événement
- **TokenValidationError** : Vérification des accès invités
- **EmailDeliveryError** : Échecs d'envoi d'invitations
- **RSVPSubmissionError** : Problèmes de soumission de réponses
- **FileUploadError** : Erreurs d'import CSV ou d'images

## Stratégie de Tests

### Tests Unitaires
- Validation des modèles de données
- Logique de génération de tokens
- Fonctions utilitaires de formatage
- Composants React isolés

### Tests d'Intégration
- Flux complet de création d'événement
- Processus d'envoi d'invitations
- Cycle RSVP complet
- Intégration avec Supabase

### Tests End-to-End
- Parcours utilisateur complet
- Tests multi-navigateurs
- Tests de performance sur mobile
- Validation des emails envoyés

### Tests de Sécurité
- Validation des tokens d'accès
- Tests de permissions RLS
- Vérification des injections SQL
- Tests de charge sur les endpoints

## Décisions de Conception et Rationales

### 1. Utilisation de Tokens Temporaires
**Décision** : Génération de tokens JWT avec expiration pour l'accès des invités
**Rationale** : Permet un accès sécurisé sans création de comptes utilisateur, avec contrôle de la durée de validité

### 2. Architecture Basée sur les Composants React
**Décision** : Découpage en composants réutilisables avec hooks personnalisés
**Rationale** : Facilite la maintenance, les tests, et permet la réutilisation du code

### 3. Supabase pour le Backend
**Décision** : Utilisation de Supabase avec RLS pour la sécurité des données
**Rationale** : Cohérent avec l'architecture existante, RLS assure l'isolation des données

### 4. Éditeur d'Invitations en Temps Réel
**Décision** : Aperçu instantané des modifications avec sauvegarde automatique
**Rationale** : Améliore l'expérience utilisateur et réduit le risque de perte de données

### 5. Import CSV pour les Invités
**Décision** : Support de l'import en lot avec validation et mapping flexible
**Rationale** : Facilite la migration depuis d'autres outils et l'ajout de nombreux invités

### 6. Système de Statistiques en Temps Réel
**Décision** : Mise à jour automatique des statistiques via WebSockets ou polling
**Rationale** : Permet un suivi immédiat des réponses et une meilleure planification