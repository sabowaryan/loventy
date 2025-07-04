import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError, testSupabaseConnection } from '../lib/supabase';
import type { TemplateDetails, TemplateCategory } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

interface UseTemplatesOptions {
  initialCategory?: string;
  initialSearchTerm?: string;
  isPremiumOnly?: boolean;
  limit?: number;
}

export const useTemplates = (options: UseTemplatesOptions = {}) => {
  const { initialCategory, initialSearchTerm, isPremiumOnly = false, limit = 20 } = options;
  const [templates, setTemplates] = useState<TemplateDetails[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const { isAuthenticated, hasRole, isLoading: authLoading } = useAuth();

  // Default templates to use when Supabase is not available
  const getDefaultTemplates = useCallback((): TemplateDetails[] => [
    {
      id: '1',
      name: 'Élégance Dorée',
      slug: 'elegance-doree',
      category_id: 'classic',
      category_name: 'Classique',
      category_slug: 'classic',
      category_icon: 'Crown',
      is_premium: false,
      is_active: true,
      preview_image_url: 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Design intemporel avec touches dorées',
      color_palette: { primary: '#D4A5A5', secondary: '#F5E6D3', accent: '#E8B86D' },
      usage_count: 0,
      unique_users: 0,
      total_views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Jardin Secret',
      slug: 'jardin-secret',
      category_id: 'nature',
      category_name: 'Nature',
      category_slug: 'nature',
      category_icon: 'Leaf',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Motifs floraux délicats et verdure',
      color_palette: { primary: '#C5D2C2', secondary: '#E8F5E8', accent: '#7FB069' },
      usage_count: 0,
      unique_users: 0,
      total_views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Minimaliste Chic',
      slug: 'minimaliste-chic',
      category_id: 'modern',
      category_name: 'Moderne',
      category_slug: 'modern',
      category_icon: 'Zap',
      is_premium: false,
      is_active: true,
      preview_image_url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Simplicité raffinée et moderne',
      color_palette: { primary: '#131837', secondary: '#F8F9FA', accent: '#6C757D' },
      usage_count: 0,
      unique_users: 0,
      total_views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Romance Vintage',
      slug: 'romance-vintage',
      category_id: 'classic',
      category_name: 'Classique',
      category_slug: 'classic',
      category_icon: 'Crown',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Charme rétro et romantique',
      color_palette: { primary: '#E16939', secondary: '#FDF2E9', accent: '#D4A574' },
      usage_count: 0,
      unique_users: 0,
      total_views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ], []);

  // Default categories to use when Supabase is not available
  const getDefaultCategories = useCallback((): TemplateCategory[] => [
    {
      id: 'classic',
      name: 'Classique',
      slug: 'classic',
      icon: 'Crown',
      description: 'Designs intemporels et élégants',
      is_active: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'modern',
      name: 'Moderne',
      slug: 'modern',
      icon: 'Zap',
      description: 'Designs contemporains et minimalistes',
      is_active: true,
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'nature',
      name: 'Nature',
      slug: 'nature',
      icon: 'Leaf',
      description: 'Inspirés par la nature et les éléments organiques',
      is_active: true,
      display_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ], []);

  // Test connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      
      if (!isConnected) {
        console.warn('Supabase connection failed, using default data');
        setCategories(getDefaultCategories());
        setError('Connection to database failed. Using offline mode.');
      }
    };
    
    checkConnection();
  }, [getDefaultCategories]);

  // Fonction pour charger les catégories
  const loadCategories = useCallback(async () => {
    if (connectionStatus === 'failed') {
      setCategories(getDefaultCategories());
      return;
    }

    if (connectionStatus === 'checking') {
      return; // Wait for connection check to complete
    }

    try {
      console.log('Loading template categories...');
      const { data, error } = await supabase
        .from('template_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'loadCategories');
        return;
      }
      
      console.log(`Loaded ${data?.length || 0} categories`);
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Unable to load categories. Using default categories.');
      setCategories(getDefaultCategories());
    }
  }, [connectionStatus, getDefaultCategories]);

  // Fonction pour charger les modèles
  const loadTemplates = useCallback(async () => {
    // Don't load templates if auth is still loading
    if (authLoading) {
      console.log('Auth still loading, delaying template load');
      return;
    }

    if (connectionStatus === 'checking') {
      return; // Wait for connection check to complete
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // If connection failed, use default templates
      if (connectionStatus === 'failed') {
        const defaultTemplates = getDefaultTemplates();
        const isPremium = isAuthenticated && hasRole('premium');
        
        // Filter templates based on user's premium status
        const filteredTemplates = defaultTemplates.filter(template => {
          if (!template.is_premium) return true;
          return isPremium;
        });

        // Apply category filter
        const categoryFilteredTemplates = selectedCategory === 'all' 
          ? filteredTemplates 
          : filteredTemplates.filter(t => t.category_slug === selectedCategory);

        // Apply search filter
        const searchFilteredTemplates = searchTerm 
          ? categoryFilteredTemplates.filter(t => 
              t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : categoryFilteredTemplates;

        setTemplates(searchFilteredTemplates);
        setIsLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est premium
      const isPremium = isAuthenticated && hasRole('premium');
      console.log('Loading templates, isPremium:', isPremium);
      
      // Build query
      let query = supabase
        .from('invitation_templates')
        .select(`
          *,
          template_categories(name, slug, icon)
        `)
        .eq('is_active', true);
        
      if (selectedCategory !== 'all') {
        query = query.eq('template_categories.slug', selectedCategory);
      }
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (isPremiumOnly) {
        query = query.eq('is_premium', true);
      }
      
      query = query.limit(limit);
      
      const { data, error } = await query;
      
      if (error) {
        handleSupabaseError(error, 'loadTemplates');
        return;
      }
      
      // Transformer les données pour correspondre au format attendu
      const transformedData = data.map(item => ({
        ...item,
        category_name: item.template_categories?.name || 'Non catégorisé',
        category_slug: item.template_categories?.slug || 'uncategorized',
        category_icon: item.template_categories?.icon || null,
        usage_count: 0,
        unique_users: 0,
        total_views: 0
      }));
      
      // Filtrer les modèles premium si l'utilisateur n'est pas premium
      const filteredTemplates = transformedData.filter(template => {
        if (!template.is_premium) return true;
        return isPremium;
      });

      console.log(`Loaded ${filteredTemplates.length} templates`);
      setTemplates(filteredTemplates);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Unable to load templates. Using default templates.');
      
      // Use default templates as fallback
      const defaultTemplates = getDefaultTemplates();
      const isPremium = isAuthenticated && hasRole('premium');
      
      const filteredTemplates = defaultTemplates.filter(template => {
        if (!template.is_premium) return true;
        return isPremium;
      });
      
      setTemplates(filteredTemplates);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchTerm, isPremiumOnly, limit, isAuthenticated, hasRole, authLoading, connectionStatus, getDefaultTemplates]);

  // Charger les catégories une fois la connexion vérifiée
  useEffect(() => {
    if (connectionStatus !== 'checking') {
      loadCategories();
    }
  }, [loadCategories, connectionStatus]);
  
  // Charger les modèles une fois que l'authentification est chargée et la connexion vérifiée
  useEffect(() => {
    if (!authLoading && connectionStatus !== 'checking') {
      console.log('Auth loading complete and connection checked, loading templates');
      loadTemplates();
    } else {
      console.log('Waiting for auth or connection check to complete');
    }
  }, [loadTemplates, authLoading, connectionStatus]);

  // Fonction pour obtenir les détails d'un modèle
  const getTemplateDetails = useCallback(async (templateId: string) => {
    if (connectionStatus === 'failed') {
      const defaultTemplates = getDefaultTemplates();
      const template = defaultTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      return template;
    }

    try {
      const { data, error } = await supabase
        .from('invitation_templates')
        .select(`
          *,
          template_categories(name, slug, icon)
        `)
        .eq('id', templateId)
        .single();

      if (error) {
        handleSupabaseError(error, 'getTemplateDetails');
        return;
      }
      
      // Transformer les données pour correspondre au format attendu
      const transformedData = {
        ...data,
        category_name: data.template_categories?.name || 'Non catégorisé',
        category_slug: data.template_categories?.slug || 'uncategorized',
        category_icon: data.template_categories?.icon || null,
        usage_count: 0,
        unique_users: 0,
        total_views: 0
      };
      
      return transformedData;
    } catch (err) {
      console.error('Error loading template details:', err);
      throw err;
    }
  }, [connectionStatus, getDefaultTemplates]);

  // Fonction pour obtenir les images d'un modèle
  const getTemplateImages = useCallback(async (templateId: string) => {
    if (connectionStatus === 'failed') {
      return []; // Return empty array for offline mode
    }

    try {
      const { data, error } = await supabase
        .from('template_images')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'getTemplateImages');
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Error loading template images:', err);
      return [];
    }
  }, [connectionStatus]);

  // Fonction pour obtenir les modèles recommandés
  const getRecommendedTemplates = useCallback(async (limit: number = 4) => {
    if (!isAuthenticated) return [];
    
    if (connectionStatus === 'failed') {
      const defaultTemplates = getDefaultTemplates();
      return defaultTemplates.slice(0, limit);
    }
    
    try {
      const { data, error } = await supabase
        .from('invitation_templates')
        .select(`
          *,
          template_categories(name, slug, icon)
        `)
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        handleSupabaseError(error, 'getRecommendedTemplates');
        return [];
      }
      
      // Transformer les données
      const transformedData = (data || []).map(item => ({
        ...item,
        category_name: item.template_categories?.name || 'Non catégorisé',
        category_slug: item.template_categories?.slug || 'uncategorized',
        category_icon: item.template_categories?.icon || null,
        score: Math.random() * 10, // Score aléatoire pour le tri
        usage_count: 0,
        unique_users: 0
      }));
      
      // Trier par score
      transformedData.sort((a, b) => b.score - a.score);
      
      return transformedData;
    } catch (err) {
      console.error('Error loading recommended templates:', err);
      return [];
    }
  }, [isAuthenticated, connectionStatus, getDefaultTemplates]);

  return {
    templates,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    connectionStatus,
    refreshTemplates: loadTemplates,
    getTemplateDetails,
    getTemplateImages,
    getRecommendedTemplates
  };
};