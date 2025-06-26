import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const useRedirects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRedirect = async () => {
      const path = location.pathname;
      
      // Skip checking for redirects if we're already checking
      if (isChecking) return;
      
      setIsChecking(true);
      setError(null);

      try {
        // Check for redirects in the database
        const { data, error: dbError } = await supabase
          .from('redirects')
          .select('new_path, redirect_type')
          .eq('old_path', path)
          .maybeSingle();

        if (dbError && dbError.code !== 'PGRST116') {
          console.error('Database error checking redirects:', dbError);
          throw new Error(`Database error: ${dbError.message}`);
        }

        // If we found a redirect in the database, apply it
        if (data) {
          if (data.redirect_type === '301') {
            // Permanent redirect - use window.location for SEO benefits
            window.location.replace(data.new_path);
          } else {
            // Temporary redirect - use React Router
            navigate(data.new_path, { replace: true });
          }
          return;
        }

        // No redirect found - this is normal for most pages
      } catch (err) {
        console.error('Error checking redirects:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsChecking(false);
      }
    };

    checkRedirect();
  }, [location.pathname, navigate, isChecking]);

  return { isChecking, error };
};