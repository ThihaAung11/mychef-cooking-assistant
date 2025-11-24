import Navigation from "@/components/Navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { savedRecipesService } from "@/services/saved-recipes.service";
import { recipesService } from "@/services/recipes.service";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import type { SavedRecipe, Recipe } from "@/types/api.types";
import { formatCookingTime } from "@/lib/api-utils";

const placeholder = "/placeholder.svg";

export default function MyRecipes() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState("created");

  // Fetch user's created recipes
  const { data: createdRecipes = [], isLoading: createdLoading } = useQuery<Recipe[]>({
    queryKey: ["user-recipes", user?.id],
    queryFn: () => recipesService.search({ created_by: user?.id, include_private: true }),
    enabled: tab === "created" && !!user?.id,
  });

  const { data: saved = [], isLoading: savedLoading } = useQuery<SavedRecipe[]>({
    queryKey: ["saved-recipes"],
    queryFn: () => savedRecipesService.list(),
    enabled: tab === "saved",
  });

  const removeMut = useMutation({
    mutationFn: (savedId: string) => savedRecipesService.delete(savedId),
    onSuccess: () => {
      toast({ title: "Removed", description: "Recipe removed from saved." });
      qc.invalidateQueries({ queryKey: ["saved-recipes"] });
    },
    onError: (err: any) => toast({ title: "Failed", description: err?.message || "Unable to remove", variant: "destructive" }),
  });

  const handleSaveToggle = async (recipeId: string) => {
    const item = saved.find((s) => String(s.recipe_id ?? (s.recipe as any)?.id) === String(recipeId));
    if (!item) return;
    removeMut.mutate(String(item.id));
  };

  const mapToCard = (r: Recipe) => {
    const totalMins = (r.preparation_time || 0) + (r.cooking_time || 0);
    const image = recipesService.getCardImage(r.image_url);
    const rating = typeof r.average_rating === 'number' ? r.average_rating : 0;
    const hasSteps = r.steps && r.steps.length > 0;
    const stepCount = hasSteps ? r.steps!.length : 0;
    return {
      id: String(r.id),
      title: r.title,
      image: image || placeholder,
      rating: Number((rating as any)?.toFixed ? (rating as any).toFixed(1) : rating),
      feedbackCount: typeof r.total_feedbacks === 'number' ? r.total_feedbacks : undefined,
      cookTime: totalMins ? formatCookingTime(totalMins) : "-",
      prepMinutes: r.preparation_time || undefined,
      cookMinutes: r.cooking_time || undefined,
      servings: r.servings || 0,
      difficulty: (r.difficulty_level as any) || "Medium",
      tags: [r.cuisine_type || "", r.difficulty_level || ""].filter(Boolean) as string[],
      description: r.description,
      hasSteps,
      stepCount,
    } as const;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6 md:py-10">
          <div className="mb-4 md:mb-6 flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-semibold">My Recipes</h1>
            <p className="text-sm text-muted-foreground">Manage your created and saved recipes.</p>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="created">Created</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>

            <Separator className="my-6" />

            <TabsContent value="created" className="space-y-4">
              <div className="flex justify-end">
                <Button asChild>
                  <Link to="/create-recipe">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Recipe
                  </Link>
                </Button>
              </div>

              {createdLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-72 bg-muted rounded-xl" />
                  ))}
                </div>
              )}

              {!createdLoading && createdRecipes.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <p className="mb-4">No created recipes yet. Start by creating your first recipe!</p>
                  <Button asChild>
                    <Link to="/create-recipe">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Recipe
                    </Link>
                  </Button>
                </div>
              )}

              {!createdLoading && createdRecipes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdRecipes.map((r) => {
                    const card = mapToCard(r);
                    return (
                      <RecipeCard
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        image={card.image}
                        rating={card.rating}
                        feedbackCount={card.feedbackCount}
                        cookTime={card.cookTime}
                        prepMinutes={card.prepMinutes}
                        cookMinutes={card.cookMinutes}
                        servings={card.servings}
                        showEdit={true}
                        difficulty={card.difficulty}
                        tags={card.tags}
                        description={card.description}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              {savedLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-72 bg-muted rounded-xl" />
                  ))}
                </div>
              )}

              {!savedLoading && saved.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  You have no saved recipes yet. Explore and save your favorites!
                </div>
              )}

              {!savedLoading && saved.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {saved.map((s) => {
                    const r = (s.recipe as Recipe) || ({} as Recipe);
                    if (!r || !r.id) return null;
                    const card = mapToCard(r);
                    return (
                      <RecipeCard
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        image={card.image}
                        rating={card.rating}
                        feedbackCount={card.feedbackCount}
                        cookTime={card.cookTime}
                        prepMinutes={card.prepMinutes}
                        cookMinutes={card.cookMinutes}
                        servings={card.servings}
                        difficulty={card.difficulty}
                        tags={card.tags}
                        description={card.description}
                        saved={true}
                        onSave={handleSaveToggle}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
