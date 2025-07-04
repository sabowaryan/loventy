const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { create } = require('xmlbuilder2');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Utilise la clé service côté serveur
);

async function main() {
  // Récupère les invitations publiques avec la date de mise à jour
  const { data: invitations, error } = await supabase
    .from('invitations')
    .select('id, updated_at')
    .eq('is_public', true);

  if (error) {
    console.error('Erreur lors de la récupération des invitations :', error);
    process.exit(1);
  }

  // URLs statiques avec options SEO
  const staticUrls = [
    { path: '', changefreq: 'weekly', priority: 1.0 },
    { path: 'templates', changefreq: 'monthly', priority: 0.8 },
    { path: 'pricing', changefreq: 'monthly', priority: 0.7 },
    { path: 'testimonials', changefreq: 'monthly', priority: 0.6 },
    { path: 'contact', changefreq: 'yearly', priority: 0.5 },
    { path: 'privacy', changefreq: 'yearly', priority: 0.3 },
    { path: 'terms', changefreq: 'yearly', priority: 0.3 },
    { path: 'cookies', changefreq: 'yearly', priority: 0.3 }
  ];

  // Construction du sitemap avec xmlbuilder2
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

  staticUrls.forEach(({ path, changefreq, priority }) => {
    const url = root.ele('url');
    url.ele('loc').txt(`https://loventy.org/${path}`).up();
    url.ele('changefreq').txt(changefreq).up();
    url.ele('priority').txt(priority).up();
    url.up();
  });

  invitations.forEach(inv => {
    const url = root.ele('url');
    url.ele('loc').txt(`https://loventy.org/invitation/${inv.id}`).up();
    if (inv.updated_at) {
      url.ele('lastmod').txt(new Date(inv.updated_at).toISOString().split('T')[0]).up();
    }
    url.ele('changefreq').txt('monthly').up();
    url.ele('priority').txt('0.6').up();
    url.up();
  });

  const xml = root.end({ prettyPrint: true });
  fs.writeFileSync('./public/sitemap.xml', xml);
  console.log('Sitemap complet généré avec xmlbuilder2 !');
}

main(); 