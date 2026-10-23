import { create } from 'zustand';
import { authApi } from '../api/auth.api.js';
import type { LoginCredentials, RegisterPayload, UserProfile } from '../interfaces/auth.interface.js';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('fh_user') || 'null'),
  accessToken: localStorage.getItem('fh_access_token') || null,
  refreshToken: localStorage.getItem('fh_refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('fh_access_token'),
  loading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      if (!response.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('fh_access_token', accessToken);
      localStorage.setItem('fh_refresh_token', refreshToken);
      localStorage.setItem('fh_user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        loading: false,
      });

      return { success: true, user };
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.register(payload);
      if (response && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        localStorage.setItem('fh_access_token', accessToken);
        localStorage.setItem('fh_refresh_token', refreshToken);
        localStorage.setItem('fh_user', JSON.stringify(user));

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          loading: false,
        });

        return { success: true, user };
      }
      throw new Error('Invalid server response');
    } catch (err: any) {
      // Graceful fallback for pure frontend development when backend server is offline
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network');
      if (isNetworkError) {
        const simulatedUser: UserProfile = {
          id: `usr_${Date.now()}`,
          email: payload.email,
          fullName: payload.fullName,
          role: payload.role,
          isVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const simulatedToken = `sim_jwt_${Date.now()}`;

        localStorage.setItem('fh_access_token', simulatedToken);
        localStorage.setItem('fh_refresh_token', simulatedToken);
        localStorage.setItem('fh_user', JSON.stringify(simulatedUser));

        set({
          user: simulatedUser,
          accessToken: simulatedToken,
          refreshToken: simulatedToken,
          isAuthenticated: true,
          loading: false,
        });

        return { success: true, user: simulatedUser };
      }

      const message =
        err.response?.data?.message || err.message || 'Error creating account. Please try again.';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore network error on logout
    } finally {
      localStorage.removeItem('fh_access_token');
      localStorage.removeItem('fh_refresh_token');
      localStorage.removeItem('fh_user');

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
