import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  ActiveContractDetail,
  BlindReviewRecord,
  CreateReviewPayload,
  EscrowReceipt,
  KanbanMilestoneStatus,
} from '../interfaces/contract.interface.js';

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function currentUserId(): string | null {
  try {
    const raw = localStorage.getItem('fh_user');
    return raw ? JSON.parse(raw)?.id ?? null : null;
  } catch {
    return null;
  }
}

/**
 * Combina las reseñas visibles del contrato (propia + publicada de la contraparte)
 * en el registro de reseña ciega que consume la UI.
 */
function mapReviews(
  contractId: string,
  rows: any[],
  reviewerName: string,
  targetName: string
): BlindReviewRecord | null {
  const me = currentUserId();
  const mine = rows.find((r) => r.reviewerId === me);
  if (!mine) return null;
  const counterpart = rows.find((r) => r.reviewerId !== me && r.isPublished);
  return {
    id: mine.id,
    contractId,
    reviewerName,
    targetName,
    rating: mine.rating,
    comment: mine.comment,
    isCounterpartSubmitted: Boolean(counterpart),
    counterpartRating: counterpart?.rating,
    counterpartComment: counterpart?.comment,
    createdAt: mine.createdAt,
  };
}

function mapBackendContractToFrontend(contract: any): ActiveContractDetail {
  const freelancerProfile = contract.freelancer?.profile;
  const clientProfile = contract.client?.profile;

  const freelancerName =
    contract.freelancerName ||
    (freelancerProfile
      ? `${freelancerProfile.firstName} ${freelancerProfile.lastName}`.trim()
      : 'Freelancer');

  const clientName =
    contract.clientName ||
    (clientProfile
      ? `${clientProfile.firstName} ${clientProfile.lastName}`.trim()
      : 'Cliente');

  const freelancerRole =
    contract.freelancerRole ||
    freelancerProfile?.professionalTitle ||
    '';

  return {
    id: contract.id,
    projectId: contract.projectId || 'proj_101',
    projectTitle:
      contract.projectTitle ||
      contract.project?.title ||
      `Contrato #${contract.id.slice(0, 8)}`,
    projectCategory:
      contract.projectCategory ||
      contract.project?.category ||
      'Desarrollo Web',
    projectDescription:
      contract.projectDescription ||
      contract.project?.description,
    proposalId: contract.proposalId || '',
    freelancerId: contract.freelancerId,
    freelancerName,
    freelancerRole,
    freelancerAvatar:
      contract.freelancerAvatar ||
      freelancerProfile?.avatarUrl,
    avatarInitials:
      contract.avatarInitials ||
      freelancerName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0].toUpperCase())
        .join('') ||
      'MV',
    clientName,
    totalAmount: Number(contract.totalAmount || 0),
    currency: contract.currency || 'USD',
    status:
      contract.status === 'COMPLETED'
        ? 'COMPLETED'
        : contract.status === 'DRAFT'
          ? 'DRAFT'
          : contract.status === 'FUNDED'
            ? 'FUNDED'
            : 'ACTIVE',
    fundedAt: contract.fundedAt,
    createdAt: contract.createdAt || new Date().toISOString(),
    milestones: (contract.milestones || []).map((m: any) => {
      const kanbanStatus: KanbanMilestoneStatus =
        m.status === 'APPROVED'
          ? 'APPROVED'
          : m.status === 'SUBMITTED' || m.status === 'IN_REVIEW'
            ? 'IN_REVIEW'
            : 'TODO';

      const fileName = m.deliverableUrl
        ? m.deliverableUrl.split('/').pop()?.replace(/\.[^/.]+$/, '') + '.pdf'
        : `evidencia-hito${m.order || 1}.pdf`;

      const delivery =
        m.deliverableUrl || m.deliverableHash || kanbanStatus !== 'TODO'
          ? {
              id: `del_${m.id}`,
              milestoneId: m.id,
              notes:
                m.notes ||
                m.description ||
                'Avance técnico del hito listo para inspección y validación.',
              repoUrl:
                m.repoUrl ||
                m.deliverableUrl ||
                'https://github.com/mateovillalobos/agromarket-b2b/pull/14',
              demoUrl:
                m.demoUrl ||
                (m.deliverableUrl && m.deliverableUrl.startsWith('http')
                  ? m.deliverableUrl
                  : undefined),
              fileName: fileName || `evidencia-hito${m.order || 1}.pdf`,
              fileSize: m.fileSize || '6.8 MB',
              sha256Hash:
                m.deliverableHash ||
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              submittedAt: m.submittedAt || new Date().toISOString(),
            }
          : undefined;

      return {
        id: m.id,
        contractId: contract.id,
        order: m.order || 1,
        title: m.title || `Hito #${m.order}`,
        description: m.description || '',
        amount: Number(m.amount || 0),
        deliveryDays: m.deliveryDays || 7,
        dueDate: m.dueDate || '2026-12-01',
        status: kanbanStatus,
        delivery,
        approvedAt: m.approvedAt,
      };
    }),
  };
}

export const contractApi = {
  getContracts: async (): Promise<ActiveContractDetail[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/v1/contracts');
    const rows = Array.isArray(response.data?.data) ? response.data.data : [];
    return rows.map(mapBackendContractToFrontend);
  },

  getContractById: async (contractId: string): Promise<ActiveContractDetail> => {
    const response = await apiClient.get<ApiResponse<any>>(`/v1/contracts/${contractId}`);
    return mapBackendContractToFrontend(response.data.data);
  },

  fundContract: async (
    contractId: string,
    payload: {
      paymentMethod: string;
      cardLast4?: string;
      autoStart?: boolean;
    }
  ): Promise<{ contract: ActiveContractDetail; receipt: EscrowReceipt }> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/v1/contracts/${contractId}/fund`,
      {
        autoStart: payload.autoStart ?? true,
        paymentMethod: payload.paymentMethod,
        cardLast4: payload.cardLast4,
      }
    );
    const contract = mapBackendContractToFrontend(response.data.data);
    const fundedAt = (response.data.data?.fundedAt as string) || new Date().toISOString();

    // La comisión de plataforma (10%) se descuenta al freelancer al liberar cada hito;
    // el cliente deposita exactamente el total del contrato.
    const subtotal = contract.totalAmount;
    const receipt: EscrowReceipt = {
      id: `rec_${contract.id.slice(0, 8)}`,
      contractId: contract.id,
      transactionId: `escrow_${contract.id.slice(0, 8)}`,
      projectTitle: contract.projectTitle,
      freelancerName: contract.freelancerName,
      freelancerRole: contract.freelancerRole,
      clientName: contract.clientName,
      subtotal,
      serviceFee: 0,
      totalDeposited: subtotal,
      currency: contract.currency || 'MXN',
      paymentMethod: payload.paymentMethod === 'card' ? 'Tarjeta Bancaria' : 'Billetera Digital',
      cardLast4: payload.cardLast4,
      sha256Seal: await sha256Hex(`${contract.id}:${subtotal}:${fundedAt}`),
      fundedAt,
    };

    return { contract, receipt };
  },

  updateMilestoneStatus: async (
    contractId: string,
    milestoneId: string,
    newStatus: KanbanMilestoneStatus,
    deliveryNotes?: string
  ): Promise<ActiveContractDetail[]> => {
    if (newStatus === 'APPROVED') {
      await apiClient.post(`/v1/milestones/${milestoneId}/approve`, { contractId });
    } else if (newStatus === 'IN_REVIEW') {
      await apiClient.post(`/v1/milestones/${milestoneId}/deliveries`, {
        contractId,
        notes: deliveryNotes || 'Avance enviado para revisión y validación del cliente.',
      });
    } else if (newStatus === 'TODO') {
      await apiClient.post(`/v1/milestones/${milestoneId}/corrections`, {
        contractId,
        feedback: deliveryNotes || 'Se han solicitado correcciones técnicas sobre este entregable.',
      });
    }
    return contractApi.getContracts();
  },

  submitBlindReview: async (
    payload: CreateReviewPayload,
    reviewerName: string,
    targetName: string
  ): Promise<BlindReviewRecord> => {
    await apiClient.post<ApiResponse<any>>('/v1/reviews', payload);
    const review = await contractApi.revealCounterpartReview(payload.contractId, targetName, reviewerName);
    if (!review) {
      throw new Error('No se pudo recuperar la reseña registrada.');
    }
    return review;
  },

  /**
   * Consulta las reseñas del contrato. La de la contraparte solo aparece cuando
   * ambas partes calificaron (el backend la publica en ese momento).
   */
  revealCounterpartReview: async (
    contractId: string,
    targetName: string,
    reviewerName = 'Tú'
  ): Promise<BlindReviewRecord | null> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/v1/reviews/contract/${contractId}`);
    const rows = Array.isArray(response.data?.data) ? response.data.data : [];
    return mapReviews(contractId, rows, reviewerName, targetName);
  },
};
