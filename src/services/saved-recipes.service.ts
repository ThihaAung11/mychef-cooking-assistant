import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import type { SavedRecipe } from "@/types/api.types";

export const savedRecipesService = {
  async list(): Promise<SavedRecipe[]> {
    const res = await apiService.get<any>(API_CONFIG.ENDPOINTS.SAVED_RECIPES);
    // Handle paginated response structure
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items as SavedRecipe[];
    }
    // Fallback for direct array response
    return Array.isArray(res.data) ? res.data : [];
  },

  async save(recipeId: string): Promise<SavedRecipe> {
    const res = await apiService.post<SavedRecipe>(API_CONFIG.ENDPOINTS.SAVED_RECIPES, { recipe_id: recipeId });
    return res.data as SavedRecipe;
  },

  async delete(savedId: string): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.SAVED_RECIPE_DELETE(savedId));
  },
};
