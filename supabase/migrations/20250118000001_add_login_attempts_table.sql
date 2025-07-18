-- Migration pour ajouter la table de suivi des tentatives de connexion
-- Cette table complète le système de sécurité côté serveur

-- Table pour le suivi des tentatives de connexion
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT login_attempts_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);

-- Index composé pour les requêtes de sécurité
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created_at ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created_at ON login_attempts(ip_address, created_at DESC);

-- Activer RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Admins can view all login attempts" ON login_attempts
  FOR SELECT USING (
    has_user_role('super_admin') OR has_user_role('admin')
  );

CREATE POLICY "System can insert login attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

-- Fonction pour nettoyer les anciennes tentatives (plus de 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM login_attempts 
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$;

-- Fonction pour obtenir les statistiques de tentatives de connexion
CREATE OR REPLACE FUNCTION get_login_attempt_stats(
  p_hours INTEGER DEFAULT 24
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Vérifier les permissions admin
  IF NOT (has_user_role('super_admin') OR has_user_role('admin')) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  SELECT json_build_object(
    'total_attempts', COUNT(*),
    'successful_attempts', COUNT(*) FILTER (WHERE success = true),
    'failed_attempts', COUNT(*) FILTER (WHERE success = false),
    'unique_ips', COUNT(DISTINCT ip_address),
    'unique_emails', COUNT(DISTINCT email),
    'top_failing_emails', (
      SELECT json_agg(
        json_build_object(
          'email', email,
          'attempts', count
        )
      )
      FROM (
        SELECT email, COUNT(*) as count
        FROM login_attempts
        WHERE success = false 
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour' * p_hours
        GROUP BY email
        ORDER BY count DESC
        LIMIT 10
      ) top_emails
    ),
    'suspicious_ips', (
      SELECT json_agg(
        json_build_object(
          'ip_address', ip_address,
          'attempts', count,
          'success_rate', ROUND((successful::NUMERIC / count) * 100, 2)
        )
      )
      FROM (
        SELECT 
          ip_address,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE success = true) as successful
        FROM login_attempts
        WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour' * p_hours
        AND ip_address IS NOT NULL
        GROUP BY ip_address
        HAVING COUNT(*) > 5 AND COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*) < 0.5
        ORDER BY count DESC
        LIMIT 10
      ) suspicious
    )
  ) INTO v_result
  FROM login_attempts
  WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour' * p_hours;

  RETURN v_result;
END;
$$;

-- Fonction pour enregistrer une tentative de connexion
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_id UUID;
BEGIN
  INSERT INTO login_attempts (
    email,
    success,
    ip_address,
    user_agent,
    failure_reason
  ) VALUES (
    LOWER(p_email),
    p_success,
    p_ip_address,
    p_user_agent,
    p_failure_reason
  ) RETURNING id INTO v_attempt_id;

  -- Log dans audit_logs pour les échecs répétés
  IF NOT p_success THEN
    -- Vérifier si c'est un pattern suspect (plus de 3 échecs en 5 minutes)
    IF (
      SELECT COUNT(*) 
      FROM login_attempts 
      WHERE email = LOWER(p_email) 
      AND success = false 
      AND created_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    ) >= 3 THEN
      INSERT INTO audit_logs (
        user_id, 
        action, 
        resource_type, 
        resource_id, 
        severity, 
        metadata,
        ip_address,
        user_agent
      ) VALUES (
        NULL,
        'SUSPICIOUS_LOGIN_PATTERN',
        'login_attempt',
        v_attempt_id::TEXT,
        'high',
        json_build_object(
          'email', p_email,
          'failure_reason', p_failure_reason,
          'recent_failures', (
            SELECT COUNT(*) 
            FROM login_attempts 
            WHERE email = LOWER(p_email) 
            AND success = false 
            AND created_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
          )
        ),
        p_ip_address,
        p_user_agent
      );
    END IF;
  END IF;

  RETURN v_attempt_id;
END;
$$;

-- Créer une tâche de nettoyage automatique (si pg_cron est disponible)
-- Cette partie sera commentée car pg_cron n'est pas toujours disponible
/*
SELECT cron.schedule(
  'cleanup-login-attempts',
  '0 2 * * *', -- Tous les jours à 2h du matin
  'SELECT cleanup_old_login_attempts();'
);
*/

-- Commentaire pour la documentation
COMMENT ON TABLE login_attempts IS 'Table de suivi des tentatives de connexion pour la sécurité';
COMMENT ON FUNCTION record_login_attempt IS 'Enregistre une tentative de connexion et détecte les patterns suspects';
COMMENT ON FUNCTION get_login_attempt_stats IS 'Retourne les statistiques des tentatives de connexion pour les admins';
COMMENT ON FUNCTION cleanup_old_login_attempts IS 'Nettoie les anciennes tentatives de connexion (30+ jours)';