export type KanbanMilestoneStatus = 'TODO' | 'IN_REVIEW' | 'APPROVED';

export interface MilestoneDelivery {
  id: string;
  milestoneId: string;
  notes: string;
  repoUrl: string;
  demoUrl?: string;
  fileName: string;
  fileSize: string;
  sha256Hash: string;
  submittedAt: string;
}

export interface ContractMilestone {
  id: string;
  contractId: string;
  order: number;
  title: string;
  description: string;
  amount: number;
  deliveryDays: number;
  dueDate: string;
  status: KanbanMilestoneStatus;
  delivery?: MilestoneDelivery;
  approvedAt?: string;
}

export interface BlindReviewRecord {
  id: string;
  contractId: string;
  reviewerName: string;
  targetName: string;
  rating: number; // 1 to 5
  comment: string;
  isCounterpartSubmitted: boolean;
  counterpartRating?: number;
  counterpartComment?: string;
  createdAt: string;
}

export interface ActiveContractDetail {
  id: string;
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  projectDescription?: string;
  proposalId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerRole: string;
  freelancerAvatar?: string;
  avatarInitials: string;
  clientName: string;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'FUNDED' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
  fundedAt?: string;
  createdAt: string;
  milestones: ContractMilestone[];
  review?: BlindReviewRecord | null;
}

export interface EscrowReceipt {
  id: string;
  contractId: string;
  transactionId: string;
  projectTitle: string;
  freelancerName: string;
  freelancerRole?: string;
  clientName: string;
  subtotal: number;
  serviceFee: number;
  totalDeposited: number;
  currency: string;
  paymentMethod: string;
  cardLast4?: string;
  sha256Seal: string;
  fundedAt: string;
}

export interface CreateReviewPayload {
  contractId: string;
  freelancerId: string;
  rating: number;
  comment: string;
}
