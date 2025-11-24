import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { apiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ApiTest() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [responseData, setResponseData] = useState<any>(null);

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Testing API connection...');
    
    try {
      // Test basic connection by fetching recipes
      const response = await apiService.get(API_CONFIG.ENDPOINTS.RECIPES);
      setStatus('success');
      setMessage('✅ API connection successful!');
      setResponseData(response.data);
      console.log('API Response:', response.data);
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ API connection failed: ${error.detail || error.message}`);
      console.error('API Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-4xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">API Connection Test</h1>
            <p className="text-muted-foreground">
              Test the connection to the backend API
            </p>
          </div>

          <Card className="p-6 space-y-6">
            {/* API Info */}
            <div>
              <h2 className="text-lg font-semibold mb-3">API Configuration</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Base URL:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {API_CONFIG.BASE_URL}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Timeout:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {API_CONFIG.TIMEOUT}ms
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Max File Size:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB
                  </code>
                </div>
              </div>
            </div>

            {/* Test Button */}
            <div className="space-y-3">
              <Button 
                onClick={testConnection}
                disabled={status === 'loading'}
                className="w-full"
                size="lg"
              >
                {status === 'loading' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Test API Connection
              </Button>

              {/* Status Display */}
              {status !== 'idle' && (
                <div className={`p-4 rounded-lg border ${
                  status === 'success' 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : status === 'error'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    )}
                    {status === 'error' && (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    {status === 'loading' && (
                      <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Response Data */}
            {responseData && (
              <div className="space-y-2">
                <h3 className="font-semibold">Response Data:</h3>
                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-xs">
                    {JSON.stringify(responseData, null, 2)}
                  </pre>
                </div>
                {Array.isArray(responseData) && (
                  <Badge variant="secondary">
                    Found {responseData.length} recipes
                  </Badge>
                )}
              </div>
            )}

            {/* Quick Links */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">API Documentation</h3>
              <div className="space-y-2">
                <a 
                  href={`${API_CONFIG.BASE_URL}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-primary hover:underline"
                >
                  📚 Swagger UI (Interactive Docs)
                </a>
                <a 
                  href={`${API_CONFIG.BASE_URL}/redoc`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-primary hover:underline"
                >
                  📖 ReDoc (Reference Docs)
                </a>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2">🧪 Testing Instructions</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Click the "Test API Connection" button above</li>
              <li>Check if the connection is successful</li>
              <li>Open browser console (F12) for detailed logs</li>
              <li>If successful, you'll see recipe data below</li>
              <li>Check the API documentation links for available endpoints</li>
            </ol>
          </Card>
        </div>
      </main>
    </div>
  );
}
