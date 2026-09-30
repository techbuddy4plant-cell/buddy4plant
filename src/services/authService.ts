import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { UserProfile, Address } from '../types';

const USERS_COLLECTION = 'users';
const ADMINS_COLLECTION = 'admins';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      try {
        localStorage.setItem(`b4p_user_profile_${uid}`, JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err) {
    console.warn('Error fetching user profile from Firestore, checking local backup:', err);
  }

  // Fallback to local cache
  try {
    const local = localStorage.getItem(`b4p_user_profile_${uid}`);
    if (local) {
      return JSON.parse(local) as UserProfile;
    }
  } catch (e) {}

  return null;
}

export async function checkIsAdmin(uid: string, email?: string | null): Promise<boolean> {
  if (email === 'admin@vanabotanica.com' || email === 'admin@buddy4plant.com') return true;
  try {
    const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, uid));
    if (adminDoc.exists()) return true;
  } catch (err) {
    // ignore
  }
  return false;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  // Always update local storage first for instantaneous availability
  try {
    localStorage.setItem(`b4p_user_profile_${profile.uid}`, JSON.stringify(profile));
  } catch (e) {}

  try {
    const docRef = doc(db, USERS_COLLECTION, profile.uid);
    await setDoc(docRef, profile, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore (saved locally):', err);
  }
}

export async function saveUserAddress(uid: string, address: Address): Promise<Address[]> {
  let profile = await getUserProfile(uid);
  const addresses: Address[] = profile?.addresses ? [...profile.addresses] : [];

  // Match existing address by ID or exact content (street, city, pincode)
  let existingIndex = -1;
  if (address.id) {
    existingIndex = addresses.findIndex((a) => a.id === address.id);
  } else {
    existingIndex = addresses.findIndex(
      (a) =>
        a.street.trim().toLowerCase() === address.street.trim().toLowerCase() &&
        a.city.trim().toLowerCase() === address.city.trim().toLowerCase() &&
        a.pincode.replace(/\D/g, '') === address.pincode.replace(/\D/g, '')
    );
  }

  const assignedId = address.id || (existingIndex !== -1 ? addresses[existingIndex].id : `addr-${Date.now()}`);
  const finalAddress: Address = {
    ...address,
    id: assignedId,
  };

  if (existingIndex !== -1) {
    addresses[existingIndex] = { ...addresses[existingIndex], ...finalAddress };
  } else {
    // If it's the first address, make it default automatically
    if (addresses.length === 0) {
      finalAddress.isDefault = true;
    }
    addresses.push(finalAddress);
  }

  if (finalAddress.isDefault) {
    addresses.forEach((a) => {
      a.isDefault = a.id === finalAddress.id;
    });
  }

  const updatedProfile: UserProfile = profile
    ? { ...profile, addresses }
    : {
        uid,
        email: address.email || '',
        displayName: address.fullName || 'Valued Customer',
        phone: address.phone || '',
        role: 'customer',
        addresses,
        createdAt: Date.now(),
      };

  await saveUserProfile(updatedProfile);
  return addresses;
}

export async function deleteUserAddress(uid: string, addressId: string): Promise<Address[]> {
  const profile = await getUserProfile(uid);
  const addresses = (profile?.addresses || []).filter((a) => a.id !== addressId);
  if (profile) {
    await saveUserProfile({ ...profile, addresses });
  }
  return addresses;
}

export async function setDefaultUserAddress(uid: string, addressId: string): Promise<Address[]> {
  const profile = await getUserProfile(uid);
  const addresses = (profile?.addresses || []).map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));
  if (profile) {
    await saveUserProfile({ ...profile, addresses });
  }
  return addresses;
}

