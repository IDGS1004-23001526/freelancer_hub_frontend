import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  ActiveContractDetail,
  BlindReviewRecord,
  ContractMilestone,
  CreateReviewPayload,
  EscrowReceipt,
  KanbanMilestoneStatus,
} from '../interfaces/contract.interface.js';

const KANBAN_CONTRACTS_KEY = 'fh_kanban_contracts_v1';
const BLIND_REVIEWS_KEY = 'fh_blind_reviews_v1';

const INITIAL_CONTRACTS: ActiveContractDetail[] = [
  {
    id: 'ctr_901',
    projectId: 'proj_101',
    projectTitle: 'Plataforma E-Commerce B2B con Pagos en Custodia',
    projectCategory: 'Desarrollo Web',
    proposalId: 'prop_201',
    freelancerId: 'free_01',
    freelancerName: 'Mateo Villalobos',
    freelancerRole: 'Arquitecto Full-Stack & Especialista Fintech',
    avatarInitials: 'MV',
    clientName: 'Sofía Ramírez • Estudio Nexus',
    totalAmount: 4200,
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: '2026-11-03T15:00:00.000Z',
    milestones: [
      {
        id: 'km_101',
        contractId: 'ctr_901',
        order: 1,
        title: 'Base de datos y sistema de retención de pagos',
        description:
          'Estructura principal de la base de datos, reglas para resguardar el dinero de cada pedido y conexión con el sistema de órdenes.',
        amount: 1400,
        deliveryDays: 9,
        dueDate: '2026-11-12',
        status: 'APPROVED',
        approvedAt: '2026-11-08T18:20:00.000Z',
        delivery: {
          id: 'del_101',
          milestoneId: 'km_101',
          notes:
            'Hola Sofía, dejé lista la base de datos y las reglas de retención de saldo. Adjunto el paquete con el esquema SQL y las pruebas de liberación de pagos para que puedas revisarlo con calma.',
          repoUrl: 'https://github.com/mateovillalobos/agromarket-b2b/pull/1',
          demoUrl: 'https://staging-api.estudionexus-b2b.com/docs',
          fileName: 'entregable-hito1-esquema-pagos.zip',
          fileSize: '4.2 MB',
          sha256Hash:
            'a94f8d2c7e10b634f21a98c05d71e84b3c90a12d4f6e8b10c3a5d7e9f1b2c4d6',
          submittedAt: '2026-11-08T11:30:00.000Z',
        },
      },
      {
        id: 'km_102',
        contractId: 'ctr_901',
        order: 2,
        title: 'Catálogo mayorista y carrito para múltiples proveedores',
        description:
          'Pantallas para que los compradores consulten precios por volumen, armen pedidos con distintos proveedores y descarguen su cotización.',
        amount: 1600,
        deliveryDays: 11,
        dueDate: '2026-11-23',
        status: 'IN_REVIEW',
        delivery: {
          id: 'del_102',
          milestoneId: 'km_102',
          notes:
            'Subí la versión completa del catálogo mayorista y el carrito unificado. Ya puedes probar el cálculo automático de descuentos por mayoreo en el enlace de demostración.',
          repoUrl: 'https://github.com/mateovillalobos/agromarket-b2b/pull/14',
          demoUrl: 'https://demo-catalogo.estudionexus-b2b.com',
          fileName: 'evidencia-hito2-catalogo-b2b.pdf',
          fileSize: '6.8 MB',
          sha256Hash:
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          submittedAt: '2026-11-10T16:45:00.000Z',
        },
      },
      {
        id: 'km_103',
        contractId: 'ctr_901',
        order: 3,
        title: 'Panel de seguimiento de envíos y entrega final',
        description:
          'Tablero para que cada proveedor actualice el estado de sus envíos, confirmación de recepción por parte del cliente y puesta en marcha.',
        amount: 1200,
        deliveryDays: 8,
        dueDate: '2026-12-01',
        status: 'TODO',
      },
    ],
    review: null,
  },
  {
    id: 'ctr_902',
    projectId: 'proj_102',
    projectTitle: 'Rediseño de Sistema de Diseño UI/UX para App Fintech',
    projectCategory: 'Diseño UI/UX',
    proposalId: 'prop_204',
    freelancerId: 'free_04',
    freelancerName: 'Camila Orozco',
    freelancerRole: 'Product Designer Senior & Especialista en Design Systems',
    avatarInitials: 'CO',
    clientName: 'Sofía Ramírez • Estudio Nexus',
    totalAmount: 2650,
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: '2026-11-01T10:00:00.000Z',
    milestones: [
      {
        id: 'km_201',
        contractId: 'ctr_902',
        order: 1,
        title: 'Flujo de bienvenida y estructura de billetera digital',
        description:
          'Mapa de navegación de registro de usuarios, pantalla principal de billetera y flujo paso a paso para transferencias.',
        amount: 850,
        deliveryDays: 6,
        dueDate: '2026-11-07',
        status: 'APPROVED',
        approvedAt: '2026-11-06T17:10:00.000Z',
        delivery: {
          id: 'del_201',
          milestoneId: 'km_201',
          notes:
            'Comparto los flujos aprobados en Figma con las correcciones de textos en el registro de nuevos usuarios.',
          repoUrl: 'https://figma.com/file/fintech-onboarding-flow',
          demoUrl: 'https://figma.com/proto/fintech-onboarding-demo',
          fileName: 'arquitectura-flujos-billetera.pdf',
          fileSize: '5.1 MB',
          sha256Hash:
            '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730',
          submittedAt: '2026-11-06T12:00:00.000Z',
        },
      },
      {
        id: 'km_202',
        contractId: 'ctr_902',
        order: 2,
        title: 'Librería de botones, tarjetas y colores en Figma',
        description:
          'Guía visual con todos los componentes reutilizables listos para que el equipo de programación los implemente.',
        amount: 1000,
        deliveryDays: 8,
        dueDate: '2026-11-15',
        status: 'APPROVED',
        approvedAt: '2026-11-09T19:00:00.000Z',
        delivery: {
          id: 'del_202',
          milestoneId: 'km_202',
          notes:
            'Quedaron listos los 45 componentes con sus variantes claras, estados de error y guía de espaciados.',
          repoUrl: 'https://figma.com/file/fintech-design-system-tokens',
          demoUrl: 'https://figma.com/proto/fintech-ui-kit',
          fileName: 'guia-sistema-diseno-v2.pdf',
          fileSize: '9.4 MB',
          sha256Hash:
            '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
          submittedAt: '2026-11-09T14:20:00.000Z',
        },
      },
      {
        id: 'km_203',
        contractId: 'ctr_902',
        order: 3,
        title: 'Prototipo interactivo final y entrega para desarrollo',
        description:
          'Prototipo navegable de principio a fin y documento con especificaciones visuales para el equipo técnico.',
        amount: 800,
        deliveryDays: 6,
        dueDate: '2026-11-21',
        status: 'IN_REVIEW',
        delivery: {
          id: 'del_203',
          milestoneId: 'km_203',
          notes:
            '¡Hola Sofía! Ya está listo el último entregable con el prototipo navegable completo. Al aprobar este último hito habremos concluido todo el proyecto.',
          repoUrl: 'https://figma.com/file/fintech-final-handoff',
          demoUrl: 'https://figma.com/proto/fintech-app-interactive',
          fileName: 'entrega-final-prototipo-fintech.pdf',
          fileSize: '12.3 MB',
          sha256Hash:
            '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          submittedAt: '2026-11-10T18:00:00.000Z',
        },
      },
    ],
    review: null,
  },
  {
    id: 'ctr_draft_101',
    projectId: 'proj_103',
    projectTitle: 'Arquitectura Cloud Microservicios con Kubernetes y Vault',
    projectCategory: 'DevOps & Cloud',
    proposalId: 'prop_205',
    freelancerId: 'free_01',
    freelancerName: 'Mateo Villalobos',
    freelancerRole: 'Arquitecto Cloud & Especialista en Seguridad Escrow',
    avatarInitials: 'MV',
    clientName: 'Sofía Ramírez • Estudio Nexus',
    totalAmount: 3500,
    currency: 'USD',
    status: 'DRAFT',
    createdAt: '2026-11-20T10:00:00.000Z',
    milestones: [
      {
        id: 'km_301',
        contractId: 'ctr_draft_101',
        order: 1,
        title: 'Clúster EKS y Pipeline CI/CD con Terraform',
        description: 'Infraestructura como código para despliegues automatizados y pruebas de estrés.',
        amount: 1500,
        deliveryDays: 10,
        dueDate: '2026-12-05',
        status: 'TODO',
      },
      {
        id: 'km_302',
        contractId: 'ctr_draft_101',
        order: 2,
        title: 'Gestión de Secretos con HashiCorp Vault y Cifrado TLS',
        description: 'Políticas de rotación de credenciales, tokens temporales y certificados SSL/TLS.',
        amount: 1200,
        deliveryDays: 8,
        dueDate: '2026-12-15',
        status: 'TODO',
      },
      {
        id: 'km_303',
        contractId: 'ctr_draft_101',
        order: 3,
        title: 'Monitoreo Prometheus/Grafana y Documentación Runbook',
        description: 'Tableros de observabilidad, alertas en tiempo real y manual de contingencia operativa.',
        amount: 800,
        deliveryDays: 6,
        dueDate: '2026-12-22',
        status: 'TODO',
      },
    ],
    review: null,
  },
];

function loadStoredReviews(): Record<string, BlindReviewRecord> {
  try {
    const raw = localStorage.getItem(BLIND_REVIEWS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

function saveStoredReviews(map: Record<string, BlindReviewRecord>): void {
  try {
    localStorage.setItem(BLIND_REVIEWS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function loadStoredKanbanContracts(): ActiveContractDetail[] {
  const reviewsMap = loadStoredReviews();
  try {
    const raw = localStorage.getItem(KANBAN_CONTRACTS_KEY);
    if (raw) {
      const parsed: ActiveContractDetail[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const missing = INITIAL_CONTRACTS.filter(
          (init) => !parsed.some((p) => p.id === init.id)
        );
        const combined = [...parsed, ...missing];
        return combined.map((c) => ({
          ...c,
          review: reviewsMap[c.id] || c.review || null,
        }));
      }
    }
  } catch {
    // fallback
  }

  const seeded = INITIAL_CONTRACTS.map((c) => ({
    ...c,
    review: reviewsMap[c.id] || null,
  }));
  try {
    localStorage.setItem(KANBAN_CONTRACTS_KEY, JSON.stringify(seeded));
  } catch {
    // ignore
  }
  return seeded;
}

function saveStoredKanbanContracts(contracts: ActiveContractDetail[]): void {
  try {
    localStorage.setItem(KANBAN_CONTRACTS_KEY, JSON.stringify(contracts));
  } catch {
    // ignore
  }
}

function generatePseudoHash(seed: string): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    const code = seed.charCodeAt(i % seed.length) + i * 17;
    result += chars[code % 16];
  }
  return result;
}

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
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/v1/contracts');
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      if (rows.length > 0) {
        return rows.map(mapBackendContractToFrontend);
      }
    } catch {
      // Fallback a contratos locales
    }
    return loadStoredKanbanContracts();
  },

  getContractById: async (contractId: string): Promise<ActiveContractDetail> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/v1/contracts/${contractId}`);
      if (response.data?.data) {
        return mapBackendContractToFrontend(response.data.data);
      }
    } catch {
      // Fallback
    }
    const contracts = loadStoredKanbanContracts();
    const found = contracts.find((c) => c.id === contractId);
    if (found) return found;
    return contracts[0];
  },

  fundContract: async (
    contractId: string,
    payload: {
      paymentMethod: string;
      cardLast4?: string;
      autoStart?: boolean;
    }
  ): Promise<{ contract: ActiveContractDetail; receipt: EscrowReceipt }> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/v1/contracts/${contractId}/fund`,
        {
          autoStart: payload.autoStart ?? true,
          paymentMethod: payload.paymentMethod,
          cardLast4: payload.cardLast4,
        }
      );
      if (response.data?.data) {
        const contract = mapBackendContractToFrontend(response.data.data);
        const fundedAt = (response.data.data?.fundedAt as string) || new Date().toISOString();
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
      }
    } catch {
      // Fallback local
    }

    const contracts = loadStoredKanbanContracts();
    const activeContract = contracts.find((c) => c.id === contractId) || contracts[0];
    const fundedAt = new Date().toISOString();
    const updatedContract: ActiveContractDetail = {
      ...activeContract,
      status: 'ACTIVE',
      fundedAt,
    };
    const updatedList = contracts.map((c) =>
      c.id === updatedContract.id ? updatedContract : c
    );
    saveStoredKanbanContracts(updatedList);

    const subtotal = activeContract.totalAmount;
    const receipt: EscrowReceipt = {
      id: `rec_${activeContract.id.slice(0, 8)}`,
      contractId: activeContract.id,
      transactionId: `escrow_${activeContract.id.slice(0, 8)}`,
      projectTitle: activeContract.projectTitle,
      freelancerName: activeContract.freelancerName,
      freelancerRole: activeContract.freelancerRole,
      clientName: activeContract.clientName,
      subtotal,
      serviceFee: 0,
      totalDeposited: subtotal,
      currency: activeContract.currency || 'USD',
      paymentMethod: payload.paymentMethod === 'card' ? 'Tarjeta Bancaria' : 'Billetera Digital',
      cardLast4: payload.cardLast4,
      sha256Seal: await sha256Hex(`${activeContract.id}:${subtotal}:${fundedAt}`),
      fundedAt,
    };

    return { contract: updatedContract, receipt };
  },

  updateMilestoneStatus: async (
    contractId: string,
    milestoneId: string,
    newStatus: KanbanMilestoneStatus,
    deliveryNotes?: string
  ): Promise<ActiveContractDetail[]> => {
    try {
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
      const response = await apiClient.get<ApiResponse<any[]>>('/v1/contracts');
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      if (rows.length > 0) {
        return rows.map(mapBackendContractToFrontend);
      }
    } catch {
      // Fallback local update
    }

    const contracts = loadStoredKanbanContracts().map((contract) => {
      if (contract.id !== contractId) return contract;

      const updatedMilestones: ContractMilestone[] = contract.milestones.map(
        (ms) => {
          if (ms.id !== milestoneId) return ms;

          const existingDelivery = ms.delivery || {
            id: `del_${ms.id}`,
            milestoneId: ms.id,
            notes:
              deliveryNotes ||
              `Hola, te comparto los avances terminados de "${ms.title}" para que puedas revisarlos cuando gustes.`,
            repoUrl: `https://github.com/freelancehub/proyecto-${contract.projectId}/tree/main/hito-${ms.order}`,
            demoUrl: `https://preview.freelancehub.app/${contract.id}/hito-${ms.order}`,
            fileName: `entregable-hito-${ms.order}.zip`,
            fileSize: '5.4 MB',
            sha256Hash: generatePseudoHash(`${ms.id}_${ms.title}`),
            submittedAt: new Date().toISOString(),
          };

          return {
            ...ms,
            status: newStatus,
            delivery:
              newStatus === 'IN_REVIEW' || newStatus === 'APPROVED'
                ? existingDelivery
                : ms.delivery,
            approvedAt:
              newStatus === 'APPROVED'
                ? new Date().toISOString()
                : undefined,
          };
        }
      );

      const allApproved =
        updatedMilestones.length > 0 &&
        updatedMilestones.every((m) => m.status === 'APPROVED');

      return {
        ...contract,
        status: allApproved ? ('COMPLETED' as const) : ('ACTIVE' as const),
        milestones: updatedMilestones,
      };
    });

    saveStoredKanbanContracts(contracts);
    return contracts;
  },

  submitBlindReview: async (
    payload: CreateReviewPayload,
    reviewerName: string,
    targetName: string
  ): Promise<BlindReviewRecord> => {
    try {
      await apiClient.post<ApiResponse<any>>('/v1/reviews', payload);
      const review = await contractApi.revealCounterpartReview(payload.contractId, targetName, reviewerName);
      if (review) return review;
    } catch {
      // Fallback local
    }

    const reviewsMap = loadStoredReviews();
    if (reviewsMap[payload.contractId]) {
      return reviewsMap[payload.contractId];
    }

    const newReview: BlindReviewRecord = {
      id: `rev_${Date.now().toString().slice(-6)}`,
      contractId: payload.contractId,
      reviewerName,
      targetName,
      rating: payload.rating,
      comment: payload.comment.trim(),
      isCounterpartSubmitted: false,
      createdAt: new Date().toISOString(),
    };

    reviewsMap[payload.contractId] = newReview;
    saveStoredReviews(reviewsMap);

    const contracts = loadStoredKanbanContracts().map((c) =>
      c.id === payload.contractId ? { ...c, review: newReview } : c
    );
    saveStoredKanbanContracts(contracts);

    return newReview;
  },

  revealCounterpartReview: async (
    contractId: string,
    targetName: string,
    reviewerName = 'Tú'
  ): Promise<BlindReviewRecord | null> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/v1/reviews/contract/${contractId}`);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      const mapped = mapReviews(contractId, rows, reviewerName, targetName);
      if (mapped) return mapped;
    } catch {
      // Fallback local
    }

    const reviewsMap = loadStoredReviews();
    const current = reviewsMap[contractId];
    if (!current) return null;

    const updated: BlindReviewRecord = {
      ...current,
      isCounterpartSubmitted: true,
      counterpartRating: 5,
      counterpartComment: `Fue un gusto colaborar en este proyecto. Las indicaciones fueron muy claras en cada etapa y la aprobación de los entregables fue muy ágil. ¡Muchas gracias por la confianza! — ${targetName}`,
    };

    reviewsMap[contractId] = updated;
    saveStoredReviews(reviewsMap);

    const contracts = loadStoredKanbanContracts().map((c) =>
      c.id === contractId ? { ...c, review: updated } : c
    );
    saveStoredKanbanContracts(contracts);

    return updated;
  },
};

