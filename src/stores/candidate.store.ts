import { create } from 'zustand';
import { candidateApi } from '../api/candidate.api.js';
import {
  calculateCandidateMcda,
  DEFAULT_MCDA_WEIGHTS,
  type McdaWeights,
} from '../utils/mcda.js';
import type {
  CandidateProposal,
  ContractRecord,
} from '../interfaces/candidate.interface.js';

export type ComparisonViewMode = 'cards' | 'table';
export type SortCriterion = 'score' | 'price' | 'timeline' | 'reputation';

interface CandidateComparisonState {
  proposals: CandidateProposal[];
  loading: boolean;
  acceptingId: string | null;
  viewMode: ComparisonViewMode;
  sortBy: SortCriterion;
  weights: McdaWeights;
  activeContract: ContractRecord | null;
  loadProposals: (
    projectId: string,
    projectMeta: {
      title?: string;
      category?: string;
      budget: number;
      currency: string;
      skills: string[];
    }
  ) => Promise<void>;
  setViewMode: (mode: ComparisonViewMode) => void;
  setSortBy: (criterion: SortCriterion) => void;
  applyPriorityPreset: (preset: 'balanced' | 'skills' | 'budget' | 'speed') => void;
  acceptProposal: (
    proposal: CandidateProposal,
    projectMeta: { budget: number; currency: string; skills: string[] }
  ) => Promise<ContractRecord>;
  updateProposalStatus: (
    proposalId: string,
    status: 'PENDING' | 'REJECTED'
  ) => Promise<void>;
}

export const useCandidateStore = create<CandidateComparisonState>((set, get) => ({
  proposals: [],
  loading: false,
  acceptingId: null,
  viewMode: 'cards',
  sortBy: 'score',
  weights: DEFAULT_MCDA_WEIGHTS,
  activeContract: null,

  loadProposals: async (projectId, projectMeta) => {
    set({ loading: true });
    const rawList = await candidateApi.getProposalsByProject(projectId, projectMeta);
    const currentWeights = get().weights;

    const scoredList = rawList.map((proposal) => ({
      ...proposal,
      mcda: calculateCandidateMcda(
        proposal,
        projectMeta.budget,
        projectMeta.skills,
        32,
        currentWeights
      ),
    }));

    set({
      proposals: scoredList,
      loading: false,
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setSortBy: (criterion) => set({ sortBy: criterion }),

  applyPriorityPreset: (preset) => {
    const presets: Record<
      'balanced' | 'skills' | 'budget' | 'speed',
      McdaWeights
    > = {
      balanced: { skills: 0.35, budget: 0.25, timeline: 0.2, reputation: 0.2 },
      skills: { skills: 0.55, budget: 0.15, timeline: 0.1, reputation: 0.2 },
      budget: { skills: 0.2, budget: 0.5, timeline: 0.15, reputation: 0.15 },
      speed: { skills: 0.2, budget: 0.15, timeline: 0.5, reputation: 0.15 },
    };

    const nextWeights = presets[preset] || DEFAULT_MCDA_WEIGHTS;
    set({ weights: nextWeights });
  },

  acceptProposal: async (proposal) => {
    set({ acceptingId: proposal.id });
    const contract = await candidateApi.acceptProposalAndCreateContract(
      {
        projectId: proposal.projectId,
        proposalId: proposal.id,
        freelancerId: proposal.freelancerId,
        totalAmount: proposal.totalPrice,
        currency: proposal.currency,
        estimatedDays: proposal.estimatedDays,
      },
      proposal.freelancerName
    );

    const updatedProposals = get().proposals.map((item) =>
      item.id === proposal.id ? { ...item, status: 'ACCEPTED' as const } : item
    );

    set({
      proposals: updatedProposals,
      acceptingId: null,
      activeContract: contract,
    });

    return contract;
  },

  updateProposalStatus: async (proposalId, status) => {
    await candidateApi.updateProposalStatus(proposalId, status);
    const updatedProposals = get().proposals.map((item) =>
      item.id === proposalId ? { ...item, status } : item
    );
    set({ proposals: updatedProposals });
  },
}));
