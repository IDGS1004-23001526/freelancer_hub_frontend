import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  CandidateProposal,
  ContractRecord,
  CreateContractPayload,
} from '../interfaces/candidate.interface.js';

const PROPOSALS_STORAGE_KEY = 'fh_candidate_proposals_v2';
const CONTRACTS_STORAGE_KEY = 'fh_contracts_records_v2';

const INITIAL_PROPOSALS: CandidateProposal[] = [
  // ===========================================================================
  // Proyecto proj_101: Plataforma E-Commerce B2B con Pagos en Custodia (3 candidatos)
  // ===========================================================================
  {
    id: 'prop_201',
    projectId: 'proj_101',
    freelancerId: 'free_01',
    freelancerName: 'Mateo Villalobos',
    freelancerRole: 'Arquitecto Full-Stack & Especialista Fintech',
    freelancerLocation: 'Ciudad de México, MX',
    avatarInitials: 'MV',
    reputation: 4.9,
    reviewsCount: 38,
    completedProjects: 42,
    totalPrice: 4200,
    currency: 'USD',
    estimatedDays: 28,
    coverLetter:
      'Hola Sofía, he implementado tres pasarelas mayoristas con retención de fondos y conciliación bancaria automática. Propongo dividir el portal B2B en tres entregas claras para que puedas validar el flujo de pagos antes de pasar al panel de proveedores.',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    milestones: [
      {
        id: 'ms_201_1',
        proposalId: 'prop_201',
        title: 'Arquitectura base, PostgreSQL y motor de custodia',
        description: 'Esquema relacional, reglas de retención en garantía y API de órdenes.',
        amount: 1400,
        deliveryDays: 9,
        order: 1,
      },
      {
        id: 'ms_201_2',
        proposalId: 'prop_201',
        title: 'Catálogo mayorista B2B y carrito multi-proveedor',
        description: 'Interfaz en React + TypeScript con precios por volumen y cotizaciones.',
        amount: 1600,
        deliveryDays: 11,
        order: 2,
      },
      {
        id: 'ms_201_3',
        proposalId: 'prop_201',
        title: 'Panel de proveedores en tiempo real y puesta en marcha',
        description: 'Tablero de seguimiento de envíos, liberación de pagos y pruebas finales.',
        amount: 1200,
        deliveryDays: 8,
        order: 3,
      },
    ],
    portfolio: [
      {
        id: 'pf_01',
        title: 'Portal Mayorista AgroMarket',
        category: 'E-Commerce B2B',
        summary: 'Plataforma de compras por volumen con liberación de fondos contra entrega verificada.',
        url: 'https://github.com/mateovillalobos/agromarket-b2b',
        techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      },
      {
        id: 'pf_02',
        title: 'Pasarela de Liquidación Kobra',
        category: 'Fintech',
        summary: 'Módulo de dispersión automática de comisiones y billeteras para comercios.',
        url: 'https://github.com/mateovillalobos/kobra-escrow',
        techStack: ['Node.js', 'PostgreSQL', 'Tailwind CSS'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-11-02T10:20:00.000Z',
  },
  {
    id: 'prop_202',
    projectId: 'proj_101',
    freelancerId: 'free_02',
    freelancerName: 'Valeria Mondragón',
    freelancerRole: 'Ingeniera de Software Senior en E-Commerce',
    freelancerLocation: 'Guadalajara, MX',
    avatarInitials: 'VM',
    reputation: 4.8,
    reviewsCount: 27,
    completedProjects: 31,
    totalPrice: 3950,
    currency: 'USD',
    estimatedDays: 32,
    coverLetter:
      'Cuento con 6 años creando portales de comercio mayorista en React y Node.js. Me enfoco en que las órdenes de compra y el panel de proveedores sean rápidos, claros y fáciles de operar para tu equipo.',
    skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
    milestones: [
      {
        id: 'ms_202_1',
        proposalId: 'prop_202',
        title: 'Diseño de interfaz y flujo de órdenes de compra B2B',
        description: 'Vistas responsivas del portal mayorista y conexión con catálogo.',
        amount: 1350,
        deliveryDays: 10,
        order: 1,
      },
      {
        id: 'ms_202_2',
        proposalId: 'prop_202',
        title: 'API de pagos protegidos y gestión de estados',
        description: 'Servicios backend para retención y liberación de pagos por lote.',
        amount: 1500,
        deliveryDays: 12,
        order: 2,
      },
      {
        id: 'ms_202_3',
        proposalId: 'prop_202',
        title: 'Tablero administrativo de proveedores y entrega final',
        description: 'Reportes descargables, alertas por correo y despliegue.',
        amount: 1100,
        deliveryDays: 10,
        order: 3,
      },
    ],
    portfolio: [
      {
        id: 'pf_03',
        title: 'Distribuidora Textil del Bajío',
        category: 'Comercio Mayorista',
        summary: 'Catálogo B2B con pedidos recurrentes y generación automática de órdenes.',
        url: 'https://github.com/valeriamondragon/textil-b2b',
        techStack: ['React', 'TypeScript', 'Tailwind CSS'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-11-02T14:45:00.000Z',
  },
  {
    id: 'prop_203',
    projectId: 'proj_101',
    freelancerId: 'free_03',
    freelancerName: 'Diego Santamaría',
    freelancerRole: 'Especialista Backend & Bases de Datos Transaccionales',
    freelancerLocation: 'Monterrey, MX',
    avatarInitials: 'DS',
    reputation: 4.6,
    reviewsCount: 16,
    completedProjects: 19,
    totalPrice: 4480,
    currency: 'USD',
    estimatedDays: 24,
    coverLetter:
      'Puedo dedicarme de tiempo completo para tener la primera versión lista en poco más de tres semanas. Mi fuerte es la seguridad transaccional en PostgreSQL para el motor de custodia y órdenes.',
    skills: ['Node.js', 'PostgreSQL', 'TypeScript', 'React'],
    milestones: [
      {
        id: 'ms_203_1',
        proposalId: 'prop_203',
        title: 'Núcleo transaccional en PostgreSQL y API REST',
        description: 'Base de datos blindada, control de sesiones y endpoints de órdenes.',
        amount: 2200,
        deliveryDays: 12,
        order: 1,
      },
      {
        id: 'ms_203_2',
        proposalId: 'prop_203',
        title: 'Integración con frontend React y liberación a producción',
        description: 'Conexión de pantallas de cliente y proveedor con pruebas de carga.',
        amount: 2280,
        deliveryDays: 12,
        order: 2,
      },
    ],
    portfolio: [
      {
        id: 'pf_04',
        title: 'Motor Contable FinCore',
        category: 'Backend Financiero',
        summary: 'API de conciliación de saldos y auditoría de movimientos en tiempo real.',
        url: 'https://github.com/diegosantamaria/fincore-api',
        techStack: ['Node.js', 'PostgreSQL', 'TypeScript'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-11-03T09:10:00.000Z',
  },

  // ===========================================================================
  // Proyecto proj_102: Rediseño de Sistema de Diseño UI/UX para App Fintech (2 candidatos)
  // ===========================================================================
  {
    id: 'prop_204',
    projectId: 'proj_102',
    freelancerId: 'free_04',
    freelancerName: 'Camila Orozco',
    freelancerRole: 'Product Designer Senior & Especialista en Design Systems',
    freelancerLocation: 'Ciudad de México, MX',
    avatarInitials: 'CO',
    reputation: 5.0,
    reviewsCount: 34,
    completedProjects: 39,
    totalPrice: 2650,
    currency: 'USD',
    estimatedDays: 20,
    coverLetter:
      'He liderado el rediseño de dos aplicaciones bancarias en México. Te entregaré una librería en Figma con variables de color, flujos de onboarding, billetera digital y prototipos listos para pruebas de usabilidad.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping'],
    milestones: [
      {
        id: 'ms_204_1',
        proposalId: 'prop_204',
        title: 'Auditoría UX y arquitectura de onboarding y billetera',
        description: 'Mapeo de registro, billetera y transferencias internacionales.',
        amount: 850,
        deliveryDays: 6,
        order: 1,
      },
      {
        id: 'ms_204_2',
        proposalId: 'prop_204',
        title: 'Sistema de diseño tokenizado en Figma',
        description: 'Componentes accesibles, estados interactivos y guía de estilos.',
        amount: 1000,
        deliveryDays: 8,
        order: 2,
      },
      {
        id: 'ms_204_3',
        proposalId: 'prop_204',
        title: 'Prototipo navegable y pruebas con usuarios',
        description: 'Sesión de validación de usabilidad y entrega documentada para desarrollo.',
        amount: 800,
        deliveryDays: 6,
        order: 3,
      },
    ],
    portfolio: [
      {
        id: 'pf_05',
        title: 'Sistema de Diseño AlboPay',
        category: 'Banca Digital',
        summary: 'Librería multi-plataforma con más de 120 componentes documentados en Figma.',
        url: 'https://figma.com/@camilaorozco',
        techStack: ['Figma', 'Design Systems', 'Prototyping'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-10-30T11:30:00.000Z',
  },
  {
    id: 'prop_205',
    projectId: 'proj_102',
    freelancerId: 'free_05',
    freelancerName: 'Andrés Peñaloza',
    freelancerRole: 'Diseñador UI/UX & Especialista en Prototipado',
    freelancerLocation: 'Puebla, MX',
    avatarInitials: 'AP',
    reputation: 4.7,
    reviewsCount: 19,
    completedProjects: 23,
    totalPrice: 2400,
    currency: 'USD',
    estimatedDays: 25,
    coverLetter:
      'Diseño interfaces financieras claras y fáciles de entender para todo tipo de usuarios. Entrego especificaciones listas para que tu equipo de ingeniería las implemente sin fricciones.',
    skills: ['Figma', 'UI/UX Design', 'Prototyping'],
    milestones: [
      {
        id: 'ms_205_1',
        proposalId: 'prop_205',
        title: 'Rediseño de pantallas de bienvenida y billetera digital',
        description: 'Propuesta visual moderna con componentes reutilizables.',
        amount: 1200,
        deliveryDays: 12,
        order: 1,
      },
      {
        id: 'ms_205_2',
        proposalId: 'prop_205',
        title: 'Flujo de transferencias internacionales y kit UI',
        description: 'Prototipo interactivo en Figma y guía de entrega.',
        amount: 1200,
        deliveryDays: 13,
        order: 2,
      },
    ],
    portfolio: [
      {
        id: 'pf_06',
        title: 'App de Ahorro Nido',
        category: 'Fintech Móvil',
        summary: 'Interfaz intuitiva para metas de ahorro y transferencias rápidas.',
        url: 'https://figma.com/@andrespenaloza',
        techStack: ['Figma', 'UI/UX Design', 'Prototyping'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-10-31T16:00:00.000Z',
  },

  // ===========================================================================
  // Proyecto proj_103: Arquitectura Microservicios & Pipeline CI/CD en AWS (4 candidatos)
  // ===========================================================================
  {
    id: 'prop_206',
    projectId: 'proj_103',
    freelancerId: 'free_06',
    freelancerName: 'Rodrigo Altamirano',
    freelancerRole: 'Arquitecto Cloud AWS & Especialista Kubernetes',
    freelancerLocation: 'Monterrey, MX',
    avatarInitials: 'RA',
    reputation: 5.0,
    reviewsCount: 41,
    completedProjects: 45,
    totalPrice: 3450,
    currency: 'USD',
    estimatedDays: 22,
    coverLetter:
      'Certificado en AWS Solutions Architect y CKA. Automatizaré tu infraestructura multi-región con Terraform, despliegues sin caída en Kubernetes con GitHub Actions y tableros listos en Prometheus y Grafana.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    milestones: [
      {
        id: 'ms_206_1',
        proposalId: 'prop_206',
        title: 'Infraestructura como código con Terraform en AWS',
        description: 'Redes VPC multi-región, clúster EKS y políticas de seguridad.',
        amount: 1250,
        deliveryDays: 8,
        order: 1,
      },
      {
        id: 'ms_206_2',
        proposalId: 'prop_206',
        title: 'Pipelines CI/CD con GitHub Actions y contenedores Docker',
        description: 'Despliegue automatizado con pruebas, análisis y rollback.',
        amount: 1200,
        deliveryDays: 8,
        order: 2,
      },
      {
        id: 'ms_206_3',
        proposalId: 'prop_206',
        title: 'Observabilidad Prometheus/Grafana y optimización de costos',
        description: 'Alertas en vivo, auto-escalado y reducción de gasto en contenedores.',
        amount: 1000,
        deliveryDays: 6,
        order: 3,
      },
    ],
    portfolio: [
      {
        id: 'pf_07',
        title: 'Migración EKS Multi-Región PayCloud',
        category: 'DevOps & Cloud',
        summary: 'Reducción del 38% en facturación AWS y despliegues en menos de 4 minutos.',
        url: 'https://github.com/rodrigoaltamirano/aws-eks-terraform',
        techStack: ['AWS', 'Kubernetes', 'Terraform', 'GitHub Actions'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-10-21T10:00:00.000Z',
  },
  {
    id: 'prop_207',
    projectId: 'proj_103',
    freelancerId: 'free_07',
    freelancerName: 'Fernanda Luján',
    freelancerRole: 'Ingeniera DevOps & Site Reliability Engineer (SRE)',
    freelancerLocation: 'Ciudad de México, MX',
    avatarInitials: 'FL',
    reputation: 4.9,
    reviewsCount: 29,
    completedProjects: 33,
    totalPrice: 3300,
    currency: 'USD',
    estimatedDays: 25,
    coverLetter:
      'Me especializo en estabilidad de microservicios y monitoreo proactivo. Dejaré tus pipelines en GitHub Actions completamente documentados y tus métricas clave visibles en Grafana.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions'],
    milestones: [
      {
        id: 'ms_207_1',
        proposalId: 'prop_207',
        title: 'Contenerización Docker y orquestación en Kubernetes',
        description: 'Configuración de clústeres, balanceadores y secretos seguros.',
        amount: 1650,
        deliveryDays: 12,
        order: 1,
      },
      {
        id: 'ms_207_2',
        proposalId: 'prop_207',
        title: 'Flujos CI/CD y monitoreo con Prometheus/Grafana',
        description: 'Automatización de releases y paneles de salud del sistema.',
        amount: 1650,
        deliveryDays: 13,
        order: 2,
      },
    ],
    portfolio: [
      {
        id: 'pf_08',
        title: 'Stack de Observabilidad CloudWatch + Grafana',
        category: 'SRE & Monitoreo',
        summary: 'Monitoreo unificado para 25 microservicios de alto tráfico.',
        url: 'https://github.com/fernandalujan/k8s-observability',
        techStack: ['Docker', 'Kubernetes', 'AWS'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-10-22T12:15:00.000Z',
  },
  {
    id: 'prop_208',
    projectId: 'proj_103',
    freelancerId: 'free_08',
    freelancerName: 'Héctor Ibáñez',
    freelancerRole: 'Consultor Cloud & Automatización CI/CD',
    freelancerLocation: 'Querétaro, MX',
    avatarInitials: 'HI',
    reputation: 4.7,
    reviewsCount: 18,
    completedProjects: 21,
    totalPrice: 3100,
    currency: 'USD',
    estimatedDays: 27,
    coverLetter:
      'He ayudado a varias startups a migrar sus servidores tradicionales hacia contenedores en AWS con Terraform y Docker, cuidando siempre que el costo mensual de nube se mantenga bajo control.',
    skills: ['AWS', 'Docker', 'Terraform', 'GitHub Actions'],
    milestones: [
      {
        id: 'ms_208_1',
        proposalId: 'prop_208',
        title: 'Módulos de Terraform y entorno productivo en AWS',
        description: 'Aprovisionamiento automatizado y seguro de servidores y redes.',
        amount: 1550,
        deliveryDays: 14,
        order: 1,
      },
      {
        id: 'ms_208_2',
        proposalId: 'prop_208',
        title: 'Pipeline de entrega continua y ajuste de recursos',
        description: 'Despliegue desde GitHub Actions y reporte de ahorro en nube.',
        amount: 1550,
        deliveryDays: 13,
        order: 2,
      },
    ],
    portfolio: [
      {
        id: 'pf_09',
        title: 'Plantillas Terraform Multi-Ambiente',
        category: 'Infraestructura Cloud',
        summary: 'Arquitectura reproducible para entornos dev, staging y producción.',
        url: 'https://github.com/hectoribanez/terraform-aws-modules',
        techStack: ['AWS', 'Terraform', 'Docker'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-10-22T17:40:00.000Z',
  },
  {
    id: 'prop_209',
    projectId: 'proj_103',
    freelancerId: 'free_09',
    freelancerName: 'Natalia Cárdenas',
    freelancerRole: 'Especialista en Plataformas Kubernetes & Seguridad DevSecOps',
    freelancerLocation: 'Guadalajara, MX',
    avatarInitials: 'NC',
    reputation: 4.8,
    reviewsCount: 24,
    completedProjects: 28,
    totalPrice: 3580,
    currency: 'USD',
    estimatedDays: 20,
    coverLetter:
      'Además de configurar el despliegue en AWS y Kubernetes, integro escaneo de seguridad en cada entrega de GitHub Actions para que ningún cambio vulnerable llegue a producción.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    milestones: [
      {
        id: 'ms_209_1',
        proposalId: 'prop_209',
        title: 'Clúster Kubernetes en AWS con Terraform',
        description: 'Infraestructura multi-zona con políticas de red y cifrado.',
        amount: 1800,
        deliveryDays: 10,
        order: 1,
      },
      {
        id: 'ms_209_2',
        proposalId: 'prop_209',
        title: 'Pipeline DevSecOps y tableros en Grafana',
        description: 'Integración continua, métricas de contenedores y entrega final.',
        amount: 1780,
        deliveryDays: 10,
        order: 2,
      },
    ],
    portfolio: [
      {
        id: 'pf_10',
        title: 'Pipeline DevSecOps para Banca Regional',
        category: 'DevSecOps',
        summary: 'Automatización de despliegues con auditoría continua en contenedores.',
        url: 'https://github.com/nataliacardenas/devsecops-k8s',
        techStack: ['Kubernetes', 'GitHub Actions', 'AWS', 'Terraform'],
      },
    ],
    status: 'PENDING',
    createdAt: '2026-10-23T09:15:00.000Z',
  },
];

export function loadStoredProposals(): CandidateProposal[] {
  try {
    const raw = localStorage.getItem(PROPOSALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(INITIAL_PROPOSALS));
  return [...INITIAL_PROPOSALS];
}

function saveStoredProposals(list: CandidateProposal[]): void {
  localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(list));
}

/**
 * Genera candidatos coherentes con el proyecto recién creado (título, categoría, presupuesto y habilidades)
 */
function buildFallbackProposalsForProject(
  projectId: string,
  budget: number = 3500,
  currency: string = 'MXN',
  skills: string[] = ['React', 'Node.js', 'PostgreSQL'],
  projectTitle: string = 'tu convocatoria',
  projectCategory: string = 'Desarrollo Web'
): CandidateProposal[] {
  const safeBudget = budget > 0 ? budget : 3500;
  const baseSkills =
    skills.length > 0 ? skills : ['React', 'Node.js', 'PostgreSQL'];

  return [
    {
      id: `prop_${projectId}_1`,
      projectId,
      freelancerId: 'free_10',
      freelancerName: 'Elena Castellanos',
      freelancerRole: `Especialista Senior en ${projectCategory}`,
      freelancerLocation: 'Ciudad de México, MX',
      avatarInitials: 'EC',
      reputation: 4.9,
      reviewsCount: 31,
      completedProjects: 36,
      totalPrice: Math.round(safeBudget * 0.92),
      currency,
      estimatedDays: 21,
      coverLetter: `Revisé a detalle tu convocatoria "${projectTitle}". Cuento con experiencia comprobada en ${baseSkills.join(', ')} y propongo dividir el trabajo en tres entregas claras para que veas avances reales desde la primera semana.`,
      skills: [...baseSkills],
      milestones: [
        {
          id: `ms_${projectId}_1a`,
          proposalId: `prop_${projectId}_1`,
          title: 'Planeación técnica y estructura base del proyecto',
          description: `Configuración inicial con ${baseSkills.slice(0, 2).join(' y ')} y primeros flujos.`,
          amount: Math.round(safeBudget * 0.35),
          deliveryDays: 7,
          order: 1,
        },
        {
          id: `ms_${projectId}_1b`,
          proposalId: `prop_${projectId}_1`,
          title: 'Desarrollo de módulos principales e integración',
          description: 'Implementación completa de las funciones solicitadas en la convocatoria.',
          amount: Math.round(safeBudget * 0.37),
          deliveryDays: 8,
          order: 2,
        },
        {
          id: `ms_${projectId}_1c`,
          proposalId: `prop_${projectId}_1`,
          title: 'Pruebas finales, ajustes y entrega documentada',
          description: 'Validación conjunta y puesta en marcha lista para tus usuarios.',
          amount: Math.round(safeBudget * 0.2),
          deliveryDays: 6,
          order: 3,
        },
      ],
      portfolio: [
        {
          id: `pf_${projectId}_1`,
          title: `Plataforma Digital (${projectCategory})`,
          category: projectCategory,
          summary: `Proyecto en producción desarrollado con ${baseSkills.join(', ')}.`,
          url: 'https://github.com/elenacastellanos/portfolio',
          techStack: baseSkills.slice(0, 4),
        },
      ],
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
    {
      id: `prop_${projectId}_2`,
      projectId,
      freelancerId: 'free_11',
      freelancerName: 'Sebastián Ríos',
      freelancerRole: `Consultor Independiente en ${projectCategory}`,
      freelancerLocation: 'Querétaro, MX',
      avatarInitials: 'SR',
      reputation: 4.7,
      reviewsCount: 22,
      completedProjects: 25,
      totalPrice: Math.round(safeBudget * 0.85),
      currency,
      estimatedDays: 26,
      coverLetter: `Me interesa mucho colaborar en "${projectTitle}". Ofrezco una propuesta ajustada a tu presupuesto en ${currency}, trabajando con ${baseSkills.slice(0, 3).join(', ')} y entregas quincenales.`,
      skills: baseSkills.slice(0, Math.max(2, baseSkills.length - 1)),
      milestones: [
        {
          id: `ms_${projectId}_2a`,
          proposalId: `prop_${projectId}_2`,
          title: 'Primera entrega: base funcional y vistas clave',
          description: 'Avance del 50% con demostración en entorno de pruebas.',
          amount: Math.round(safeBudget * 0.45),
          deliveryDays: 13,
          order: 1,
        },
        {
          id: `ms_${projectId}_2b`,
          proposalId: `prop_${projectId}_2`,
          title: 'Segunda entrega: cierre de funciones y despliegue',
          description: 'Entrega completa revisada y lista para operar.',
          amount: Math.round(safeBudget * 0.4),
          deliveryDays: 13,
          order: 2,
        },
      ],
      portfolio: [
        {
          id: `pf_${projectId}_2`,
          title: 'Sistema Operativo Lumina',
          category: projectCategory,
          summary: 'Solución optimizada para alto rendimiento y facilidad de uso.',
          url: 'https://github.com/sebastianrios/lumina',
          techStack: baseSkills.slice(0, 3),
        },
      ],
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Devuelve la lista de postulaciones de un proyecto garantizando que exista
 * y que su conteo coincida siempre con el mostrado en las tarjetas del proyecto.
 */
export function ensureProjectProposals(
  projectId: string,
  projectMeta?: {
    title?: string;
    category?: string;
    budget?: number;
    currency?: string;
    skills?: string[];
  }
): CandidateProposal[] {
  const all = loadStoredProposals();
  const filtered = all.filter((p) => p.projectId === projectId);
  if (filtered.length > 0) {
    return filtered;
  }

  const generated = buildFallbackProposalsForProject(
    projectId,
    projectMeta?.budget,
    projectMeta?.currency,
    projectMeta?.skills,
    projectMeta?.title,
    projectMeta?.category
  );
  const updated = [...all, ...generated];
  saveStoredProposals(updated);
  return generated;
}

export function getProjectProposalsCount(
  projectId: string,
  projectMeta?: {
    title?: string;
    category?: string;
    budget?: number;
    currency?: string;
    skills?: string[];
  }
): number {
  return ensureProjectProposals(projectId, projectMeta).length;
}

export const candidateApi = {
  getProposalsByProject: async (
    projectId: string,
    projectMeta?: {
      title?: string;
      category?: string;
      budget?: number;
      currency?: string;
      skills?: string[];
    }
  ): Promise<CandidateProposal[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CandidateProposal[]>>(
        `/v1/projects/${projectId}/proposals`
      );
      if (Array.isArray(response.data?.data) && response.data.data.length > 0) {
        return response.data.data;
      }
      throw new Error('Local fallback');
    } catch {
      return ensureProjectProposals(projectId, projectMeta);
    }
  },

  acceptProposalAndCreateContract: async (
    payload: CreateContractPayload,
    freelancerName: string
  ): Promise<ContractRecord> => {
    try {
      const response = await apiClient.post<ApiResponse<ContractRecord>>(
        '/v1/contracts',
        payload
      );
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error('Local fallback');
    } catch {
      const allProposals = loadStoredProposals().map((item) => {
        if (item.projectId !== payload.projectId) return item;
        if (item.id === payload.proposalId) {
          return { ...item, status: 'ACCEPTED' as const };
        }
        return item;
      });
      saveStoredProposals(allProposals);

      const newContract: ContractRecord = {
        id: `ctr_${Date.now().toString().slice(-6)}`,
        projectId: payload.projectId,
        proposalId: payload.proposalId,
        freelancerId: payload.freelancerId,
        freelancerName,
        totalAmount: payload.totalAmount,
        currency: payload.currency,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      };

      try {
        const existingRaw = localStorage.getItem(CONTRACTS_STORAGE_KEY);
        const existing: ContractRecord[] = existingRaw
          ? JSON.parse(existingRaw)
          : [];
        localStorage.setItem(
          CONTRACTS_STORAGE_KEY,
          JSON.stringify([newContract, ...existing])
        );
      } catch {
        // Ignore storage error
      }

      return newContract;
    }
  },

  updateProposalStatus: async (
    proposalId: string,
    status: 'PENDING' | 'REJECTED'
  ): Promise<CandidateProposal | null> => {
    try {
      const response = await apiClient.patch<ApiResponse<CandidateProposal>>(
        `/v1/proposals/${proposalId}/status`,
        { status }
      );
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error('Local fallback');
    } catch {
      let updatedProposal: CandidateProposal | null = null;
      const allProposals = loadStoredProposals().map((item) => {
        if (item.id === proposalId) {
          updatedProposal = { ...item, status };
          return updatedProposal;
        }
        return item;
      });
      saveStoredProposals(allProposals);
      return updatedProposal;
    }
  },
};
