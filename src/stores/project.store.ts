import { create } from 'zustand';
import { projectApi } from '../api/project.api.js';
import { apiClient } from '../api/client.js';
import type {
  ProjectConvocatoria,
  CreateProjectPayload,
  ClientWalletInfo,
  ProjectFilterParams,
  ProjectStatus,
} from '../interfaces/project.interface.js';

const STORAGE_KEY = 'fh_projects_catalog';
const WALLET_STORAGE_KEY = 'fh_client_wallet';

const INITIAL_PROJECTS: ProjectConvocatoria[] = [];

const DEFAULT_WALLET: ClientWalletInfo = {
  balance: 0,
  escrowLocked: 0,
  currency: 'MXN',
  cardBrand: '',
  cardLast4: '',
};

function normalizeProject(proj: any): ProjectConvocatoria {
  const statusMap: Record<string, ProjectStatus> = {
    ACTIVE: 'ABIERTO',
    ABIERTO: 'ABIERTO',
    IN_PROGRESS: 'EN_PROGRESO',
    EN_PROGRESO: 'EN_PROGRESO',
    COMPLETED: 'COMPLETADO',
    COMPLETADO: 'COMPLETADO',
    CANCELLED: 'CANCELADO',
    CANCELADO: 'CANCELADO',
    // CLOSED: la convocatoria ya tiene contrato formalizado.
    CLOSED: 'EN_PROGRESO',
  };

  const id = proj.id || `proj_${Date.now()}`;
  const title = proj.title || '';
  const category = proj.category || 'Desarrollo Web';
  const budget = Number(proj.budget) || 0;
  const currency = proj.currency || 'MXN';
  const skills = Array.isArray(proj.skills) ? proj.skills : [];
  const status = statusMap[proj.status] || 'ABIERTO';

  return {
    ...proj,
    id,
    title,
    category,
    budget,
    currency,
    skills,
    estimatedDate: proj.estimatedDate
      ? String(proj.estimatedDate).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    description:
      proj.description ||
      `Convocatoria para ${title} en ${category}. Habilidades: ${skills.join(', ')}.`,
    status,
    clientName: proj.clientName || 'Cliente',
    clientAvatar: proj.clientAvatar || undefined,
    proposalsCount: typeof proj.proposalsCount === 'number' ? proj.proposalsCount : 0,
    createdAt: proj.createdAt || new Date().toISOString(),
    updatedAt: proj.updatedAt || proj.createdAt || new Date().toISOString(),
  };
}

function syncProjectsProposalsCount(
  list: ProjectConvocatoria[]
): ProjectConvocatoria[] {
  return list.map((proj) => normalizeProject(proj));
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
  fetchProjects: (params?: ProjectFilterParams) => Promise<void>;
  createProject: (
    payload: CreateProjectPayload,
    clientName?: string
  ) => Promise<{ success: boolean; project?: ProjectConvocatoria; error?: string }>;
  getProjectById: (id: string) => ProjectConvocatoria | undefined;
  fetchWallet: () => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  updateActiveCard: (cardBrand: string, cardLast4: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadInitialProjects(),
  wallet: loadInitialWallet(),
  loading: false,
  error: null,

  fetchProjects: async (params?: ProjectFilterParams) => {
    set({ loading: true, error: null });
    try {
      const response = await projectApi.getProjects(params);
      if (response?.data && Array.isArray(response.data)) {
        const normalized = response.data.map(normalizeProject);
        if (!params?.search && (!params?.category || params.category === 'TODAS')) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        }
        set({ projects: normalized, loading: false });
        return;
      }
    } catch (err: any) {
      // Se muestra la última copia descargada del servidor, avisando del error.
      set({ error: err?.response?.data?.message || 'No se pudieron cargar las convocatorias.' });
    }
    const localProjects = loadInitialProjects();
    if (params?.search || (params?.category && params.category !== 'TODAS')) {
      const filtered = localProjects.filter((p) => {
        const matchSearch =
          !params.search ||
          p.title.toLowerCase().includes(params.search.toLowerCase()) ||
          p.description.toLowerCase().includes(params.search.toLowerCase()) ||
          p.skills.some((s) => s.toLowerCase().includes(params.search!.toLowerCase()));
        const matchCategory =
          !params.category || params.category === 'TODAS' || p.category === params.category;
        return matchSearch && matchCategory;
      });
      set({ projects: filtered, loading: false });
      return;
    }
    set({ projects: localProjects, loading: false });
  },

  createProject: async (payload: CreateProjectPayload, _clientName?: string) => {
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
      throw new Error('Respuesta vacía del servidor.');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'No se pudo publicar la convocatoria.';
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  getProjectById: (id: string) => {
    return get().projects.find((p) => p.id === id);
  },

  fetchWallet: async () => {
    const response = await apiClient.get('/v1/wallet');
    const data = response.data?.data;
    if (!data) return;
    const updatedWallet: ClientWalletInfo = {
      ...get().wallet,
      balance: Number(data.availableBalance) || 0,
      escrowLocked: Number(data.escrowLocked) || 0,
      currency: data.currency || 'MXN',
    };
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updatedWallet));
    set({ wallet: updatedWallet });
  },

  addFunds: async (amount: number) => {
    if (amount <= 0) return;
    await apiClient.post('/v1/wallet/deposit', { amount });
    await get().fetchWallet();
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
