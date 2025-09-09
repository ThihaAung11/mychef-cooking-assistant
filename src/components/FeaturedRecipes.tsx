import RecipeCard from "./RecipeCard";
import mohingaImage from "@/assets/mohinga-dish.jpg";
import teaLeafSaladImage from "@/assets/tea-leaf-salad.jpg";
import shanKhautSweImage from "@/assets/shan-khaut-swe.jpg";

const featuredRecipes = [
  {
    id: "1",
    title: "Traditional Mohinga",
    image: mohingaImage,
    rating: 4.8,
    cookTime: "1h 30m",
    servings: 4,
    difficulty: "Medium" as const,
    tags: ["Traditional", "Fish", "Noodles", "Comfort Food"],
    description: "Myanmar's beloved national dish - a hearty fish noodle soup with rich, aromatic broth and fresh herbs."
  },
  {
    id: "2", 
    title: "Tea Leaf Salad (Lahpet Thoke)",
    image: teaLeafSaladImage,
    rating: 4.6,
    cookTime: "30m",
    servings: 6,
    difficulty: "Easy" as const,
    tags: ["Vegetarian", "Salad", "Traditional", "Healthy"],
    description: "A unique and flavorful salad made with fermented tea leaves, mixed with crunchy vegetables and nuts."
  },
  {
    id: "3",
    title: "Shan Khaut Swe",
    image: shanKhautSweImage,
    rating: 4.7,
    cookTime: "45m", 
    servings: 4,
    difficulty: "Medium" as const,
    tags: ["Noodles", "Shan", "Chicken", "Regional"],
    description: "Delicious Shan-style noodles with tender chicken in a rich, flavorful broth topped with fresh herbs."
  }
];

export default function FeaturedRecipes() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Featured Burmese Dishes</h2>
        <p className="text-muted-foreground">Discover authentic flavors from Myanmar's rich culinary heritage</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} {...recipe} />
        ))}
      </div>
    </div>
  );
}