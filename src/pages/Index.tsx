import ChatInterface from "@/components/ChatInterface";
import FeaturedRecipes from "@/components/FeaturedRecipes";
import Navigation from "@/components/Navigation";
import RecipeCard from "@/components/RecipeCard";
import ForYouSection from "@/components/ForYouSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/burmese-kitchen-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { cookingSessionService } from "@/services/cooking-session.service";
import { recipesService } from "@/services/recipes.service";
import { collectionsService } from "@/services/collections.service";
import { Clock, ChefHat, TrendingUp, Play, History, MessageCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCookingTime } from "@/lib/api-utils";
import type { CookingSession, Recipe, RecipeCollection } from "@/types/api.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Fetch cooking sessions for logged-in users
  const { data: sessions = [] } = useQuery<CookingSession[]>({
    queryKey: ["cooking-sessions"],
    queryFn: () => cookingSessionService.list(),
    enabled: !!user,
    retry: false,
    meta: {
      errorMessage: 'Failed to load cooking sessions'
    }
  });

  // Fetch recommended recipes for logged-in users
  const { data: recommended = [] } = useQuery<Recipe[]>({
    queryKey: ["recommended-recipes"],
    queryFn: () => recipesService.search({ page_size: 6 }),
    enabled: !!user,
    retry: false,
    meta: {
      errorMessage: 'Failed to load recommendations'
    }
  });

  // Fetch collections for meal plan
  const { data: collections = [] } = useQuery<RecipeCollection[]>({
    queryKey: ["collections"],
    queryFn: () => collectionsService.list(),
    enabled: !!user,
    retry: false,
  });

  const latestSession = sessions[0];
  const recentSessions = sessions.slice(0, 3);

  // Get today's meal plan
  const todaysMeal = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const mealCollections = collections.filter(c => c.collection_type === 'meal_plan');
    
    for (const collection of mealCollections) {
      if (collection.items) {
        const todaysRecipes = collection.items.filter(
          item => item.day_of_week?.toLowerCase() === today.toLowerCase()
        );
        if (todaysRecipes.length > 0) {
          return {
            collection,
            recipes: todaysRecipes
          };
        }
      }
    }
    return null;
  }, [collections]);

  // If user is logged in, show personalized dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 md:pt-20 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            {/* Today's Meal Plan - If exists */}
            {todaysMeal && (
              <div className="pt-6 pb-4">
                <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-primary/10 border-primary/30">
                              {t('index.todaysPlan')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {t('index.from')} {todaysMeal.collection.name}
                            </span>
                          </div>
                          <h3 className="font-semibold text-base">
                            {todaysMeal.recipes.length === 1 
                              ? todaysMeal.recipes[0].recipe?.title 
                              : `${todaysMeal.recipes.length} ${t('index.mealsPlanned')}`}
                          </h3>
                          {todaysMeal.recipes.length === 1 && todaysMeal.recipes[0].meal_type && (
                            <p className="text-sm text-muted-foreground capitalize">
                              {todaysMeal.recipes[0].meal_type}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="h-8" asChild>
                            <Link to={`/recipes/${todaysMeal.recipes[0].recipe_id}`}>
                              {t('index.startCooking')}
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8" asChild>
                            <Link to={`/collections/${todaysMeal.collection.id}`}>
                              {t('index.viewPlan')}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Hero Section - AI Chat Focus */}
            <div className={`text-center space-y-6 ${todaysMeal ? 'py-8 md:py-12' : 'py-12 md:py-16'}`}>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                  {todaysMeal ? t('index.orAskAnything') : t('index.whatToCook')}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                  {todaysMeal ? t('index.lookingDifferent') : t('index.askAboutCuisine')}
                </p>
              </div>

              {/* Large Chat Input - Apple Style */}
              <div className="max-w-2xl mx-auto">
                <Link to="/chat" className="block">
                  <div className="group relative">
                    <Input
                      placeholder={t('index.searchPlaceholder')}
                      className="h-14 md:h-16 text-base md:text-lg pl-6 pr-14 rounded-2xl border-2 hover:border-primary/50 focus:border-primary transition-all shadow-sm hover:shadow-md cursor-pointer"
                      readOnly
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Quick Action Chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                <Link to="/chat?q=chicken">
                  <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-sm hover:bg-primary/5 hover:border-primary/50">
                    🐔 {t('index.useChicken')}
                  </Button>
                </Link>
                <Link to="/chat?q=quick">
                  <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-sm hover:bg-primary/5 hover:border-primary/50">
                    ⏰ {t('index.quickMeals')}
                  </Button>
                </Link>
                <Link to="/chat?q=spicy">
                  <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-sm hover:bg-primary/5 hover:border-primary/50">
                    🌶️ {t('index.spicyDishes')}
                  </Button>
                </Link>
                <Link to="/chat?q=healthy">
                  <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-sm hover:bg-primary/5 hover:border-primary/50">
                    🥗 {t('index.healthy')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Continue Cooking Banner - Prominent if Active */}
            {latestSession && !latestSession.ended_at && (
              <div className="mb-8">
                <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:shadow-lg transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                            {t('index.active')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{t('index.continueWhereLeft')}</span>
                        </div>
                        <h3 className="text-xl font-semibold">{latestSession.recipe?.title || 'Recipe'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('index.started')} {new Date(latestSession.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="lg" className="rounded-full shadow-md hover:shadow-lg" asChild>
                        <Link to={`/recipes/${latestSession.recipe_id}`}>
                          {t('index.resumeCooking')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* For You - AI-Powered Recommendations */}
            <ForYouSection />

            {/* Secondary Actions - Subtle, Below Fold */}
            <div className="pt-8 border-t space-y-4">
              <p className="text-sm text-muted-foreground text-center">{t('index.needMore')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/collections">
                  <Card className="p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer group">
                    <div className="space-y-2">
                      <div className="text-2xl group-hover:scale-110 transition-transform">📅</div>
                      <p className="text-sm font-medium">{t('index.mealPlans')}</p>
                    </div>
                  </Card>
                </Link>
                <Link to="/my-kitchen">
                  <Card className="p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer group">
                    <div className="space-y-2">
                      <div className="text-2xl group-hover:scale-110 transition-transform">👨‍🍳</div>
                      <p className="text-sm font-medium">{t('index.myKitchen')}</p>
                    </div>
                  </Card>
                </Link>
                <Link to="/create-recipe">
                  <Card className="p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer group">
                    <div className="space-y-2">
                      <div className="text-2xl group-hover:scale-110 transition-transform">✍️</div>
                      <p className="text-sm font-medium">{t('index.createRecipe')}</p>
                    </div>
                  </Card>
                </Link>
                <Link to="/discover">
                  <Card className="p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer group">
                    <div className="space-y-2">
                      <div className="text-2xl group-hover:scale-110 transition-transform">🔍</div>
                      <p className="text-sm font-medium">{t('index.browseAll')}</p>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Stats - Minimal Footer */}
            {sessions.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('index.youCooked')} <span className="font-semibold text-foreground">{sessions.length}</span> {sessions.length === 1 ? t('common.recipe') : t('common.recipes')}
                  </p>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/my-recipes">{t('index.viewHistory')}</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Non-logged-in users see enhanced welcome/guide page
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        {/* Hero Section - Centered, Simple */}
        <section className="relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
                {t('index.aiCookingAssistant').split(' Myanmar ')[0]}<br />assistant for<br />
                <span className="bg-gradient-warm bg-clip-text text-transparent">Myanmar cuisine</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('index.fromQuestionToDinner')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button asChild size="lg" className="rounded-full h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                <Link to="/register">{t('index.getStarted')}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full h-12 px-8 text-base">
                <Link to="/login">{t('index.signIn')}</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <p className="text-sm text-muted-foreground pt-4">
              {t('index.joinHomeCooks')}
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 space-y-16 py-12">
          {/* 3 Key Features - Apple Grid Style */}
          <section className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="text-5xl mb-2">🤖</div>
              <h3 className="text-xl font-semibold">{t('index.aiAssistant')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('index.aiAssistantDesc')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-5xl mb-2">👨‍🍳</div>
              <h3 className="text-xl font-semibold">{t('index.stepByStep')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('index.stepByStepDesc')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-5xl mb-2">📅</div>
              <h3 className="text-xl font-semibold">{t('index.mealPlanning')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('index.mealPlanningDesc')}
              </p>
            </div>
          </section>

          {/* Popular Dishes - Simple */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">{t('index.tryRecipes')}</h2>
              <p className="text-muted-foreground">{t('index.popularDishes')}</p>
            </div>
            <FeaturedRecipes />
          </section>

          {/* Simple CTA */}
          <section className="text-center space-y-4 py-8">
            <Button asChild size="lg" className="rounded-full h-14 px-10 text-base shadow-lg hover:shadow-xl transition-all">
              <Link to="/register">{t('index.startCookingToday')}</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('index.freeToUse')}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
