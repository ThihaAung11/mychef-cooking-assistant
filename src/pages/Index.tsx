import ChatInterface from "@/components/ChatInterface";
import FeaturedRecipes from "@/components/FeaturedRecipes";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/burmese-kitchen-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle pattern-overlay">
      <Navigation />
      
      {/* Main Content */}
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden mb-12">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Burmese Kitchen" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-warm bg-clip-text text-transparent">မြန်မာ</span>
              <br />
              <span className="text-foreground">Culinary Journey</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover authentic Burmese recipes with your personal AI cooking assistant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-warm text-primary-foreground rounded-full font-semibold text-lg shadow-warm hover:shadow-lg transition-all duration-300 hover:scale-105">
                Start Cooking
              </button>
              <button className="px-8 py-3 bg-background/80 backdrop-blur-sm text-foreground border border-border rounded-full font-semibold text-lg hover:bg-background transition-all duration-300">
                Explore Recipes
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {/* Chat Interface Section */}
          <section className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-gentle overflow-hidden h-[600px]">
                <ChatInterface />
              </div>
            </div>
            
            {/* Quick Tips Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-warm p-6 rounded-2xl text-primary-foreground">
                <h3 className="font-semibold mb-3">💡 Cooking Tip</h3>
                <p className="text-sm opacity-95">
                  For authentic Mohinga, toast the rice powder until fragrant. This adds depth to the broth's flavor.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h3 className="font-semibold mb-3 text-accent">🌿 Ingredient Spotlight</h3>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Nga Pi (Fish Paste)</strong> - Essential for authentic Burmese flavors. A little goes a long way!
                </p>
              </div>

              <div className="bg-gradient-earth p-6 rounded-2xl text-secondary-foreground">
                <h3 className="font-semibold mb-3">📚 Did You Know?</h3>
                <p className="text-sm opacity-95">
                  Burmese cuisine uses over 40 different spices and herbs, each contributing unique flavors and health benefits.
                </p>
              </div>
            </div>
          </section>

          {/* Featured Recipes */}
          <section>
            <FeaturedRecipes />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
