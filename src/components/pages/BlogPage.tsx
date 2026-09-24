import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Tag,
  Leaf,
  ChevronRight,
  Share2,
  X,
  CheckCircle2
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Plant Care' | 'Interior Styling' | 'Planters & Decor' | 'Urban Gardening';
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

const BLOG_POSTS: BlogPost[] = [
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
  },
  {
    id: '5',
    slug: 'biophilic-living-spaces-science-of-indoor-greens',
    title: 'The Science of Biophilic Spaces: Why Indoor Plants Elevate Daily Wellbeing',
    excerpt: 'How living botanical elements reduce cortisol levels, sharpen focus during remote work, and soften hard modern interior lines.',
    category: 'Interior Styling',
    readTime: '5 min read',
    publishDate: 'Jul 15, 2026',
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=1000&auto=format&fit=crop&q=80',
    author: {
      name: 'Dr. Ananya Roy',
      role: 'Chief Horticulturist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    tags: ['Biophilia', 'Mental Wellness', 'Work From Home', 'Aesthetics'],
    content: [
      'Humans possess an innate biological urge to connect with nature—a concept known as Biophilia. Multiple psychological studies demonstrate that workstations framed by living plants record a 15% increase in creative productivity and a notable decline in physiological stress markers.',
      'Placing plants with fractal leaf patterns (such as Monstera Deliciosa or Bird of Paradise) near natural light creates dynamic shadow play throughout the day, anchoring the circadian rhythm of living room occupants.'
    ]
  }
];

const CATEGORIES = ['All', 'Plant Care', 'Interior Styling', 'Planters & Decor', 'Urban Gardening'] as const;

export const BlogPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-10 sm:py-14 font-sans text-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A]">
          <button onClick={() => navigate('/')} className="hover:text-[#141414] transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-[#1F3B22] font-semibold">The Botanical Journal & Blog</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5EC] border border-[#C5E1C9]">
            <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Nursery Wisdom &amp; Guides
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#142B1A]">
            The Botanical Journal
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5C5C] leading-relaxed max-w-2xl mx-auto">
            Practical care rituals, seasonal watering wisdom, and biophilic architectural guides written by our certified horticulturists and nursery botanists.
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E2D9] shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1F3B22] text-white shadow-xs'
                    : 'bg-[#FAF9F5] text-[#5C5C5C] hover:text-[#1F3B22] hover:bg-[#F3F1EB] border border-[#E5E2D9]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search botanical guides..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#DDD9CF] rounded-full text-xs text-[#141414] placeholder-[#8A8A8A] focus:outline-none focus:border-[#1F3B22]"
            />
            <Search className="w-3.5 h-3.5 text-[#7A7A7A] absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E5E2D9]">
            <Leaf className="w-10 h-10 text-[#2D6A4F] mx-auto mb-3 opacity-60" />
            <h3 className="font-editorial text-lg font-bold text-[#141414]">No journal entries found</h3>
            <p className="text-xs text-[#7A7A7A] mt-1">Try another search keyword or select &apos;All&apos; categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => setActiveArticle(post)}
                className="group bg-white rounded-3xl border border-[#E5E2D9] overflow-hidden flex flex-col justify-between hover:border-[#1F3B22]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-[#F3F1EB]">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#1F3B22] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-[#7A7A7A]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.publishDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-editorial font-bold text-lg sm:text-xl text-[#141414] leading-snug group-hover:text-[#1F3B22] transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs text-[#5C5C5C] leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer with Author & CTA */}
                <div className="p-5 sm:p-6 pt-0 border-t border-[#F2EFE8] mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#1F3B22]/20"
                    />
                    <div>
                      <p className="text-[11px] font-bold text-[#141414] leading-tight">{post.author.name}</p>
                      <p className="text-[9px] text-[#7A7A7A]">{post.author.role}</p>
                    </div>
                  </div>

                  <span className="w-8 h-8 rounded-full bg-[#FAF9F5] group-hover:bg-[#1F3B22] group-hover:text-white text-[#1F3B22] flex items-center justify-center transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Interactive Article Reading Modal */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-[#0F1710]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-[#FDFCF9] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E5E2D9] shadow-2xl p-6 sm:p-10 relative animate-fadeIn">
              {/* Close Button */}
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white border border-[#E5E2D9] text-[#4A4A4A] hover:text-[#141414] hover:bg-[#F3F1EB] flex items-center justify-center transition-colors shadow-xs"
                aria-label="Close article modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Article Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="bg-[#1F3B22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {activeArticle.category}
                  </span>
                  <span className="text-xs text-[#7A7A7A]">• {activeArticle.readTime}</span>
                </div>

                <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#141414] leading-tight">
                  {activeArticle.title}
                </h2>

                <div className="flex items-center gap-3 pb-4 border-b border-[#E8E5DC]">
                  <img
                    src={activeArticle.author.avatar}
                    alt={activeArticle.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1F3B22]/20"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#141414]">{activeArticle.author.name}</p>
                    <p className="text-[10px] text-[#7A7A7A]">{activeArticle.author.role} • Published {activeArticle.publishDate}</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-16/9 bg-[#F3F1EB]">
                  <img
                    src={activeArticle.image}
                    alt={activeArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                  {activeArticle.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Tags */}
                <div className="pt-4 border-t border-[#E8E5DC] flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-[#141414] uppercase tracking-wider">Related Topics:</span>
                  {activeArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-[#FAF9F5] border border-[#DDD9CF] text-[10px] font-semibold text-[#5A5A5A] rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Direct Action */}
                <div className="bg-[#EBF5EC] p-5 rounded-2xl border border-[#C5E1C9] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#142B1A]">Looking for recommended plants or care kits?</h4>
                    <p className="text-[11px] text-[#3D6A48] mt-0.5">Explore our greenhouse collections hand-potted for indoor living spaces.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveArticle(null);
                      navigate('/plants');
                    }}
                    className="pill-btn-dark px-6 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                  >
                    Shop Living Plants &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
