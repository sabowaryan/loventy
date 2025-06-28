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
      
      // Skip redirect check if we know there are connection issues
      const connectionError = sessionStorage.getItem('connection_error');
      if (connectionError) {
        console.warn('Skipping redirect check due to known connection issues');
        return;
      }
      
      setIsChecking(true);
      setError(null);

      try {
        // Create abort controller with longer timeout for better reliability
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 10000); // Increased to 10 seconds

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
            sessionStorage.setItem('connection_error', 'network_error');
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
        // Clear any previous connection errors since this request succeeded
        sessionStorage.removeItem('connection_error');
        
      } catch (err) {
        // Handle all errors gracefully to prevent app crashes
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.warn('Redirect check timed out, continuing without redirect check');
            sessionStorage.setItem('connection_error', 'timeout');
            return;
          }
          
          if (err.message?.includes('NetworkError') || 
              err.message?.includes('fetch') ||
              err.message?.includes('Failed to fetch')) {
            console.warn('Network error checking redirects, continuing without redirect check:', err.message);
            sessionStorage.setItem('connection_error', 'network_error');
            return;
          }
        }
        
        // For unexpected errors, log but don't break the app
        console.error('Unexpected error checking redirects:', err);
        sessionStorage.setItem('connection_error', 'unknown_error');
        
        // Don't set error state to avoid showing error messages to users
        // since redirects are not critical functionality
        
      } finally {
        setIsChecking(false);
      }
    };

    // Only run redirect check if we have valid environment variables
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not configured, skipping redirect check');
      setIsChecking(false);
      return;
    }

    checkRedirect();
  }, [location.pathname, navigate, isChecking]);

  return { isChecking, error };
};