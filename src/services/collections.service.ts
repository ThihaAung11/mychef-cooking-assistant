import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import type {
  RecipeCollection,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  CreateCollectionItemRequest,
  UpdateCollectionItemRequest,
  CollectionItem,
} from "@/types/api.types";

export const collectionsService = {
  /**
   * Get all collections for current user
   */
  async list(skip: number = 0, limit: number = 100): Promise<RecipeCollection[]> {
    const res = await apiService.get<RecipeCollection[]>(
      `${API_CONFIG.ENDPOINTS.COLLECTIONS}?skip=${skip}&limit=${limit}`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Get a specific collection by ID
   */
  async getById(id: number): Promise<RecipeCollection> {
    const res = await apiService.get<RecipeCollection>(
      API_CONFIG.ENDPOINTS.COLLECTION_DETAIL(id)
    );
    return res.data as RecipeCollection;
  },

  /**
   * Create a new collection
   */
  async create(data: CreateCollectionRequest): Promise<RecipeCollection> {
    const res = await apiService.post<RecipeCollection>(
      API_CONFIG.ENDPOINTS.COLLECTIONS,
      data
    );
    return res.data as RecipeCollection;
  },

  /**
   * Update a collection
   */
  async update(id: number, data: UpdateCollectionRequest): Promise<RecipeCollection> {
    const res = await apiService.put<RecipeCollection>(
      API_CONFIG.ENDPOINTS.COLLECTION_DETAIL(id),
      data
    );
    return res.data as RecipeCollection;
  },

  /**
   * Delete a collection
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.COLLECTION_DETAIL(id));
  },

  /**
   * Add a recipe to a collection
   */
  async addRecipe(
    collectionId: number,
    data: CreateCollectionItemRequest
  ): Promise<CollectionItem> {
    const res = await apiService.post<CollectionItem>(
      API_CONFIG.ENDPOINTS.COLLECTION_ADD_RECIPE(collectionId),
      data
    );
    return res.data as CollectionItem;
  },

  /**
   * Remove a recipe from a collection
   */
  async removeRecipe(collectionId: number, recipeId: number): Promise<void> {
    await apiService.delete(
      API_CONFIG.ENDPOINTS.COLLECTION_REMOVE_RECIPE(collectionId, recipeId)
    );
  },

  /**
   * Update a collection item (for meal planning)
   */
  async updateItem(
    collectionId: number,
    itemId: number,
    data: UpdateCollectionItemRequest
  ): Promise<CollectionItem> {
    const res = await apiService.put<CollectionItem>(
      API_CONFIG.ENDPOINTS.COLLECTION_UPDATE_ITEM(collectionId, itemId),
      data
    );
    return res.data as CollectionItem;
  },
};
