import { useEffect, useMemo, useState } from "react";
import { Search, Filter, X, ChevronDown, Clock, Leaf, Flame } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import ForYouSection from "@/components/ForYouSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { recipesService, RecipeSearchParams } from "@/services/recipes.service";
import { formatCookingTime } from "@/lib/api-utils";
import { savedRecipesService } from "@/services/saved-recipes.service";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

// Placeholder for missing images
const placeholder = "/placeholder.svg";

const INGREDIENT_SUGGESTIONS = [
  "chicken",
  "fish",
  "tofu",
  "noodles",
  "tea leaf",
  "turmeric",
  "garlic",
  "ginger",
];

const DIETS = ["omnivore", "vegetarian", "vegan"] as const;
const DIFFICULTY = ["Easy", "Medium", "Hard"] as const;

export default function Discover() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'foryou' | 'community'>('foryou');
  const [q, setQ] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [diet, setDiet] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [maxTime, setMaxTime] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [cuisine, setCuisine] = useState<string>("");
  const chips = [t('discover.trending'), t('discover.popular'), t('discover.quickMeals')];

  // Build search params for API
  const params: RecipeSearchParams = useMemo(() => {
    return {
      q: q || undefined,
      cuisine: cuisine || undefined,
      difficulty: difficulty[0] || undefined,
      max_time: maxTime > 0 ? maxTime : undefined,
      diet_type: diet[0] as any,
      include_private: false,
      page,
      page_size: pageSize,
    };
  }, [q, cuisine, difficulty, maxTime, diet, page, pageSize]);

  // Debounce search input to reduce requests
  const [debouncedParams, setDebouncedParams] = useState(params);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedParams(params), 300);
    return () => clearTimeout(id);
  }, [params]);

  const { data: recipes = [], isLoading, isFetching } = useQuery({
    queryKey: ["recipes", debouncedParams],
    queryFn: () => recipesService.search(debouncedParams),
  });

  // Reset to first page when filters change (excluding page/pageSize)
  useEffect(() => {
    setPage(1);
  }, [q, cuisine, difficulty, maxTime, diet]);

  const shown = recipes;

  const toggleArray = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  // Local saved map: recipeId -> savedId
  const [savedMap, setSavedMap] = useState<Record<string, string>>({});

  // Hydrate saved recipes on load if authenticated
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user) {
          setSavedMap({});
          return;
        }
        const list = await savedRecipesService.list();
        if (!mounted) return;
        const map: Record<string, string> = {};
        list.forEach((s) => {
          if (s.recipe_id) map[String(s.recipe_id)] = String(s.id);
          else if ((s as any).recipe?.id) map[String((s as any).recipe.id)] = String(s.id);
        });
        setSavedMap(map);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [user]);

  const handleSave = async (recipeId: string) => {
    const savedId = savedMap[recipeId];
    try {
      if (savedId) {
        // Unsave
        await savedRecipesService.delete(savedId);
        setSavedMap((m) => {
          const { [recipeId]: _, ...rest } = m;
          return rest;
        });
        toast({ title: t('discover.removed'), description: t('discover.recipeRemoved') });
      } else {
        // Save
        const res = await savedRecipesService.save(recipeId);
        setSavedMap((m) => ({ ...m, [recipeId]: String(res.id) }));
        toast({ title: t('discover.saved'), description: t('discover.recipeAdded') });
      }
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Unable to update saved recipes';
      toast({ title: t('discover.actionFailed'), description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-4 md:py-6">
        {/* Minimal Header with Toggle */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0 md:justify-between mb-4">
          {/* Segmented Control */}
          <div className="inline-flex items-center p-1 rounded-full bg-muted/50 backdrop-blur-sm border shadow-sm">
            <button
              onClick={() => setActiveTab('foryou')}
              className={`px-4 md:px-5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                activeTab === 'foryou'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ✨ {t('discover.forYou') || 'For You'}
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 md:px-5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                activeTab === 'community'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🌍 {t('discover.community') || 'Community'}
            </button>
          </div>

          {/* Distinct Search Bar */}
          <div className="relative w-full md:w-auto md:max-w-md md:ml-4">
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowSuggest(false); // Close suggestions when typing
              }}
              onFocus={() => setShowSuggest(false)}
              placeholder={t('discover.searchPlaceholder')}
              className="h-10 md:h-9 text-sm pl-10 md:pl-9 pr-10 md:pr-10 rounded-full border-2 border-primary/20 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            <Search className={`absolute left-3 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isFetching && activeTab === 'community' ? 'animate-pulse' : ''} text-primary pointer-events-none`} />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}

              {/* Live suggestions - Fixed positioning */}
              {showSuggest && q.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border rounded-lg shadow-lg overflow-hidden">
                  <Command className="rounded-lg border-0">
                    <CommandList className="max-h-64">
                      <CommandEmpty className="py-6 text-center text-sm">{t('discover.noSuggestions')}</CommandEmpty>
                      <CommandGroup heading={t('discover.suggestions')}>
                        {INGREDIENT_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q.toLowerCase())).map((s) => (
                          <CommandItem 
                            key={s} 
                            value={s} 
                            onSelect={(value) => {
                              setQ(value);
                              setShowSuggest(false);
                            }}
                            className="cursor-pointer"
                          >
                            {s}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>
        </div>

        {/* Unified Layout with Sidebar Filters */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
          {/* Sidebar filters (visible on md+) */}
          <aside className="hidden md:block">
            <div className="rounded-xl border bg-card shadow-sm sticky top-20">
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="font-medium text-xs">{t('discover.filters')}</div>
                <Button variant="ghost" size="sm" onClick={() => { setDiet([]); setDifficulty([]); setMaxTime(0); }} className="h-7 text-xs">
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Separator />

              <div className="p-3 space-y-4">
                {/* Diet */}
                <div>
                  <h4 className="font-medium text-xs mb-2 text-muted-foreground">{t('discover.diet')}</h4>
                  <div className="flex flex-wrap gap-1">
                    {DIETS.map((d) => (
                      <Badge
                        key={d}
                        className={`cursor-pointer text-xs px-2 py-0.5 ${
                          diet.includes(d) ? "bg-green-600 text-white" : "bg-muted hover:bg-muted/80"
                        }`}
                        onClick={() => toggleArray(diet, d, setDiet)}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <h4 className="font-medium text-xs mb-2 text-muted-foreground">{t('discover.difficulty')}</h4>
                  <div className="flex flex-wrap gap-1">
                    {DIFFICULTY.map((d) => (
                      <Badge
                        key={d}
                        className={`cursor-pointer text-xs px-2 py-0.5 ${
                          difficulty.includes(d) ? "bg-orange-500 text-white" : "bg-muted hover:bg-muted/80"
                        }`}
                        onClick={() => toggleArray(difficulty, d, setDifficulty)}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-xs text-muted-foreground">{t('discover.maxTime')}</h4>
                    <span className="text-xs text-muted-foreground">{maxTime > 0 ? `${maxTime}m` : t('discover.any')}</span>
                  </div>
                  <Slider value={[maxTime > 0 ? maxTime : 60]} onValueChange={(v) => setMaxTime(v[0])} min={10} max={120} step={5} className="cursor-pointer" />
                </div>
              </div>
            </div>
          </aside>

          {/* Content Section - Conditional based on tab */}
          <section className="space-y-4">
            {/* Mobile Filters Row - Shared by both tabs */}
            <div className="md:hidden mb-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 h-10 rounded-full border-2 shadow-sm">
                    <Filter className="w-4 h-4" /> 
                    <span className="font-medium">{t('discover.filters')}</span>
                    {(diet.length > 0 || difficulty.length > 0 || maxTime > 0) && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {diet.length + difficulty.length + (maxTime > 0 ? 1 : 0)}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[calc(100vw-2rem)] p-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-5">
                      {/* Diet */}
                      <div>
                        <h4 className="font-medium mb-2 text-sm">{t('discover.diet')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {DIETS.map((d) => (
                            <Badge
                              key={d}
                              className={`cursor-pointer text-xs px-2.5 py-1 ${
                                diet.includes(d) ? "bg-green-600 text-white" : "bg-muted hover:bg-muted/80"
                              }`}
                              onClick={() => toggleArray(diet, d, setDiet)}
                            >
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Difficulty */}
                      <div>
                        <h4 className="font-medium mb-2 text-sm">{t('discover.difficulty')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {DIFFICULTY.map((d) => (
                            <Badge
                              key={d}
                              className={`cursor-pointer text-xs px-2.5 py-1 ${
                                difficulty.includes(d) ? "bg-orange-500 text-white" : "bg-muted hover:bg-muted/80"
                              }`}
                              onClick={() => toggleArray(difficulty, d, setDifficulty)}
                            >
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Time */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{t('discover.maxCookTime')}</h4>
                          <span className="text-xs text-muted-foreground">{maxTime > 0 ? `${maxTime}m` : t('discover.any')}</span>
                        </div>
                        <Slider value={[maxTime > 0 ? maxTime : 60]} onValueChange={(v) => setMaxTime(v[0])} min={10} max={120} step={5} />
                      </div>
                      <div className="pt-2">
                        <Button className="w-full" variant="default">
                          {t('discover.apply') || 'Apply'}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            {activeTab === 'foryou' ? (
              /* For You - AI Recommendations */
              <ForYouSection 
                searchQuery={q}
                filters={{
                  diet,
                  difficulty,
                  maxTime
                }}
                compact
              />
            ) : (
              /* Community - All Recipes */
              <>
            {/* Results count with search indication */}
            {!isLoading && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground">
                  {shown.length > 0 ? (
                    <>
                      {shown.length} {shown.length === 1 ? 'recipe' : 'recipes'}
                      {q && <span className="ml-1">• searching for "{q}"</span>}
                    </>
                  ) : q ? (
                    `No recipes found for "${q}"`
                  ) : (
                    'No recipes found'
                  )}
                </p>
              </div>
            )}
            
            {/* Searching indicator */}
            {isFetching && (
              <div className="mb-3">
                <p className="text-xs text-primary animate-pulse">
                  Searching...
                </p>
              </div>
            )}

            {/* Grid with better spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Loading skeleton */}
              {isLoading && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="aspect-[4/3] bg-muted rounded-2xl" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {/* Empty state - Beautiful */}
              {!isLoading && shown.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('discover.noRecipes')}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {t('discover.tryAdjusting')}
                  </p>
                  <Button variant="outline" onClick={() => { setQ(''); setDiet([]); setDifficulty([]); setMaxTime(0); }}>
                    {t('discover.clearAllFilters')}
                  </Button>
                </div>
              )}
              {!isLoading && shown.map((r) => {
                const totalMins = (r.preparation_time || 0) + (r.cooking_time || 0);
                const image = recipesService.getCardImage(r.image_url);
                const rating = typeof r.average_rating === 'number' ? r.average_rating : 0;
                const hasSteps = r.steps && r.steps.length > 0;
                const stepCount = hasSteps ? r.steps!.length : 0;
                return (
                  <RecipeCard
                    key={r.id}
                    id={String(r.id)}
                    title={r.title}
                    image={image || placeholder}
                    rating={Number(rating.toFixed ? rating.toFixed(1) : rating)}
                    feedbackCount={typeof r.total_feedbacks === 'number' ? r.total_feedbacks : undefined}
                    cookTime={totalMins ? formatCookingTime(totalMins) : "-"}
                    prepMinutes={r.preparation_time || undefined}
                    cookMinutes={r.cooking_time || undefined}
                    servings={r.servings || 0}
                    difficulty={(r.difficulty_level as any) || "Medium"}
                    tags={[r.cuisine_type || "", r.difficulty_level || ""].filter(Boolean) as string[]}
                    description={r.description}
                    saved={!!savedMap[String(r.id)]}
                    onSave={handleSave}
                    hasSteps={hasSteps}
                    stepCount={stepCount}
                    creatorName={r.creator ? (r.creator.name || r.creator.username) : undefined}
                    creatorImage={r.creator?.profile_image_url}
                  />
                );
              })}
            </div>

            {!isLoading && shown.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  disabled={isFetching || page === 1}
                  className="h-9"
                >
                  {t('discover.previous')}
                </Button>
                <div className="text-sm font-medium text-muted-foreground px-3">{t('discover.page')} {page}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching || shown.length < pageSize}
                  className="h-9"
                >
                  {t('discover.next')}
                </Button>
              </div>
            )}
            </>
            )}
          </section>
        </div>
      </div>
      </main>
    </div>
  );
}
