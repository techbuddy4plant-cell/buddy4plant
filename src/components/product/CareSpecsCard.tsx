import React from 'react';
import { Sun, Droplets, Thermometer, Sparkles, PawPrint, Compass, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';

interface CareSpecsCardProps {
  product: Product;
}

export const CareSpecsCard: React.FC<CareSpecsCardProps> = ({ product }) => {
  return (
    <div className="bg-[#F5F2EB] p-6 border border-[#E5E2D9] space-y-6">
      <h3 className="font-serif font-bold text-lg text-[#1A1A1A] flex items-center gap-2">
        <i className="fa-solid fa-leaf text-[#2D4A27]" />
        Botanical Care & Specifications
      </h3>

      {/* Grid of Key Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-3.5 border border-[#E5E2D9]">
          <div className="flex items-center gap-1.5 text-[#2D4A27] font-bold uppercase tracking-wider text-[10px] mb-1">
            <Sun className="w-3.5 h-3.5" />
            Light
          </div>
          <div className="font-semibold text-[#1A1A1A]">{product.lightRequirement}</div>
        </div>

        <div className="bg-white p-3.5 border border-[#E5E2D9]">
          <div className="flex items-center gap-1.5 text-[#2D4A27] font-bold uppercase tracking-wider text-[10px] mb-1">
            <Droplets className="w-3.5 h-3.5" />
            Water
          </div>
          <div className="font-semibold text-[#1A1A1A]">{product.wateringFrequency}</div>
        </div>

        <div className="bg-white p-3.5 border border-[#E5E2D9]">
          <div className="flex items-center gap-1.5 text-[#2D4A27] font-bold uppercase tracking-wider text-[10px] mb-1">
            <Compass className="w-3.5 h-3.5" />
            Ideal Space
          </div>
          <div className="font-semibold text-[#1A1A1A]">{product.location}</div>
        </div>

        <div className="bg-white p-3.5 border border-[#E5E2D9]">
          <div className="flex items-center gap-1.5 text-[#2D4A27] font-bold uppercase tracking-wider text-[10px] mb-1">
            <Thermometer className="w-3.5 h-3.5" />
            Maintenance
          </div>
          <div className="font-semibold text-[#1A1A1A]">{product.maintenanceLevel} Care</div>
        </div>

        <div className="bg-white p-3.5 border border-[#E5E2D9]">
          <div className="flex items-center gap-1.5 text-[#8B5E3C] font-bold uppercase tracking-wider text-[10px] mb-1">
            <PawPrint className="w-3.5 h-3.5" />
            Pet Friendly
          </div>
          <div className="font-semibold text-[#1A1A1A]">
            {product.petFriendly ? 'Yes (100% Safe)' : 'Keep away from pets'}
          </div>
        </div>

        <div className="bg-white p-3.5 border border-[#E5E2D9]">
          <div className="flex items-center gap-1.5 text-[#2D4A27] font-bold uppercase tracking-wider text-[10px] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Maturity Size
          </div>
          <div className="font-semibold text-[#1A1A1A]">{product.plantSize}</div>
        </div>
      </div>

      {/* In-depth Care Instructions */}
      {product.careInstructions && (
        <div className="space-y-3 pt-2 text-xs text-[#5A5A5A] border-t border-[#E5E2D9]">
          <div>
            <strong className="text-[#1A1A1A] flex items-center gap-1.5 mb-0.5 font-bold">
              <i className="fa-solid fa-sun text-amber-500" />
              Light & Placement Guide:
            </strong>
            <p className="text-[#5A5A5A] leading-relaxed font-light">{product.careInstructions.light}</p>
          </div>
          <div>
            <strong className="text-[#1A1A1A] flex items-center gap-1.5 mb-0.5 font-bold">
              <i className="fa-solid fa-droplet text-blue-500" />
              Watering Routine:
            </strong>
            <p className="text-[#5A5A5A] leading-relaxed font-light">{product.careInstructions.water}</p>
          </div>
          <div>
            <strong className="text-[#1A1A1A] flex items-center gap-1.5 mb-0.5 font-bold">
              <i className="fa-solid fa-seedling text-emerald-600" />
              Soil & Fertilizer:
            </strong>
            <p className="text-[#5A5A5A] leading-relaxed font-light">{product.careInstructions.fertilizer}</p>
          </div>
          <div>
            <strong className="text-[#1A1A1A] flex items-center gap-1.5 mb-0.5 font-bold">
              <i className="fa-solid fa-wand-magic-sparkles text-amber-600" />
              Horticulturist Pro Tip:
            </strong>
            <p className="text-[#5A5A5A] leading-relaxed font-light">{product.careInstructions.tips}</p>
          </div>
        </div>
      )}
    </div>
  );
};
