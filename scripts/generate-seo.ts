/**
 * Buddy4Plant - generates public/sitemap.xml, public/robots.txt and public/seo-routes.json.
 * seo-routes.json is used by server.ts (production) to put the right <title>, description,
 * canonical, Open Graph tags and JSON-LD into the HTML for each URL, so crawlers and link
 * previews see them without running JavaScript.
 *
 * Runs automatically before `npm run build`. Manual: npx tsx scripts/generate-seo.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { STORE_CATALOGUE } from '../src/data/initialProducts';
import { PILLAR_ARTICLES, BLOG_SECTIONS } from '../src/data/pillarArticles';
import { INITIAL_CATEGORIES } from '../src/data/initialCategories';
import {
  HOME_SEO, ALL_PLANTS_SEO, COLLECTIONS_SEO, SERVICES_SEO, PROJECTS_SEO, ABOUT_SEO, STORE_SEO, BLOG_SEO, GIFTING_SEO,
  categorySeo, productSeo,
} from '../src/data/seoCopy';
import {
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  absUrl,
  articleLd,
  blogPath,
  breadcrumbLd,
  faqLd,
  productLd,
} from '../src/utils/seo';

type Route = { title: string; description: string; image?: string; type?: string; jsonLd?: unknown[] };
const routes: Record<string, Route> = {};
const today = new Date().toISOString().slice(0, 10);
const urls: { loc: string; lastmod?: string; priority: string }[] = [];
const add = (path: string, r: Route, priority = '0.6', lastmod?: string) => {
  routes[path] = r;
  urls.push({ loc: absUrl(path), lastmod: lastmod || today, priority });
};
const clip = (s: string, n = 158) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

// Static pages
add('/', HOME_SEO, '1.0');
add('/plants', ALL_PLANTS_SEO, '0.9');
add('/garden-services', {
  ...SERVICES_SEO,
  jsonLd: [{
    '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Landscaping and gardening services',
    provider: { '@id': `${SITE_URL}/#organization` }, areaServed: ['Lucknow', 'Kanpur', 'Uttar Pradesh', 'Delhi'],
  }],
}, '0.9');
add('/projects', { ...PROJECTS_SEO, image: '/projects/giti-campuses.jpg' }, '0.7');
add('/about', ABOUT_SEO, '0.5');
// Visit / contact / help pages
add('/store-locator', {
  ...STORE_SEO,
  jsonLd: [{
    '@context': 'https://schema.org', '@type': 'GardenStore', '@id': `${SITE_URL}/#store`, name: 'Buddy4Plant',
    url: `${SITE_URL}/store-locator`, image: absUrl('/plant-photos/areca-palm-plant.jpg'), telephone: '+91-8004881668',
    address: { '@type': 'PostalAddress', addressLocality: 'Lucknow', addressRegion: 'Uttar Pradesh', addressCountry: 'IN' },
    geo: { '@type': 'GeoCoordinates', latitude: 26.9039826, longitude: 80.9602056 },
    hasMap: 'https://maps.app.goo.gl/kF5HbobUaLwzu3vu9', parentOrganization: { '@id': `${SITE_URL}/#organization` },
  }],
}, '0.7');
add('/contact', { title: 'Contact Buddy4Plant | Plants & Landscaping, Lucknow', description: 'Contact Buddy4Plant on WhatsApp or email for plant orders, bulk and corporate orders, and landscaping or garden maintenance enquiries.' }, '0.5');
add('/care-guide', { title: 'Plant Care Guide | Buddy4Plant', description: 'Simple care guide for your new plants from Buddy4Plant: light, watering, soil, feeding and common problems.' }, '0.5');
add('/plant-doctor', { title: 'Plant Doctor - Fix Common Plant Problems | Buddy4Plant', description: 'Yellow leaves, brown tips, drooping stems or pests? Find the likely cause and the fix with the Buddy4Plant plant doctor.' }, '0.5');
add('/reviews', { title: 'Customer Reviews | Buddy4Plant', description: 'Read what customers say about Buddy4Plant plants, pots, delivery and landscaping services.' }, '0.5');
add('/collections', COLLECTIONS_SEO, '0.6');
add('/shipping-policy', { title: 'Shipping Policy | Buddy4Plant', description: 'How Buddy4Plant packs and delivers plants and pots: delivery areas, timelines and charges.' }, '0.3');
add('/refund-policy', { title: 'Refund & Cancellation Policy | Buddy4Plant', description: 'Buddy4Plant refund, return and cancellation policy for plants, pots and other orders.' }, '0.3');
add('/privacy-policy', { title: 'Privacy Policy | Buddy4Plant', description: 'How Buddy4Plant collects, uses and protects your personal information.' }, '0.3');
add('/terms-and-conditions', { title: 'Terms & Conditions | Buddy4Plant', description: 'Terms and conditions for using the Buddy4Plant website and placing orders.' }, '0.3');
for (const [p, seo] of Object.entries(GIFTING_SEO)) add(p, seo, p === '/gifting' ? '0.7' : '0.6');

// Blog
add('/blog', BLOG_SEO, '0.8');
for (const [id, label] of Object.entries(BLOG_SECTIONS)) {
  add(`/blog/${id}`, { title: `${label} - Guides & Tips | Buddy4Plant`, description: `Buddy4Plant guides on ${label.toLowerCase()} for Indian homes, gardens and campuses.` }, '0.6');
}
for (const post of PILLAR_ARTICLES) {
  const path = blogPath(post);
  add(path, {
    title: `${post.seoTitle || post.title}`,
    description: post.metaDescription || post.excerpt,
    image: post.image,
    type: 'article',
    jsonLd: [
      articleLd(post),
      breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.category, path: `/blog/${post.section}` }, { name: post.title, path }]),
      ...(post.faqs?.length ? [faqLd(post.faqs)] : []),
    ],
  }, '0.8', post.updatedDate || post.isoDate);
}

// Categories
const catPath = (slug: string) =>
  ['fertilizers', 'potting-soil', 'pest-control', 'garden-tools', 'watering-tools', 'garden-decor', 'plant-care'].includes(slug) ? `/collections/${slug}` : `/plants/${slug}`;
for (const c of INITIAL_CATEGORIES as any[]) {
  if (!c?.slug || c.slug.includes('gifting')) continue;
  add(catPath(c.slug), categorySeo(c.slug, c.name, c.description), '0.7');
}

// Products
for (const p of STORE_CATALOGUE) {
  if (p.active === false) continue;
  const path = `/product/${p.slug}`;
  add(path, {
    ...productSeo(p),
    image: p.images?.[0],
    type: 'product',
    jsonLd: [productLd(p), breadcrumbLd([{ name: 'Home', path: '/' }, { name: p.subCategory || 'Shop', path: catPath(p.category) }, { name: p.name, path }])],
  }, '0.7');
}

const pub = join(process.cwd(), 'public');
writeFileSync(join(pub, 'seo-routes.json'), JSON.stringify(routes));
writeFileSync(
  join(pub, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n') +
    '\n</urlset>\n'
);
writeFileSync(
  join(pub, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /b4padmin\nDisallow: /checkout\nDisallow: /cart\nDisallow: /profile\nDisallow: /wishlist\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);
console.log(`SEO: ${urls.length} URLs in sitemap, ${Object.keys(routes).length} routes with meta tags.`);
