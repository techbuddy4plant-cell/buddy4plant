import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BotanicalProject } from '../types';
import { LANDSCAPE_PROJECTS } from '../data/landscapeProjects';

// Old demo projects (kept for reference, no longer shown)
export const LEGACY_DEMO_PROJECTS: BotanicalProject[] = [
  {
    id: 'balcony-sanctuary',
    title: 'The Urban Balcony Sanctuary',
    location: 'Indiranagar, Bengaluru',
    category: 'Residential Balcony',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    description:
      'Transformed a bare 150 sq.ft sunny balcony into a lush subtropical sanctuary featuring custom drainage-friendly planters, monstera deliciosa, and automated organic misting.',
    speciesCount: 28,
    plantHighlights: ['Monstera Deliciosa', 'Fiddle Leaf Fig', 'Golden Pothos', 'Organic Kelp Fed Soil'],
    tag: 'Completed Project',
    featured: true,
    area: '150 sq. ft',
    duration: '2 Weeks',
    active: true,
  },
  {
    id: 'biophilic-atrium',
    title: 'Biophilic Workspace Atrium',
    location: 'Whitefield Tech Park, Bengaluru',
    category: 'Corporate Green Interior',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80',
    description:
      'Engineered an indoor oxygen micro-climate for 400+ employees with 120+ NASA air-purifiers, zero-maintenance self-watering planters, and bi-weekly organic soil nutrition.',
    speciesCount: 120,
    plantHighlights: ['Areca Palms', 'Snake Plants', 'ZZ Raven', 'Peace Lilies'],
    tag: 'Completed Project',
    featured: true,
    area: '2,400 sq. ft',
    duration: '4 Weeks',
    active: true,
  },
  {
    id: 'terrace-zen-garden',
    title: 'Terrace Zen & Organic Herb Garden',
    location: 'Greater Kailash, New Delhi',
    category: 'Rooftop Terrace',
    image: 'https://images.unsplash.com/photo-1599598425947-320d43702580?auto=format&fit=crop&w=1200&q=80',
    description:
      'A serene rooftop retreat with hand-thrown terracotta pots, cold-pressed neem fed soil beds, and aromatic culinary and medicinal plants resilient to extreme northern heat.',
    speciesCount: 45,
    plantHighlights: ['Lemon Grass', 'Holy Basil (Tulsi)', 'Aloe Arborescens', 'Rosemary'],
    tag: 'Completed Project',
    featured: true,
    area: '800 sq. ft',
    duration: '3 Weeks',
    active: true,
  },
];

const LOCAL_STORAGE_KEY = 'b4p_projects_db';
const DELETED_IDS_KEY = 'b4p_deleted_project_ids';
const SEEDED_FLAG_KEY = 'b4p_projects_seeded';
const PROJECTS_VERSION_KEY = 'b4p_projects_version';
const PROJECTS_VERSION = 'landscape-v4';
const PROJECTS_COLLECTION = 'projects';

export const INITIAL_PROJECTS: BotanicalProject[] = LANDSCAPE_PROJECTS;

/**
 * Keeps the saved project list in step with the projects shipped in code.
 * v1: replaced the old demo projects with the real Buddy4Plant projects.
 * v2: adds real site photos, videos and before/after pictures, plus new projects,
 *     without losing anything edited or added in the admin panel.
 */
const migrateProjects = () => {
  try {
    if (typeof window === 'undefined') return;
    const version = localStorage.getItem(PROJECTS_VERSION_KEY);
    if (version === PROJECTS_VERSION) return;
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const saved: BotanicalProject[] | null = raw ? JSON.parse(raw) : null;
    if (!['landscape-v1', 'landscape-v2', 'landscape-v3'].includes(version || '') || !Array.isArray(saved)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      localStorage.removeItem(DELETED_IDS_KEY);
    } else {
      const deleted = getDeletedProjectIds();
      const byId = new Map(INITIAL_PROJECTS.map((p) => [p.id, p]));
      const merged = saved.map((p) => {
        const base = byId.get(p.id);
        if (!base) return p;
        const untouchedCover = !p.image || p.image.endsWith('.svg');
        return {
          ...p,
          image: untouchedCover ? base.image : p.image,
          gallery: p.gallery?.length ? p.gallery : base.gallery,
          videos: p.videos?.length ? p.videos : base.videos,
          beforeAfter: p.beforeAfter || base.beforeAfter,
          segment: p.segment || base.segment,
          ...(untouchedCover
            ? { title: base.title, client: base.client, description: base.description, plantHighlights: base.plantHighlights, featured: base.featured }
            : {}),
        };
      });
      const have = new Set(merged.map((p) => p.id));
      const added = INITIAL_PROJECTS.filter((p) => !have.has(p.id) && !deleted.has(p.id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...merged, ...added]));
    }
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');
    localStorage.setItem(PROJECTS_VERSION_KEY, PROJECTS_VERSION);
  } catch (e) {}
};

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('b4p_store_data_changed', { detail: { type: 'projects' } })
    );
  }
};

const getDeletedProjectIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

const markProjectDeleted = (id: string) => {
  const set = getDeletedProjectIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

const unmarkProjectDeleted = (id: string) => {
  const set = getDeletedProjectIds();
  set.delete(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

/* ------------------------------------------------------------------ */
/* Cloud copy (Firestore "projects" collection)                        */
/* Admin changes are saved in this browser straight away and copied   */
/* to Firestore, so every visitor and device sees the same projects.   */
/* ------------------------------------------------------------------ */
const withTimeout = <T,>(p: Promise<T>, ms = 6000) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

/** Firestore rejects `undefined` values and very large inline images. */
const cleanForCloud = (p: BotanicalProject) => {
  const out: Record<string, unknown> = {};
  Object.entries(p).forEach(([k, v]) => {
    if (v !== undefined) out[k] = v;
  });
  if (typeof out.image === 'string' && (out.image as string).startsWith('data:') && (out.image as string).length > 700000) {
    out.image = '/logo-white.jpg';
  }
  return out;
};

const pushToCloud = async (p: BotanicalProject) => {
  try {
    await withTimeout(setDoc(doc(db, PROJECTS_COLLECTION, p.id), cleanForCloud(p)));
  } catch (err) {
    console.warn('Project saved in this browser only (cloud save failed):', err);
  }
};

let cloudSynced = false;
/** Pull projects from Firestore once per page load and merge by last update. */
const syncFromCloud = async () => {
  if (cloudSynced || typeof window === 'undefined') return;
  cloudSynced = true;
  try {
    const snap = await withTimeout(getDocs(collection(db, PROJECTS_COLLECTION)));
    if (snap.empty) {
      // First run: upload the current list so other devices get it too.
      const local: BotanicalProject[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      await Promise.all(local.map(pushToCloud));
      return;
    }
    const remote = snap.docs.map((d) => ({ ...(d.data() as BotanicalProject & { deleted?: boolean }), id: d.id }));
    const local: BotanicalProject[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const byId = new Map(local.map((p) => [p.id, p]));
    let changed = false;
    const deleted = getDeletedProjectIds();
    for (const r of remote) {
      if (r.deleted) {
        if (byId.has(r.id)) {
          byId.delete(r.id);
          changed = true;
        }
        deleted.add(r.id);
        continue;
      }
      const l = byId.get(r.id);
      if (!l || (r.updatedAt || 0) > (l.updatedAt || 0)) {
        byId.set(r.id, r);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(byId.values())));
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(deleted)));
      emitStoreDataChanged();
    }
  } catch (err) {
    console.warn('Could not load projects from cloud (using this browser\'s copy):', err);
  }
};

export const getProjects = async (): Promise<BotanicalProject[]> => {
  migrateProjects();
  void syncFromCloud();
  const deletedIds = getDeletedProjectIds();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => p && p.id && !deletedIds.has(p.id));
      }
    }
  } catch (err) {
    console.warn('Error reading projects from storage:', err);
  }

  const isSeeded = typeof window !== 'undefined' ? localStorage.getItem(SEEDED_FLAG_KEY) : null;
  if (isSeeded === 'true') {
    return [];
  }

  return INITIAL_PROJECTS.filter((p) => !deletedIds.has(p.id));
};

export const saveProject = async (project: BotanicalProject): Promise<void> => {
  unmarkProjectDeleted(project.id);
  const current = await getProjects();
  const existingIndex = current.findIndex((p) => p.id === project.id);
  let updated: BotanicalProject[];

  const stamped: BotanicalProject = { ...project, createdAt: project.createdAt || Date.now(), updatedAt: Date.now() };
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = stamped;
  } else {
    updated = [stamped, ...current];
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  emitStoreDataChanged();
  void pushToCloud(stamped);
};

export const deleteProject = async (id: string): Promise<void> => {
  markProjectDeleted(id);
  const current = await getProjects();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  emitStoreDataChanged();
  // Keep a "deleted" marker in the cloud so other devices remove it too.
  withTimeout(setDoc(doc(db, PROJECTS_COLLECTION, id), { deleted: true, updatedAt: Date.now() })).catch(() =>
    withTimeout(deleteDoc(doc(db, PROJECTS_COLLECTION, id))).catch(() => undefined)
  );
};

export const deleteAllProjects = async (): Promise<void> => {
  const current = await getProjects();
  for (const p of current) {
    markProjectDeleted(p.id);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  emitStoreDataChanged();
};

export const resetProjectsToDefault = async (): Promise<void> => {
  localStorage.removeItem(DELETED_IDS_KEY);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  emitStoreDataChanged();
};
