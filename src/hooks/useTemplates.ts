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
    // FREE TEMPLATES
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
      preview_image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
      description: 'Design intemporel avec touches dorées et élégance raffinée',
      color_palette: { primary: '#D4A5A5', secondary: '#F5E6D3', accent: '#E8B86D' },
      font_pairs: {
        heading: 'Playfair Display',
        body: 'Inter'
      },
      layout_options: {
        layouts: ['vertical', 'horizontal']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'fade',
        showRSVP: true
      },
      usage_count: 1247,
      unique_users: 892,
      total_views: 3421,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Minimaliste Chic',
      slug: 'minimaliste-chic',
      category_id: 'modern',
      category_name: 'Moderne',
      category_slug: 'modern',
      category_icon: 'Zap',
      is_premium: false,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
      description: 'Simplicité raffinée et design contemporain épuré',
      color_palette: { primary: '#2C3E50', secondary: '#ECF0F1', accent: '#3498DB' },
      font_pairs: {
        heading: 'Raleway',
        body: 'Raleway'
      },
      layout_options: {
        layouts: ['vertical', 'horizontal']
      },
      default_settings: {
        layout: 'horizontal',
        animation: 'slide',
        showRSVP: true
      },
      usage_count: 956,
      unique_users: 743,
      total_views: 2834,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Bohème Naturel',
      slug: 'boheme-naturel',
      category_id: 'nature',
      category_name: 'Nature',
      category_slug: 'nature',
      category_icon: 'Leaf',
      is_premium: false,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80',
      description: 'Inspiration naturelle avec touches bohèmes et organiques',
      color_palette: { primary: '#8B7355', secondary: '#F4F1E8', accent: '#A0522D' },
      font_pairs: {
        heading: 'Libre Baskerville',
        body: 'Open Sans'
      },
      layout_options: {
        layouts: ['vertical']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'fade',
        showRSVP: true
      },
      usage_count: 678,
      unique_users: 521,
      total_views: 1923,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Simplicité Pure',
      slug: 'simplicite-pure',
      category_id: 'modern',
      category_name: 'Moderne',
      category_slug: 'modern',
      category_icon: 'Zap',
      is_premium: false,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1544531586-fbd96ceaff1c?auto=format&fit=crop&w=800&q=80',
      description: 'Design ultra-minimaliste pour un mariage moderne et épuré',
      color_palette: { primary: '#34495E', secondary: '#FFFFFF', accent: '#E74C3C' },
      font_pairs: {
        heading: 'Poppins',
        body: 'Poppins'
      },
      layout_options: {
        layouts: ['vertical', 'horizontal']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'none',
        showRSVP: false
      },
      usage_count: 432,
      unique_users: 298,
      total_views: 1156,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // PREMIUM TEMPLATES
    {
      id: '5',
      name: 'Jardin Secret Premium',
      slug: 'jardin-secret-premium',
      category_id: 'nature',
      category_name: 'Nature',
      category_slug: 'nature',
      category_icon: 'Leaf',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=800&q=80',
      description: 'Motifs floraux délicats avec animations sophistiquées et éléments interactifs',
      color_palette: { primary: '#2E8B57', secondary: '#F0FFF0', accent: '#228B22' },
      font_pairs: {
        heading: 'Cormorant Garamond',
        body: 'Montserrat'
      },
      layout_options: {
        layouts: ['vertical', 'horizontal']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'slide',
        showRSVP: true
      },
      usage_count: 1834,
      unique_users: 1245,
      total_views: 5672,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Romance Vintage Luxe',
      slug: 'romance-vintage-luxe',
      category_id: 'classic',
      category_name: 'Classique',
      category_slug: 'classic',
      category_icon: 'Crown',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      description: 'Charme rétro avec ornements dorés et typographie élégante',
      color_palette: { primary: '#8B4513', secondary: '#FDF5E6', accent: '#DAA520' },
      font_pairs: {
        heading: 'Dancing Script',
        body: 'Crimson Pro'
      },
      layout_options: {
        layouts: ['vertical']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'zoom',
        showRSVP: true
      },
      usage_count: 2156,
      unique_users: 1678,
      total_views: 6789,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '7',
      name: 'Majesté Royale',
      slug: 'majeste-royale',
      category_id: 'luxury',
      category_name: 'Luxe',
      category_slug: 'luxury',
      category_icon: 'Diamond',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      description: 'Design luxueux avec dorures, motifs baroques et finitions premium',
      color_palette: { primary: '#4B0082', secondary: '#F8F8FF', accent: '#FFD700' },
      font_pairs: {
        heading: 'Cinzel',
        body: 'Lato'
      },
      layout_options: {
        layouts: ['vertical', 'horizontal']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'fade',
        showRSVP: true
      },
      usage_count: 987,
      unique_users: 743,
      total_views: 3421,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '8',
      name: 'Océan Mystique',
      slug: 'ocean-mystique',
      category_id: 'nature',
      category_name: 'Nature',
      category_slug: 'nature',
      category_icon: 'Leaf',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80',
      description: 'Inspiré par les profondeurs marines avec effets aquatiques animés',
      color_palette: { primary: '#008B8B', secondary: '#F0FFFF', accent: '#20B2AA' },
      font_pairs: {
        heading: 'Merriweather',
        body: 'Merriweather Sans'
      },
      layout_options: {
        layouts: ['vertical']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'slide',
        showRSVP: true
      },
      usage_count: 1456,
      unique_users: 1123,
      total_views: 4567,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '9',
      name: 'Art Déco Prestige',
      slug: 'art-deco-prestige',
      category_id: 'classic',
      category_name: 'Classique',
      category_slug: 'classic',
      category_icon: 'Crown',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      description: 'Style Art Déco avec géométries sophistiquées et métaux précieux',
      color_palette: { primary: '#2F4F4F', secondary: '#F5F5DC', accent: '#B8860B' },
      font_pairs: {
        heading: 'Bodoni Moda',
        body: 'Karla'
      },
      layout_options: {
        layouts: ['vertical', 'horizontal']
      },
      default_settings: {
        layout: 'horizontal',
        animation: 'zoom',
        showRSVP: true
      },
      usage_count: 1789,
      unique_users: 1334,
      total_views: 5234,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10',
      name: 'Constellation Étoilée',
      slug: 'constellation-etoilee',
      category_id: 'modern',
      category_name: 'Moderne',
      category_slug: 'modern',
      category_icon: 'Zap',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80',
      description: 'Design cosmique avec animations d\'étoiles et effets de particules',
      color_palette: { primary: '#191970', secondary: '#F8F8FF', accent: '#FFD700' },
      font_pairs: {
        heading: 'Josefin Sans',
        body: 'Josefin Sans'
      },
      layout_options: {
        layouts: ['vertical', 'horizontal']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'fade',
        showRSVP: true
      },
      usage_count: 2341,
      unique_users: 1876,
      total_views: 7123,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '11',
      name: 'Jardin Japonais Zen',
      slug: 'jardin-japonais-zen',
      category_id: 'nature',
      category_name: 'Nature',
      category_slug: 'nature',
      category_icon: 'Leaf',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
      description: 'Sérénité japonaise avec bambous, cerisiers et calligraphie zen',
      color_palette: { primary: '#556B2F', secondary: '#F5F5DC', accent: '#DC143C' },
      font_pairs: {
        heading: 'Great Vibes',
        body: 'Lato'
      },
      layout_options: {
        layouts: ['vertical']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'slide',
        showRSVP: true
      },
      usage_count: 1567,
      unique_users: 1234,
      total_views: 4891,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '12',
      name: 'Cristal de Bohème',
      slug: 'cristal-de-boheme',
      category_id: 'luxury',
      category_name: 'Luxe',
      category_slug: 'luxury',
      category_icon: 'Diamond',
      is_premium: true,
      is_active: true,
      preview_image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
      description: 'Luxe bohème avec cristaux, plumes et textures précieuses',
      color_palette: { primary: '#8B008B', secondary: '#FFF8DC', accent: '#FF69B4' },
      font_pairs: {
        heading: 'Tangerine',
        body: 'Montserrat'
      },
      layout_options: {
        layouts: ['vertical', 'horizontal']
      },
      default_settings: {
        layout: 'vertical',
        animation: 'zoom',
        showRSVP: true
      },
      usage_count: 1123,
      unique_users: 876,
      total_views: 3456,
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
    },
    {
      id: 'luxury',
      name: 'Luxe',
      slug: 'luxury',
      icon: 'Diamond',
      description: 'Designs premium avec finitions luxueuses et éléments sophistiqués',
      is_active: true,
      display_order: 4,
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
      // Force database loading - temporarily disable fallback for debugging
      if (connectionStatus === 'failed') {
        console.log('⚠️ Connection failed, but forcing database attempt...');
        // Don't return early - try database anyway
      }


      // Vérifier si l'utilisateur est premium pour l'affichage des overlays
      const isPremium = isAuthenticated && hasRole('premium');
      let query = supabase
        .from('invitation_templates')
        .select('*')
        .eq('is_active', true);

      // Note: Category filtering will be done after fetching data since we're not joining

      // Apply search filter
      if (searchTerm) {
        console.log('🔍 Applying search filter:', searchTerm);
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply premium filter
      if (isPremiumOnly) {
        console.log('👑 Filtering premium only');
        query = query.eq('is_premium', true);
      }

      // Apply limit
      query = query.limit(limit);

      console.log('📡 Executing database query...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Database query error:', error);
        handleSupabaseError(error, 'loadTemplates');

        // Fallback to default templates on error
        console.log('🔄 Falling back to default templates due to error');
        const defaultTemplates = getDefaultTemplates();
        const filteredDefaults = defaultTemplates.filter(template => {
          if (!template.is_premium) return true;
          return isPremium;
        });
        setTemplates(filteredDefaults);
        return;
      }

      console.log('✅ Raw database response:', data);
      console.log(`📊 Found ${data?.length || 0} templates in database`);

      if (!data || data.length === 0) {
        console.log('⚠️ No templates found in database');
        console.log('Query details:', { selectedCategory, searchTerm, isPremiumOnly, limit });
        setTemplates([]);
        return;
      }

      // Load categories to match with templates
      console.log('📂 Loading categories for template matching...');
      const { data: categoriesData } = await supabase
        .from('template_categories')
        .select('*')
        .eq('is_active', true);

      console.log('📂 Categories loaded:', categoriesData?.length || 0);

      // Transform data to match expected format
      const transformedData = data.map(item => {
        console.log('🔄 Transforming template:', item.name);

        // Find matching category
        const matchingCategory = categoriesData?.find(cat => cat.id === item.category_id);

        return {
          ...item,
          category_name: matchingCategory?.name || 'Non catégorisé',
          category_slug: matchingCategory?.slug || 'uncategorized',
          category_icon: matchingCategory?.icon || 'Crown',
          usage_count: Math.floor(Math.random() * 2000) + 100, // Simulate usage stats
          unique_users: Math.floor(Math.random() * 1500) + 50,
          total_views: Math.floor(Math.random() * 5000) + 200
        };
      });

      // Apply category filter after transformation
      let categoryFilteredTemplates = transformedData;
      if (selectedCategory !== 'all') {
        console.log('🏷️ Applying category filter:', selectedCategory);
        categoryFilteredTemplates = transformedData.filter(template =>
          template.category_slug === selectedCategory
        );
        console.log(`📂 Templates after category filter: ${categoryFilteredTemplates.length}`);
      }

      // Don't filter premium templates - show all templates but restrict access in UI
      // Users should see premium templates to encourage upgrades
      const filteredTemplates = categoryFilteredTemplates;

      console.log(`🎯 Final filtered templates: ${filteredTemplates.length}`);
      console.log('📋 Template names:', filteredTemplates.map(t => t.name));

      setTemplates(filteredTemplates);
    } catch (err) {
      console.error('💥 Critical error loading templates:', err);
      setError(`Database error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTemplates([]); // Don't use fallback - show empty to debug
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