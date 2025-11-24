/**
 * API Utilities
 * Helper functions for API operations
 */

import { API_CONFIG } from '@/config/api.config';
import { ApiError } from '@/types/api.types';

// ============================================
// Error Handling
// ============================================

/**
 * Format API error for display
 */
export function formatApiError(error: ApiError | any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.detail) {
    // Handle validation errors (422)
    if (typeof error.detail === 'object' && Array.isArray(error.detail)) {
      return error.detail.map((err: any) => err.msg).join(', ');
    }
    return error.detail;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return !error.status || error.message?.includes('Network Error');
}

// ============================================
// File Validation
// ============================================

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > API_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }
  
  // Check file type
  if (!API_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WEBP, or GIF image.',
    };
  }
  
  return { valid: true };
}

/**
 * Create image preview URL
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Revoke object URL to free memory
 */
export function revokeImagePreview(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

// ============================================
// URL Building
// ============================================

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get full image URL
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Otherwise, prepend base URL
  return `${API_CONFIG.BASE_URL}${path}`;
}

// ============================================
// Data Transformation
// ============================================

/**
 * Parse cooking time string to minutes
 */
export function parseCookingTime(timeStr: string): number {
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Format minutes to time string
 */
export function formatCookingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// ============================================
// Retry Logic
// ============================================

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if ((error as ApiError)?.status && (error as ApiError).status! < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
