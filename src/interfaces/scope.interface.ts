export type ChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ScopeDeliverableInput {
  title: string;
  description?: string;
  estimatedDays?: number;
}

export interface ScopeCalculatedDeliverable {
  title: string;
  description?: string;
  deliveryDays: number;
  amount: number;
}

export interface IronTriangleCalculation {
  dailyRateApplied: number;
  suggestedAddedDays: number;
  suggestedAddedCost: number;
  newTotalDays: number;
  newTotalAmount: number;
  deliverablesBreakdown: ScopeCalculatedDeliverable[];
}

export interface ContractChangeRequest {
  id: string;
  contractId: string;
  requestedById: string;
  title: string;
  description: string;
  baseAmountSnapshot: number;
  baseDaysSnapshot: number;
  addedDeliverables: ScopeCalculatedDeliverable[];
  complexityFactor: number;
  suggestedAddedDays: number;
  suggestedAddedCost: number;
  dailyRateApplied: number;
  clientApproved: boolean;
  clientSignedAt?: string | null;
  clientSignature?: string | null;
  freelancerApproved: boolean;
  freelancerSignedAt?: string | null;
  freelancerSignature?: string | null;
  status: ChangeRequestStatus;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface CreateChangeRequestPayload {
  title: string;
  description: string;
  complexityFactor?: number;
  addedDeliverables: ScopeDeliverableInput[];
}

export interface CreateChangeRequestResponse {
  changeRequest: ContractChangeRequest;
  ironTriangleCalculation: IronTriangleCalculation;
}

export interface ApproveChangeRequestResponse {
  status: ChangeRequestStatus;
  awaitingCounterpartySignature: boolean;
  changeRequest: ContractChangeRequest;
  newVersionNumber: number | null;
}

export interface ContractVersionRecord {
  id: string;
  contractId: string;
  versionNumber: number;
  changeRequestId?: string | null;
  createdById: string;
  reason: string;
  totalAmount: number;
  totalDays: number;
  snapshot: {
    contractId: string;
    status: string;
    totalAmount: number;
    totalDays: number;
    addedCost?: number;
    addedDays?: number;
    clientSignature?: string | null;
    freelancerSignature?: string | null;
    milestones: {
      id: string;
      title: string;
      amount: number;
      deliveryDays: number;
      order: number;
      status: string;
    }[];
  };
  createdAt: string;
}
