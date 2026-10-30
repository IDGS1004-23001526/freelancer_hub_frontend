import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  OnboardingProgress,
  UpdateProfessionalInfoPayload,
  PortfolioItemPayload,
  PortfolioItem,
  UpdateSkillsPayload,
  FreelancerProfileData,
} from '../interfaces/profile.interface.js';

export const profileApi = {
  // Swagger: GET /api/v1/users/me/profile (con fallback a /v1/profile/me)
  getMyProfile: async (): Promise<ApiResponse<FreelancerProfileData>> => {
    try {
      const response = await apiClient.get<ApiResponse<FreelancerProfileData>>(
        '/v1/users/me/profile'
      );
      return response.data;
    } catch {
      const fallback = await apiClient.get<ApiResponse<FreelancerProfileData>>(
        '/v1/profile/me'
      );
      return fallback.data;
    }
  },

  // Swagger: PUT /api/v1/users/me/profile (Actualiza o inicializa Upsert)
  updateProfile: async (
    payload: any
  ): Promise<ApiResponse<FreelancerProfileData>> => {
    try {
      const response = await apiClient.put<ApiResponse<FreelancerProfileData>>(
        '/v1/users/me/profile',
        payload
      );
      return response.data;
    } catch {
      const fallback = await apiClient.put<ApiResponse<FreelancerProfileData>>(
        '/v1/profile/professional-info',
        payload
      );
      return fallback.data;
    }
  },

  updateProfessionalInfo: async (
    payload: UpdateProfessionalInfoPayload | any
  ): Promise<ApiResponse<FreelancerProfileData>> => {
    return profileApi.updateProfile(payload);
  },

  // Swagger: POST /api/v1/users/me/avatar (Carga o actualiza la imagen de perfil)
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
        '/v1/users/me/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch {
      const fallback = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
        '/v1/profile/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return fallback.data;
    }
  },

  // Estado general de onboarding
  getOnboardingStatus: async (): Promise<ApiResponse<OnboardingProgress>> => {
    const response = await apiClient.get<ApiResponse<OnboardingProgress>>(
      '/v1/profile/onboarding-status'
    );
    if (response.data?.data && !response.data.data.steps) {
      const c = response.data.data.completedSteps || 0;
      response.data.data.steps = [
        { id: 'professional_info', isCompleted: c >= 1 } as any,
        { id: 'portfolio', isCompleted: c >= 2 } as any,
        { id: 'skills', isCompleted: c >= 3 } as any,
      ];
    }
    return response.data;
  },

  addPortfolioItem: async (
    payload: PortfolioItemPayload
  ): Promise<ApiResponse<PortfolioItem>> => {
    const response = await apiClient.post<ApiResponse<PortfolioItem>>(
      '/v1/profile/portfolio',
      payload
    );
    return response.data;
  },

  deletePortfolioItem: async (itemId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/v1/profile/portfolio/${itemId}`
    );
    return response.data;
  },

  // Catálogo de habilidades (tabla 'skills' en BD)
  getSkillsCatalog: async (): Promise<ApiResponse<{ id: string; name: string; slug: string; category: string }[]>> => {
    const response = await apiClient.get<ApiResponse<{ id: string; name: string; slug: string; category: string }[]>>(
      '/v1/skills'
    );
    return response.data;
  },

  // Habilidades del usuario autenticado (tabla 'profile_skills' en BD)
  getMySkills: async (): Promise<ApiResponse<{ name: string; id?: string }[]>> => {
    const response = await apiClient.get<ApiResponse<{ name: string; id?: string }[]>>(
      '/v1/users/me/skills'
    );
    return response.data;
  },

  // Agregar una habilidad individual al perfil del usuario
  addSkillToProfile: async (name: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/v1/users/me/skills',
      { name }
    );
    return response.data;
  },

  // Eliminar una habilidad del perfil
  removeSkillFromProfile: async (identifier: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/v1/users/me/skills/${encodeURIComponent(identifier)}`
    );
    return response.data;
  },

  updateSkills: async (
    payload: UpdateSkillsPayload
  ): Promise<ApiResponse<FreelancerProfileData>> => {
    try {
      const response = await apiClient.put<ApiResponse<FreelancerProfileData>>(
        '/v1/users/me/skills',
        payload
      );
      return response.data;
    } catch {
      const fallback = await apiClient.put<ApiResponse<FreelancerProfileData>>(
        '/v1/profile/skills',
        payload
      );
      return fallback.data;
    }
  },

  getProfileById: async (userId: string): Promise<ApiResponse<FreelancerProfileData>> => {
    const response = await apiClient.get<ApiResponse<FreelancerProfileData>>(
      `/v1/profile/${userId}`
    );
    return response.data;
  },
};
