import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { Review } from '../../types';

interface CustomerReviewsSectionProps {
  reviews: Review[];
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({ reviews }) => {
  const displayReviews = reviews.slice(0, 3);

  return (
    <section className="py-20 sm:py-28 bg-transparent border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block">
            Botanical Testimonials
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] mt-2 tracking-tight">
            Loved in 50,000+ Homes
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-3 font-normal leading-relaxed">
            Authentic reflections from plant parents experiencing living serene spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FAF9F5] p-8 rounded-3xl border border-[#E5E2D9] hover:border-[#1F3B22]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center text-[#1F3B22] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? 'fill-[#1F3B22] text-[#1F3B22]' : 'text-[#DCD7CB]'
                      }`}
                    />
                  ))}
                </div>

                <h4 className="font-editorial font-bold text-[#141414] text-lg mb-3">
                  &ldquo;{rev.title}&rdquo;
                </h4>

                <p className="text-xs sm:text-sm text-[#575757] leading-relaxed italic font-normal">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-[#E8E5DC] flex items-center justify-between">
                <div>
                  <h5 className="font-editorial text-xs font-bold text-[#141414]">{rev.userName}</h5>
                  <span className="text-[11px] text-[#7A7A7A] block mt-0.5">{rev.productName}</span>
                </div>
                {rev.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#1F3B22] bg-[#1F3B22]/10 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified Parent
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
