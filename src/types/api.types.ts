/**
 * API Type Definitions
 * TypeScript interfaces for API requests and responses
 */

// ============================================
// Authentication
// ============================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  name: string | null;
  created_at: string;
}

// ============================================
// User
// ============================================

export interface User {
  id: string;
  username: string;
  email: string;
  name: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_recipes: number;
  saved_recipes_count: number;
  cooking_sessions_count: number;
  average_rating: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  username?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ============================================
// Recipe
// ============================================

export interface RecipeCreator {
  id: number;
  username: string;
  name: string | null;
  profile_image_url: string | null;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cuisine_type: string | null;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  preparation_time: number | null;
  cooking_time: number | null;
  servings: number | null;
  image_url: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  total_feedbacks?: number;
  steps?: RecipeStep[]; // New structured steps from backend
  creator?: RecipeCreator; // Creator info from backend
}

export interface RecipeStep {
  id: number;
  recipe_id: number;
  step_number: number;
  instruction_text: string;
  media_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cuisine_type?: string;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  preparation_time?: number;
  cooking_time?: number;
  servings?: number;
  is_public?: boolean;
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {}

export interface RecipeSearchParams {
  q?: string;
  cuisine?: string;
  difficulty?: string;
  max_time?: number;
  ingredients?: string;
  created_by?: string;
  include_private?: boolean;
  skip?: number;
  limit?: number;
}

export interface PaginatedRecipes {
  items: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

// ============================================
// Saved Recipes
// ============================================

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  saved_at: string;
  recipe?: Recipe;
}

export interface SaveRecipeRequest {
  recipe_id: string;
}

// ============================================
// Cooking Session
// ============================================

export interface CookingSession {
  id: string;
  user_id: string;
  recipe_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  recipe?: Recipe;
}

export interface StartCookingRequest {
  recipe_id: string;
}

export interface EndCookingRequest {
  notes?: string;
}

// ============================================
// Feedback
// ============================================

export interface Feedback {
  id: string;
  user_id: string;
  recipe_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateFeedbackRequest {
  recipe_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateFeedbackRequest {
  rating?: number;
  comment?: string;
}

// ============================================
// Chat
// ============================================

export interface ChatMessage {
  message_id: number;
  user_id: string;
  user_message: string;
  ai_reply: string;
  cooking_recipe: Recipe | null;
  language: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message_id: number;
  ai_reply: string;
  cooking_recipe: Recipe | null;
  language: string;
}

// ============================================
// User Preferences
// ============================================

export interface UserPreferences {
  id: number | string;
  user_id: number | string;
  language: 'en' | 'my';
  spice_level: 'low' | 'medium' | 'high' | null;
  diet_type: 'omnivore' | 'vegetarian' | 'vegan' | null;
  allergies: string | null;
  preferred_cuisine: string | null;
  cooking_skill: 'beginner' | 'intermediate' | 'advanced' | null;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencesRequest {
  language?: 'en' | 'my';
  spice_level?: 'low' | 'medium' | 'high' | null;
  diet_type?: 'omnivore' | 'vegetarian' | 'vegan' | null;
  allergies?: string | null;
  preferred_cuisine?: string | null;
  cooking_skill?: 'beginner' | 'intermediate' | 'advanced' | null;
}

// ============================================
// Recommendations
// ============================================

export interface RecommendRequest {
  query: string;
}

export interface RecommendationResponse {
  recommendations: Recipe[];
}

export interface RecommendationApiResponse {
  recommendations: Recipe[];
}

// ============================================
// Collections & Meal Planning
// ============================================

export interface CollectionItem {
  id: number;
  collection_id: number;
  recipe_id: number;
  order: number;
  day_of_week: string | null;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
  notes: string | null;
  servings: number | null;
  created_at: string;
  updated_at: string;
  recipe?: Recipe;
}

export interface RecipeCollection {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  collection_type: 'meal_plan' | 'favorites' | 'custom';
  is_public: boolean;
  items: CollectionItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  collection_type?: 'meal_plan' | 'favorites' | 'custom';
  is_public?: boolean;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  collection_type?: 'meal_plan' | 'favorites' | 'custom';
  is_public?: boolean;
}

export interface CreateCollectionItemRequest {
  recipe_id: number;
  order?: number;
  day_of_week?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  servings?: number;
}

export interface UpdateCollectionItemRequest {
  order?: number;
  day_of_week?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  servings?: number;
}

// ============================================
// Common/Utility
// ============================================

export interface ApiError {
  detail: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
