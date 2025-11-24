import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { User, LoginRequest } from "@/types/api.types";
import { formatApiError } from "@/lib/api-utils";
import { toast } from "@/hooks/use-toast";

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize: Check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get stored user first
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
          
          // Then fetch fresh user data in background
          try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
          } catch (error) {
            // Token might be expired, logout
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const { user: loggedInUser } = await authService.login(credentials);
      setUser(loggedInUser);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${loggedInUser.username}`,
      });
    } catch (error: any) {
      const errorMsg = formatApiError(error);
      toast({
        title: "Login failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = useMemo(
    () => ({ 
      isAuthenticated: !!user, 
      user, 
      login, 
      logout, 
      loading,
      refreshUser 
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
