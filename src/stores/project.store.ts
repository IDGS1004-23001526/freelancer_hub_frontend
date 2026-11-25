import { create } from 'zustand';
import { projectApi } from '../api/project.api.js';
import { getProjectProposalsCount } from '../api/candidate.api.js';
import type {
  ProjectConvocatoria,
  CreateProjectPayload,
  ClientWalletInfo,
} from '../interfaces/project.interface.js';

const STORAGE_KEY = 'fh_projects_catalog';
const WALLET_STORAGE_KEY = 'fh_client_wallet';

const INITIAL_PROJECTS: ProjectConvocatoria[] = [];

const DEFAULT_WALLET: ClientWalletInfo = {
  balance: 0,
  escrowLocked: 0,
  currency: 'USD',
  cardBrand: '',
  cardLast4: '',
};

function syncProjectsProposalsCount(
  list: ProjectConvocatoria[]
): ProjectConvocatoria[] {
  return list.map((proj) => ({
    ...proj,
    proposalsCount: getProjectProposalsCount(proj.id, {
      title: proj.title,
      category: proj.category,
      budget: proj.budget,
      currency: proj.currency,
      skills: proj.skills,
    }),
  }));
}

function loadInitialProjects(): ProjectConvocatoria[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const withoutSeeds = parsed.filter(
          (p) => !['proj_101', 'proj_102', 'proj_103'].includes(p.id)
        );
        const synced = syncProjectsProposalsCount(withoutSeeds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
        return synced;
      }
    }
  } catch {
    // Fallback to initial seed
  }
  const syncedInitial = syncProjectsProposalsCount(INITIAL_PROJECTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedInitial));
  return syncedInitial;
}

function loadInitialWallet(): ClientWalletInfo {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && !(parsed.balance === 14850 && parsed.cardLast4 === '4829')) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(DEFAULT_WALLET));
  return DEFAULT_WALLET;
}

interface ProjectState {
  projects: ProjectConvocatoria[];
  wallet: ClientWalletInfo;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (
    payload: CreateProjectPayload,
    clientName?: string
  ) => Promise<{ success: boolean; project?: ProjectConvocatoria; error?: string }>;
  getProjectById: (id: string) => ProjectConvocatoria | undefined;
  addFunds: (amount: number) => void;
  updateActiveCard: (cardBrand: string, cardLast4: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadInitialProjects(),
  wallet: loadInitialWallet(),
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await projectApi.getProjects();
      if (response?.data && Array.isArray(response.data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
        set({ projects: response.data, loading: false });
        return;
      }
    } catch {
      // Fallback local
    }
    const localProjects = loadInitialProjects();
    set({ projects: localProjects, loading: false });
  },

  createProject: async (payload: CreateProjectPayload, clientName?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await projectApi.createProject(payload);
      if (response?.data) {
        const created: ProjectConvocatoria = {
          ...response.data,
          status: 'ABIERTO',
        };
        const updatedList = [created, ...get().projects];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        set({ projects: updatedList, loading: false });
        return { success: true, project: created };
      }
      throw new Error('Fallback local');
    } catch {
      // Creación reactiva local con estado ABIERTO garantizado
      const now = new Date().toISOString();
      const newId = `proj_${Date.now()}`;
      const generatedCount = getProjectProposalsCount(newId, {
        title: payload.title.trim(),
        category: payload.category || 'Desarrollo Web',
        budget: Number(payload.budget),
        currency: payload.currency || 'MXN',
        skills: payload.skills,
      });

      const newProject: ProjectConvocatoria = {
        id: newId,
        title: payload.title.trim(),
        category: payload.category || 'Desarrollo Web',
        budget: Number(payload.budget),
        currency: payload.currency || 'MXN',
        skills: payload.skills,
        estimatedDate: payload.estimatedDate,
        description:
          payload.description?.trim() ||
          `Convocatoria abierta para ${payload.title.trim()} en la categoría de ${payload.category || 'Desarrollo Web'}. Se requieren especialistas con dominio en ${payload.skills.join(', ')}.`,
        status: 'ABIERTO',
        clientName: clientName || 'Sofía Ramírez • Cliente Verificado',
        proposalsCount: generatedCount,
        createdAt: now,
        updatedAt: now,
      };

      const updatedList = [newProject, ...get().projects];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

      set({
        projects: updatedList,
        loading: false,
      });

      return { success: true, project: newProject };
    }
  },

  getProjectById: (id: string) => {
    return get().projects.find((p) => p.id === id);
  },

  addFunds: (amount: number) => {
    if (amount <= 0) return;
    const currentWallet = get().wallet;
    const updatedWallet: ClientWalletInfo = {
      ...currentWallet,
      balance: currentWallet.balance + amount,
    };
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updatedWallet));
    set({ wallet: updatedWallet });
  },

  updateActiveCard: (cardBrand: string, cardLast4: string) => {
    const currentWallet = get().wallet;
    const updatedWallet: ClientWalletInfo = {
      ...currentWallet,
      cardBrand: cardBrand || 'Tarjeta Verificada',
      cardLast4: (cardLast4 || '0000').slice(-4),
    };
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updatedWallet));
    set({ wallet: updatedWallet });
  },
}));
