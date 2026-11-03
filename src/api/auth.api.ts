import { apiClient } from './client.js';
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  UserProfile,
} from '../interfaces/auth.interface.js';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/login', credentials);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/register', payload);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/refresh-token', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/v1/auth/logout', { refreshToken });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/v1/auth/me');
    return response.data;
  },

  googleAuth: async (idToken: string, role?: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/google', { idToken, role });
    return response.data;
  },
};
