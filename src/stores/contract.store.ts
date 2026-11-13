import { create } from 'zustand';
import { contractApi } from '../api/contract.api.js';
import type {
  ActiveContractDetail,
  BlindReviewRecord,
  CreateReviewPayload,
  KanbanMilestoneStatus,
} from '../interfaces/contract.interface.js';

interface ContractKanbanState {
  contracts: ActiveContractDetail[];
  selectedContractId: string;
  loading: boolean;
  updatingMilestoneId: string | null;
  submittingReview: boolean;
  loadContracts: (preferredContractId?: string) => Promise<void>;
  setSelectedContractId: (contractId: string) => void;
  moveMilestone: (
    contractId: string,
    milestoneId: string,
    newStatus: KanbanMilestoneStatus,
    deliveryNotes?: string
  ) => Promise<{ justCompletedContract: boolean }>;
  submitBlindReview: (
    payload: CreateReviewPayload,
    reviewerName: string,
    targetName: string
  ) => Promise<BlindReviewRecord>;
  revealCounterpartReview: (
    contractId: string,
    freelancerName: string
  ) => Promise<BlindReviewRecord | null>;
}

export const useContractStore = create<ContractKanbanState>((set, get) => ({
  contracts: [],
  selectedContractId: 'ctr_901',
  loading: false,
  updatingMilestoneId: null,
  submittingReview: false,

  loadContracts: async (preferredContractId) => {
    set({ loading: true });
    const list = await contractApi.getContracts();
    const currentId = preferredContractId || get().selectedContractId;
    const exists = list.some((c) => c.id === currentId);
    set({
      contracts: list,
      selectedContractId: exists ? currentId : list[0]?.id || 'ctr_901',
      loading: false,
    });
  },

  setSelectedContractId: (contractId) =>
    set({ selectedContractId: contractId }),

  moveMilestone: async (contractId, milestoneId, newStatus, deliveryNotes) => {
    const prevContract = get().contracts.find((c) => c.id === contractId);
    const wasCompletedBefore = prevContract?.status === 'COMPLETED';

    set({ updatingMilestoneId: milestoneId });
    const updatedList = await contractApi.updateMilestoneStatus(
      contractId,
      milestoneId,
      newStatus,
      deliveryNotes
    );
    const nextContract = updatedList.find((c) => c.id === contractId);
    const isNowCompleted = nextContract?.status === 'COMPLETED';

    set({
      contracts: updatedList,
      updatingMilestoneId: null,
    });

    return {
      justCompletedContract: !wasCompletedBefore && Boolean(isNowCompleted),
    };
  },

  submitBlindReview: async (payload, reviewerName, targetName) => {
    set({ submittingReview: true });
    const review = await contractApi.submitBlindReview(
      payload,
      reviewerName,
      targetName
    );
    const updatedContracts = get().contracts.map((c) =>
      c.id === payload.contractId ? { ...c, review } : c
    );
    set({
      contracts: updatedContracts,
      submittingReview: false,
    });
    return review;
  },

  revealCounterpartReview: async (contractId, freelancerName) => {
    const updatedReview = await contractApi.revealCounterpartReview(
      contractId,
      freelancerName
    );
    if (updatedReview) {
      const updatedContracts = get().contracts.map((c) =>
        c.id === contractId ? { ...c, review: updatedReview } : c
      );
      set({ contracts: updatedContracts });
    }
    return updatedReview;
  },
}));
