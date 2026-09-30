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
add('/', { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }, '1.0');
add('/plants', { title: 'Buy Plants Online in Lucknow & India | Buddy4Plant', description: 'Indoor plants, XL plants, flowering, fruit and low-light plants from our Lucknow nursery, delivered in Buddy4Plant pots.' }, '0.9');
add('/garden-services', {
  title: 'Gardening & Landscaping Services in Lucknow | Buddy4Plant',
  description: 'Landscaping, garden design and Annual Maintenance Contracts (AMC) for homes, offices and government campuses across Uttar Pradesh and Delhi.',
  jsonLd: [{
    '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Landscaping and gardening services',
    provider: { '@id': `${SITE_URL}/#organization` }, areaServed: ['Lucknow', 'Kanpur', 'Uttar Pradesh', 'Delhi'],
  }],
}, '0.9');
add('/projects', { title: 'Landscaping Projects | Buddy4Plant', description: 'Landscaping and AMC projects by Buddy4Plant for government offices, institutes, industrial units and commercial sites in Uttar Pradesh.' }, '0.7');
add('/about', { title: 'About Buddy4Plant | Lucknow Nursery & Landscaping', description: 'Buddy4Plant is a Lucknow-based nursery and landscaping company growing plants and building gardens across Uttar Pradesh.' }, '0.5');
for (const [p, t] of [['/gifting', 'Plant Gifting'], ['/gifting/corporate', 'Corporate Plant Gifting'], ['/gifting/festive', 'Festive Plant Gifting'], ['/gifting/green', 'Green Gifting']] as const) {
  add(p, { title: `${t} | Buddy4Plant`, description: `${t} - plants, planters and hampers from Buddy4Plant, Lucknow.` }, '0.6');
}

// Blog
add('/blog', { title: 'Gardening Guides, Plant Care & Landscaping Blog | Buddy4Plant', description: 'Practical Indian gardening guides from a Lucknow nursery and landscaping team.' }, '0.8');
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
  add(catPath(c.slug), { title: `${c.name} | Buddy4Plant`, description: clip(c.description || `Shop ${c.name} online from Buddy4Plant, Lucknow.`) }, '0.7');
}

// Products
for (const p of STORE_CATALOGUE) {
  if (p.active === false) continue;
  const path = `/product/${p.slug}`;
  add(path, {
    title: `${p.name} - Buy Online | Buddy4Plant`,
    description: clip(`${p.shortDescription || ''} Price ₹${p.price}. Buy ${p.name} online from Buddy4Plant, Lucknow.`.trim()),
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
