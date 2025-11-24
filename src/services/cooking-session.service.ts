import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import type { CookingSession, StartCookingRequest, EndCookingRequest } from "@/types/api.types";

export const cookingSessionService = {
  async list(): Promise<CookingSession[]> {
    const res = await apiService.get<CookingSession[]>(API_CONFIG.ENDPOINTS.COOKING_SESSIONS);
    return Array.isArray(res.data) ? res.data : [];
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
