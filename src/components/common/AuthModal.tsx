import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, ShieldAlert, CheckCircle2, Eye } from './Icons';
import { useAuth } from '../../context/AuthContext';
import { Buddy4PlantLogo } from './Buddy4PlantLogo';
import {
  checkEmailFormat,
  validateNewEmail,
  checkNewPassword,
  lockedFor,
  recordFailure,
  clearFailures,
  waitText,
  friendlyAuthError,
} from '../../utils/authSecurity';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    loginWithGoogle,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  // a "Did you mean ...?" suggestion that the person chose to ignore (they re-submitted the same email)
  const [acceptedEmail, setAcceptedEmail] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const onEmailBlur = () => {
    if (!email.trim()) return;
    const f = checkEmailFormat(email);
    if (!f.ok && !f.suggestion) setError(f.message || null);
    else if (!f.ok && f.suggestion && email.trim().toLowerCase() !== acceptedEmail) {
      setSuggestion(f.suggestion);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setSuccessMsg(null);
    setSuggestion(null);

    const typed = email.trim().toLowerCase();
    // 1. email must look right (a typo suggestion can be ignored by submitting again)
    const f = checkEmailFormat(typed);
    if (!f.ok) {
      if (f.suggestion && acceptedEmail !== typed) {
        setSuggestion(f.suggestion);
        setAcceptedEmail(typed);
        return;
      }
      if (!f.suggestion) {
        setError(f.message || 'This is not a valid email address.');
        return;
      }
    }

    // 2. too many wrong tries from this browser?
    const scope = authModalTab === 'register' ? 'register' : 'login';
    const wait = lockedFor(scope, typed);
    if (wait > 0 && authModalTab !== 'forgot') {
      setError(`Too many attempts. For your safety, please wait ${waitText(wait)} and try again.`);
      return;
    }

    setLoading(true);
    try {
      if (authModalTab === 'login') {
        if (!password) throw Object.assign(new Error(''), { code: 'auth/invalid-credential' });
        await login(typed, password);
        clearFailures('login', typed);
      } else if (authModalTab === 'register') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          return;
        }
        if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))) {
          setError('Please enter a valid 10-digit Indian mobile number, or leave it empty.');
          return;
        }
        const pwProblem = checkNewPassword(password);
        if (pwProblem) {
          setError(pwProblem);
          return;
        }
        const full = await validateNewEmail(typed);
        if (!full.ok) {
          setError(full.message || 'This is not a valid email address.');
          return;
        }
        await register(typed, password, name.trim().slice(0, 80), phone.trim());
        clearFailures('register', typed);
      } else if (authModalTab === 'forgot') {
        await resetPassword(typed);
        setSuccessMsg("If an account exists for this email, we've sent a link to reset the password. Please check your inbox and spam folder.");
      }
    } catch (err: any) {
      if (authModalTab !== 'forgot') recordFailure(scope, typed);
      setError(friendlyAuthError(err, authModalTab === 'register' ? 'register' : authModalTab === 'forgot' ? 'reset' : 'login'));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(friendlyAuthError(err, 'google'));
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F1710]/70 backdrop-blur-xs transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Box */}
      <div
        id="auth-modal"
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 z-10 animate-fadeIn"
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Buddy4PlantLogo size={52} showText={false} variant="full-circle" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            {authModalTab === 'login' && 'Welcome to buddy4plant'}
            {authModalTab === 'register' && 'Create Your Botanical Account'}
            {authModalTab === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {authModalTab === 'login' && 'Sign in to access your orders and saved wishlist'}
            {authModalTab === 'register' && 'Join the buddy4plant gardening community'}
            {authModalTab === 'forgot' && "Enter your email to receive recovery instructions"}
          </p>
        </div>

        {/* Tab Switcher */}
        {authModalTab !== 'forgot' && (
          <div className="flex border-b border-stone-200 mb-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setError(null);
                openAuthModal('login');
              }}
              className={`flex-1 pb-3 text-center transition-colors ${
                authModalTab === 'login'
                  ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                openAuthModal('register');
              }}
              className={`flex-1 pb-3 text-center transition-colors ${
                authModalTab === 'register'
                  ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {suggestion && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
            Did you mean{' '}
            <button
              type="button"
              className="font-bold underline"
              onClick={() => {
                setEmail(suggestion);
                setSuggestion(null);
                setError(null);
              }}
            >
              {suggestion}
            </button>
            ? <span className="text-amber-700">(If your email is correct, just press the button again.)</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ananya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 80048 81668"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSuggestion(null);
                  setError(null);
                }}
                onBlur={onEmailBlur}
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {authModalTab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">Password</label>
                {authModalTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] text-emerald-800 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={authModalTab === 'register' ? 8 : undefined}
                  maxLength={128}
                  autoComplete={authModalTab === 'register' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1.5 p-1.5 text-stone-400 hover:text-stone-700"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              {authModalTab === 'register' && (
                <p className="mt-1 text-[11px] text-stone-500">At least 8 characters, with letters and a number.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Processing...' : authModalTab === 'login' ? 'Sign In' : authModalTab === 'register' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Alternative Google Login */}
        {authModalTab !== 'forgot' && (
          <div className="mt-4">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-stone-400 uppercase">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoogle}
              className="w-full py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Account
            </button>
          </div>
        )}

        {authModalTab === 'forgot' && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="text-xs text-emerald-900 font-semibold hover:underline"
            >
              &larr; Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
