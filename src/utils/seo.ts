/**
 * Buddy4Plant SEO helpers: title, meta description, canonical URL, Open Graph / Twitter tags
 * and JSON-LD structured data for each page.
 *
 * The production server (server.ts) injects the same tags into the HTML for crawlers
 * (from dist/seo-routes.json); these helpers keep them correct while users navigate the SPA.
 */
import type { BlogPost } from '../services/blogService';
import type { Product } from '../types';

export const SITE_URL = 'https://buddy4plant.in';
export const SITE_NAME = 'Buddy4Plant';
export const DEFAULT_TITLE = 'Buddy4Plant - Plants, Pots, Gardening & Landscaping in Lucknow';
export const DEFAULT_DESCRIPTION =
  'Buddy4Plant is a Lucknow nursery and landscaping company: indoor and outdoor plants, pots, soil, compost and plant food, plus gardening services and AMC across Uttar Pradesh.';
export const DEFAULT_IMAGE = '/plant-photos/areca-palm-plant.jpg';

export const absUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);

type JsonLd = Record<string, unknown>;

export interface SeoOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: JsonLd[];
  noindex?: boolean;
}

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export function setSeo({ title, description, path, image, type = 'website', jsonLd = [], noindex }: SeoOptions) {
  if (typeof document === 'undefined') return;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = absUrl(path.split('?')[0]);
  const img = absUrl(image || DEFAULT_IMAGE);
  document.title = fullTitle;
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  upsertLink('canonical', url);
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:title', fullTitle);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:type', type === 'product' ? 'product' : type);
  upsertMeta('property', 'og:image', img);
  upsertMeta('property', 'og:locale', 'en_IN');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', fullTitle);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', img);

  let script = document.getElementById('b4p-page-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'b4p-page-jsonld';
    document.head.appendChild(script);
  }
  script.textContent = jsonLd.length ? JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd) : '';
}

/* ------------------------------------------------------------------ */
/* Structured data builders                                            */
/* ------------------------------------------------------------------ */

export const ORG_ID = `${SITE_URL}/#organization`;

export const breadcrumbLd = (items: { name: string; path: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.path) })),
});

export const blogPath = (post: Pick<BlogPost, 'slug'> & { section?: string }) =>
  post.section ? `/blog/${post.section}/${post.slug}` : `/blog/${post.slug}`;

export const articleLd = (post: BlogPost): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.metaDescription || post.excerpt,
  image: absUrl(post.image),
  datePublished: post.isoDate || undefined,
  dateModified: post.updatedDate || post.isoDate || undefined,
  author: { '@type': 'Organization', name: post.author?.name || SITE_NAME, url: absUrl('/about') },
  publisher: { '@id': ORG_ID },
  mainEntityOfPage: absUrl(blogPath(post)),
  keywords: [post.primaryKeyword, ...(post.tags || [])].filter(Boolean).join(', '),
  articleSection: post.category,
  inLanguage: 'en-IN',
});

export const faqLd = (faqs: { q: string; a: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const productLd = (p: Product): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.name,
  description: p.shortDescription || p.description,
  image: (p.images || []).slice(0, 4).map(absUrl),
  sku: p.sku,
  brand: { '@type': 'Brand', name: SITE_NAME },
  category: p.subCategory || p.category,
  url: absUrl(`/product/${p.slug}`),
  offers: {
    '@type': 'Offer',
    priceCurrency: 'INR',
    price: p.price,
    availability: (p.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: absUrl(`/product/${p.slug}`),
    seller: { '@id': ORG_ID },
  },
});

export const itemListLd = (name: string, items: { name: string; path: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.slice(0, 30).map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absUrl(it.path) })),
});
