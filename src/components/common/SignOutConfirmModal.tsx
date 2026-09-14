import React from 'react';
import { LogOut, X, AlertTriangle, ShieldAlert, User as UserIcon } from 'lucide-react';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  userEmail?: string | null;
  userName?: string | null;
  isSigningOut?: boolean;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  userName,
  isSigningOut = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Amazon-Inspired Sign Out Card */}
      <div className="relative bg-white border border-[#E5E2D9] shadow-2xl max-w-md w-full rounded-xl overflow-hidden z-10 animate-scaleUp">
        {/* Amazon-style Top Header Bar */}
        <div className="bg-[#131921] px-5 py-3.5 flex items-center justify-between text-white border-b border-[#232F3E]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FF9900]/20 border border-[#FF9900]/40 flex items-center justify-center text-[#FF9900]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm text-white tracking-wide">
                Sign Out Confirmation
              </h3>
              <span className="text-[10px] text-[#A9B3C2] font-mono block -mt-0.5">
                Buddy4Plant Account Security
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A9B3C2] hover:text-white transition-colors rounded-md hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-[#1A1A1A]">
                Are you sure you want to sign out?
              </h4>
              <p className="text-xs text-[#5A5A5A] leading-relaxed">
                Signing out will end your current session. You will need to log back in to manage your active plant orders, saved addresses, and wishlist items.
              </p>
            </div>
          </div>

          {/* User Account Info Chip */}
          {(userName || userEmail) && (
            <div className="bg-[#F5F2EB] p-3.5 rounded-lg border border-[#E5E2D9] flex items-center gap-3 text-xs">
              <div className="w-9 h-9 rounded-full bg-[#2D4A27] text-white flex items-center justify-center font-bold shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-[#1A1A1A] block truncate">
                  {userName || 'Logged In Customer'}
                </span>
                {userEmail && (
                  <span className="text-[#5A5A5A] text-[11px] block truncate font-mono">
                    {userEmail}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSigningOut}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#F5F2EB] border border-[#E5E2D9] text-[#1A1A1A] text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Stay Signed In
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSigningOut}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Amazon-style Footer Bar */}
        <div className="bg-[#F8F9FA] px-5 py-2.5 border-t border-[#E5E2D9] text-[10px] text-[#7A7A7A] flex items-center justify-between font-mono">
          <span>Amazon-Style Authentication Protocol</span>
          <span className="text-[#2D4A27] font-semibold">Protected Session</span>
        </div>
      </div>
    </div>
  );
};
