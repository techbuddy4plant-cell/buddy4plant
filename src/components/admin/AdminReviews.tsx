import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit2, Trash2, CheckCircle, X, Search, ShieldCheck } from 'lucide-react';
import { Review } from '../../types';
import { getAllReviews, addReview, updateReviewStatus, deleteReview } from '../../services/reviewService';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Form state
  const [userName, setUserName] = useState('');
  const [productName, setProductName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [verifiedPurchase, setVerifiedPurchase] = useState(true);
  const [approved, setApproved] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openAddModal = () => {
    setEditingReview(null);
    setUserName('');
    setProductName('Monstera Deliciosa');
    setRating(5);
    setTitle('Exceptional quality & packaging');
    setComment('');
    setVerifiedPurchase(true);
    setApproved(true);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Review) => {
    setEditingReview(r);
    setUserName(r.userName);
    setProductName(r.productName || '');
    setRating(r.rating);
    setTitle(r.title);
    setComment(r.comment);
    setVerifiedPurchase(r.verifiedPurchase);
    setApproved(r.approved);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    if (editingReview) {
      // update approved status and local list
      await updateReviewStatus(editingReview.id, approved);
      const updated = reviews.map((r) =>
        r.id === editingReview.id
          ? { ...r, userName, productName, rating, title, comment, verifiedPurchase, approved }
          : r
      );
      setReviews(updated);
    } else {
      await addReview({
        productId: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        productName,
        userId: 'admin_created',
        userName,
        userEmail: 'customer@buddy4plant.com',
        rating,
        title,
        comment,
        verifiedPurchase,
        approved,
      });
      await fetchReviews();
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this customer review?')) {
      await deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  const filtered = reviews.filter(
    (r) =>
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.productName && r.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">
              Customer Reviews &amp; Testimonials
            </h2>
            <span className="bg-[#EBF3EC] text-[#2D6A4F] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {reviews.length} Total
            </span>
          </div>
          <p className="text-xs text-[#5A5A5A] font-light mt-0.5">
            Manage real customer feedback, ratings, and social proof displayed across the storefront.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all self-start sm:self-auto rounded-md shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Customer Review
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E5E2D9] flex items-center justify-between shadow-2xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by customer name, review, or plant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
          />
          <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6A7B6B]">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-12 text-center">
          <Star className="w-12 h-12 text-[#A3B899] mx-auto mb-3" />
          <h3 className="font-serif font-bold text-base text-[#1A1A1A]">No reviews found</h3>
          <p className="text-xs text-[#6A7B6B] mt-1">Add your first verified customer review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-[#E5E2D9] rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.approved ? 'Published' : 'Pending'}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-[#1A1A1A] leading-snug">{r.title}</h4>
                <p className="text-xs text-[#525252] font-light mt-1.5 line-clamp-3">&ldquo;{r.comment}&rdquo;</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0ECE1] flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#1F3B22]">{r.userName}</p>
                  <p className="text-[10px] text-[#7A7A7A] truncate max-w-[150px]">
                    {r.productName || 'Houseplant Collection'}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1.5 text-[#5A5A5A] hover:text-[#1F3B22] rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-[#5A5A5A] hover:text-rose-700 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responsive Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#0F1710]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white border border-[#E5E2D9] max-w-lg w-full rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-fadeIn my-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E2D9] flex items-center justify-between bg-[#FCFBF8] shrink-0">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1A1A]">
                {editingReview ? 'Edit Review & Rating' : 'Add Customer Review'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#6A7B6B] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              id="review-form"
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Plant / Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Spathiphyllum Peace Lily"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Star Rating (1 to 5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-500 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-[#1A1A1A] ml-2">{rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Arrived in pristine condition!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Review Comments *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write the full customer review..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={approved}
                    onChange={(e) => setApproved(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2D4A27]"
                  />
                  <span className="font-semibold text-[#1A1A1A]">Publish on Live Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={verifiedPurchase}
                    onChange={(e) => setVerifiedPurchase(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2D4A27]"
                  />
                  <span className="font-semibold text-[#1A1A1A]">Verified Plant Parent Badge</span>
                </label>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#E5E2D9] bg-[#FAF9F5] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-[#5A5A5A] hover:bg-[#EAE7DF] rounded-lg font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="review-form"
                className="px-6 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
