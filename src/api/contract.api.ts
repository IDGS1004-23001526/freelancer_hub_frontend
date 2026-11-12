import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  ActiveContractDetail,
  BlindReviewRecord,
  ContractMilestone,
  CreateReviewPayload,
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
          fileName: 'guia-sistema-diseno-v2.zip',
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
          fileName: 'entrega-final-prototipo-fintech.zip',
          fileSize: '12.3 MB',
          sha256Hash:
            '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          submittedAt: '2026-11-10T18:00:00.000Z',
        },
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
  localStorage.setItem(BLIND_REVIEWS_KEY, JSON.stringify(map));
}

export function loadStoredKanbanContracts(): ActiveContractDetail[] {
  const reviewsMap = loadStoredReviews();
  try {
    const raw = localStorage.getItem(KANBAN_CONTRACTS_KEY);
    if (raw) {
      const parsed: ActiveContractDetail[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c) => ({
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
  localStorage.setItem(KANBAN_CONTRACTS_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveStoredKanbanContracts(contracts: ActiveContractDetail[]): void {
  localStorage.setItem(KANBAN_CONTRACTS_KEY, JSON.stringify(contracts));
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

export const contractApi = {
  getContracts: async (): Promise<ActiveContractDetail[]> => {
    try {
      const response =
        await apiClient.get<ApiResponse<ActiveContractDetail[]>>(
          '/v1/contracts'
        );
      if (Array.isArray(response.data?.data) && response.data.data.length > 0) {
        return response.data.data;
      }
      throw new Error('Local fallback');
    } catch {
      return loadStoredKanbanContracts();
    }
  },

  updateMilestoneStatus: async (
    contractId: string,
    milestoneId: string,
    newStatus: KanbanMilestoneStatus,
    deliveryNotes?: string
  ): Promise<ActiveContractDetail[]> => {
    try {
      if (newStatus === 'APPROVED') {
        await apiClient.post(`/v1/milestones/${milestoneId}/approve`, {
          contractId,
        });
      } else if (newStatus === 'IN_REVIEW') {
        await apiClient.post(`/v1/milestones/${milestoneId}/deliveries`, {
          contractId,
          notes:
            deliveryNotes ||
            'Avance enviado para revisión y validación del cliente.',
        });
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
      const response = await apiClient.post<ApiResponse<BlindReviewRecord>>(
        '/v1/reviews',
        payload
      );
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error('Local fallback');
    } catch {
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
    }
  },

  revealCounterpartReview: async (
    contractId: string,
    freelancerName: string
  ): Promise<BlindReviewRecord | null> => {
    const reviewsMap = loadStoredReviews();
    const current = reviewsMap[contractId];
    if (!current) return null;

    const updated: BlindReviewRecord = {
      ...current,
      isCounterpartSubmitted: true,
      counterpartRating: 5,
      counterpartComment: `Fue un gusto colaborar en este proyecto. Las indicaciones fueron muy claras en cada etapa y la aprobación de los entregables fue muy ágil. ¡Muchas gracias por la confianza! — ${freelancerName}`,
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
