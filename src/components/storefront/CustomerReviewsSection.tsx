import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { Review } from '../../types';

interface CustomerReviewsSectionProps {
  reviews: Review[];
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({ reviews }) => {
  const displayReviews = reviews.slice(0, 3);

  return (
    <section className="py-16 bg-[#FDFCF9] border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] font-bold text-[#2D4A27] uppercase tracking-[0.25em] block">
            Real Customer Stories
          </span>
          <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
            Loved in 50,000+ Indian Homes
          </h2>
          <p className="text-xs text-[#5A5A5A] mt-2 font-light">
            Verified experiences from plant parents across Mumbai, Delhi, Bengaluru, Hyderabad, and Chennai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F5F2EB] p-6 border border-[#E5E2D9] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center text-[#2D4A27] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-[#2D4A27] text-[#2D4A27]' : 'text-[#D5D2C9]'
                      }`}
                    />
                  ))}
                </div>

                <h4 className="font-serif font-bold text-[#1A1A1A] text-base mb-2">
                  &ldquo;{rev.title}&rdquo;
                </h4>

                <p className="text-xs text-[#5A5A5A] leading-relaxed italic font-light">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E2D9] flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#1A1A1A]">{rev.userName}</h5>
                  <span className="text-[11px] text-[#7A7A7A]">{rev.productName}</span>
                </div>
                {rev.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#2D4A27] bg-[#2D4A27]/10 px-2 py-0.5">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
