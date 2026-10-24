// usamos el export para mandar los datos de profesional info
export interface UpdateProfessionalInfoPayload {
  professionalTitle: string;
  bio: string;
  hourlyRate: number;
}

// usamos el export para mandar los datos de portfolio
export interface PortfolioItemPayload {
  title: string;
  description: string;
  projectUrl: string;
  imageUrl?: string | null;
}

// Este es interfaz de portfolio, los mismo son para 
export interface PortfolioItem extends PortfolioItemPayload {
  id: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}


// usamos el export para mandar los datos de skills
export interface UpdateSkillsPayload {
  skills: string[];
}

// este es un estado de onboarding que es un registro de los pasos dados por el usuario
export interface OnboardingStepStatus {
  // stepNumber es el numero del paso
  stepNumber: number;
  // id es el identificador del paso
  id: 'professional_info' | 'portfolio' | 'skills';
  title: string;
  description: string;
  isCompleted: boolean;
  data?: {
    professionalTitle?: string | null;
    bio?: string | null;
    hourlyRate?: number | null;
    totalItems?: number;
    skills?: string[];
  };
}
// onboardingProgress es un registro de los pasos dados por el usuario
export interface OnboardingProgress {
  // totalSteps es el total de pasos
  totalSteps: number;
  // numero de pasos
  completedSteps: number;
  // porcentaje de pasos ya hechos
  percentage: number;
  // si ya esta todo ok
  isFullyCompleted: boolean;
  // array de pasos completados
  steps: OnboardingStepStatus[];
}
// este es un registro de los datos del perfil de freelancer
export interface FreelancerProfileData {
  // id es el identificador del perfil
  id: string;
  // userId es el identificador del usuario
  userId: string;
  // professionalTitle es el titulo profesional
  professionalTitle: string | null;
  // bio es la descripcion del perfil
  bio: string | null;
  hourlyRate: number | null;
  skills: string[];
  portfolioItems: PortfolioItem[];
  createdAt: string;
  updatedAt: string;
}
