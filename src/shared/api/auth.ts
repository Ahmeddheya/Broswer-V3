import { apiClient } from './client';
import { User, AuthTokens } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/login', data),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/register', data),

  refresh: (refreshToken: string): Promise<AuthResponse> =>
    apiClient.post('/auth/refresh', { refreshToken }),

  logout: (): Promise<{ message: string }> =>
    apiClient.post('/auth/logout'),

  logoutAll: (): Promise<{ message: string }> =>
    apiClient.post('/auth/logout-all'),
};