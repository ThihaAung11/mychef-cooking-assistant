import { useMemo, useState } from "react";
import { Search, Filter, X, ChevronDown, Clock, Leaf, Flame } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";

// Mock recipe data (images use placeholder for now)
const placeholder = "/placeholder.svg";

const ALL_RECIPES = [
  {
    id: "r1",
    title: "Chicken Curry (Kyethar Hin)",
    image: placeholder,
    rating: 4.7,
    cookTime: "45m",
    servings: 4,
    difficulty: "Medium" as const,
    tags: ["Chicken", "Curry", "Spicy"],
    description: "Tender chicken simmered in aromatic Burmese curry base with turmeric and spices.",
  },
  {
    id: "r2",
    title: "Spicy Chicken Salad (Kyethar Thoke)",
    image: placeholder,
    rating: 4.5,
    cookTime: "20m",
    servings: 2,
    difficulty: "Easy" as const,
    tags: ["Chicken", "Salad", "Fresh"],
    description: "Bright and zesty salad with shredded chicken, herbs, and toasted chickpea powder.",
  },
  {
    id: "r3",
    title: "Tea Leaf Salad (Lahpet Thoke)",
    image: placeholder,
    rating: 4.8,
    cookTime: "30m",
    servings: 4,
    difficulty: "Easy" as const,
    tags: ["Vegetarian", "Salad", "Traditional"],
    description: "Iconic Burmese salad with fermented tea leaves, crunchy nuts and seeds.",
  },
  {
    id: "r4",
    title: "Shan Noodles (Shan Khaut Swe)",
    image: placeholder,
    rating: 4.7,
    cookTime: "40m",
    servings: 4,
    difficulty: "Medium" as const,
    tags: ["Noodles", "Chicken", "Shan"],
    description: "Savory noodles with rich broth and fragrant spices, a Shan State classic.",
  },
];

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

const DIETS = ["Vegetarian", "Vegan", "Gluten-Free"] as const;
const DIFFICULTY = ["Easy", "Medium", "Hard"] as const;

export default function Discover() {
  const [q, setQ] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [diet, setDiet] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [maxTime, setMaxTime] = useState<number>(60);
  const [chips, setChips] = useState<string[]>(["Trending", "Popular", "New"]);
  const [pageSize, setPageSize] = useState(6);

  const filtered = useMemo(() => {
    return ALL_RECIPES.filter((r) => {
      const inQuery = q
        ? r.title.toLowerCase().includes(q.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
        : true;
      const inDiet = diet.length === 0 ? true : diet.every((d) => r.tags.includes(d));
      const inDiff = difficulty.length === 0 ? true : difficulty.includes(r.difficulty);
      const timeNum = parseInt(r.cookTime);
      const inTime = isNaN(timeNum) ? true : timeNum <= maxTime;
      return inQuery && inDiet && inDiff && inTime;
    });
  }, [q, diet, difficulty, maxTime]);

  const shown = filtered.slice(0, pageSize);

  const toggleArray = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col gap-3 md:gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Discover Recipes</h1>
          <p className="text-muted-foreground">Explore trending Burmese dishes, filter by your taste, and get inspired.</p>

          {/* Search + Chips (mobile-first) */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative md:flex-1">
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                placeholder="Search ingredients or dishes (e.g., chicken, salad)"
                className="pl-10 h-11"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              {/* Live suggestions */}
              {showSuggest && (
                <Popover open={showSuggest} onOpenChange={setShowSuggest}>
                  <PopoverTrigger className="hidden" />
                  <PopoverContent align="start" className="w-full p-0">
                    <Command filter={(val, search) => (val.includes(search) ? 1 : 0)}>
                      <CommandInput placeholder="Type to search..." value={q} onValueChange={setQ} />
                      <CommandList>
                        <CommandEmpty>No suggestions found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                          {INGREDIENT_SUGGESTIONS.filter((s) => s.includes(q.toLowerCase())).map((s) => (
                            <CommandItem key={s} value={s} onSelect={() => setQ(s)}>
                              {s}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 overflow-x-auto md:overflow-visible">
              {chips.map((c) => (
                <Badge key={c} variant="secondary" className="shrink-0 px-3 py-1.5 cursor-pointer" onClick={() => setQ(c)}>
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar filters (visible on md+) */}
          <aside className="hidden md:block">
            <div className="rounded-xl border bg-card">
              <div className="p-4 flex items-center justify-between">
                <div className="font-semibold">Filters</div>
                <Button variant="ghost" size="sm" onClick={() => { setDiet([]); setDifficulty([]); setMaxTime(60); }}>
                  <X className="w-4 h-4 mr-2" /> Reset
                </Button>
              </div>
              <Separator />

              <div className="p-4 space-y-6">
                {/* Diet */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium">Diet</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DIETS.map((d) => (
                      <Badge
                        key={d}
                        className={`cursor-pointer ${diet.includes(d) ? "bg-green-600 text-white" : "bg-muted"}`}
                        onClick={() => toggleArray(diet, d, setDiet)}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <h4 className="font-medium">Difficulty</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY.map((d) => (
                      <Badge
                        key={d}
                        className={`cursor-pointer ${difficulty.includes(d) ? "bg-orange-500 text-white" : "bg-muted"}`}
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
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <h4 className="font-medium">Max Cook Time</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">{maxTime} min</span>
                  </div>
                  <Slider value={[maxTime]} onValueChange={(v) => setMaxTime(v[0])} min={10} max={120} step={5} />
                </div>
              </div>
            </div>
          </aside>

          {/* Results grid */}
          <section className="space-y-4">
            {/* Mobile Filters Row */}
            <div className="md:hidden flex items-center gap-2 -mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> Filters <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[calc(100vw-2rem)] p-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-6">
                      {/* Diet */}
                      <div>
                        <h4 className="font-medium mb-2">Diet</h4>
                        <div className="flex flex-wrap gap-2">
                          {DIETS.map((d) => (
                            <Badge
                              key={d}
                              className={`cursor-pointer ${diet.includes(d) ? "bg-green-600 text-white" : "bg-muted"}`}
                              onClick={() => toggleArray(diet, d, setDiet)}
                            >
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Difficulty */}
                      <div>
                        <h4 className="font-medium mb-2">Difficulty</h4>
                        <div className="flex flex-wrap gap-2">
                          {DIFFICULTY.map((d) => (
                            <Badge
                              key={d}
                              className={`cursor-pointer ${difficulty.includes(d) ? "bg-orange-500 text-white" : "bg-muted"}`}
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
                          <h4 className="font-medium">Max Cook Time</h4>
                          <span className="text-sm text-muted-foreground">{maxTime} min</span>
                        </div>
                        <Slider value={[maxTime]} onValueChange={(v) => setMaxTime(v[0])} min={10} max={120} step={5} />
                      </div>
                      <div className="pt-2">
                        <Button className="w-full" onClick={() => { /* close popover via click outside */ }}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{filtered.length} results</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shown.map((r) => (
                <RecipeCard key={r.id} {...r} />
              ))}
            </div>

            {shown.length < filtered.length && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={() => setPageSize((s) => s + 6)}>Load more</Button>
              </div>
            )}
          </section>
        </div>
      </div>
      </main>
    </div>
  );
}
