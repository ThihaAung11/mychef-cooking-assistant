import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import type { ChatMessage, ChatRequest, ChatResponse } from "@/types/api.types";

// Chat API can take longer due to AI processing
const CHAT_TIMEOUT = 120000; // 120 seconds (2 minutes)
const HISTORY_TIMEOUT = 30000; // 30 seconds

export const chatService = {
  async sendMessage(message: string, recipeId?: string, timeoutMs: number = CHAT_TIMEOUT): Promise<ChatResponse> {
    const requestData: ChatRequest = { message };
    if (recipeId) {
      requestData.recipe_id = recipeId;
    }
    
    const res = await apiService.post<ChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT, 
      requestData,
      { timeout: timeoutMs }
    );
    return res.data as ChatResponse;
  },

  async getHistory(): Promise<ChatMessage[]> {
    const res = await apiService.get<ChatMessage[]>(
      API_CONFIG.ENDPOINTS.CHAT_HISTORY,
      { timeout: HISTORY_TIMEOUT }
    );
    return Array.isArray(res.data) ? res.data : [];
  },
};
