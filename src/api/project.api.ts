import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  ProjectConvocatoria,
  CreateProjectPayload,
} from '../interfaces/project.interface.js';

export const projectApi = {
  getProjects: async (): Promise<ApiResponse<ProjectConvocatoria[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectConvocatoria[]>>(
      '/v1/projects'
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
