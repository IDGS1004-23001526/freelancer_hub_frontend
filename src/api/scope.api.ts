import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type { ActiveContractDetail } from '../interfaces/contract.interface.js';
import type {
  ApproveChangeRequestResponse,
  ContractChangeRequest,
  ContractVersionRecord,
  CreateChangeRequestPayload,
  CreateChangeRequestResponse,
} from '../interfaces/scope.interface.js';

const SCOPE_CHANGES_KEY = 'fh_scope_change_requests_v1';

function loadStoredChangeRequests(contractId: string): ContractChangeRequest[] {
  try {
    const raw = localStorage.getItem(SCOPE_CHANGES_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, ContractChangeRequest[]>;
    return Array.isArray(map[contractId]) ? map[contractId] : [];
  } catch {
    return [];
  }
}

function saveStoredChangeRequests(
  contractId: string,
  items: ContractChangeRequest[]
): void {
  try {
    const raw = localStorage.getItem(SCOPE_CHANGES_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, ContractChangeRequest[]>) : {};
    map[contractId] = items;
    localStorage.setItem(SCOPE_CHANGES_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export const scopeApi = {
  getContracts: async (): Promise<ActiveContractDetail[]> => {
    const response = await apiClient.get<ApiResponse<ActiveContractDetail[]>>(
      '/v1/contracts'
    );
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  getContractById: async (contractId: string): Promise<ActiveContractDetail | null> => {
    const response = await apiClient.get<ApiResponse<ActiveContractDetail>>(
      `/v1/contracts/${contractId}`
    );
    return response.data?.data ?? null;
  },

  getLocalChangeRequests: (contractId: string): ContractChangeRequest[] => {
    return loadStoredChangeRequests(contractId);
  },

  createChangeRequest: async (
    contractId: string,
    payload: CreateChangeRequestPayload
  ): Promise<CreateChangeRequestResponse> => {
    const response = await apiClient.post<ApiResponse<CreateChangeRequestResponse>>(
      `/v1/contracts/${contractId}/change-requests`,
      payload
    );
    const data = response.data.data;

    const current = loadStoredChangeRequests(contractId);
    const next = [
      data.changeRequest,
      ...current.filter((item) => item.id !== data.changeRequest.id),
    ];
    saveStoredChangeRequests(contractId, next);

    return data;
  },

  approveChangeRequest: async (
    contractId: string,
    changeRequestId: string
  ): Promise<ApproveChangeRequestResponse> => {
    const response = await apiClient.post<ApiResponse<ApproveChangeRequestResponse>>(
      `/v1/contracts/${contractId}/change-requests/${changeRequestId}/approve`,
      { confirmed: true }
    );
    const data = response.data.data;

    const current = loadStoredChangeRequests(contractId);
    const next = current.map((item) =>
      item.id === changeRequestId ? data.changeRequest : item
    );
    saveStoredChangeRequests(contractId, next);

    return data;
  },

  rejectChangeRequest: async (
    contractId: string,
    changeRequestId: string
  ): Promise<ContractChangeRequest> => {
    const response = await apiClient.post<ApiResponse<ContractChangeRequest>>(
      `/v1/contracts/${contractId}/change-requests/${changeRequestId}/reject`
    );
    const data = response.data.data;

    const current = loadStoredChangeRequests(contractId);
    const next = current.map((item) =>
      item.id === changeRequestId ? data : item
    );
    saveStoredChangeRequests(contractId, next);

    return data;
  },

  getVersions: async (contractId: string): Promise<ContractVersionRecord[]> => {
    const response = await apiClient.get<ApiResponse<ContractVersionRecord[]>>(
      `/v1/contracts/${contractId}/versions`
    );
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
};
