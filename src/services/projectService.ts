import { BotanicalProject } from '../types';

export const INITIAL_PROJECTS: BotanicalProject[] = [
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

export const getProjects = async (): Promise<BotanicalProject[]> => {
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

  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...project, createdAt: project.createdAt || Date.now() };
  } else {
    updated = [{ ...project, createdAt: Date.now() }, ...current];
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  emitStoreDataChanged();
};

export const deleteProject = async (id: string): Promise<void> => {
  markProjectDeleted(id);
  const current = await getProjects();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  emitStoreDataChanged();
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
