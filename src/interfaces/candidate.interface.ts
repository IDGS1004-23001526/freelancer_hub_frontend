export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface MilestoneQuote {
  id: string;
  proposalId: string;
  title: string;
  description: string;
  amount: number;
  deliveryDays: number;
  order: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  url: string;
  techStack: string[];
}

export interface McdaBreakdown {
  totalScore: number; // 0 to 100
  skillsScore: number; // 0 to 100
  budgetScore: number; // 0 to 100
  timelineScore: number; // 0 to 100
  reputationScore: number; // 0 to 100
  matchedSkills: string[];
  missingSkills: string[];
}

export interface CandidateProposal {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerRole: string;
  freelancerLocation: string;
  avatarInitials: string;
  reputation: number; // 1.0 to 5.0
  reviewsCount: number;
  completedProjects: number;
  totalPrice: number;
  currency: string;
  estimatedDays: number;
  coverLetter: string;
  skills: string[];
  milestones: MilestoneQuote[];
  portfolio: PortfolioItem[];
  status: ProposalStatus;
  createdAt: string;
  mcda?: McdaBreakdown;
}

export interface CreateContractPayload {
  projectId: string;
  proposalId: string;
  freelancerId: string;
  totalAmount: number;
  currency: string;
  estimatedDays: number;
}

export interface ContractRecord {
  id: string;
  projectId: string;
  proposalId: string;
  freelancerId: string;
  freelancerName: string;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'FUNDED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED';
  createdAt: string;
}
