import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ChefHat, 
  Users, 
  MessageSquare, 
  LineChart, 
  Bot,
  LogOut,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ChefHat, label: 'Recipes', href: '/admin/recipes' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: MessageSquare, label: 'Feedbacks', href: '/admin/feedbacks' },
  { icon: LineChart, label: 'Analytics', href: '/admin/analytics' },
  { icon: Bot, label: 'AI Management', href: '/admin/ai' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r backdrop-blur-xl bg-background/80 dark:bg-background/90">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b p-6">
            <Link to="/admin" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">MyChef</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="border-t p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="flex-1 justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
