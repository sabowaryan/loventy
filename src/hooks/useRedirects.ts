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
        // Check for redirects in the database with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const { data, error: dbError } = await supabase
          .from('redirects')
          .select('new_path, redirect_type')
          .eq('old_path', path)
          .eq('is_active', true)
          .maybeSingle()
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (dbError) {
          // Handle specific error cases
          if (dbError.code === 'PGRST116') {
            // No redirect found - this is normal
            return;
          }
          
          // For network errors, fail silently to not break the app
          if (dbError.message?.includes('NetworkError') || 
              dbError.message?.includes('fetch') ||
              dbError.message?.includes('AbortError')) {
            console.warn('Network error checking redirects, continuing without redirect check:', dbError.message);
            return;
          }
          
          // For other database errors, log but don't throw
          console.error('Database error checking redirects:', dbError);
          return;
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
        // Handle network errors gracefully
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.warn('Redirect check timed out, continuing without redirect check');
            return;
          }
          
          if (err.message?.includes('NetworkError') || 
              err.message?.includes('fetch') ||
              err.message?.includes('Failed to fetch')) {
            console.warn('Network error checking redirects, continuing without redirect check:', err.message);
            return;
          }
        }
        
        // For unexpected errors, log but don't break the app
        console.error('Unexpected error checking redirects:', err);
        setError('Unable to check for redirects due to connectivity issues');
      } finally {
        setIsChecking(false);
      }
    };

    // Only check redirects if we have a valid Supabase connection
    const connectionError = sessionStorage.getItem('connection_error');
    if (connectionError) {
      console.warn('Skipping redirect check due to known connection issues');
      setIsChecking(false);
      return;
    }

    checkRedirect();
  }, [location.pathname, navigate, isChecking]);

  return { isChecking, error };
};