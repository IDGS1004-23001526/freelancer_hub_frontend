import { create } from 'zustand';
import { projectApi } from '../api/project.api.js';
import type {
  ProjectConvocatoria,
  CreateProjectPayload,
  ClientWalletInfo,
} from '../interfaces/project.interface.js';

const STORAGE_KEY = 'fh_projects_catalog';
const WALLET_STORAGE_KEY = 'fh_client_wallet';

const INITIAL_PROJECTS: ProjectConvocatoria[] = [
  {
    id: 'proj_101',
    title: 'Plataforma E-Commerce B2B con Pagos en Custodia (Escrow)',
    category: 'Desarrollo Web',
    budget: 4500,
    currency: 'USD',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    estimatedDate: '2026-12-20',
    description:
      'Buscamos desarrollar un portal mayorista con pasarela de pagos retenidos en garantía, panel de proveedores en tiempo real y generación automatizada de órdenes de compra.',
    status: 'ABIERTO',
    clientName: 'Sofía Ramírez • Estudio Nexus',
    proposalsCount: 6,
    createdAt: '2026-11-01T14:30:00.000Z',
    updatedAt: '2026-11-01T14:30:00.000Z',
  },
  {
    id: 'proj_102',
    title: 'Rediseño de Sistema de Diseño UI/UX para App Fintech',
    category: 'Diseño UI/UX',
    budget: 2800,
    currency: 'USD',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping'],
    estimatedDate: '2026-12-05',
    description:
      'Necesitamos modernizar los flujos de onboarding, billetera digital y transferencias internacionales con componentes accesibles y pruebas de usabilidad.',
    status: 'ABIERTO',
    clientName: 'Sofía Ramírez • Estudio Nexus',
    proposalsCount: 4,
    createdAt: '2026-10-29T10:15:00.000Z',
    updatedAt: '2026-10-29T10:15:00.000Z',
  },
  {
    id: 'proj_103',
    title: 'Arquitectura Microservicios & Pipeline CI/CD en AWS',
    category: 'DevOps & Cloud',
    budget: 3600,
    currency: 'USD',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    estimatedDate: '2026-12-15',
    description:
      'Automatización de despliegues multi-región, monitoreo con Prometheus/Grafana y optimización de costos en contenedores de producción.',
    status: 'EN_PROGRESO',
    clientName: 'Sofía Ramírez • Estudio Nexus',
    proposalsCount: 9,
    createdAt: '2026-10-20T09:00:00.000Z',
    updatedAt: '2026-10-25T16:45:00.000Z',
  },
];

const DEFAULT_WALLET: ClientWalletInfo = {
  balance: 14850.0,
  escrowLocked: 3600.0,
  currency: 'USD',
  cardBrand: 'Visa Corporativa',
  cardLast4: '4829',
};

function loadInitialProjects(): ProjectConvocatoria[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial seed
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
  return INITIAL_PROJECTS;
}

function loadInitialWallet(): ClientWalletInfo {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
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
      const newProject: ProjectConvocatoria = {
        id: `proj_${Date.now()}`,
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
        proposalsCount: 0,
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
}));
