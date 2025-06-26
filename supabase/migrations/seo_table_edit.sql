-- Add seo_metadata_id to invitations table
ALTER TABLE public.invitations
ADD COLUMN seo_metadata_id uuid NULL;

ALTER TABLE public.invitations
ADD CONSTRAINT fk_invitations_seo_metadata
FOREIGN KEY (seo_metadata_id) REFERENCES public.seo_metadata(id)
ON DELETE SET NULL;

-- Add seo_metadata_id to invitation_templates table
ALTER TABLE public.invitation_templates
ADD COLUMN seo_metadata_id uuid NULL;

ALTER TABLE public.invitation_templates
ADD CONSTRAINT fk_invitation_templates_seo_metadata
FOREIGN KEY (seo_metadata_id) REFERENCES public.seo_metadata(id)
ON DELETE SET NULL;
