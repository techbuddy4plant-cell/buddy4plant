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
  content: string[];
  tags: string[];
}

const BLOG_STORAGE_KEY = 'b4p_blog_posts';

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'top-10-air-purifying-plants-indian-homes',
    title: '10 NASA-Approved Indoor Plants That Clean Air in Indian Homes',
    excerpt: 'Combat urban AQI and indoor toxins with resilient tropical houseplants proven to absorb formaldehyde, benzene, and particulate matter.',
    category: 'Plant Care',
    readTime: '5 min read',
    publishDate: 'Sep 18, 2026',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=1000&auto=format&fit=crop&q=80',
    author: {
      name: 'Dr. Ananya Roy',
      role: 'Chief Horticulturist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    tags: ['Air Purifiers', 'NASA Study', 'Indoor Foliage', 'Living Room'],
    content: [
      'Indoor air in urban Indian metropolitan areas like Delhi-NCR, Bengaluru, and Mumbai often carries 2 to 5 times more particulate matter and volatile organic compounds (VOCs) than ambient outdoor air due to synthetic furnishings, wall paints, and kitchen emissions.',
      'According to NASA’s Clean Air Study, certain tropical understory plants have evolved specialized stomatal pathways and root-microbiome relationships that actively break down volatile toxins like benzene, trichloroethylene, and formaldehyde into harmless organic nutrients.',
      'Our top nursery recommendations for Indian apartments include the Snake Plant (Sansevieria Trifasciata), which releases oxygen during the nighttime, the Peace Lily (Spathiphyllum) for humidifying dry AC air, and the hardy Areca Palm for filtering acetone and xylene.'
    ]
  },
  {
    id: '2',
    slug: 'the-monsoon-plant-care-guide-preventing-root-rot',
    title: 'The Indian Monsoon Plant Care Protocol: Preventing Root Rot & Fungal Shock',
    excerpt: 'High atmospheric humidity and overcast skies can drown root systems. Here is how to regulate watering rhythms and aerate container potting mix.',
    category: 'Plant Care',
    readTime: '6 min read',
    publishDate: 'Aug 24, 2026',
    image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1000&auto=format&fit=crop&q=80',
    author: {
      name: 'Karan Shenoy',
      role: 'Master Nurseryman',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    tags: ['Monsoon', 'Watering Rhythms', 'Foliage Care', 'Organic Bio-Defense'],
    content: [
      'When relative humidity tops 80%, evaporation from container potting mix drops by nearly 70%. Plants simply do not drink water at the same rate they do during hot summer months.',
      'Rule #1 during rains: Never water by the calendar. Always test the top 2 inches of soil with your index finger. If it feels cool and clammy, leave it alone for another 3 to 4 days.',
      'Ensure every planter has clear drainage holes. Elevate pots using clay risers or plant saucers so excess monsoon runoff never accumulates beneath the root zone.'
    ]
  },
  {
    id: '3',
    slug: 'choosing-planters-ceramic-vs-terracotta-vs-fiber',
    title: 'Ceramic vs Terracotta vs Fiber Stone: Choosing the Perfect Planter',
    excerpt: 'Planter material dictates soil aeration, moisture retention, and root respiration. Discover which material suits your plant species.',
    category: 'Planters & Decor',
    readTime: '4 min read',
    publishDate: 'Aug 10, 2026',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1000&auto=format&fit=crop&q=80',
    author: {
      name: 'Pooja Varma',
      role: 'Biophilic Design Lead',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    tags: ['Planters', 'Pots', 'Terracotta', 'Ceramics', 'Design Aesthetics'],
    content: [
      'Terracotta is naturally porous, allowing roots to breathe and wicking away excess moisture. It is ideal for cacti, succulents, snake plants, and beginner plant parents prone to accidental overwatering.',
      'Glazed Ceramic planters lock in moisture and offer statement textures and bespoke earthy tones. They pair best with moisture-loving tropicals like Monsteras, Calatheas, and Philodendrons.',
      'Fiberstone composite planters blend recycled stone powder with lightweight fiberglass, delivering luxury architectural scale for large indoor trees without the unmanageable weight.'
    ]
  },
  {
    id: '4',
    slug: 'balcony-garden-makeover-compact-apartments',
    title: 'Transforming Compact Apartment Balconies into Lush Green Sanctuaries',
    excerpt: 'Practical spatial hacks, railing planters, and vertical trellis setups to maximize plant diversity in limited urban square footage.',
    category: 'Urban Gardening',
    readTime: '7 min read',
    publishDate: 'Jul 29, 2026',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1000&auto=format&fit=crop&q=80',
    author: {
      name: 'Pooja Varma',
      role: 'Biophilic Design Lead',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    tags: ['Balcony Makeover', 'Vertical Gardens', 'Apartment Gardening', 'Urban Sanctuary'],
    content: [
      'Even a 4x8 foot urban balcony can support over 30 distinct species when designed with vertical layers. The secret lies in treating vertical walls and railings as primary planting zones.',
      'Anchor the corners with height: Use tall specimen palms or a Ficus Lyrata in lightweight planters. Line the railings with weather-sealed iron planter boxes for blooming bougainvillea and trailing pothos.',
      'Integrate natural wooden decking tiles and warm 2700K solar string lanterns to transform your concrete balcony into an evening botanical tea haven.'
    ]
  }
];

export async function getBlogPosts(): Promise<BlogPost[]> {
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
