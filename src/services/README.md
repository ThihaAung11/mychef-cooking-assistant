# API Service Documentation

## Overview

The API service layer provides a centralized way to interact with the backend API. It includes:

- **Axios instance** with automatic token injection
- **Request/Response interceptors** for error handling
- **Token management** utilities
- **Type-safe API calls** with TypeScript

## Quick Start

### Basic Usage

```typescript
import { apiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

// GET request
const response = await apiService.get(API_CONFIG.ENDPOINTS.RECIPES);
console.log(response.data);

// POST request
const newRecipe = await apiService.post(API_CONFIG.ENDPOINTS.RECIPES, {
  title: 'My Recipe',
  description: 'Delicious!',
  // ... other fields
});

// File upload
const file = document.querySelector('input[type="file"]').files[0];
await apiService.uploadFile(
  API_CONFIG.ENDPOINTS.USER_UPLOAD_IMAGE,
  file,
  'file'
);
```

### Token Management

```typescript
import { tokenManager } from '@/services/api.service';

// Store token after login
tokenManager.setToken('your-jwt-token');

// Get current token
const token = tokenManager.getToken();

// Remove token (logout)
tokenManager.removeToken();

// Store/retrieve user data
tokenManager.setUser({ id: '1', name: 'John' });
const user = tokenManager.getUser();
```

### Error Handling

```typescript
import { formatApiError } from '@/lib/api-utils';

try {
  await apiService.get('/some-endpoint');
} catch (error) {
  const errorMessage = formatApiError(error);
  console.error(errorMessage);
  // Show toast notification
}
```

## Testing the API Connection

Open the browser console and run:

```javascript
// Test connection
fetch('https://ai-powered-cooking-assistant.onrender.com/docs')
  .then(r => r.text())
  .then(html => console.log('API is reachable!'))
  .catch(e => console.error('API connection failed:', e));
```

## Features

### Automatic Token Injection
All requests automatically include the JWT token in the Authorization header if available.

### Auto-redirect on 401
If the server returns 401 Unauthorized, the user is automatically redirected to the login page.

### File Upload Helper
Simplified file upload with automatic FormData creation and multipart/form-data headers.

### Type Safety
Full TypeScript support with interfaces for all API requests and responses.

## Configuration

Edit `src/config/api.config.ts` to modify:
- API base URL
- Timeout settings
- File upload limits
- Endpoint paths

## Next Steps

1. Test the API connection
2. Implement authentication service
3. Create React Query hooks for data fetching
4. Add specific service modules (auth, recipes, chat, etc.)
