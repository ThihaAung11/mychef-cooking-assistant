import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, RefreshCw, Database, Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";

export default function AdminAI() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRefreshEmbeddings = async () => {
    setLoading(true);
    try {
      await adminService.ai.refreshEmbeddings();
      toast({
        title: "Success",
        description: "AI embeddings refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh embeddings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecipeData = async () => {
    setLoading(true);
    try {
      await adminService.ai.updateRecipeData();
      toast({
        title: "Success",
        description: "Recipe data updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recipe data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Knowledge Management</h1>
        <p className="text-muted-foreground">Manage AI embeddings and recipe data</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Refresh Embeddings */}
        <Card className="glass-card p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Refresh Embeddings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Update AI embeddings for better recipe recommendations and search results.
                This process may take a few minutes.
              </p>
              <Button
                onClick={handleRefreshEmbeddings}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Embeddings
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Update Recipe Data */}
        <Card className="glass-card p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Update Recipe Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Synchronize recipe data with the AI knowledge base.
                Run this after adding or updating multiple recipes.
              </p>
              <Button
                onClick={handleUpdateRecipeData}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Update Recipe Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="glass-card p-6">
        <div className="flex items-start gap-4">
          <Bot className="h-6 w-6 text-purple-500 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">AI System Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Embeddings:</strong> Vector representations of recipes used for
                semantic search and recommendations.
              </p>
              <p>
                <strong>Recipe Data:</strong> Structured information that powers the AI
                assistant's cooking knowledge.
              </p>
              <p>
                <strong>Best Practice:</strong> Refresh embeddings weekly and update recipe
                data after bulk changes.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Card */}
      <Card className="glass-card p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <div>
            <p className="font-medium">AI System Status</p>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
