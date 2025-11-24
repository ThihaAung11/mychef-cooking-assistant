/**
 * Authentication Service
 * Handles login, register, and user profile operations
 */

import { apiService, tokenManager } from './api.service';
import { API_CONFIG } from '@/config/api.config';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  UserStats,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '@/types/api.types';

export const authService = {
  /**
   * Login with username/email and password
   */
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    // Backend expects form data for OAuth2 password flow
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiService.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.LOGIN,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = response.data;

    // Store token
    tokenManager.setToken(access_token);

    // Fetch user profile
    const user = await this.getCurrentUser();

    // Store user
    tokenManager.setUser(user);

    return { user, token: access_token };
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiService.post<RegisterResponse>(
      API_CONFIG.ENDPOINTS.REGISTER,
      data
    );

    return response.data;
  },

  /**
   * Logout user
   */
  logout(): void {
    tokenManager.removeToken();
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>(API_CONFIG.ENDPOINTS.USER_ME);
    return response.data;
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiService.get<UserStats>(
      API_CONFIG.ENDPOINTS.USER_STATS
    );
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserRequest): Promise<User> {
    const response = await apiService.put<User>(
      API_CONFIG.ENDPOINTS.USER_UPDATE,
      data
    );

    // Update stored user
    tokenManager.setUser(response.data);

    return response.data;
  },

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File, onProgress?: (percent: number) => void): Promise<User> {
    const response = await apiService.uploadFile<User>(
      API_CONFIG.ENDPOINTS.USER_UPLOAD_IMAGE,
      file,
      'file',
      undefined,
      onProgress
    );

    // Update stored user
    tokenManager.setUser(response.data);

    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiService.post(API_CONFIG.ENDPOINTS.USER_CHANGE_PASSWORD, data);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getToken();
  },

  /**
   * Get stored user (without API call)
   */
  getStoredUser(): User | null {
    return tokenManager.getUser();
  },
};
