import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import type { CookingSession, StartCookingRequest, EndCookingRequest } from "@/types/api.types";

export const cookingSessionService = {
  async list(): Promise<CookingSession[]> {
    try {
      // Try user-specific endpoint first (more RESTful)
      const res = await apiService.get<CookingSession[]>(API_CONFIG.ENDPOINTS.USER_COOKING_SESSIONS);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error: any) {
      // Fallback to general endpoint if user-specific doesn't exist
      if (error.status === 404) {
        try {
          const res = await apiService.get<CookingSession[]>(API_CONFIG.ENDPOINTS.COOKING_SESSIONS);
          return Array.isArray(res.data) ? res.data : [];
        } catch (fallbackError) {
          console.error('Both cooking session endpoints failed:', fallbackError);
          return [];
        }
      }
      console.error('Failed to fetch cooking sessions:', error);
      return [];
    }
  },

  async start(data: StartCookingRequest): Promise<CookingSession> {
    const res = await apiService.post<CookingSession>(API_CONFIG.ENDPOINTS.COOKING_SESSIONS, data);
    return res.data as CookingSession;
  },

  async end(id: string, data?: EndCookingRequest): Promise<CookingSession> {
    const res = await apiService.post<CookingSession>(API_CONFIG.ENDPOINTS.COOKING_SESSION_END(id), data || {});
    return res.data as CookingSession;
  },
};
