import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  CreateProposalPayload,
  ProposalResponse,
  SubmitProposalResult,
} from '../interfaces/proposal.interface.js';
import type { CandidateProposal } from '../interfaces/candidate.interface.js';

const SUBMITTED_PROPOSALS_KEY = 'fh_submitted_proposals_v1';
const CANDIDATE_PROPOSALS_KEY = 'fh_candidate_proposals_v2';

interface StoredProposalEntry {
  userId: string;
  projectId: string;
  proposal: ProposalResponse;
}

function getCurrentUserMeta(): { id: string; fullName: string } {
  try {
    const raw = localStorage.getItem('fh_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        id: parsed?.id || 'local_freelancer',
        fullName: parsed?.fullName || 'Freelancer',
      };
    }
  } catch {
    // Ignore storage error
  }
  return { id: 'local_freelancer', fullName: 'Freelancer' };
}

function loadSubmittedEntries(): StoredProposalEntry[] {
  try {
    const raw = localStorage.getItem(SUBMITTED_PROPOSALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage error
  }
  return [];
}

function saveSubmittedEntry(userId: string, projectId: string, proposal: ProposalResponse): void {
  try {
    const entries = loadSubmittedEntries();
    const filtered = entries.filter(
      (item) => !(item.projectId === projectId && item.userId === userId)
    );
    localStorage.setItem(
      SUBMITTED_PROPOSALS_KEY,
      JSON.stringify([{ userId, projectId, proposal }, ...filtered])
    );
  } catch {
    // Ignore storage error
  }
}

function syncCandidateCatalog(
  proposal: ProposalResponse,
  portfolioUrls: string[],
  projectSkills: string[] = []
): void {
  try {
    const raw = localStorage.getItem(CANDIDATE_PROPOSALS_KEY);
    const existing: CandidateProposal[] = raw ? JSON.parse(raw) : [];
    const { fullName } = getCurrentUserMeta();
    const parts = fullName.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : fullName.slice(0, 2).toUpperCase();

    const candidateEntry: CandidateProposal = {
      id: proposal.id,
      projectId: proposal.projectId,
      freelancerId: proposal.freelancerId,
      freelancerName: fullName,
      freelancerRole: 'Especialista Freelancer',
      freelancerLocation: 'México',
      avatarInitials: initials || 'FL',
      reputation: 4.9,
      reviewsCount: 14,
      completedProjects: 18,
      totalPrice: Number(proposal.totalPrice),
      currency: 'MXN',
      estimatedDays: Number(proposal.estimatedDays),
      coverLetter: proposal.coverLetter,
      skills: projectSkills.length > 0 ? projectSkills : ['React', 'Node.js'],
      milestones: proposal.milestones.map((m, idx) => ({
        id: m.id || `ms_${Date.now()}_${idx}`,
        proposalId: proposal.id,
        title: m.title,
        description: m.description || `Entregable de hito #${m.order ?? idx + 1}`,
        amount: Number(m.amount),
        deliveryDays: Number(m.deliveryDays),
        order: m.order ?? idx + 1,
      })),
      portfolio: portfolioUrls.map((url, idx) => ({
        id: `pf_${proposal.id}_${idx + 1}`,
        title: `Proyecto de portafolio #${idx + 1}`,
        category: 'Portafolio',
        summary: 'Enlace de proyecto previo adjunto en la postulación.',
        url,
        techStack: projectSkills.slice(0, 3),
      })),
      status: 'PENDING',
      createdAt: proposal.createdAt,
    };

    const deduped = existing.filter(
      (item) =>
        !(
          item.projectId === proposal.projectId &&
          item.freelancerId === proposal.freelancerId
        )
    );
    localStorage.setItem(
      CANDIDATE_PROPOSALS_KEY,
      JSON.stringify([candidateEntry, ...deduped])
    );
  } catch {
    // Ignore storage error
  }
}

export interface MyProposalItem {
  id: string;
  projectId: string;
  projectTitle: string;
  companyName: string;
  coverLetter: string;
  totalPrice: number;
  currency: string;
  estimatedDays: number;
  status: 'PENDIENTE' | 'ADJUDICADA' | 'RECHAZADA';
  createdAt: string;
  portfolioUrls: string[];
  milestones: ProposalResponse['milestones'];
}

function normalizeProposalStatus(raw?: string): 'PENDIENTE' | 'ADJUDICADA' | 'RECHAZADA' {
  const val = String(raw || '').toUpperCase();
  if (val === 'ADJUDICADA' || val === 'ACCEPTED' || val === 'APPROVED') return 'ADJUDICADA';
  if (val === 'REJECTED' || val === 'RECHAZADA') return 'RECHAZADA';
  return 'PENDIENTE';
}

export const proposalApi = {
  /**
   * Lista todas las postulaciones del freelancer actual, enriquecidas con datos de proyectos y contratos.
   */
  getMyProposals: async (
    userId?: string,
    knownProjects: Array<{
      id: string;
      title?: string;
      clientName?: string;
      currency?: string;
    }> = []
  ): Promise<MyProposalItem[]> => {
    const activeUserId = userId || getCurrentUserMeta().id;
    const projectMap = new Map<string, { title?: string; clientName?: string; currency?: string }>();
    knownProjects.forEach((proj) => {
      if (proj?.id) projectMap.set(proj.id, proj);
    });

    try {
      const projectsRes = await apiClient.get<ApiResponse<any[]>>('/v1/projects');
      const list = Array.isArray(projectsRes.data?.data) ? projectsRes.data.data : [];
      list.forEach((proj: any) => {
        if (proj?.id) {
          projectMap.set(proj.id, {
            title: proj.title,
            clientName: proj.clientName || proj.client?.fullName || proj.companyName,
            currency: proj.currency || 'MXN',
          });
        }
      });
    } catch {
      // Mantiene catálogo conocido localmente si el endpoint no responde
    }

    const byProject = new Map<string, MyProposalItem>();

    // 1. Propuestas guardadas localmente al postular (respaldo y modo demo offline)
    const entries = loadSubmittedEntries().filter(
      (entry) =>
        entry.userId === activeUserId ||
        entry.proposal?.freelancerId === activeUserId ||
        activeUserId === 'local_freelancer'
    );

    entries.forEach(({ projectId, proposal }) => {
      const proj = projectMap.get(projectId);
      byProject.set(projectId, {
        id: proposal.id,
        projectId,
        projectTitle: proj?.title || `Convocatoria #${projectId.slice(0, 8)}`,
        companyName: proj?.clientName || 'Cliente Contratante',
        coverLetter: proposal.coverLetter,
        totalPrice: Number(proposal.totalPrice) || 0,
        currency: proj?.currency || 'MXN',
        estimatedDays: Number(proposal.estimatedDays) || 1,
        status: normalizeProposalStatus(proposal.status),
        createdAt: proposal.createdAt,
        portfolioUrls: Array.isArray(proposal.portfolioUrls) ? proposal.portfolioUrls : [],
        milestones: Array.isArray(proposal.milestones) ? proposal.milestones : [],
      });
    });

    const token =
      localStorage.getItem('fh_access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken');

    if (token && !token.startsWith('sim_jwt_')) {
      // 2. Consultar postulaciones reales del freelancer en PostgreSQL (GET /api/v1/proposals/me)
      try {
        const myPropsRes = await apiClient.get<ApiResponse<ProposalResponse[]>>('/v1/proposals/me');
        const remoteProposals = Array.isArray(myPropsRes.data?.data) ? myPropsRes.data.data : [];

        remoteProposals.forEach((proposal) => {
          if (!proposal?.projectId) return;
          saveSubmittedEntry(activeUserId, proposal.projectId, proposal);
          const proj = projectMap.get(proposal.projectId);
          const prev = byProject.get(proposal.projectId);

          byProject.set(proposal.projectId, {
            id: proposal.id,
            projectId: proposal.projectId,
            projectTitle: proj?.title || prev?.projectTitle || `Convocatoria #${proposal.projectId.slice(0, 8)}`,
            companyName: proj?.clientName || prev?.companyName || 'Cliente Contratante',
            coverLetter: proposal.coverLetter,
            totalPrice: Number(proposal.totalPrice) || 0,
            currency: proj?.currency || prev?.currency || 'MXN',
            estimatedDays: Number(proposal.estimatedDays) || 1,
            status: normalizeProposalStatus(proposal.status),
            createdAt: proposal.createdAt,
            portfolioUrls: Array.isArray(proposal.portfolioUrls)
              ? proposal.portfolioUrls
              : prev?.portfolioUrls || [],
            milestones: Array.isArray(proposal.milestones) ? proposal.milestones : [],
          });
        });
      } catch {
        // Si el backend remoto aún no despliega /v1/proposals/me, continúa con caché local + contratos
      }

      // 3. Contratos adjudicados desde backend (GET /api/v1/contracts)
      try {
        const contractsRes = await apiClient.get<any>('/v1/contracts');
        const rawList = Array.isArray(contractsRes.data?.data)
          ? contractsRes.data.data
          : Array.isArray(contractsRes.data)
            ? contractsRes.data
            : [];

        rawList.forEach((raw: any) => {
          const proj = raw?.project || {};
          const cli = raw?.client || {};
          const pId = String(proj.id || raw?.projectId || raw?.id || '');
          if (!pId) return;

          const prev = byProject.get(pId);
          byProject.set(pId, {
            id: String(raw?.id || prev?.id || pId),
            projectId: pId,
            projectTitle:
              proj.title || prev?.projectTitle || projectMap.get(pId)?.title || 'Proyecto Adjudicado',
            companyName:
              cli.fullName ||
              cli.name ||
              prev?.companyName ||
              projectMap.get(pId)?.clientName ||
              'Cliente Contratante',
            coverLetter: prev?.coverLetter || 'Propuesta adjudicada en contrato.',
            totalPrice: Number(raw?.totalAmount || prev?.totalPrice || 0),
            currency: prev?.currency || proj.currency || 'MXN',
            estimatedDays: prev?.estimatedDays || 15,
            status: 'ADJUDICADA',
            createdAt: raw?.createdAt || prev?.createdAt || new Date().toISOString(),
            portfolioUrls: prev?.portfolioUrls || [],
            milestones: prev?.milestones || [],
          });
        });
      } catch {
        // Si falla la consulta de contratos, conserva las propuestas disponibles
      }
    }

    return Array.from(byProject.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Verifica si el usuario actual ya postuló a una convocatoria específica.
   */
  getMyProposalForProject: async (
    projectId: string,
    userId?: string
  ): Promise<ProposalResponse | null> => {
    const activeUserId = userId || getCurrentUserMeta().id;
    const localMatch = loadSubmittedEntries().find(
      (entry) => entry.projectId === projectId && entry.userId === activeUserId
    );
    if (localMatch) {
      return localMatch.proposal;
    }

    const token =
      localStorage.getItem('fh_access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken');

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        projectId
      );

    if (token && !token.startsWith('sim_jwt_') && isUuid && activeUserId !== 'local_freelancer') {
      try {
        const response = await apiClient.get<ApiResponse<ProposalResponse[]>>('/v1/proposals/me');
        const list = response.data?.data;
        if (Array.isArray(list)) {
          const mine = list.find((p) => p.projectId === projectId);
          if (mine) {
            saveSubmittedEntry(activeUserId, projectId, mine);
            return mine;
          }
        }
      } catch {
        // Ignorar errores si /v1/proposals/me aún no está desplegado y mantener estado local
      }
    }

    return null;
  },

  /**
   * Envía una nueva propuesta económica por hitos a POST /api/v1/proposals
   */
  submitProposal: async (
    payload: CreateProposalPayload,
    projectSkills: string[] = []
  ): Promise<SubmitProposalResult> => {
    const { id: userId } = getCurrentUserMeta();
    const cleanUrls = (payload.portfolioUrls || [])
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 3);

    const requestBody: CreateProposalPayload = {
      projectId: payload.projectId,
      coverLetter: payload.coverLetter.trim(),
      totalPrice: Number(payload.totalPrice),
      estimatedDays: Number(payload.estimatedDays),
      ...(cleanUrls.length > 0 ? { portfolioUrls: cleanUrls } : {}),
      milestones: payload.milestones.map((m, index) => ({
        title: m.title.trim(),
        ...(m.description?.trim() ? { description: m.description.trim() } : {}),
        amount: Number(m.amount),
        deliveryDays: Number(m.deliveryDays),
        order: m.order ?? index + 1,
      })),
    };

    try {
      const response = await apiClient.post<ApiResponse<ProposalResponse>>(
        '/v1/proposals',
        requestBody
      );

      if (response.data?.data) {
        const created: ProposalResponse = {
          ...response.data.data,
          portfolioUrls: response.data.data.portfolioUrls || cleanUrls,
        };
        saveSubmittedEntry(userId, payload.projectId, created);
        syncCandidateCatalog(created, cleanUrls, projectSkills);
        return { success: true, data: created };
      }

      throw new Error('Respuesta inesperada del servidor');
    } catch (err: any) {
      if (err?.response) {
        const status = err.response.status;
        if (status === 409) {
          const existingLocal = loadSubmittedEntries().find(
            (e) => e.projectId === payload.projectId && e.userId === userId
          );
          if (!existingLocal) {
            const placeholder: ProposalResponse = {
              id: `prop_existing_${Date.now()}`,
              projectId: payload.projectId,
              freelancerId: userId,
              coverLetter: requestBody.coverLetter,
              totalPrice: requestBody.totalPrice,
              estimatedDays: requestBody.estimatedDays,
              portfolioUrls: cleanUrls,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              milestones: requestBody.milestones.map((m, idx) => ({
                id: `ms_existing_${idx}`,
                ...m,
              })),
            };
            saveSubmittedEntry(userId, payload.projectId, placeholder);
          }
          return {
            success: false,
            alreadyApplied: true,
            error:
              err.response.data?.message ||
              'Ya has enviado una propuesta a este proyecto.',
          };
        }

        const detailMsg = err.response.data?.detalles?.[0]?.mensaje;
        const message =
          detailMsg ||
          err.response.data?.message ||
          'No se pudo enviar tu propuesta. Verifica los datos ingresados.';

        return {
          success: false,
          error: message,
        };
      }

      // Fallback local cuando el backend no está en línea en pruebas locales
      const existingLocal = loadSubmittedEntries().find(
        (e) => e.projectId === payload.projectId && e.userId === userId
      );
      if (existingLocal) {
        return {
          success: false,
          alreadyApplied: true,
          error: 'Ya has enviado una propuesta a este proyecto.',
        };
      }

      const now = new Date().toISOString();
      const proposalId = `prop_${Date.now()}`;
      const localProposal: ProposalResponse = {
        id: proposalId,
        projectId: payload.projectId,
        freelancerId: userId,
        coverLetter: requestBody.coverLetter,
        totalPrice: requestBody.totalPrice,
        estimatedDays: requestBody.estimatedDays,
        portfolioUrls: cleanUrls,
        status: 'PENDING',
        createdAt: now,
        milestones: requestBody.milestones.map((m, idx) => ({
          id: `ms_${proposalId}_${idx + 1}`,
          title: m.title,
          description: m.description,
          amount: m.amount,
          deliveryDays: m.deliveryDays,
          order: m.order ?? idx + 1,
        })),
      };

      saveSubmittedEntry(userId, payload.projectId, localProposal);
      syncCandidateCatalog(localProposal, cleanUrls, projectSkills);

      return {
        success: true,
        data: localProposal,
        simulated: true,
      };
    }
  },
};
