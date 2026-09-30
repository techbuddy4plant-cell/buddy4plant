import { PILLAR_ARTICLES } from '../data/pillarArticles';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Plant Care' | 'Interior Styling' | 'Planters & Decor' | 'Urban Gardening' | string;
  readTime: string;
  publishDate: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  /** Content blocks. Each block may use simple markdown: ## headings, lists, | tables |, **bold**, [links](/path). */
  content: string[];
  tags: string[];
  /** SEO & structure (optional) */
  section?: string;
  seoTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  imageAlt?: string;
  isoDate?: string;
  updatedDate?: string;
  faqs?: { q: string; a: string }[];
  related?: string[];
  cta?: { label: string; path: string };
}

const BLOG_STORAGE_KEY = 'b4p_blog_posts';

export const INITIAL_BLOG_POSTS: BlogPost[] = PILLAR_ARTICLES;

const BLOG_VERSION_KEY = 'b4p_blog_version';
const BLOG_VERSION = 'pillar-v1';
const OLD_DEMO_IDS = ['1', '2', '3', '4', '5'];

/** One-time switch from the old demo posts to the SEO pillar articles (keeps posts added in admin). */
const migrateBlog = () => {
  try {
    if (typeof window === 'undefined' || localStorage.getItem(BLOG_VERSION_KEY) === BLOG_VERSION) return;
    const saved = JSON.parse(localStorage.getItem(BLOG_STORAGE_KEY) || '[]');
    const pillarIds = new Set(PILLAR_ARTICLES.map((p) => p.id));
    const own = Array.isArray(saved) ? saved.filter((p: BlogPost) => p && !OLD_DEMO_IDS.includes(p.id) && !pillarIds.has(p.id)) : [];
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify([...PILLAR_ARTICLES, ...own]));
    localStorage.setItem(BLOG_VERSION_KEY, BLOG_VERSION);
  } catch (e) {}
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  migrateBlog();
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(BLOG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Error reading blog posts:', err);
  }
  return INITIAL_BLOG_POSTS;
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  const posts = await getBlogPosts();
  const index = posts.findIndex((p) => p.id === post.id);
  let updated: BlogPost[];
  if (index >= 0) {
    updated = [...posts];
    updated[index] = post;
  } else {
    updated = [post, ...posts];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'blog' } }));
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  const posts = await getBlogPosts();
  const updated = posts.filter((p) => p.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'blog' } }));
  }
}
