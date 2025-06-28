/*
  # Ajout de la relation entre invitations et événements

  1. Nouvelles Relations
    - Ajout de la colonne `event_id` à la table `invitations`
    - Création d'une clé étrangère vers la table `event`
  
  2. Modifications
    - Rendre la colonne `event_id` nullable pour la migration
    - Ajouter une contrainte de clé étrangère avec suppression en cascade
*/

-- Ajouter la colonne event_id à la table invitations
ALTER TABLE public.invitations 
ADD COLUMN event_id UUID NULL;

-- Créer la contrainte de clé étrangère
ALTER TABLE public.invitations
ADD CONSTRAINT invitations_event_id_fkey
FOREIGN KEY (event_id)
REFERENCES public.event(id)
ON DELETE CASCADE;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX idx_invitations_event_id ON public.invitations(event_id);