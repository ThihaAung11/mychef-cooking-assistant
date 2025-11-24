/**
 * Preferences Service
 */
import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import { UpdatePreferencesRequest, UserPreferences } from "@/types/api.types";

export const preferencesService = {
  async get(): Promise<UserPreferences> {
    // This endpoint auto-creates defaults if missing
    const res = await apiService.get<UserPreferences>(API_CONFIG.ENDPOINTS.PREFERENCES_ME);
    return res.data;
  },

  // Create explicit preferences (will error if already exists)
  async create(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    const res = await apiService.post<UserPreferences>(API_CONFIG.ENDPOINTS.PREFERENCES, data);
    return res.data;
  },

  // Update existing preferences (partial allowed)
  async update(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    const res = await apiService.put<UserPreferences>(API_CONFIG.ENDPOINTS.PREFERENCES, data);
    return res.data;
  },
};
