import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  ProjectConvocatoria,
  CreateProjectPayload,
  ProjectFilterParams,
} from '../interfaces/project.interface.js';

export const projectApi = {
  getProjects: async (
    params?: ProjectFilterParams
  ): Promise<ApiResponse<ProjectConvocatoria[]>> => {
    const queryParams: Record<string, any> = {};
    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params?.category && params.category !== 'TODAS') {
      queryParams.category = params.category.trim();
    }
    if (params?.minBudget !== undefined) {
      queryParams.minBudget = params.minBudget;
    }
    if (params?.maxBudget !== undefined) {
      queryParams.maxBudget = params.maxBudget;
    }
    if (params?.skills && params.skills.length > 0) {
      queryParams.skills = params.skills;
    }
    if (params?.page) {
      queryParams.page = params.page;
    }
    if (params?.limit) {
      queryParams.limit = params.limit;
    }

    const response = await apiClient.get<ApiResponse<ProjectConvocatoria[]>>(
      '/v1/projects',
      { params: queryParams }
    );
    return response.data;
  },

  getProjectById: async (id: string): Promise<ApiResponse<ProjectConvocatoria>> => {
    const response = await apiClient.get<ApiResponse<ProjectConvocatoria>>(
      `/v1/projects/${id}`
    );
    return response.data;
  },

  createProject: async (
    payload: CreateProjectPayload
  ): Promise<ApiResponse<ProjectConvocatoria>> => {
    const response = await apiClient.post<ApiResponse<ProjectConvocatoria>>(
      '/v1/projects',
      payload
    );
    return response.data;
  },
};
