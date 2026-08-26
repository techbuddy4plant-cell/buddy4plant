import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquare, Send } from 'lucide-react';
import { Review, Product } from '../../types';
import { getProductReviews, submitReview } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';

interface ReviewListProps {
  product: Product;
}

export const ReviewList: React.FC<ReviewListProps> = ({ product }) => {
  const { user, profile, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getProductReviews(product.id).then(setReviews);
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !profile) {
      openAuthModal('login');
      return;
    }
    if (!title.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const newRev = await submitReview({
        productId: product.id,
        productName: product.name,
        userId: user?.uid || profile?.uid || 'guest',
        userName: profile?.displayName || user?.displayName || 'Botanical Enthusiast',
        userEmail: user?.email || 'customer@vanabotanica.com',
        rating,
        title,
        comment,
        verifiedPurchase: true,
      });

      setReviews([newRev, ...reviews]);
      setSuccess(true);
      setShowForm(false);
      setTitle('');
      setComment('');
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E2D9]">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#1A1A1A]">
            Customer Reviews ({reviews.length})
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-[#2D4A27]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(product.rating) ? 'fill-[#2D4A27] text-[#2D4A27]' : 'text-[#E5E2D9]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#1A1A1A]">
              {product.rating.toFixed(1)} out of 5 stars
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (!user && !profile) {
              openAuthModal('login');
            } else {
              setShowForm(!showForm);
            }
          }}
          className="px-4 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider self-start sm:self-auto transition-all shadow-xs"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {success && (
        <div className="p-3 bg-[#2D4A27]/10 border border-[#2D4A27]/20 text-[#2D4A27] text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Thank you! Your verified review has been published.</span>
        </div>
      )}

      {/* Review Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-[#F5F2EB] p-5 border border-[#E5E2D9] space-y-4 animate-fadeIn">
          <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Share your plant experience</h4>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Your Rating</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-[#2D4A27] hover:scale-110 transition-transform"
                >
                  <Star className={`w-5 h-5 ${star <= rating ? 'fill-[#2D4A27]' : 'text-[#E5E2D9]'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Headline / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Arrived vibrant and healthy in Mumbai!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-xs focus:outline-none focus:border-[#2D4A27]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Detailed Review</label>
            <textarea
              required
              rows={3}
              placeholder="How was the packaging, leaf condition, and growth after watering?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-xs focus:outline-none focus:border-[#2D4A27]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Post Verified Review'}
          </button>
        </form>
      )}

      {/* Review List */}
      <div className="divide-y divide-[#E5E2D9]">
        {reviews.length === 0 ? (
          <p className="text-xs text-[#7A7A7A] py-6 text-center font-light">
            No reviews yet. Be the first to share your experience with this botanical beauty!
          </p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#1A1A1A]">{rev.userName}</span>
                  {rev.verifiedPurchase && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-[#2D4A27] bg-[#2D4A27]/10 px-1.5 py-0.5">
                      <CheckCircle className="w-2.5 h-2.5" />
                      Verified Buyer
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#7A7A7A]">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex text-[#2D4A27]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rev.rating ? 'fill-[#2D4A27] text-[#2D4A27]' : 'text-[#E5E2D9]'
                    }`}
                  />
                ))}
              </div>

              <h5 className="font-serif font-bold text-xs text-[#1A1A1A]">{rev.title}</h5>
              <p className="text-xs text-[#5A5A5A] leading-relaxed font-light">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
