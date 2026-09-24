import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react';
import { BlogPost, getBlogPosts, saveBlogPost, deleteBlogPost } from '../../services/blogService';
import { PlantImage } from '../../utils/imageFallback';

interface AdminBlogProps {
  navigate: (path: string) => void;
}

export const AdminBlog: React.FC<AdminBlogProps> = ({ navigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Plant Care');
  const [readTime, setReadTime] = useState('5 min read');
  const [image, setImage] = useState('');
  const [authorName, setAuthorName] = useState('Dr. Ananya Roy');
  const [authorRole, setAuthorRole] = useState('Chief Horticulturist');
  const [contentString, setContentString] = useState('');
  const [tagsString, setTagsString] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getBlogPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleDataChanged = () => loadData();
    window.addEventListener('b4p_store_data_changed', handleDataChanged);
    return () => window.removeEventListener('b4p_store_data_changed', handleDataChanged);
  }, []);

  const openAddModal = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setCategory('Plant Care');
    setReadTime('5 min read');
    setImage('https://images.unsplash.com/photo-1545241047-6083a3684587?w=1000&auto=format&fit=crop&q=80');
    setAuthorName('Dr. Ananya Roy');
    setAuthorRole('Chief Horticulturist');
    setContentString('');
    setTagsString('Houseplants, Plant Care, Living Room');
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setCategory(post.category);
    setReadTime(post.readTime);
    setImage(post.image);
    setAuthorName(post.author?.name || 'Dr. Ananya Roy');
    setAuthorRole(post.author?.role || 'Chief Horticulturist');
    setContentString(post.content?.join('\n\n') || '');
    setTagsString(post.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const computedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const paragraphs = contentString
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const postPayload: BlogPost = {
      id: editingPost ? editingPost.id : Date.now().toString(),
      slug: computedSlug,
      title: title.trim(),
      excerpt: excerpt.trim(),
      category: category as any,
      readTime: readTime.trim() || '5 min read',
      publishDate: editingPost ? editingPost.publishDate : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: image.trim() || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=1000&auto=format&fit=crop&q=80',
      author: {
        name: authorName.trim() || 'Dr. Ananya Roy',
        role: authorRole.trim() || 'Chief Horticulturist',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      },
      content: paragraphs.length > 0 ? paragraphs : [excerpt],
      tags: tagsString.split(',').map((t) => t.trim()).filter(Boolean),
    };

    await saveBlogPost(postPayload);
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      await deleteBlogPost(id);
      loadData();
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-[#E5E2D9] rounded-lg shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2D4A27]" />
            blog — Botanical Articles &amp; Editorial Care Guides
          </h2>
          <p className="text-xs text-[#5A5A5A] font-light mt-0.5">
            Manage living flora stories, watering rhythm tutorials, and nursery plant wisdom published to the storefront /blog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/blog')}
            className="px-3.5 py-2 bg-[#F5F2EB] hover:bg-[#EAE5D9] text-[#1A1A1A] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors border border-[#D5CFC2]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#5A5A5A]" />
            View Live Blog
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Write New Article
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 border border-[#E5E2D9] rounded-lg">
        <Search className="w-4 h-4 text-[#8A8A8A]" />
        <input
          type="text"
          placeholder="Search articles by title, category, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-[#1A1A1A] focus:outline-none"
        />
      </div>

      {/* Article Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500">Loading blog articles...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E5E2D9] rounded-lg">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No blog posts found</p>
          <p className="text-xs text-gray-500 mt-1">Click &quot;Write New Article&quot; to publish your first botanical guide.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-[#E5E2D9] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="relative aspect-video bg-[#F5F2EB] overflow-hidden">
                  <PlantImage src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 bg-[#1F3B22]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-[#7A7A7A]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.publishDate}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-[#1A1A1A] leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#5A5A5A] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[9px] bg-[#F5F2EB] text-[#5A5A5A] px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-[#F0ECE1] flex items-center justify-between text-xs mt-3">
                <span className="text-[11px] text-[#7A7A7A] truncate font-medium">
                  By {post.author?.name || 'Horticulturist'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(post)}
                    className="p-1.5 text-gray-600 hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded transition-colors"
                    title="Edit Post"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E5E2D9] p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                {editingPost ? 'Edit Blog Article' : 'Write New Botanical Guide'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 NASA-Approved Indoor Plants That Clean Air in Indian Homes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E2D9] rounded font-semibold text-sm focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E2D9] rounded bg-white text-xs focus:outline-none focus:border-[#2D4A27]"
                  >
                    <option value="Plant Care">Plant Care</option>
                    <option value="Interior Styling">Interior Styling</option>
                    <option value="Planters & Decor">Planters &amp; Decor</option>
                    <option value="Urban Gardening">Urban Gardening</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full px-3 py-2 border border-[#E5E2D9] rounded focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-[#E5E2D9] rounded font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Short Excerpt / Teaser *</label>
                <textarea
                  rows={2}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise 1-2 sentence hook for the article preview card..."
                  className="w-full px-3 py-2 border border-[#E5E2D9] rounded focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Article Content (Separate paragraphs with double Enter)</label>
                <textarea
                  rows={6}
                  value={contentString}
                  onChange={(e) => setContentString(e.target.value)}
                  placeholder="Write the full botanical guide here. Each paragraph separated by an empty line..."
                  className="w-full px-3 py-2 border border-[#E5E2D9] rounded focus:outline-none focus:border-[#2D4A27] font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E2D9] rounded focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Author Title / Role</label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E2D9] rounded focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="Air Purifiers, Monsoon Care, Living Room"
                  className="w-full px-3 py-2 border border-[#E5E2D9] rounded focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white rounded font-bold"
                >
                  {editingPost ? 'Save Article Changes' : 'Publish Article Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
