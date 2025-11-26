import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { recipesService } from "@/services/recipes.service";
import RecipeCard from "@/components/RecipeCard";
import { formatCookingTime } from "@/lib/api-utils";
import type { Recipe } from "@/types/api.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

interface ForYouSectionProps {
  searchQuery?: string;
  filters?: {
    diet?: string[];
    difficulty?: string[];
    maxTime?: number;
  };
  compact?: boolean; // When true, shows without header (for use in Discover page)
}

export default function ForYouSection({ searchQuery = "", filters = {}, compact = false }: ForYouSectionProps) {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Simple, clear query that should work
      const query = "show me popular recipes";
      
      console.log("=" .repeat(50));
      console.log("🔍 RECOMMENDATION REQUEST");
      console.log("Endpoint: POST /recipes/recommend");
      console.log("Query:", query);
      console.log("Full request body:", JSON.stringify({ query }, null, 2));
      console.log("=" .repeat(50));
      
      // Try AI recommendations first
      try {
        const recipes = await recipesService.recommend(query);
        console.log("✅ API SUCCESS - Received:", recipes?.length || 0, "recipes");
        console.log("First recipe:", recipes[0]?.title || "none");
        
        if (recipes && recipes.length > 0) {
          setRecommendations(recipes.slice(0, 6));
          console.log("✅ SET RECOMMENDATIONS:", recipes.slice(0, 6).length, "recipes");
          return;
        } else {
          console.log("⚠️ API returned empty array");
        }
      } catch (recommendError: any) {
        console.error("❌ RECOMMEND API ERROR:", recommendError);
        console.error("Error details:", {
          message: recommendError?.message,
          status: recommendError?.status,
          detail: recommendError?.detail
        });
      }
      
      // Always use fallback if recommend fails or returns empty
      console.log("📋 LOADING FALLBACK (regular recipe list)...");
      const fallbackRecipes = await recipesService.list({ skip: 0, limit: 6 });
      console.log("✅ FALLBACK SUCCESS:", fallbackRecipes?.length || 0, "recipes");
      
      if (fallbackRecipes && fallbackRecipes.length > 0) {
        setRecommendations(fallbackRecipes);
        console.log("✅ SET FALLBACK RECOMMENDATIONS:", fallbackRecipes.length, "recipes");
      } else {
        console.error("❌ Even fallback is empty!");
      }
      
    } catch (error: any) {
      console.error("❌ COMPLETE FAILURE:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  // Filter recommendations based on search and filters
  const filteredRecommendations = useMemo(() => {
    let filtered = [...recommendations];

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.cuisine_type?.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (filters?.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter(recipe =>
        filters.difficulty!.includes(recipe.difficulty_level)
      );
    }

    // Max time filter
    if (filters?.maxTime && filters.maxTime > 0) {
      filtered = filtered.filter(recipe => {
        const totalTime = (recipe.preparation_time || 0) + (recipe.cooking_time || 0);
        return totalTime <= filters.maxTime!;
      });
    }

    return filtered;
  }, [recommendations, searchQuery, filters]);

  // Don't render section if no recommendations after loading
  if (!loading && filteredRecommendations.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          {t('discover.noRecipes') || 'No recipes found matching your criteria.'}
        </p>
      </div>
    );
  }

  // Compact mode for use in Discover page (no wrapper, no header)
  if (compact) {
    return (
      <>
        {/* Results count - minimal */}
        {!loading && filteredRecommendations.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground">
              {filteredRecommendations.length} {filteredRecommendations.length === 1 ? 'recipe' : 'recipes'}
            </p>
          </div>
        )}

        {/* Grid with better spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          // Elegant loading skeletons
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-muted to-muted/50" />
              <div className="space-y-2.5 px-1">
                <div className="h-5 bg-muted rounded-lg w-3/4" />
                <div className="h-4 bg-muted/60 rounded-lg w-1/2" />
              </div>
            </div>
          ))
        ) : (
          // Beautiful recipe cards
          filteredRecommendations.map((recipe) => {
            const totalMins = (recipe.preparation_time || 0) + (recipe.cooking_time || 0);
            const image = recipesService.getCardImage(recipe.image_url);
            const rating = typeof recipe.average_rating === 'number' ? recipe.average_rating : 0;
            const hasSteps = recipe.steps && recipe.steps.length > 0;
            const stepCount = hasSteps ? recipe.steps.length : 0;
            
            return (
              <RecipeCard
                key={recipe.id}
                id={String(recipe.id)}
                title={recipe.title}
                image={image}
                rating={Number(rating.toFixed ? rating.toFixed(1) : rating)}
                feedbackCount={recipe.total_feedbacks}
                cookTime={totalMins ? formatCookingTime(totalMins) : "-"}
                servings={recipe.servings || 0}
                difficulty={recipe.difficulty_level as any || "Medium"}
                tags={[recipe.cuisine_type, recipe.difficulty_level].filter(Boolean) as string[]}
                description={recipe.description || ""}
                saved={recipe.is_saved || false}
                hasSteps={hasSteps}
                stepCount={stepCount}
                creatorName={recipe.creator ? (recipe.creator.name || recipe.creator.username) : undefined}
                creatorImage={recipe.creator?.profile_image_url}
              />
            );
          })
        )}
      </div>
      </>
    );
  }

  // Full mode for use in home page (with header and wrapper)
  return (
    <div className="mb-8">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">
            {t('home.forYou') || 'For you'}
          </h2>
          {!loading && (
            <span className="text-sm text-muted-foreground">
              {filteredRecommendations.length}
            </span>
          )}
        </div>
        <Link to="/discover">
          <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full text-xs font-medium hover:bg-accent/50">
            {t('home.seeAll') || 'See all'}
          </Button>
        </Link>
      </div>

      {/* Recipe Grid - Apple-inspired clean layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          // Elegant loading skeletons
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-muted to-muted/50" />
              <div className="space-y-2.5 px-1">
                <div className="h-5 bg-muted rounded-lg w-3/4" />
                <div className="h-4 bg-muted/60 rounded-lg w-1/2" />
              </div>
            </div>
          ))
        ) : (
          // Beautiful recipe cards
          filteredRecommendations.map((recipe) => {
            const totalMins = (recipe.preparation_time || 0) + (recipe.cooking_time || 0);
            const image = recipesService.getCardImage(recipe.image_url);
            const rating = typeof recipe.average_rating === 'number' ? recipe.average_rating : 0;
            const hasSteps = recipe.steps && recipe.steps.length > 0;
            const stepCount = hasSteps ? recipe.steps.length : 0;
            
            return (
              <RecipeCard
                key={recipe.id}
                id={String(recipe.id)}
                title={recipe.title}
                image={image}
                rating={Number(rating.toFixed ? rating.toFixed(1) : rating)}
                feedbackCount={recipe.total_feedbacks}
                cookTime={totalMins ? formatCookingTime(totalMins) : "-"}
                servings={recipe.servings || 0}
                difficulty={recipe.difficulty_level as any || "Medium"}
                tags={[recipe.cuisine_type, recipe.difficulty_level].filter(Boolean) as string[]}
                description={recipe.description || ""}
                saved={recipe.is_saved || false}
                hasSteps={hasSteps}
                stepCount={stepCount}
                creatorName={recipe.creator ? (recipe.creator.name || recipe.creator.username) : undefined}
                creatorImage={recipe.creator?.profile_image_url}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
