import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsService } from "@/services/collections.service";
import { recipesService } from "@/services/recipes.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Plus, X, Loader2, Clock, Utensils, Search, Calendar } from "lucide-react";
import type { RecipeCollection, Recipe, CollectionItem } from "@/types/api.types";
import { formatCookingTime } from "@/lib/api-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [missingRecipes, setMissingRecipes] = useState<Record<number, Recipe>>({});

  // Fetch collection
  const { data: collection, isLoading } = useQuery<RecipeCollection>({
    queryKey: ["collection", id],
    queryFn: () => collectionsService.getById(Number(id!)),
    enabled: !!id,
  });

  // Search recipes
  const { data: searchResults } = useQuery<Recipe[]>({
    queryKey: ["recipe-search", searchQuery],
    queryFn: () => recipesService.search({ q: searchQuery, limit: 20 }),
    enabled: searchQuery.length > 2 && isAddRecipeOpen,
  });

  // Add recipe mutation
  const addRecipeMutation = useMutation({
    mutationFn: (recipeId: number) =>
      collectionsService.addRecipe(Number(id!), { recipe_id: recipeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", id] });
      toast({ title: "Recipe added!" });
      setIsAddRecipeOpen(false);
      setSearchQuery("");
    },
  });

  // Remove recipe mutation
  const removeRecipeMutation = useMutation({
    mutationFn: (recipeId: number) =>
      collectionsService.removeRecipe(Number(id!), recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", id] });
      toast({ title: "Recipe removed" });
    },
  });

  // Update item (for day assignment)
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, day }: { itemId: number; day: string }) =>
      collectionsService.updateItem(Number(id!), itemId, { day_of_week: day }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", id] });
      toast({ title: "Day updated!" });
    },
  });

  // Fetch missing recipe details
  useEffect(() => {
    if (collection?.items) {
      const missingItems = collection.items.filter(item => !item.recipe);
      
      missingItems.forEach(async (item) => {
        if (!missingRecipes[item.recipe_id]) {
          try {
            const recipe = await recipesService.getById(String(item.recipe_id));
            setMissingRecipes(prev => ({
              ...prev,
              [item.recipe_id]: recipe
            }));
          } catch (error) {
            console.warn(`Failed to fetch recipe ${item.recipe_id}:`, error);
          }
        }
      });
    }
  }, [collection?.items, missingRecipes]);

  const isMealPlan = collection?.collection_type === "meal_plan";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return <div>Collection not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16 md:pt-20 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Header - Clean & Simple */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate("/my-kitchen")} className="mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-muted-foreground">{collection.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge>{collection.items?.length || 0} recipes</Badge>
                </div>
              </div>
              
              <Button onClick={() => setIsAddRecipeOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Recipe
              </Button>
            </div>
          </div>

          {/* Recipe Grid - Apple Photos Style */}
          {!collection.items || collection.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Utensils className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No recipes yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Add recipes to this collection to get started
              </p>
              <Button onClick={() => setIsAddRecipeOpen(true)} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Add Your First Recipe
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {collection.items.map((item) => {
                // Use recipe data from collection or fallback to individually fetched recipe
                const recipe = item.recipe || missingRecipes[item.recipe_id];
                
                return (
                <div key={item.id} className="group">
                  <Link to={`/recipes/${item.recipe_id}`} className="block">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-3 shadow-sm hover:shadow-md transition-all duration-300">
                      {recipe?.image_url ? (
                        <img
                          src={recipesService.getCardImage(recipe.image_url)}
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Utensils className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Remove button - appears on hover */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeRecipeMutation.mutate(item.recipe_id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Day badge for meal plans */}
                      {isMealPlan && item.day_of_week && (
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-primary text-primary-foreground shadow-lg text-xs font-semibold">
                            {item.day_of_week}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {recipe?.title || "Recipe"}
                    </h3>
                    
                    {recipe?.cooking_time && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatCookingTime(recipe.cooking_time)}
                      </p>
                    )}
                  </Link>

                  {/* Day selector for meal plans */}
                  {isMealPlan && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={item.day_of_week || ""}
                        onValueChange={(day) => updateItemMutation.mutate({ itemId: item.id, day })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          <SelectValue placeholder="Set day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day) => (
                            <SelectItem key={day} value={day} className="text-xs">
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Recipe Dialog - Simple */}
      <Dialog open={isAddRecipeOpen} onOpenChange={setIsAddRecipeOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Recipe</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {searchQuery.length > 2 ? (
                searchResults && searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((recipe) => (
                      <Card
                        key={recipe.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => addRecipeMutation.mutate(Number(recipe.id))}
                      >
                        <div className="flex items-center gap-3">
                          {recipe.image_url && (
                            <img
                              src={recipesService.getCardImage(recipe.image_url)}
                              alt={recipe.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">{recipe.title}</h4>
                            {recipe.cooking_time && (
                              <p className="text-xs text-muted-foreground">
                                {formatCookingTime(recipe.cooking_time)}
                              </p>
                            )}
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No recipes found</p>
                )
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Type to search recipes
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
