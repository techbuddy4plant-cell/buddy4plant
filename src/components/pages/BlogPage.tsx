import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Calendar, ChevronDown, Clock, Leaf, ListTree, Search, Share2, CheckCircle2 } from '../common/Icons';
import { BlogPost, getBlogPosts, INITIAL_BLOG_POSTS } from '../../services/blogService';
import { BLOG_SECTIONS } from '../../data/pillarArticles';
import { MarkdownBlock, extractHeadings } from '../blog/MarkdownBlock';
import { articleLd, blogPath, breadcrumbLd, faqLd, itemListLd, setSeo, ORG_ID, SITE_URL } from '../../utils/seo';

const sectionOf = (p: BlogPost) =>
  p.section || Object.keys(BLOG_SECTIONS).find((k) => BLOG_SECTIONS[k] === p.category) || '';

const Link: React.FC<{ to: string; navigate: (p: string) => void; className?: string; children: React.ReactNode; ariaLabel?: string }> = ({
  to,
  navigate,
  className,
  children,
  ariaLabel,
}) => (
  <a
    href={to}
    aria-label={ariaLabel}
    className={className}
    onClick={(e) => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      navigate(to);
      window.scrollTo({ top: 0 });
    }}
  >
    {children}
  </a>
);

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

const PostCard: React.FC<{ post: BlogPost; navigate: (p: string) => void; index: number }> = ({ post, navigate, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.5, delay: (index % 3) * 0.06 }}
    className="group bg-white rounded-[22px] ring-1 ring-[#ECE6DA] shadow-[0_10px_30px_-18px_rgba(19,48,27,0.35)] overflow-hidden flex flex-col hover:shadow-[0_22px_40px_-20px_rgba(19,48,27,0.45)] hover:-translate-y-1 transition-all duration-300"
  >
    <Link to={blogPath({ slug: post.slug, section: sectionOf(post) })} navigate={navigate} className="flex flex-col h-full">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F3F1EB]">
        <img
          src={post.image}
          alt={post.imageAlt || post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <span className="absolute top-3 left-3 bg-[#1F3B22] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {post.category}
        </span>
      </div>
      <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col">
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
        <h2 className="font-serif font-bold text-lg sm:text-xl text-[#141414] leading-snug group-hover:text-[#1F3B22] transition-colors">
          {post.title}
        </h2>
        <p className="text-xs text-[#5C5C5C] leading-relaxed line-clamp-3">{post.excerpt}</p>
        <span className="mt-auto pt-3 text-xs font-bold text-[#1F3B22] inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
          Read guide <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  </motion.article>
);

/* ------------------------------------------------------------------ */
/* Article page                                                        */
/* ------------------------------------------------------------------ */

const ArticleView: React.FC<{ post: BlogPost; posts: BlogPost[]; navigate: (p: string) => void }> = ({ post, posts, navigate }) => {
  const section = sectionOf(post);
  const headings = useMemo(() => extractHeadings(post.content || []), [post]);
  const related = (post.related || [])
    .map((s) => posts.find((p) => p.slug === s))
    .filter(Boolean) as BlogPost[];
  const fallbackRelated = related.length ? related : posts.filter((p) => p.id !== post.id && sectionOf(p) === section).slice(0, 3);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const path = blogPath({ slug: post.slug, section });
    const crumbs = [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      ...(section ? [{ name: BLOG_SECTIONS[section] || post.category, path: `/blog/${section}` }] : []),
      { name: post.title, path },
    ];
    setSeo({
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      path,
      image: post.image,
      type: 'article',
      jsonLd: [articleLd(post), breadcrumbLd(crumbs), ...(post.faqs?.length ? [faqLd(post.faqs)] : [])],
    });
  }, [post, section]);

  const share = async () => {
    const url = `${SITE_URL}${blogPath({ slug: post.slug, section })}`;
    try {
      if ((navigator as any).share) await (navigator as any).share({ title: post.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* share cancelled */
    }
  };

  return (
    <article className="max-w-6xl mx-auto" itemScope itemType="https://schema.org/BlogPosting">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#7A7A7A] mb-6">
        <Link to="/" navigate={navigate} className="hover:text-[#141414]">Home</Link>
        <span>/</span>
        <Link to="/blog" navigate={navigate} className="hover:text-[#141414]">Blog</Link>
        {section && (
          <>
            <span>/</span>
            <Link to={`/blog/${section}`} navigate={navigate} className="hover:text-[#141414]">{BLOG_SECTIONS[section]}</Link>
          </>
        )}
      </nav>

      <header className="max-w-3xl space-y-4">
        <span className="inline-block bg-[#1F3B22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{post.category}</span>
        <h1 itemProp="headline" className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#141414] leading-tight">
          {post.title}
        </h1>
        <p className="text-sm sm:text-base text-[#5C5C5C] leading-relaxed">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#6A6A6A] pt-1">
          <Link to="/about" navigate={navigate} className="flex items-center gap-2 font-bold text-[#141414] hover:text-[#1F3B22]">
            <img src={(post.author?.avatar && post.author.avatar !== '/logo.svg' ? post.author.avatar : '/logo.png')} alt="" className="w-7 h-7 rounded-full bg-white ring-1 ring-[#1F3B22]/20 object-contain" />
            <span itemProp="author">{post.author?.name}</span>
          </Link>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={post.isoDate}>{post.publishDate}</time>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
          <button onClick={share} className="flex items-center gap-1 font-semibold text-[#1F3B22] hover:underline">
            <Share2 className="w-3.5 h-3.5" /> {copied ? 'Link copied' : 'Share'}
          </button>
        </div>
      </header>

      <div className="mt-8 rounded-3xl overflow-hidden aspect-[16/8] bg-[#F3F1EB] border border-[#E5E2D9]">
        <img src={post.image} alt={post.imageAlt || post.title} className="w-full h-full object-cover" itemProp="image" />
      </div>

      <div className="mt-10 grid lg:grid-cols-12 gap-10">
        {/* Table of contents */}
        {headings.length > 2 && (
          <aside className="lg:col-span-3 lg:order-2">
            <div className="lg:sticky lg:top-28 bg-white border border-[#E5E2D9] rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#142B1A] mb-3 flex items-center gap-1.5">
                <ListTree className="w-3.5 h-3.5" /> In this guide
              </p>
              <ol className="space-y-2 text-xs">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[#4A4A4A] hover:text-[#1F3B22] leading-snug block"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        )}

        <div className={`${headings.length > 2 ? 'lg:col-span-9 lg:order-1' : 'lg:col-span-12'} max-w-3xl`}>
          <div itemProp="articleBody" className="space-y-5 text-sm sm:text-[15px] text-[#3A3A3A] leading-relaxed">
            {(post.content || []).map((b, i) => (
              <MarkdownBlock key={i} block={b} navigate={navigate} />
            ))}
          </div>

          {/* FAQ */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#142B1A] mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {post.faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q} className={`rounded-2xl border bg-white ${open ? 'border-[#2D6A4F]/50' : 'border-[#E5E2D9]'}`}>
                      <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 p-4 text-left">
                        <h3 className="text-sm font-bold text-[#142B1A]">{f.q}</h3>
                        <ChevronDown className={`w-4 h-4 shrink-0 text-[#1F3B22] transition-transform ${open ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={open ? 'block' : 'hidden'}>
                        <p className="px-4 pb-4 text-sm text-[#5C5C5C] leading-relaxed">{f.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-12 bg-[#142B1A] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 b4p-fixed-theme">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B7D7A8]">Buddy4Plant, Lucknow</p>
              <h2 className="font-serif text-xl sm:text-2xl font-bold mt-1">Need plants, products or a garden plan?</h2>
              <p className="text-xs text-white/75 mt-1.5 max-w-md">
                Our nursery team can suggest the right plants for your space, and our gardening team handles landscaping and AMC across Uttar Pradesh.
              </p>
            </div>
            <Link
              to={post.cta?.path || '/plants'}
              navigate={navigate}
              className="shrink-0 px-6 py-3 rounded-full bg-[#B7D7A8] text-[#142B1A] text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2"
            >
              {post.cta?.label || 'Shop plants'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Entity / author box */}
          <div className="mt-8 flex gap-4 items-start bg-white border border-[#E5E2D9] rounded-2xl p-5">
            <img src="/logo.png" alt="Buddy4Plant logo" className="w-12 h-12 rounded-full bg-[#F3F1EB] object-contain shrink-0" />
            <div className="text-xs text-[#5C5C5C] leading-relaxed">
              <p className="font-bold text-sm text-[#141414]">About {post.author?.name || 'Buddy4Plant'}</p>
              <p className="mt-1">
                Buddy4Plant is a nursery and landscaping company based in Lucknow, Uttar Pradesh. We grow and sell plants, pots, soil, compost and
                plant food, and carry out landscaping and garden maintenance for homes, offices and government and institutional campuses. Our
                guides are written from that day-to-day nursery and site experience.
              </p>
              <div className="flex flex-wrap gap-3 mt-2 font-semibold">
                <Link to="/about" navigate={navigate} className="text-[#1F3B22] hover:underline">About us</Link>
                <Link to="/garden-services" navigate={navigate} className="text-[#1F3B22] hover:underline">Gardening services</Link>
                <Link to="/plants" navigate={navigate} className="text-[#1F3B22] hover:underline">Shop plants</Link>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {post.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 bg-[#FAF9F5] border border-[#DDD9CF] text-[10px] font-semibold text-[#5A5A5A] rounded-md">
                #{t.replace(/\s+/g, '')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {fallbackRelated.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-extrabold text-[#142B1A] mb-6">Related guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fallbackRelated.map((p, i) => (
              <PostCard key={p.id} post={p} navigate={navigate} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

/* ------------------------------------------------------------------ */
/* Page (list, section and article routes)                             */
/* ------------------------------------------------------------------ */

export const BlogPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = () => getBlogPosts().then(setPosts);
    load();
    window.addEventListener('b4p_store_data_changed', load);
    return () => window.removeEventListener('b4p_store_data_changed', load);
  }, []);

  const parts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean); // ['blog', ...]
  const a = parts[1];
  const b = parts[2];
  const isSection = !!a && !!BLOG_SECTIONS[a] && !b;
  const section = isSection ? a : 'all';
  const article = b
    ? posts.find((p) => p.slug === b)
    : a && !BLOG_SECTIONS[a]
    ? posts.find((p) => p.slug === a)
    : undefined;

  const filtered = posts.filter((p) => {
    const q = searchQuery.toLowerCase();
    const inSection = section === 'all' || sectionOf(p) === section;
    const match = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
    return inSection && match;
  });

  useEffect(() => {
    if (article) return;
    const path = section === 'all' ? '/blog' : `/blog/${section}`;
    const name = section === 'all' ? 'Gardening Guides & Blog' : `${BLOG_SECTIONS[section]} Guides`;
    setSeo({
      title: section === 'all' ? 'Gardening Guides, Plant Care & Landscaping Blog' : `${BLOG_SECTIONS[section]} - Guides & Tips`,
      description:
        section === 'all'
          ? 'Practical Indian gardening guides from a Lucknow nursery and landscaping team: plant care, kitchen gardens, soil and compost, landscaping costs, Miyawaki and real projects.'
          : `Buddy4Plant guides on ${BLOG_SECTIONS[section].toLowerCase()} for Indian homes, gardens and campuses.`,
      path,
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'Blog', name: `Buddy4Plant ${name}`, url: `${SITE_URL}${path}`, publisher: { '@id': ORG_ID } },
        breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, ...(section === 'all' ? [] : [{ name: BLOG_SECTIONS[section], path }])]),
        itemListLd(name, filtered.map((p) => ({ name: p.title, path: blogPath({ slug: p.slug, section: sectionOf(p) }) }))),
      ],
    });
  }, [article, section, filtered.length]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-10 sm:py-14 font-sans text-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {article ? (
          <ArticleView post={article} posts={posts} navigate={navigate} />
        ) : (
          <>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7A7A7A]">
              <Link to="/" navigate={navigate} className="hover:text-[#141414]">Home</Link>
              <span>/</span>
              <Link to="/blog" navigate={navigate} className={section === 'all' ? 'text-[#1F3B22] font-semibold' : 'hover:text-[#141414]'}>Blog</Link>
              {section !== 'all' && (
                <>
                  <span>/</span>
                  <span className="text-[#1F3B22] font-semibold">{BLOG_SECTIONS[section]}</span>
                </>
              )}
            </nav>

            <header className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5EC] border border-[#C5E1C9]">
                <BookOpen className="w-3.5 h-3.5" /> Guides from our nursery &amp; gardening team
              </span>
              <h1 className="font-editorial text-3xl sm:text-5xl font-extrabold tracking-tight text-[#142B1A]">
                {section === 'all' ? 'Gardening Guides & Blog' : BLOG_SECTIONS[section]}
              </h1>
              <p className="text-xs sm:text-sm text-[#5C5C5C] leading-relaxed max-w-2xl mx-auto">
                Practical, India-first advice on plants, soil, kitchen gardens, landscaping and Miyawaki forests - written from real nursery and
                project experience in Lucknow and Uttar Pradesh.
              </p>
            </header>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E2D9]">
              <nav aria-label="Blog sections" className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {[['all', 'All guides'], ...Object.entries(BLOG_SECTIONS)].map(([id, label]) => (
                  <Link
                    key={id}
                    to={id === 'all' ? '/blog' : `/blog/${id}`}
                    navigate={navigate}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      section === id ? 'bg-[#1F3B22] text-white' : 'bg-[#FAF9F5] text-[#5C5C5C] hover:text-[#1F3B22] border border-[#E5E2D9]'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="relative w-full md:w-72 shrink-0">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guides..."
                  aria-label="Search guides"
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#DDD9CF] rounded-full text-xs text-[#141414] placeholder-[#8A8A8A] focus:outline-none focus:border-[#1F3B22]"
                />
                <Search className="w-3.5 h-3.5 text-[#7A7A7A] absolute left-3 top-2.5" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#E5E2D9]">
                <Leaf className="w-10 h-10 text-[#2D6A4F] mx-auto mb-3 opacity-60" />
                <h2 className="font-serif text-lg font-bold text-[#141414]">No guides found</h2>
                <p className="text-xs text-[#7A7A7A] mt-1">Try another keyword or view all guides.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filtered.map((post, i) => (
                  <PostCard key={post.id} post={post} navigate={navigate} index={i} />
                ))}
              </div>
            )}

            <div className="bg-[#EBF5EC] border border-[#C5E1C9] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-sm text-[#142B1A]">Have a plant problem or planning a garden?</h2>
                  <p className="text-xs text-[#3D6A48] mt-0.5">Ask our team - we answer gardening questions and do free site visits in Lucknow &amp; Kanpur.</p>
                </div>
              </div>
              <Link to="/garden-services" navigate={navigate} className="pill-btn-dark px-6 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                Ask our team &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
