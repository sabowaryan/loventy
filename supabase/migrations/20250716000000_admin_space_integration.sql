/*
  # Admin Space Integration - Database Schema and Security

  1. Admin-specific Tables
    - `admin_audit_log` - Comprehensive audit trail for admin actions
    - `system_alerts` - System-wide alerts and notifications
    - `user_suspensions` - User suspension management
    - `content_moderation` - Content moderation and flagging system

  2. Admin Views
    - `admin_user_overview` - Comprehensive user data aggregation
    - `admin_system_metrics` - Real-time system health metrics

  3. Admin RPC Functions
    - `get_user_activity` - Detailed user activity history
    - `admin_suspend_user` - User suspension with audit trail
    - `admin_reactivate_user` - User reactivation with audit trail
    - `get_system_health_metrics` - Real-time system health data

  4. Security
    - RLS policies restricting access to admin role only
    - Comprehensive audit logging for all admin actions
    - Secure function execution with proper authorization checks

  Requirements: 5.1, 5.2, 5.3, 5.5
*/

-- =====================================================
-- ADMIN-SPECIFIC TABLES
-- =====================================================

-- Admin Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type varchar(50) NOT NULL,
  resource_type varchar(50) NOT NULL,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- System Alerts Table
CREATE TABLE IF NOT EXISTS system_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type varchar(50) NOT NULL,
  severity varchar(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title varchar(255) NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User Suspensions Table
CREATE TABLE IF NOT EXISTS user_suspensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  suspended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  suspended_at timestamptz DEFAULT now(),
  lifted_at timestamptz,
  lifted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true
);

-- Content Moderation Table
CREATE TABLE IF NOT EXISTS content_moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(50) NOT NULL,
  content_id uuid NOT NULL,
  reported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_reason text,
  automated_flags jsonb DEFAULT '{}',
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_type ON admin_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource_type ON admin_audit_log(resource_type);

CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_is_resolved ON system_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_is_active ON user_suspensions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_suspended_at ON user_suspensions(suspended_at);

CREATE INDEX IF NOT EXISTS idx_content_moderation_content_type ON content_moderation(content_type);
CREATE INDEX IF NOT EXISTS idx_content_moderation_status ON content_moderation(status);
CREATE INDEX IF NOT EXISTS idx_content_moderation_created_at ON content_moderation(created_at);

-- =====================================================
-- ROW LEVEL SECURITY SETUP
-- =====================================================

-- Enable RLS on all admin tables
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid
    AND r.name = 'admin'
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES - ADMIN ONLY ACCESS
-- =====================================================

-- Admin Audit Log Policies
CREATE POLICY "Only admins can view audit logs"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (is_admin_user());

CREATE POLICY "Only admins can insert audit logs"
  ON admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user());

-- System Alerts Policies
CREATE POLICY "Only admins can manage system alerts"
  ON system_alerts
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- User Suspensions Policies
CREATE POLICY "Only admins can manage user suspensions"
  ON user_suspensions
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Content Moderation Policies
CREATE POLICY "Only admins can manage content moderation"
  ON content_moderation
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- =====================================================
-- ADMIN VIEWS
-- =====================================================

-- Admin User Overview View
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.avatar_url,
  u.created_at,
  u.updated_at,
  -- Suspension status
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_suspensions us 
      WHERE us.user_id = u.id 
      AND us.is_active = true 
      AND us.lifted_at IS NULL
    ) THEN 'suspended'
    ELSE 'active'
  END as status,
  -- Latest suspension reason
  (
    SELECT us.reason 
    FROM user_suspensions us 
    WHERE us.user_id = u.id 
    AND us.is_active = true 
    AND us.lifted_at IS NULL
    ORDER BY us.suspended_at DESC 
    LIMIT 1
  ) as suspension_reason,
  -- Event counts
  COUNT(DISTINCT i.id) as events_count,
  COUNT(DISTINCT g.id) as guests_count,
  -- Subscription info
  COALESCE(s.status, 'not_started') as subscription_status,
  s.current_period_end,
  -- Activity metrics
  COUNT(DISTINCT CASE WHEN i.created_at > NOW() - INTERVAL '30 days' THEN i.id END) as events_last_30_days,
  COUNT(DISTINCT CASE WHEN g.created_at > NOW() - INTERVAL '30 days' THEN g.id END) as guests_last_30_days,
  -- Storage usage
  COALESCE(SUM(uf.file_size), 0) as storage_used_bytes
FROM users u
LEFT JOIN invitations i ON u.id = i.user_id
LEFT JOIN guests g ON u.id = g.user_id
LEFT JOIN stripe_customers sc ON u.id = sc.user_id
LEFT JOIN stripe_subscriptions s ON sc.customer_id = s.customer_id
LEFT JOIN user_files uf ON u.id = uf.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.created_at, u.updated_at, s.status, s.current_period_end;

-- Admin System Metrics View
CREATE OR REPLACE VIEW admin_system_metrics AS
SELECT 
  -- User metrics
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN u.created_at > NOW() - INTERVAL '30 days' THEN u.id END) as new_users_30_days,
  COUNT(DISTINCT CASE WHEN i.created_at > NOW() - INTERVAL '30 days' THEN u.id END) as active_users_30_days,
  COUNT(DISTINCT CASE WHEN us.is_active = true AND us.lifted_at IS NULL THEN u.id END) as suspended_users,
  
  -- Event metrics
  COUNT(DISTINCT i.id) as total_events,
  COUNT(DISTINCT CASE WHEN i.created_at > NOW() - INTERVAL '30 days' THEN i.id END) as events_30_days,
  COUNT(DISTINCT CASE WHEN i.status = 'published' THEN i.id END) as published_events,
  
  -- Guest metrics
  COUNT(DISTINCT g.id) as total_guests,
  COUNT(DISTINCT CASE WHEN g.created_at > NOW() - INTERVAL '30 days' THEN g.id END) as guests_30_days,
  COUNT(DISTINCT CASE WHEN g.status = 'confirmed' THEN g.id END) as confirmed_guests,
  
  -- Subscription metrics
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN sc.user_id END) as active_subscriptions,
  COUNT(DISTINCT CASE WHEN s.status = 'canceled' THEN sc.user_id END) as canceled_subscriptions,
  
  -- System health indicators
  COUNT(DISTINCT CASE WHEN sa.is_resolved = false AND sa.severity IN ('high', 'critical') THEN sa.id END) as critical_alerts,
  COUNT(DISTINCT CASE WHEN cm.status = 'pending' THEN cm.id END) as pending_moderation,
  
  -- Storage metrics
  SUM(uf.file_size) as total_storage_used,
  AVG(uf.file_size) as avg_file_size
FROM users u
LEFT JOIN invitations i ON u.id = i.user_id
LEFT JOIN guests g ON u.id = g.user_id
LEFT JOIN stripe_customers sc ON u.id = sc.user_id
LEFT JOIN stripe_subscriptions s ON sc.customer_id = s.customer_id
LEFT JOIN user_files uf ON u.id = uf.user_id
LEFT JOIN user_suspensions us ON u.id = us.user_id
LEFT JOIN system_alerts sa ON true
LEFT JOIN content_moderation cm ON true;

-- Grant access to admin views
GRANT SELECT ON admin_user_overview TO authenticated;
GRANT SELECT ON admin_system_metrics TO authenticated;

-- =====================================================
-- ADMIN RPC FUNCTIONS
-- =====================================================

-- Function to get detailed user activity
CREATE OR REPLACE FUNCTION get_user_activity(user_uuid uuid)
RETURNS TABLE (
  activity_type text,
  activity_date timestamptz,
  details jsonb
) AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  -- Event creation activities
  SELECT 
    'event_created'::text,
    i.created_at,
    jsonb_build_object(
      'event_title', i.title,
      'event_id', i.id,
      'template_id', i.template_id,
      'status', i.status
    )
  FROM invitations i
  WHERE i.user_id = user_uuid
  
  UNION ALL
  
  -- Guest management activities
  SELECT 
    'guest_added'::text,
    g.created_at,
    jsonb_build_object(
      'guest_name', g.name,
      'guest_email', g.email,
      'event_id', g.invitation_id,
      'status', g.status
    )
  FROM guests g
  WHERE g.user_id = user_uuid
  
  UNION ALL
  
  -- Email activities
  SELECT 
    'email_sent'::text,
    el.sent_at,
    jsonb_build_object(
      'email_type', el.email_type,
      'recipient', el.recipient_email,
      'status', el.status,
      'invitation_id', el.invitation_id
    )
  FROM email_logs el
  WHERE el.user_id = user_uuid
  
  UNION ALL
  
  -- File upload activities
  SELECT 
    'file_uploaded'::text,
    uf.created_at,
    jsonb_build_object(
      'file_name', uf.file_name,
      'file_type', uf.file_type,
      'file_size', uf.file_size,
      'invitation_id', uf.invitation_id
    )
  FROM user_files uf
  WHERE uf.user_id = user_uuid
  
  ORDER BY activity_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend a user
CREATE OR REPLACE FUNCTION admin_suspend_user(
  user_uuid uuid,
  suspension_reason text,
  admin_uuid uuid DEFAULT auth.uid()
)
RETURNS boolean AS $$
DECLARE
  audit_details jsonb;
BEGIN
  -- Check if caller is admin
  IF NOT is_admin_user(admin_uuid) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_uuid) THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- Check if user is already suspended
  IF EXISTS (
    SELECT 1 FROM user_suspensions 
    WHERE user_id = user_uuid 
    AND is_active = true 
    AND lifted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'User is already suspended.';
  END IF;

  -- Insert suspension record
  INSERT INTO user_suspensions (user_id, suspended_by, reason)
  VALUES (user_uuid, admin_uuid, suspension_reason);

  -- Prepare audit details
  audit_details := jsonb_build_object(
    'user_id', user_uuid,
    'reason', suspension_reason,
    'action', 'suspend'
  );

  -- Log admin action
  INSERT INTO admin_audit_log (
    admin_id, 
    action_type, 
    resource_type, 
    resource_id, 
    new_values
  )
  VALUES (
    admin_uuid,
    'user_suspended',
    'user',
    user_uuid,
    audit_details
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reactivate a suspended user
CREATE OR REPLACE FUNCTION admin_reactivate_user(
  user_uuid uuid,
  admin_uuid uuid DEFAULT auth.uid()
)
RETURNS boolean AS $$
DECLARE
  suspension_record record;
  audit_details jsonb;
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(admin_uuid) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Get active suspension record
  SELECT * INTO suspension_record
  FROM user_suspensions 
  WHERE user_id = user_uuid 
  AND is_active = true 
  AND lifted_at IS NULL;

  -- Check if user is suspended
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User is not currently suspended.';
  END IF;

  -- Lift the suspension
  UPDATE user_suspensions 
  SET lifted_at = now(), lifted_by = admin_uuid
  WHERE id = suspension_record.id;

  -- Prepare audit details
  audit_details := jsonb_build_object(
    'user_id', user_uuid,
    'original_reason', suspension_record.reason,
    'suspended_at', suspension_record.suspended_at,
    'action', 'reactivate'
  );

  -- Log admin action
  INSERT INTO admin_audit_log (
    admin_id, 
    action_type, 
    resource_type, 
    resource_id, 
    old_values,
    new_values
  )
  VALUES (
    admin_uuid,
    'user_reactivated',
    'user',
    user_uuid,
    jsonb_build_object('status', 'suspended'),
    audit_details
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get system health metrics
CREATE OR REPLACE FUNCTION get_system_health_metrics()
RETURNS TABLE (
  metric_name text,
  metric_value numeric,
  metric_unit text,
  status text
) AS $$
DECLARE
  db_connections int;
  avg_response_time numeric;
  error_rate numeric;
  storage_usage numeric;
BEGIN
  -- Check if caller is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Get database connection count (approximation)
  SELECT count(*) INTO db_connections
  FROM pg_stat_activity 
  WHERE state = 'active';

  -- Calculate average response time (based on recent email logs as proxy)
  SELECT COALESCE(
    EXTRACT(EPOCH FROM AVG(delivered_at - sent_at)) * 1000, 
    0
  ) INTO avg_response_time
  FROM email_logs 
  WHERE sent_at > NOW() - INTERVAL '1 hour'
  AND delivered_at IS NOT NULL;

  -- Calculate error rate (failed emails as proxy)
  SELECT COALESCE(
    (COUNT(CASE WHEN status = 'failed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)),
    0
  ) INTO error_rate
  FROM email_logs 
  WHERE sent_at > NOW() - INTERVAL '1 hour';

  -- Calculate storage usage percentage (assuming 1GB limit)
  SELECT COALESCE(
    (SUM(file_size) * 100.0 / (1024*1024*1024)),
    0
  ) INTO storage_usage
  FROM user_files;

  RETURN QUERY VALUES
    ('database_connections', db_connections, 'connections', 
     CASE WHEN db_connections < 50 THEN 'healthy' 
          WHEN db_connections < 100 THEN 'warning' 
          ELSE 'critical' END),
    ('avg_response_time', avg_response_time, 'ms',
     CASE WHEN avg_response_time < 1000 THEN 'healthy'
          WHEN avg_response_time < 3000 THEN 'warning'
          ELSE 'critical' END),
    ('error_rate', error_rate, 'percent',
     CASE WHEN error_rate < 1 THEN 'healthy'
          WHEN error_rate < 5 THEN 'warning'
          ELSE 'critical' END),
    ('storage_usage', storage_usage, 'percent',
     CASE WHEN storage_usage < 70 THEN 'healthy'
          WHEN storage_usage < 90 THEN 'warning'
          ELSE 'critical' END);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on admin functions
GRANT EXECUTE ON FUNCTION get_user_activity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_suspend_user(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reactivate_user(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;

-- Grant access to admin tables for authenticated users (RLS will handle authorization)
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON system_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_suspensions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_moderation TO authenticated;

-- =====================================================
-- INITIAL SYSTEM ALERT
-- =====================================================

-- Insert initial system alert to indicate admin system is ready
INSERT INTO system_alerts (
  alert_type,
  severity,
  title,
  description,
  metadata
) VALUES (
  'system_initialization',
  'low',
  'Admin System Initialized',
  'Admin space integration has been successfully set up with all required tables, views, and functions.',
  jsonb_build_object(
    'version', '1.0.0',
    'initialized_at', now(),
    'components', jsonb_build_array(
      'admin_audit_log',
      'system_alerts', 
      'user_suspensions',
      'content_moderation',
      'admin_user_overview',
      'admin_system_metrics'
    )
  )
);