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
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching user profile:', err);
  }
  return null;
}

export async function checkIsAdmin(uid: string, email?: string | null): Promise<boolean> {
  if (email === 'admin@vanabotanica.com') return true;
  try {
    const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, uid));
    if (adminDoc.exists()) return true;
  } catch (err) {
    // ignore
  }
  return false;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, profile.uid);
    await setDoc(docRef, profile, { merge: true });
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export async function saveUserAddress(uid: string, address: Address): Promise<Address[]> {
  const profile = await getUserProfile(uid);
  const addresses = profile?.addresses || [];
  
  if (address.id) {
    const idx = addresses.findIndex((a) => a.id === address.id);
    if (idx !== -1) {
      addresses[idx] = address;
    } else {
      addresses.push(address);
    }
  } else {
    address.id = `addr-${Date.now()}`;
    addresses.push(address);
  }

  if (address.isDefault) {
    addresses.forEach((a) => {
      a.isDefault = a.id === address.id;
    });
  }

  if (profile) {
    await saveUserProfile({ ...profile, addresses });
  }

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

