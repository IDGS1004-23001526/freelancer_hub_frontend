/**
 * Interfaces y contratos TypeScript para la entidad de Usuario y Sesión
 */

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'CLIENT' | 'FREELANCER' | 'ADMIN';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  user: UserProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: 'CLIENT' | 'FREELANCER' | 'ADMIN';
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
  detalles?: Array<{ campo: string; mensaje: string }>;
}
