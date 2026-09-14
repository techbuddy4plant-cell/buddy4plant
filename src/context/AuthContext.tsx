import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { UserProfile, Address } from '../types';
import { getUserProfile, saveUserProfile, checkIsAdmin, saveUserAddress, deleteUserAddress, setDefaultUserAddress } from '../services/authService';
import { SignOutConfirmModal } from '../components/common/SignOutConfirmModal';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot' | 'admin';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot' | 'admin') => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isSignOutModalOpen: boolean;
  promptSignOut: () => void;
  confirmSignOut: () => Promise<void>;
  cancelSignOut: () => void;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  saveAddress: (address: Address) => Promise<Address[]>;
  removeAddress: (addressIdOrIndex: string | number) => Promise<Address[]>;
  setDefaultAddress: (addressId: string) => Promise<Address[]>;
  updateProfileDetails: (name: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot' | 'admin'>('login');
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  useEffect(() => {
    // Check demo admin session from localStorage first
    const demoAdminSession = localStorage.getItem('vb_demo_admin');
    if (demoAdminSession === 'true') {
      setIsAdmin(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        let p = await getUserProfile(fbUser.uid);
        const adminStatus = (await checkIsAdmin(fbUser.uid, fbUser.email)) || demoAdminSession === 'true';
        setIsAdmin(adminStatus);

        if (!p) {
          p = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Green Lover',
            role: adminStatus ? 'admin' : 'customer',
            addresses: [],
            createdAt: Date.now(),
          };
          await saveUserProfile(p);
        }
        setProfile(p);
      } else {
        setProfile(null);
        if (demoAdminSession !== 'true') {
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' | 'admin' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const admin = await checkIsAdmin(res.user.uid, res.user.email);
      setIsAdmin(admin);
      closeAuthModal();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to sign in');
    }
  };

  const register = async (email: string, pass: string, name: string, phone?: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || email,
        displayName: name,
        phone: phone || '',
        role: 'customer',
        addresses: [],
        createdAt: Date.now(),
      };
      await saveUserProfile(newProfile);
      setProfile(newProfile);
      closeAuthModal();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create account');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const admin = await checkIsAdmin(res.user.uid, res.user.email);
      setIsAdmin(admin);
      let p = await getUserProfile(res.user.uid);
      if (!p) {
        p = {
          uid: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || 'Green Lover',
          role: admin ? 'admin' : 'customer',
          addresses: [],
          createdAt: Date.now(),
        };
        await saveUserProfile(p);
      }
      setProfile(p);
      closeAuthModal();
    } catch (err: any) {
      throw new Error(err.message || 'Google sign-in failed');
    }
  };

  const logout = async () => {
    localStorage.removeItem('vb_demo_admin');
    setIsAdmin(false);
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const promptSignOut = () => {
    setIsSignOutModalOpen(true);
  };

  const cancelSignOut = () => {
    setIsSignOutModalOpen(false);
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
    } finally {
      setIsSigningOut(false);
      setIsSignOutModalOpen(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to send password reset email');
    }
  };

  const loginAsDemoAdmin = async () => {
    localStorage.setItem('vb_demo_admin', 'true');
    setIsAdmin(true);
    if (!profile) {
      setProfile({
        uid: 'admin-super-01',
        email: 'admin@vanabotanica.com',
        displayName: 'Store Administrator',
        role: 'admin',
        addresses: [],
        createdAt: Date.now(),
      });
    }
    closeAuthModal();
  };

  const saveAddress = async (address: Address): Promise<Address[]> => {
    if (!user && !profile) {
      // Guest local address storage
      const guestAddresses: Address[] = JSON.parse(localStorage.getItem('vb_guest_addresses') || '[]');
      if (!address.id) address.id = `guest-${Date.now()}`;
      const idx = guestAddresses.findIndex((a) => a.id === address.id);
      if (idx !== -1) {
        guestAddresses[idx] = address;
      } else {
        guestAddresses.push(address);
      }
      localStorage.setItem('vb_guest_addresses', JSON.stringify(guestAddresses));
      return guestAddresses;
    }

    const uid = user?.uid || profile?.uid || 'guest';
    const updated = await saveUserAddress(uid, address);
    if (profile) {
      setProfile({ ...profile, addresses: updated });
    }
    return updated;
  };

  const removeAddress = async (addressIdOrIndex: string | number): Promise<Address[]> => {
    if (!user && !profile) {
      const guestAddresses: Address[] = JSON.parse(localStorage.getItem('vb_guest_addresses') || '[]');
      let updated: Address[] = [];
      if (typeof addressIdOrIndex === 'number') {
        updated = guestAddresses.filter((_, i) => i !== addressIdOrIndex);
      } else {
        updated = guestAddresses.filter((a) => a.id !== addressIdOrIndex);
      }
      localStorage.setItem('vb_guest_addresses', JSON.stringify(updated));
      return updated;
    }

    const uid = user?.uid || profile?.uid || 'guest';
    let addrId = '';
    if (typeof addressIdOrIndex === 'number') {
      addrId = profile?.addresses?.[addressIdOrIndex]?.id || '';
    } else {
      addrId = addressIdOrIndex;
    }

    const updated = await deleteUserAddress(uid, addrId);
    if (profile) {
      setProfile({ ...profile, addresses: updated });
    }
    return updated;
  };

  const setDefaultAddress = async (addressId: string): Promise<Address[]> => {
    if (!user && !profile) {
      const guestAddresses: Address[] = JSON.parse(localStorage.getItem('vb_guest_addresses') || '[]');
      const updated = guestAddresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      localStorage.setItem('vb_guest_addresses', JSON.stringify(updated));
      return updated;
    }

    const uid = user?.uid || profile?.uid || 'guest';
    const updated = await setDefaultUserAddress(uid, addressId);
    if (profile) {
      setProfile({ ...profile, addresses: updated });
    }
    return updated;
  };

  const updateProfileDetails = async (name: string, phone?: string) => {
    if (profile) {
      const updated: UserProfile = {
        ...profile,
        displayName: name,
        phone: phone || profile.phone,
      };
      setProfile(updated);
      await saveUserProfile(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
        isSignOutModalOpen,
        promptSignOut,
        confirmSignOut,
        cancelSignOut,
        resetPassword,
        loginAsDemoAdmin,
        saveAddress,
        removeAddress,
        setDefaultAddress,
        updateProfileDetails,
      }}
    >
      {children}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={cancelSignOut}
        onConfirm={confirmSignOut}
        userEmail={user?.email || profile?.email}
        userName={profile?.displayName || user?.displayName}
        isSigningOut={isSigningOut}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
