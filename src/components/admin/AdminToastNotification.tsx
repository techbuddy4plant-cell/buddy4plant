import React from 'react';
import { CheckCircle2, ExternalLink, X, Sparkles } from 'lucide-react';

interface AdminToastNotificationProps {
  show: boolean;
  message?: string;
  onClose: () => void;
  onViewStorefront?: () => void;
}

export const AdminToastNotification: React.FC<AdminToastNotificationProps> = ({
  show,
  message = 'Published Live! Storefront updated successfully.',
  onClose,
  onViewStorefront,
}) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short max-w-md w-full bg-[#182319] text-white border border-[#2D4A27] p-4 shadow-2xl rounded-xs flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#2D4A27] text-white rounded-full flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5 text-emerald-300" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Changes Published Live
          </h4>
          <p className="text-[11px] text-[#A3B899] mt-0.5 line-clamp-1">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onViewStorefront && (
          <button
            onClick={onViewStorefront}
            className="px-3 py-1.5 bg-[#2D4A27] hover:bg-[#395D32] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors rounded-xs border border-[#446F3C]"
          >
            <ExternalLink className="w-3 h-3" />
            View Store
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1 text-[#A3B899] hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
