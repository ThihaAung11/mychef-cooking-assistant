import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const recipes = await adminService.recipes.list();
      setRecipes(recipes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await adminService.recipes.delete(id);
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
      loadRecipes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recipe Management</h1>
          <p className="text-muted-foreground">Manage all recipes in the platform</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      {/* Search */}
      <Card className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Recipes Table */}
      <Card className="glass-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-4 text-left text-sm font-medium">Title</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Difficulty</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Prep Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Cook Time</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Loading recipes...
                  </td>
                </tr>
              ) : filteredRecipes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No recipes found
                  </td>
                </tr>
              ) : (
                filteredRecipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b hover:bg-accent/50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{recipe.title}</div>
                      <div className="text-sm text-muted-foreground">{recipe.author}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {recipe.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{recipe.prepTime || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{recipe.cookTime || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(recipe.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
