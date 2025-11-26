import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import type { Feedback, CreateFeedbackRequest, UpdateFeedbackRequest } from "@/types/api.types";

export const feedbackService = {
  async getByRecipe(recipeId: string): Promise<Feedback[]> {
    const res = await apiService.get<any>(API_CONFIG.ENDPOINTS.FEEDBACK_BY_RECIPE(recipeId));
    // Handle paginated response structure
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items as Feedback[];
    }
    // Fallback for direct array response
    return Array.isArray(res.data) ? res.data : [];
  },

  async create(data: CreateFeedbackRequest): Promise<Feedback> {
    const res = await apiService.post<Feedback>(API_CONFIG.ENDPOINTS.FEEDBACKS, data);
    return res.data as Feedback;
  },

  async update(id: string, data: UpdateFeedbackRequest): Promise<Feedback> {
    const res = await apiService.put<Feedback>(API_CONFIG.ENDPOINTS.FEEDBACK_DETAIL(id), data);
    return res.data as Feedback;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.FEEDBACK_DETAIL(id));
  },
};
