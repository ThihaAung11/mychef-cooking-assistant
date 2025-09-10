import Navigation from "@/components/Navigation";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-4xl px-4">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="text-muted-foreground">This is a placeholder profile page. We can add account details and preferences here.</p>
        </div>
      </main>
    </div>
  );
}
