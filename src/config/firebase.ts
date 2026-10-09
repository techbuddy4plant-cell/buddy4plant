import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
// ignoreUndefinedProperties: an empty optional field (e.g. no coupon code) must never stop a save
let firestore: Firestore;
try {
  firestore = initializeFirestore(app, { ignoreUndefinedProperties: true });
} catch {
  firestore = getFirestore(app); // already initialised (hot reload)
}
export const db = firestore;
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Analytics loads after the page is ready, so it never slows down the first view
export let analytics: any = null;
if (typeof window !== 'undefined') {
  const startAnalytics = () =>
    import('firebase/analytics')
      .then(({ getAnalytics, isSupported }) => isSupported().then((ok) => { if (ok) analytics = getAnalytics(app); }))
      .catch(() => undefined); // optional
  const idle = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 2500));
  if (document.readyState === 'complete') idle(startAnalytics);
  else window.addEventListener('load', () => idle(startAnalytics), { once: true });
}

export default app;
