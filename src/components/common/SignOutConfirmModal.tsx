import React from 'react';
import { LogOut, X, User as UserIcon } from './Icons';

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
        className="fixed inset-0 bg-[#0E1C11]/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Minimal Botanical Sign Out Modal */}
      <div className="relative bg-white border border-[#E8DFD3] shadow-xl max-w-md w-full rounded-2xl p-6 sm:p-7 z-10 animate-scaleUp space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF3EB] border border-[#C5E1C9] text-[#1F6B3A] flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-[#1F6B3A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#141C14]">
                Sign Out
              </h3>
              <p className="text-xs text-[#7A746B] mt-0.5">
                Buddy4Plant Account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8479] hover:text-[#141C14] hover:bg-[#FAF5EE] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#5C554B] leading-relaxed">
          Are you sure you want to sign out? You will need to log back in to access your saved orders, addresses, and wishlist.
        </p>

        {/* User Account Info */}
        {(userName || userEmail) && (
          <div className="bg-[#FAF5EE] p-3 rounded-xl border border-[#ECE6DA] flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-[#13301B] text-[#F4EFE3] flex items-center justify-center font-bold text-xs shrink-0">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-[#141C14] block truncate">
                {userName || 'Logged In Account'}
              </span>
              {userEmail && (
                <span className="text-[#7A746B] text-[11px] block truncate">
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
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#DCD3C4] text-[#2B2A26] hover:bg-[#FAF5EE] text-xs font-semibold transition-colors cursor-pointer"
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSigningOut}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#13301B] hover:bg-[#1F4A2B] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
