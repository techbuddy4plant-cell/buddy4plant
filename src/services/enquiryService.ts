import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export interface ServiceEnquiry {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  organisation?: string;
  enquiryType: string;
  propertyType: string;
  city: string;
  area?: string;
  message?: string;
  status: EnquiryStatus;
  createdAt: number;
  source: 'landscaping-services';
  syncedToCloud?: boolean;
}

const LOCAL_KEY = 'b4p_service_enquiries';
const COLLECTION = 'serviceEnquiries';

const readLocal = (): ServiceEnquiry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (list: ServiceEnquiry[]) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 500)));
  } catch {
    /* storage full or blocked - cloud copy is still saved */
  }
};

const withTimeout = <T,>(p: Promise<T>, ms = 7000) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

/** Save an enquiry to Firestore (and keep a local copy so nothing is lost if the network fails). */
export async function saveServiceEnquiry(
  data: Omit<ServiceEnquiry, 'id' | 'status' | 'createdAt' | 'source' | 'syncedToCloud'>
): Promise<ServiceEnquiry> {
  const base = { ...data, status: 'new' as EnquiryStatus, createdAt: Date.now(), source: 'landscaping-services' as const };
  let entry: ServiceEnquiry = { ...base, id: `local-${base.createdAt}`, syncedToCloud: false };
  try {
    const ref = await withTimeout(addDoc(collection(db, COLLECTION), base));
    entry = { ...base, id: ref.id, syncedToCloud: true };
  } catch (err) {
    console.warn('Enquiry saved locally only (cloud save failed):', err);
  }
  writeLocal([entry, ...readLocal()]);
  return entry;
}

/** All enquiries for the admin panel: cloud + any local-only ones, newest first. */
export async function getServiceEnquiries(): Promise<ServiceEnquiry[]> {
  const local = readLocal();
  let cloud: ServiceEnquiry[] = [];
  try {
    const snap = await withTimeout(getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))));
    cloud = snap.docs.map((d) => ({ ...(d.data() as ServiceEnquiry), id: d.id, syncedToCloud: true }));
  } catch (err) {
    console.warn('Could not load enquiries from cloud:', err);
  }
  const cloudIds = new Set(cloud.map((c) => c.id));
  const merged = [...cloud, ...local.filter((l) => !cloudIds.has(l.id) && !l.syncedToCloud)];
  return merged.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateServiceEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  writeLocal(readLocal().map((e) => (e.id === id ? { ...e, status } : e)));
  if (!id.startsWith('local-')) {
    try {
      await withTimeout(updateDoc(doc(db, COLLECTION, id), { status }));
    } catch (err) {
      console.warn('Status saved locally only:', err);
    }
  }
}
