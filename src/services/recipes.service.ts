import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import { buildQueryString, getImageUrl } from "@/lib/api-utils";
import type { Recipe, CreateRecipeRequest, UpdateRecipeRequest, RecommendRequest } from "@/types/api.types";

export type RecipeSearchParams = {
  q?: string;
  cuisine?: string;
  difficulty?: string;
  max_time?: number; // total time in minutes
  ingredients?: string; // comma separated
  diet_type?: 'omnivore' | 'vegetarian' | 'vegan';
  created_by?: string; // Filter by creator user ID
  // Pagination - prefer page/page_size when supported
  page?: number;
  page_size?: number;
  // Legacy/internals (some endpoints may still accept these)
  skip?: number;
  limit?: number;
  // Visibility
  include_private?: boolean;
};

export const recipesService = {
  async search(params: RecipeSearchParams): Promise<Recipe[]> {
    const qs = buildQueryString(params as any);
    const res = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.RECIPE_SEARCH}${qs}`);
    const data = res.data;
    if (Array.isArray(data)) return data as Recipe[];
    if (data && Array.isArray(data.items)) return data.items as Recipe[];
    return [];
  },

  async recommend(query: string): Promise<Recipe[]> {
    console.log("📡 API Request - POST", API_CONFIG.ENDPOINTS.RECIPE_RECOMMEND);
    console.log("📝 Request body:", { query });
    
    const res = await apiService.post<any>(
      API_CONFIG.ENDPOINTS.RECIPE_RECOMMEND, 
      { query }
    );
    
    console.log("📡 API Response status:", res.status);
    console.log("📦 Response data:", res.data);
    
    // Backend returns { recommendations: [...] }
    let recipes: Recipe[] = [];
    if (res.data && Array.isArray(res.data.recommendations)) {
      recipes = res.data.recommendations;
    } else if (Array.isArray(res.data)) {
      recipes = res.data;
    }
    
    console.log("✅ Parsed recipes count:", recipes.length);
    
    return recipes;
  },

  async list(params: Pick<RecipeSearchParams, 'skip' | 'limit'> = { skip: 0, limit: 12 }): Promise<Recipe[]> {
    const qs = buildQueryString(params as any);
    const res = await apiService.get<Recipe[]>(`${API_CONFIG.ENDPOINTS.RECIPES}${qs}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: string): Promise<Recipe> {
    const res = await apiService.get<Recipe>(API_CONFIG.ENDPOINTS.RECIPE_DETAIL(id));
    return res.data as Recipe;
  },

  async create(data: CreateRecipeRequest): Promise<Recipe> {
    const res = await apiService.post<Recipe>(API_CONFIG.ENDPOINTS.RECIPES, data);
    return res.data as Recipe;
  },

  async update(id: string, data: UpdateRecipeRequest): Promise<Recipe> {
    const res = await apiService.put<Recipe>(API_CONFIG.ENDPOINTS.RECIPE_DETAIL(id), data);
    return res.data as Recipe;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.RECIPE_DETAIL(id));
  },

  async uploadImage(id: string, file: File, onProgress?: (progress: number) => void): Promise<Recipe> {
    const res = await apiService.uploadFile<Recipe>(API_CONFIG.ENDPOINTS.RECIPE_UPLOAD_IMAGE(id), file, 'file', undefined, onProgress);
    return res.data as Recipe;
  },

  async uploadStepMedia(id: string, stepNumber: number, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const res = await apiService.uploadFile<any>(API_CONFIG.ENDPOINTS.RECIPE_STEP_MEDIA(id, stepNumber), file, 'file', undefined, onProgress);
    return res.data;
  },

  getCardImage(url: string | null | undefined): string {
    const resolved = getImageUrl(url || undefined);
    return resolved || "/placeholder.svg";
  }
};
