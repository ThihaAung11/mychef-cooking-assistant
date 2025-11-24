import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BookPlus, BookmarkCheck, History, ChefHat, FolderOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collectionsService } from "@/services/collections.service";
import { recipesService } from "@/services/recipes.service";
import { savedRecipesService } from "@/services/saved-recipes.service";
import { cookingSessionService } from "@/services/cooking-session.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Utensils, Heart, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { RecipeCollection, Recipe, CookingSession } from "@/types/api.types";
import { formatCookingTime } from "@/lib/api-utils";

export default function MyKitchen() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  // Fetch collections
  const { data: collections, isLoading: collectionsLoading } = useQuery<RecipeCollection[]>({
    queryKey: ["collections"],
    queryFn: () => collectionsService.list(),
  });

  // Fetch user's created recipes
  const { data: createdRecipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({
    queryKey: ["user-recipes", user?.id],
    queryFn: () => recipesService.search({ created_by: user?.id, include_private: true }),
    enabled: !!user?.id,
  });

  // Fetch saved recipes
  const { data: savedRecipes = [], isLoading: savedLoading } = useQuery({
    queryKey: ["saved-recipes"],
    queryFn: () => savedRecipesService.list(),
    enabled: !!user,
  });

  // Fetch cooking history
  const { data: cookingHistory = [], isLoading: historyLoading } = useQuery<CookingSession[]>({
    queryKey: ["cooking-sessions"],
    queryFn: () => cookingSessionService.list(),
    enabled: !!user,
  });

  const getIcon = (type: string) => {
    if (type === "meal_plan") return <Calendar className="w-5 h-5" />;
    if (type === "favorites") return <Heart className="w-5 h-5" />;
    return <FolderOpen className="w-5 h-5" />;
  };

  const getBadge = (type: string) => {
    if (type === "meal_plan") return <Badge>Meal Plan</Badge>;
    if (type === "favorites") return <Badge variant="secondary" className="bg-red-100 text-red-700">Favorites</Badge>;
    return <Badge variant="outline">Custom</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16 md:pt-20 pb-24 md:pb-12">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Clean Header - Apple Style */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight">Kitchen</h1>
            <p className="text-muted-foreground">
              Your personal cooking workspace
            </p>
          </div>

          {/* Clean Tabs */}
          <Tabs defaultValue="meal-plans" className="space-y-8">
            <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-muted p-1 text-muted-foreground">
              <TabsTrigger value="meal-plans" className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Meal Plans</span>
                <span className="sm:hidden">Plans</span>
              </TabsTrigger>
              <TabsTrigger value="my-recipes" className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <BookPlus className="w-4 h-4" />
                <span className="hidden sm:inline">My Recipes</span>
                <span className="sm:hidden">Mine</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <BookmarkCheck className="w-4 h-4" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 px-4 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Meal Plans Tab */}
            <TabsContent value="meal-plans" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Meal Plans</h2>
                  <p className="text-sm text-muted-foreground">Organize your weekly cooking</p>
                </div>
                <Link to="/collections">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Plan
                  </Button>
                </Link>
              </div>

              {!collections?.filter(c => c.collection_type === 'meal_plan').length ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No meal plans yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Plan your meals for the week and never wonder what to cook
                  </p>
                  <Link to="/collections">
                    <Button size="lg" className="gap-2">
                      <Plus className="w-5 h-5" />
                      Create Your First Meal Plan
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.filter(c => c.collection_type === 'meal_plan').slice(0, 6).map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collections/${collection.id}`}
                      className="group block h-full"
                    >
                      <Card className="h-full hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                              {getIcon(collection.collection_type)}
                            </div>
                            <CardTitle className="text-base font-bold truncate group-hover:text-primary transition-colors">
                              {collection.name}
                            </CardTitle>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {getBadge(collection.collection_type)}
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Utensils className="w-3 h-3" />
                              {collection.items?.length || 0}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {collections && collections.length > 6 && (
                <div className="text-center pt-4">
                  <Link to="/collections">
                    <Button variant="outline">View All Collections</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* My Recipes Tab */}
            <TabsContent value="my-recipes" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">My Recipes</h2>
                  <p className="text-sm text-muted-foreground">Recipes you've created and shared</p>
                </div>
                <Link to="/create-recipe">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Recipe
                  </Button>
                </Link>
              </div>

              {!createdRecipes || createdRecipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <BookPlus className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No recipes yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Share your culinary creations with the world
                  </p>
                  <Link to="/create-recipe">
                    <Button size="lg" className="gap-2">
                      <Plus className="w-5 h-5" />
                      Create Your First Recipe
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdRecipes.map((recipe) => (
                    <Link
                      key={recipe.id}
                      to={`/recipes/${recipe.id}`}
                      className="group block h-full"
                    >
                      <Card className="h-full hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden border-2">
                        {recipe.image_url && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={recipe.image_url}
                              alt={recipe.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors">
                            {recipe.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {recipe.cooking_time && (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Clock className="w-3 h-3" />
                                {formatCookingTime(recipe.cooking_time)}
                              </Badge>
                            )}
                            {recipe.is_public ? (
                              <Badge className="text-xs">Public</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Private</Badge>
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Saved Recipes Tab */}
            <TabsContent value="saved" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Saved Recipes</h2>
                  <p className="text-sm text-muted-foreground">Your bookmarked favorites</p>
                </div>
                <Link to="/discover">
                  <Button variant="outline" className="gap-2">
                    Discover More
                  </Button>
                </Link>
              </div>

              {!savedRecipes || savedRecipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <BookmarkCheck className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No saved recipes</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Save recipes you love for easy access later
                  </p>
                  <Link to="/discover">
                    <Button size="lg">Discover Recipes</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {savedRecipes.length} saved {savedRecipes.length === 1 ? 'recipe' : 'recipes'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* TODO: Map saved recipes here */}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6 mt-0">
              <div>
                <h2 className="text-xl font-semibold mb-1">Cooking History</h2>
                <p className="text-sm text-muted-foreground">Track your cooking journey</p>
              </div>

              {!cookingHistory || cookingHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <History className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No cooking history</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Start cooking to track your culinary journey
                  </p>
                  <Link to="/discover">
                    <Button size="lg">Discover Recipes</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {cookingHistory.slice(0, 10).map((session) => (
                    <Link 
                      key={session.id}
                      to={`/recipes/${session.recipe_id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-lg hover:border-primary/30 transition-all border-2">
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base font-semibold">
                                {session.recipe?.title || 'Recipe'}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(session.started_at).toLocaleDateString()}
                                {session.ended_at && ` • Completed`}
                              </p>
                            </div>
                            {!session.ended_at && (
                              <Badge variant="outline" className="bg-green-50">Active</Badge>
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
