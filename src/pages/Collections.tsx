import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { collectionsService } from "@/services/collections.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { 
  BookOpen, Plus, Loader2, Calendar, Heart, 
  FolderOpen, ChevronRight, Utensils, X
} from "lucide-react";
import type { RecipeCollection, CreateCollectionRequest } from "@/types/api.types";

export default function Collections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    collection_type: "custom" as "meal_plan" | "favorites" | "custom",
    is_public: false,
  });

  // Fetch collections
  const { data: collections, isLoading } = useQuery<RecipeCollection[]>({
    queryKey: ["collections"],
    queryFn: () => collectionsService.list(),
  });

  // Create collection mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCollectionRequest) => collectionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({ title: "Success!", description: "Collection created successfully" });
      setShowModal(false);
      setFormData({ name: "", description: "", collection_type: "custom", is_public: false });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create collection",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

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
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="pt-16 md:pt-20 pb-24 md:pb-12 relative z-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 relative z-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  My Collections
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base ml-[60px]">
                  Organize your recipes into collections and meal plans
                </p>
              </div>
              <Button 
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("New Collection button clicked!");
                  setShowModal(true);
                }}
                className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all text-base h-12 px-6 relative z-30 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                type="button"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Collection
              </Button>
            </div>
          </div>

          {/* Collections Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !collections || collections.length === 0 ? (
            <Card className="text-center py-20 shadow-lg">
              <CardContent className="space-y-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
                  <p className="text-muted-foreground text-base max-w-md mx-auto">
                    Create your first collection to organize recipes and plan your meals
                  </p>
                </div>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Empty state button clicked!");
                    setShowModal(true);
                  }}
                  size="lg"
                  className="shadow-xl hover:shadow-2xl h-12 px-8 text-base relative z-20 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                  type="button"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {collections.map((collection) => (
                <Link 
                  key={collection.id}
                  to={`/collections/${collection.id}`}
                  className="block h-full group relative z-20 no-underline"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => {
                    console.log("Card clicked!", collection.id);
                  }}
                >
                  <Card className="h-full hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer"
                    style={{ pointerEvents: 'auto' }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-all shadow-sm">
                            {getIcon(collection.collection_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                              {collection.name}
                            </CardTitle>
                          </div>
                        </div>
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                          <ChevronRight className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {getBadge(collection.collection_type)}
                        {collection.is_public && <Badge variant="outline" className="text-xs">🌐 Public</Badge>}
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Utensils className="w-3 h-3" />
                          {collection.items?.length || 0}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {collection.description && (
                        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                          {collection.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm pt-4 border-t">
                        <span className="text-muted-foreground text-xs font-medium">
                          Created {new Date(collection.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                          <span className="text-sm">View</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Create Collection</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Organize your favorite recipes
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowModal(false)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Collection Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Week of Nov 4, Quick Dinners"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this collection for?"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-semibold">Collection Type</Label>
                  <Select
                    value={formData.collection_type}
                    onValueChange={(value: any) => setFormData({ ...formData, collection_type: value })}
                  >
                    <SelectTrigger id="type" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom" className="text-sm">
                        📁 Custom Collection
                      </SelectItem>
                      <SelectItem value="meal_plan" className="text-sm">
                        📅 Meal Plan
                      </SelectItem>
                      <SelectItem value="favorites" className="text-sm">
                        ❤️ Favorites
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-6 border-t bg-muted/20 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 h-10 shadow-lg hover:shadow-xl"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
