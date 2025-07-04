import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Environment variables check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format');
}

// Ensure we're using the correct URL
if (supabaseUrl.includes('your-project-id')) {
  console.error('Placeholder Supabase URL detected:', supabaseUrl);
  throw new Error('Please update VITE_SUPABASE_URL with your actual Supabase project URL');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'invitation-app'
    }
  }
});

// Add connection test function with better error handling
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection to:', supabaseUrl);
    
    // Use a simpler test that doesn't depend on specific tables
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message.includes('Invalid API key')) {
      console.error('Invalid Supabase API key');
      sessionStorage.setItem('connection_error', 'invalid_api_key');
      return false;
    }
    
    // Test basic connectivity with a simple query
    const { error: pingError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (pingError) {
      console.error('Supabase connection test failed:', pingError);
      
      // Check if it's a table not found error (which means connection is working)
      if (pingError.code === 'PGRST116' || pingError.message.includes('relation') || pingError.message.includes('does not exist')) {
        console.log('Connection successful - table not found error is expected for new projects');
        sessionStorage.removeItem('connection_error');
        return true;
      }
      
      // For other errors, mark as connection failure
      sessionStorage.setItem('connection_error', 'server_unreachable');
      return false;
    }
    
    console.log('Supabase connection test successful');
    sessionStorage.removeItem('connection_error');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if Supabase URL is correct and accessible');
      sessionStorage.setItem('connection_error', 'network_error');
    } else {
      sessionStorage.setItem('connection_error', 'unknown_error');
    }
    
    return false;
  }
};

// Enhanced error handler
export const handleSupabaseError = (error: any, context: string = '') => {
  console.error(`Supabase error${context ? ` in ${context}` : ''}:`, error);
  
  if (error?.message?.includes('NetworkError') || error?.message?.includes('fetch')) {
    console.error('Network error details:', {
      message: error.message,
      supabaseUrl,
      timestamp: new Date().toISOString()
    });
    
    // Enregistrer l'erreur de connexion dans sessionStorage
    sessionStorage.setItem('connection_error', 'network_error');
    
    // Message d'erreur générique pour les problèmes réseau
    throw new Error('Problème de connexion. Veuillez vérifier votre connexion internet et réessayer.');
  }
  
  if (error?.message?.includes('JWT')) {
    throw new Error('Erreur d\'authentification. Veuillez vous reconnecter.');
  }
  
  if (error?.code === 'PGRST116') {
    throw new Error('La ressource demandée est introuvable.');
  }
  
  throw error;
};

