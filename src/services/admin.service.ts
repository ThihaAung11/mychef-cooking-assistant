/**
 * Admin Service
 * API calls for admin panel operations
 */

import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import type { Recipe, CreateRecipeRequest, UpdateRecipeRequest } from "@/types/api.types";

// Admin Types
export interface AdminUser {
  id: number;
  username: string;
  name: string | null;
  email: string;
  profile_url: string | null;
  is_active: boolean;
  role_id: number;
  role_name: string;
  created_at: string;
  total_recipes: number;
  total_cooking_sessions: number;
  total_feedbacks: number;
}

export interface AdminUsersResponse {
  total: number;
  users: AdminUser[];
}

export interface PaginatedUsers {
  items: AdminUser[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface AdminFeedback {
  id: string;
  recipe_id: string;
  recipe_title?: string;
  user_id: string;
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CookingSession {
  id: string;
  user_id: string;
  user_name?: string;
  recipe_id: string;
  recipe_title?: string;
  started_at: string;
  ended_at?: string;
  completed: boolean;
  duration?: number;
}

export interface CookingAnalytics {
  total_sessions: number;
  completed_sessions: number;
  active_users: number;
  average_duration: number;
  popular_recipes: Array<{
    recipe_id: string;
    recipe_title: string;
    session_count: number;
  }>;
}

// ============================================
// Recipe Management
// ============================================

export const adminRecipesService = {
  async list(): Promise<Recipe[]> {
    const res = await apiService.get<Recipe[]>(API_CONFIG.ENDPOINTS.ADMIN_RECIPES);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: string): Promise<Recipe> {
    const res = await apiService.get<Recipe>(API_CONFIG.ENDPOINTS.ADMIN_RECIPE_DETAIL(id));
    return res.data;
  },

  async create(data: CreateRecipeRequest): Promise<Recipe> {
    const res = await apiService.post<Recipe>(API_CONFIG.ENDPOINTS.ADMIN_RECIPES, data);
    return res.data;
  },

  async update(id: string, data: UpdateRecipeRequest): Promise<Recipe> {
    const res = await apiService.put<Recipe>(API_CONFIG.ENDPOINTS.ADMIN_RECIPE_DETAIL(id), data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.ADMIN_RECIPE_DETAIL(id));
  },
};

// ============================================
// User Management
// ============================================

export const adminUsersService = {
  async list(): Promise<AdminUser[]> {
    const res = await apiService.get<AdminUsersResponse>(API_CONFIG.ENDPOINTS.ADMIN_USERS);
    // API returns {total: number, users: AdminUser[]}
    if (res.data && Array.isArray(res.data.users)) {
      return res.data.users;
    }
    return [];
  },

  async listWithTotal(): Promise<PaginatedUsers> {
    const res = await apiService.get<AdminUsersResponse>(API_CONFIG.ENDPOINTS.ADMIN_USERS);
    console.log('Admin Users API Response:', res.data);
    
    // API returns {total: number, users: AdminUser[]}
    if (res.data && Array.isArray(res.data.users)) {
      return {
        items: res.data.users,
        total: res.data.total,
        skip: 0,
        limit: res.data.users.length
      };
    }
    
    // Default empty response
    return {
      items: [],
      total: 0,
      skip: 0,
      limit: 0
    };
  },

  async getById(id: number | string): Promise<AdminUser> {
    const res = await apiService.get<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_USER_DETAIL(String(id)));
    return res.data;
  },

  async activate(id: number | string): Promise<AdminUser> {
    const res = await apiService.post<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_USER_ACTIVATE(String(id)));
    return res.data;
  },

  async deactivate(id: number | string): Promise<AdminUser> {
    const res = await apiService.post<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_USER_DEACTIVATE(String(id)));
    return res.data;
  },
};

// ============================================
// Feedback Management
// ============================================

export const adminFeedbacksService = {
  async list(): Promise<AdminFeedback[]> {
    const res = await apiService.get<AdminFeedback[]>(API_CONFIG.ENDPOINTS.ADMIN_FEEDBACKS);
    return Array.isArray(res.data) ? res.data : [];
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.ADMIN_FEEDBACK_DETAIL(id));
  },
};

// ============================================
// Analytics & Cooking Sessions
// ============================================

export const adminAnalyticsService = {
  async getCookingSessions(): Promise<CookingSession[]> {
    const res = await apiService.get<CookingSession[]>(API_CONFIG.ENDPOINTS.ADMIN_COOKING_SESSIONS);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getCookingAnalytics(days: number = 30): Promise<CookingAnalytics> {
    const res = await apiService.get<CookingAnalytics>(API_CONFIG.ENDPOINTS.ADMIN_ANALYTICS_COOKING(days));
    return res.data;
  },
};

// ============================================
// AI Knowledge Management
// ============================================

export const adminAIService = {
  async refreshEmbeddings(): Promise<{ message: string; status: string }> {
    const res = await apiService.post<{ message: string; status: string }>(
      API_CONFIG.ENDPOINTS.ADMIN_AI_REFRESH_EMBEDDINGS
    );
    return res.data;
  },

  async updateRecipeData(): Promise<{ message: string; status: string }> {
    const res = await apiService.post<{ message: string; status: string }>(
      API_CONFIG.ENDPOINTS.ADMIN_AI_UPDATE_RECIPE_DATA
    );
    return res.data;
  },
};

// ============================================
// Combined Admin Service Export
// ============================================

export const adminService = {
  recipes: adminRecipesService,
  users: adminUsersService,
  feedbacks: adminFeedbacksService,
  analytics: adminAnalyticsService,
  ai: adminAIService,
};

export default adminService;
