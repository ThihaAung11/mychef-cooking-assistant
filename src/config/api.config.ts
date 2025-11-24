/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  // Base URLs
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
//   'https://ai-powered-cooking-assistant.onrender.com',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds
  
  // File Upload
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  
  // Token
  TOKEN_KEY: 'shan_chef_token',
  USER_KEY: 'shan_chef_user',
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    
    // Users
    USER_ME: '/users/me',
    USER_STATS: '/users/me/stats',
    USER_UPDATE: '/users/me',
    USER_UPLOAD_IMAGE: '/users/me/upload-profile-image',
    USER_CHANGE_PASSWORD: '/users/me/change-password',
    
    // Recipes
    RECIPES: '/recipes/',
    RECIPE_DETAIL: (id: string) => `/recipes/${id}`,
    RECIPE_SEARCH: '/recipes/search',
    RECIPE_RECOMMEND: '/recipes/recommend',
    RECIPE_UPLOAD_IMAGE: (id: string) => `/recipes/${id}/upload-image`,
    RECIPE_STEP_MEDIA: (id: string, stepNumber: number) => `/recipes/${id}/steps/${stepNumber}/upload-media`,
    
    // Saved Recipes
    SAVED_RECIPES: '/saved-recipes',  // Try without trailing slash
    SAVED_RECIPE_DELETE: (id: string) => `/saved-recipes/${id}`,
    
    // Cooking Sessions
    COOKING_SESSIONS: '/cooking-sessions/',
    COOKING_SESSION_END: (id: string) => `/cooking-sessions/${id}/end`,
    
    // Feedbacks
    FEEDBACKS: '/feedbacks/',
    FEEDBACK_DETAIL: (id: string) => `/feedbacks/${id}`,
    FEEDBACK_BY_RECIPE: (recipeId: string) => `/feedbacks/recipe/${recipeId}`,
    
    // Chat
    CHAT: '/chat/',
    CHAT_HISTORY: '/chat/history',
    
    // Recommendations
    RECOMMENDATIONS: '/recommendations/',
    
    // User Preferences (new endpoints)
    PREFERENCES_ME: '/preferences/me',
    PREFERENCES: '/preferences/',
    
    // Collections
    COLLECTIONS: '/collections/',
    COLLECTION_DETAIL: (id: number) => `/collections/${id}`,
    COLLECTION_ADD_RECIPE: (id: number) => `/collections/${id}/recipes`,
    COLLECTION_REMOVE_RECIPE: (collectionId: number, recipeId: number) => `/collections/${collectionId}/recipes/${recipeId}`,
    COLLECTION_UPDATE_ITEM: (collectionId: number, itemId: number) => `/collections/${collectionId}/items/${itemId}`,
    
    // Admin
    ADMIN_RECIPES: '/admin/recipes',
    ADMIN_RECIPE_DETAIL: (id: string) => `/admin/recipes/${id}`,
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
    ADMIN_USER_ACTIVATE: (id: string) => `/admin/users/${id}/activate`,
    ADMIN_USER_DEACTIVATE: (id: string) => `/admin/users/${id}/deactivate`,
    ADMIN_FEEDBACKS: '/admin/feedbacks',
    ADMIN_FEEDBACK_DETAIL: (id: string) => `/admin/feedbacks/${id}`,
    ADMIN_COOKING_SESSIONS: '/admin/cooking-sessions',
    ADMIN_ANALYTICS_COOKING: (days: number) => `/admin/analytics/cooking?days=${days}`,
    ADMIN_AI_REFRESH_EMBEDDINGS: '/admin/ai/refresh-embeddings',
    ADMIN_AI_UPDATE_RECIPE_DATA: '/admin/ai/update-recipe-data',
  }
} as const;
