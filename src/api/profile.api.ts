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
  getOnboardingStatus: async (): Promise<ApiResponse<OnboardingProgress>> => {
    const response = await apiClient.get<ApiResponse<OnboardingProgress>>(
      '/v1/profile/onboarding-status'
    );
    return response.data;
  },

  getMyProfile: async (): Promise<ApiResponse<FreelancerProfileData>> => {
    const response = await apiClient.get<ApiResponse<FreelancerProfileData>>(
      '/v1/profile/me'
    );
    return response.data;
  },

  updateProfessionalInfo: async (
    payload: UpdateProfessionalInfoPayload
  ): Promise<ApiResponse<FreelancerProfileData>> => {
    const response = await apiClient.put<ApiResponse<FreelancerProfileData>>(
      '/v1/profile/professional-info',
      payload
    );
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

  updateSkills: async (
    payload: UpdateSkillsPayload
  ): Promise<ApiResponse<FreelancerProfileData>> => {
    const response = await apiClient.put<ApiResponse<FreelancerProfileData>>(
      '/v1/profile/skills',
      payload
    );
    return response.data;
  },
};
