const fs = require('fs');
const { create } = require('xmlbuilder2');

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

const root = create({ version: '1.0', encoding: 'UTF-8' })
  .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

staticUrls.forEach(({ path, changefreq, priority }) => {
  const url = root.ele('url');
  url.ele('loc').txt(`https://loventy.org/${path}`).up();
  url.ele('changefreq').txt(changefreq).up();
  url.ele('priority').txt(priority).up();
  url.up();
});

const xml = root.end({ prettyPrint: true });
fs.writeFileSync('./public/sitemap.xml', xml);
console.log('Sitemap statique généré sans invitations dynamiques !'); 