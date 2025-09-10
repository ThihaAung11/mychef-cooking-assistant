import Navigation from "@/components/Navigation";

export default function MyRecipes() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h1 className="text-2xl font-bold mb-4">My Recipes</h1>
          <p className="text-muted-foreground">Save your favorite recipes and drafts here. (Placeholder content)</p>
        </div>
      </main>
    </div>
  );
}
