/**
 * Interfaces y contratos TypeScript para Postulaciones y Propuestas Económicas (HU-03 / FREEL-45)
 */

export interface ProposalMilestoneInput {
  title: string;
  description?: string;
  amount: number;
  deliveryDays: number;
  order: number;
}

export interface CreateProposalPayload {
  projectId: string;
  coverLetter: string;
  totalPrice: number;
  estimatedDays: number;
  portfolioUrls?: string[];
  milestones: ProposalMilestoneInput[];
}

export interface ProposalMilestoneResponse {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  deliveryDays: number;
  order: number;
}

export interface ProposalResponse {
  id: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  totalPrice: number;
  estimatedDays: number;
  portfolioUrls?: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
  createdAt: string;
  milestones: ProposalMilestoneResponse[];
}

export interface SubmitProposalResult {
  success: boolean;
  data?: ProposalResponse;
  error?: string;
  alreadyApplied?: boolean;
  simulated?: boolean;
}
