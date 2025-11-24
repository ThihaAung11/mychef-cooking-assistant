import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Users, ChefHat } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";

export default function AdminAnalytics() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      const [sessions, analytics] = await Promise.all([
        adminService.analytics.getCookingSessions(),
        adminService.analytics.getCookingAnalytics(days),
      ]);
      setSessions(sessions);
      setAnalytics(analytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform statistics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={days === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(7)}
          >
            7 Days
          </Button>
          <Button
            variant={days === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(30)}
          >
            30 Days
          </Button>
          <Button
            variant={days === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(90)}
          >
            90 Days
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="glass-card p-8 text-center text-muted-foreground">
          Loading analytics...
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <h3 className="text-3xl font-bold mt-2">{sessions.length}</h3>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {sessions.filter(s => s.completed).length}
                  </h3>
                </div>
                <ChefHat className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {new Set(sessions.map(s => s.user_id)).size}
                  </h3>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Duration</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length) || 0}m
                  </h3>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card className="glass-card">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recent Cooking Sessions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left text-sm font-medium">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Recipe</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Started</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 10).map((session) => (
                    <tr key={session.id} className="border-b hover:bg-accent/50">
                      <td className="px-6 py-4">{session.user_name || 'User'}</td>
                      <td className="px-6 py-4 font-medium">{session.recipe_title}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(session.started_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            session.completed
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                          }`}
                        >
                          {session.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{session.duration || 0} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
