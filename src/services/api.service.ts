/**
 * API Service
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { ApiError } from '@/types/api.types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Token Management
// ============================================

export const tokenManager = {
  getToken(): string | null {
    return localStorage.getItem(API_CONFIG.TOKEN_KEY);
  },
  
  setToken(token: string): void {
    localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
  },
  
  removeToken(): void {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.USER_KEY);
  },
  
  getUser(): any {
    const userStr = localStorage.getItem(API_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser(user: any): void {
    localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
  },
};

// ============================================
// Request Interceptor
// ============================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    
    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================

apiClient.interceptors.response.use(
  (response) => {
    // Successful response - return data directly
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle errors
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear token
      tokenManager.removeToken();
      
      // Define public pages that don't need to redirect on 401
      const publicPages = ['/', '/discover', '/recipes', '/login', '/register'];
      const isPublicPage = publicPages.some(page => window.location.pathname.startsWith(page));
      
      // Only redirect if not on a public page
      if (!isPublicPage) {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    }
    
    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      console.error('Validation error:', error.response.data);
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    
    // Transform error for consistent handling
    const apiError: ApiError = {
      detail: error.response?.data?.detail || error.message || 'An unexpected error occurred',
      status: error.response?.status,
    };
    
    return Promise.reject(apiError);
  }
);

// ============================================
// API Service
// ============================================

export const apiService = {
  // Generic GET request
  get: <T = any>(url: string, config?: any) => {
    return apiClient.get<T>(url, config);
  },
  
  // Generic POST request
  post: <T = any>(url: string, data?: any, config?: any) => {
    return apiClient.post<T>(url, data, config);
  },
  
  // Generic PUT request
  put: <T = any>(url: string, data?: any, config?: any) => {
    return apiClient.put<T>(url, data, config);
  },
  
  // Generic PATCH request
  patch: <T = any>(url: string, data?: any, config?: any) => {
    return apiClient.patch<T>(url, data, config);
  },
  
  // Generic DELETE request
  delete: <T = any>(url: string, config?: any) => {
    return apiClient.delete<T>(url, config);
  },
  
  // File upload with FormData
  uploadFile: <T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, any>,
    onProgress?: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Add additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    return apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (evt) => {
        if (evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          if (onProgress) onProgress(percent);
        }
      },
    });
  },
};

// Export axios instance for advanced use cases
export default apiClient;
