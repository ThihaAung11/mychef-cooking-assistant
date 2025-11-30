import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChefHat, Users, MessageSquare, TrendingUp, Eye, EyeOff } from "lucide-react";
import { adminService } from "@/services/admin.service";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    publicRecipes: 0,
    privateRecipes: 0,
    totalUsers: 0,
    totalFeedbacks: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [recipes, usersData, feedbacks, sessions] = await Promise.all([
        adminService.recipes.list(),
        adminService.users.listWithTotal(),
        adminService.feedbacks.list(),
        adminService.analytics.getCookingSessions(),
      ]);

      const publicRecipes = recipes.filter(recipe => recipe.is_public).length;
      const privateRecipes = recipes.filter(recipe => !recipe.is_public).length;

      setStats({
        totalRecipes: recipes.length || 0,
        publicRecipes,
        privateRecipes,
        totalUsers: usersData.total || 0, // Use total from API response
        totalFeedbacks: feedbacks.length || 0,
        totalSessions: sessions.length || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Set default values on error
      setStats({
        totalRecipes: 0,
        publicRecipes: 0,
        privateRecipes: 0,
        totalUsers: 0,
        totalFeedbacks: 0,
        totalSessions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: ChefHat, label: 'Total Recipes', value: stats.totalRecipes, color: 'text-primary' },
    { icon: Eye, label: 'Public Recipes', value: stats.publicRecipes, color: 'text-green-500' },
    { icon: EyeOff, label: 'Private Recipes', value: stats.privateRecipes, color: 'text-orange-500' },
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500' },
    { icon: MessageSquare, label: 'Total Feedbacks', value: stats.totalFeedbacks, color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Cooking Sessions', value: stats.totalSessions, color: 'text-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to MyChef Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-full bg-accent ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/recipes"
            className="p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <ChefHat className="h-5 w-5 mb-2 text-primary" />
            <h3 className="font-medium">Manage Recipes</h3>
            <p className="text-sm text-muted-foreground">Add, edit, or delete recipes</p>
          </a>
          <a
            href="/admin/users"
            className="p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <Users className="h-5 w-5 mb-2 text-blue-500" />
            <h3 className="font-medium">Manage Users</h3>
            <p className="text-sm text-muted-foreground">View and manage user accounts</p>
          </a>
          <a
            href="/admin/analytics"
            className="p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <TrendingUp className="h-5 w-5 mb-2 text-purple-500" />
            <h3 className="font-medium">View Analytics</h3>
            <p className="text-sm text-muted-foreground">Check platform statistics</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
