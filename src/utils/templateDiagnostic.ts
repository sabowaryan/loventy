// Outil de diagnostic pour les templates
import { supabase } from '../lib/supabase';

export const diagnoseTemplateIssues = async () => {
  console.log('🔍 === DIAGNOSTIC DES TEMPLATES ===');
  
  try {
    // Test 1: Connexion de base
    console.log('📡 Test 1: Connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('template_categories')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      return false;
    }
    console.log('✅ Connexion OK');

    // Test 2: Vérifier les catégories
    console.log('📂 Test 2: Chargement des catégories...');
    const { data: categories, error: catError } = await supabase
      .from('template_categories')
      .select('*')
      .eq('is_active', true);
    
    if (catError) {
      console.error('❌ Erreur catégories:', catError);
    } else {
      console.log(`✅ ${categories?.length || 0} catégories trouvées:`, categories?.map(c => c.name));
    }

    // Test 3: Vérifier les templates
    console.log('🎨 Test 3: Chargement des templates...');
    const { data: templates, error: templError } = await supabase
      .from('invitation_templates')
      .select('id, name, is_premium, is_active')
      .eq('is_active', true);
    
    if (templError) {
      console.error('❌ Erreur templates:', templError);
    } else {
      console.log(`✅ ${templates?.length || 0} templates trouvés:`);
      templates?.forEach(t => {
        console.log(`  - ${t.name} (${t.is_premium ? 'Premium' : 'Gratuit'})`);
      });
    }

    // Test 4: Requête avec jointure
    console.log('🔗 Test 4: Requête avec jointure...');
    const { data: joinData, error: joinError } = await supabase
      .from('invitation_templates')
      .select(`
        id,
        name,
        slug,
        is_premium,
        template_categories!inner(
          name,
          slug,
          icon
        )
      `)
      .eq('is_active', true)
      .limit(5);
    
    if (joinError) {
      console.error('❌ Erreur jointure:', joinError);
    } else {
      console.log(`✅ Jointure OK, ${joinData?.length || 0} résultats:`, joinData);
    }

    // Test 5: Structure des données
    if (joinData && joinData.length > 0) {
      console.log('📋 Test 5: Structure des données...');
      const sample = joinData[0];
      console.log('Structure échantillon:', {
        id: sample.id,
        name: sample.name,
        slug: sample.slug,
        is_premium: sample.is_premium,
        category: sample.template_categories
      });
    }

    return true;
  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return false;
  }
};

// Fonction pour tester depuis la console
(window as any).diagnoseTemplates = diagnoseTemplateIssues;