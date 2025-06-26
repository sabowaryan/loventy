# Loventy - Plateforme d'invitations de mariage

## Structure de la base de données

Ce document présente un résumé complet de la structure de la base de données Supabase utilisée par Loventy, une plateforme d'invitations de mariage électroniques.

### Système d'authentification et de permissions

#### Tables de base
- **users** : Profils utilisateurs liés aux comptes auth.users
  - Stocke les informations de base (nom, prénom, email, avatar)
  - Créé automatiquement lors de la confirmation d'email

- **roles** : Définition des rôles système et personnalisés
  - Rôles prédéfinis : admin, user, premium, guest
  - Attributs : nom, description, is_system

- **permissions** : Permissions granulaires par ressource/action
  - Format : `resource.action` (ex: invitations.create)
  - Attributs : nom, description, ressource, action

- **user_roles** : Attribution des rôles aux utilisateurs
  - Associe un utilisateur à un rôle avec date d'expiration optionnelle
  - Le rôle "user" est attribué automatiquement à l'inscription

- **role_permissions** : Permissions accordées à chaque rôle
  - Définit quelles permissions sont associées à quels rôles

#### Fonctions d'authentification
- **handle_new_user()** : Crée un profil utilisateur lors de l'inscription
- **handle_email_confirmation()** : Gère la confirmation d'email
- **assign_default_role()** : Attribue le rôle "user" par défaut
- **is_admin()** : Vérifie si l'utilisateur est administrateur
- **has_role_safe()** : Vérifie si l'utilisateur a un rôle spécifique
- **user_has_permission()** : Vérifie si l'utilisateur a une permission

### Gestion des invitations

#### Tables principales
- **invitations** : Stockage des invitations créées
  - Informations de base : titre, date, lieu, message
  - Statuts : draft, published, sent, archived
  - Paramètres de design et configuration

- **guests** : Stockage des invités
  - Informations de contact : nom, email, téléphone
  - Statut de réponse : pending, confirmed, declined
  - Lié à une invitation spécifique

- **invitation_guests_extended** : Informations supplémentaires sur les invités
  - Préférences alimentaires, accompagnant, relation
  - Informations de contact alternatives (WhatsApp, Telegram)

- **invitation_media** : Médias associés aux invitations
  - Photos, vidéos, logos
  - Types : couple_photo, background, gallery, logo

- **invitation_thank_you** : Messages de remerciement et livre d'or
  - Messages des invités
  - Modération avec approbation

- **invitation_rsvp_questions** : Questions personnalisées pour les RSVP
  - Types : text, choice, boolean
  - Options pour les questions à choix multiples

- **invitation_rsvp_answers** : Réponses aux questions RSVP
  - Réponses des invités aux questions personnalisées

#### Tables de modèles
- **template_categories** : Catégories de modèles
  - Classique, Moderne, Nature, Romantique
  - Attributs : nom, slug, icône, ordre d'affichage

- **invitation_templates** : Modèles d'invitation disponibles
  - Attributs : nom, description, catégorie, premium
  - Paramètres visuels : palette de couleurs, polices, options de mise en page

- **template_images** : Images associées aux modèles
  - Types : preview, background, detail
  - Ordre d'affichage

### Intégration Stripe

#### Tables de paiement
- **stripe_customers** : Lie les utilisateurs Supabase aux clients Stripe
  - Stocke l'ID client Stripe
  - Implémente la suppression douce (soft delete)

- **stripe_subscriptions** : Gère les données d'abonnement
  - Statuts : not_started, incomplete, trialing, active, past_due, canceled, etc.
  - Périodes d'abonnement et détails de paiement
  - Implémente la suppression douce

- **stripe_orders** : Stocke les informations de commande/achat
  - Enregistre les sessions de paiement et les intentions de paiement
  - Suit les montants et statuts de paiement
  - Statuts : pending, completed, canceled

#### Vues pour Stripe
- **stripe_user_subscriptions** : Vue sécurisée pour les données d'abonnement
  - Joint les clients et les abonnements
  - Filtré par utilisateur authentifié

- **stripe_user_orders** : Vue sécurisée pour l'historique des commandes
  - Joint les clients et les commandes
  - Filtré par utilisateur authentifié

### Suivi d'utilisation et limites

#### Tables de suivi
- **email_logs** : Logs des emails envoyés
  - Types : invitation, reminder, confirmation, update
  - Suivi des statuts : sent, delivered, opened, clicked, failed

- **user_files** : Fichiers uploadés par les utilisateurs
  - Stocke les métadonnées des fichiers (nom, type, taille)
  - Chemin et URL du fichier

- **plan_usage** : Cache des statistiques d'utilisation
  - Nombre d'invitations, d'invités, d'emails envoyés
  - Stockage utilisé
  - Période de suivi (début/fin)

#### Fonctions de limites
- **calculate_user_usage()** : Calcule les statistiques d'utilisation
- **check_plan_limit()** : Vérifie si une action respecte les limites du plan

### Vues pour l'analyse

- **template_details** : Modèles avec catégories et statistiques
- **invitation_details** : Invitations avec statistiques d'invités
- **guest_details** : Invités avec informations étendues
- **media_details** : Médias d'invitation avec informations sur les fichiers
- **user_template_stats** : Statistiques utilisateur par modèle
- **user_usage_stats** : Statistiques d'utilisation par utilisateur

### Sécurité et Row Level Security (RLS)

Toutes les tables sont protégées par RLS avec des politiques spécifiques :

- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les administrateurs ont accès à toutes les données
- Certaines tables (modèles, catégories) sont accessibles publiquement en lecture seule
- Les invités ont un accès limité pour répondre aux invitations

### Optimisations de performance

- Indexes sur les clés étrangères et les colonnes fréquemment filtrées
- Vues matérialisées pour les requêtes complexes
- Fonctions optimisées pour éviter les appels récursifs
- Utilisation de SECURITY DEFINER pour les fonctions critiques

### Fonctions utilitaires

- **search_templates()** : Recherche de modèles avec filtres
- **create_invitation_from_template()** : Création d'invitation à partir d'un modèle
- **duplicate_invitation()** : Duplication d'invitation existante
- **get_template_usage_stats()** : Statistiques d'utilisation des modèles
- **get_recommended_templates()** : Recommandation de modèles pour un utilisateur

## Modification de la base de données

Pour modifier la base de données, créez un nouveau fichier de migration dans le dossier `/supabase/migrations` avec un nom descriptif. Suivez ces bonnes pratiques :

1. Commencez par un commentaire explicatif des changements
2. Utilisez `IF EXISTS` ou `IF NOT EXISTS` pour éviter les erreurs
3. Mettez à jour les politiques RLS si nécessaire
4. Accordez les permissions appropriées
5. Testez vos modifications localement avant de les déployer

## Limites des plans

### Plan Découverte (Gratuit)
- 3 invitations par mois
- 50 invités maximum
- 2 modèles gratuits
- 10 MB de stockage
- 100 emails par mois

### Plan Essentiel (19,99€/mois)
- 25 invitations par mois
- 300 invités maximum
- 10 modèles premium
- 100 MB de stockage
- 1000 emails par mois

### Plan Prestige (39,99€/mois)
- Invitations illimitées
- Invités illimités
- Tous les modèles
- 1 GB de stockage
- Emails illimités
- Domaine personnalisé