/**
 * Interfaces y contratos TypeScript para Convocatorias / Proyectos (FLH-FE-01)
 */

export type ProjectStatus = 'ABIERTO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO';

export type ProjectCategory =
  | 'Desarrollo Web'
  | 'Desarrollo Móvil'
  | 'Diseño UI/UX'
  | 'Ciencia de Datos & IA'
  | 'DevOps & Cloud'
  | 'Ciberseguridad'
  | 'Blockchain & Web3'
  | 'Marketing Digital';

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Desarrollo Web',
  'Desarrollo Móvil',
  'Diseño UI/UX',
  'Ciencia de Datos & IA',
  'DevOps & Cloud',
  'Ciberseguridad',
  'Blockchain & Web3',
  'Marketing Digital',
];

export const SUGGESTED_SKILLS: string[] = [
  'React',
  'Node',
  'PostgreSQL',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Next.js',
  'Figma',
  'UI/UX Design',
  'Python',
  'AWS',
  'Docker',
  'GraphQL',
  'MongoDB',
  'Flutter',
  'Git',
];

export interface ProjectConvocatoria {
  id: string;
  title: string;
  category: ProjectCategory | string;
  budget: number;
  currency: 'USD' | 'MXN';
  skills: string[];
  estimatedDate: string; // YYYY-MM-DD
  description: string;
  status: ProjectStatus;
  clientName: string;
  clientAvatar?: string;
  proposalsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  title: string;
  category: ProjectCategory | string;
  budget: number;
  currency?: 'USD' | 'MXN';
  skills: string[];
  estimatedDate: string;
  description?: string;
}

export interface ClientWalletInfo {
  balance: number;
  escrowLocked: number;
  currency: 'USD' | 'MXN';
  cardBrand: string;
  cardLast4: string;
}
