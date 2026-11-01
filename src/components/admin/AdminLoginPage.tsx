import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { checkIsAdmin } from '../../services/authService';
import { checkEmailFormat, lockedFor, recordFailure, clearFailures, waitText, friendlyAuthError } from '../../utils/authSecurity';
import { Buddy4PlantLogo } from '../common/Buddy4PlantLogo';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  navigate: (path: string) => void;
  /** shown when someone is signed in with an account that is not an admin */
  notAdminEmail?: string | null;
}

/**
 * Admin sign-in with a real account (Firebase Authentication - the password is checked on Google's servers,
 * never stored in this website's code). Only accounts listed in the database collection "admins" get in.
 */
export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, navigate, notAdminEmail }) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    notAdminEmail ? `${notAdminEmail} does not have admin access. Sign in with an admin account.` : null
  );
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);
    const email = adminId.trim().toLowerCase();
    const f = checkEmailFormat(email);
    if (!f.ok && !f.suggestion) {
      setError(f.message || 'Please enter the admin email address.');
      return;
    }
    const wait = lockedFor('admin', email);
    if (wait > 0) {
      setError(`Too many attempts. Please wait ${waitText(wait)} and try again.`);
      return;
    }
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (!(await checkIsAdmin(res.user.uid))) {
        await signOut(auth);
        recordFailure('admin', email);
        setError('This account does not have admin access.');
        return;
      }
      clearFailures('admin', email);
      onLoginSuccess();
    } catch (err) {
      recordFailure('admin', email);
      setError(friendlyAuthError(err, 'login'));
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    setError(null);
    const email = adminId.trim().toLowerCase();
    if (!checkEmailFormat(email).ok) {
      setError('Type the admin email address above first, then press "Forgot password".');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      /* same message either way */
    }
    setInfo("If this is an admin account, a password reset link has been sent to that email.");
  };

  return (
    <div className="admin-root b4p-fixed-theme min-h-screen bg-[#111A12] text-[#FDFCF9] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2D4A27]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#182319]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 bg-[#182319] border border-[#2D4A27]/50 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md animate-fadeIn">
        {/* Brand Logo & Security Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#2D4A27]/40 rounded-full border border-[#2D4A27] mb-4 cartoon-hover-pop">
            <Buddy4PlantLogo size={44} showText={false} variant="full-circle" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2D4A27]/40 border border-[#2D4A27] text-[#95D5B2] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-3">
            <i className="fa-solid fa-lock text-xs text-emerald-400" />
            Restricted Admin Portal
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
            buddy4plant Control Console
          </h1>
          <p className="text-xs text-[#A3B899] mt-1.5 font-light">
            Sign in with your admin account to manage the store.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs rounded-xl flex items-center gap-3 animate-fadeIn">
            <i className="fa-solid fa-triangle-exclamation text-rose-400 text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mb-6 p-3.5 bg-emerald-950/70 border border-emerald-700/60 text-emerald-100 text-xs rounded-xl">{info}</div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3B899] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="username"
                inputMode="email"
                maxLength={254}
                placeholder="admin@example.com"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#111A12] border border-[#2D4A27] text-white rounded-xl text-sm placeholder:text-[#5A6E57] focus:outline-none focus:border-[#95D5B2] focus:ring-1 focus:ring-[#95D5B2] transition-all"
              />
              <i className="fa-solid fa-user-shield absolute left-3.5 top-3.5 text-[#5A6E57] text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3B899] mb-1.5">
              Admin Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                maxLength={128}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#111A12] border border-[#2D4A27] text-white rounded-xl text-sm placeholder:text-[#5A6E57] focus:outline-none focus:border-[#95D5B2] focus:ring-1 focus:ring-[#95D5B2] transition-all"
              />
              <i className="fa-solid fa-key absolute left-3.5 top-3.5 text-[#5A6E57] text-sm" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#5A6E57] hover:text-[#95D5B2] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#2D4A27] hover:bg-[#1F341C] active:scale-[0.98] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                <span>Authenticating Console...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-shield-halved text-sm text-[#95D5B2]" />
                <span>Authorize & Open Admin Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button type="button" onClick={forgot} className="text-xs text-[#95D5B2] hover:text-white underline-offset-2 hover:underline">
            Forgot password?
          </button>
        </div>

        {/* Back to Public Site */}
        <div className="mt-8 pt-5 border-t border-[#2D4A27]/40 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-[#A3B899] hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto font-medium"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span>Return to Public Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
