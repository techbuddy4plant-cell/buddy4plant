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

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('b4p_store_data_changed', { detail: { type: 'projects' } })
    );
  }
};

export const getProjects = async (): Promise<BotanicalProject[]> => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading projects from storage:', err);
  }
  // Fallback & seed initial
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
  } catch {}
  return INITIAL_PROJECTS;
};

export const saveProject = async (project: BotanicalProject): Promise<void> => {
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
  emitStoreDataChanged();
};

export const deleteProject = async (id: string): Promise<void> => {
  const current = await getProjects();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  emitStoreDataChanged();
};

export const resetProjectsToDefault = async (): Promise<void> => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
  emitStoreDataChanged();
};
