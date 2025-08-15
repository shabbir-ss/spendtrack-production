import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { createLoginUrl } from "@/lib/auth-utils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNav from "@/components/layout/bottom-nav";
import FloatingActionButton from "@/components/ui/floating-action-button";
import Dashboard from "./pages/dashboard";
import Income from "./pages/income";
import Expenses from "./pages/expenses";
import Assets from "./pages/assets";
import Accounts from "./pages/accounts";
import Bills from "./pages/bills";
import Reports from "./pages/reports";
import AuthPage from "./pages/auth";
import NotFound from "./pages/not-found";
import { Skeleton } from "@/components/ui/skeleton";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      {/* <Route path="/dashboard" component={Dashboard} /> */}
      <Route path="/income" component={Income} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/assets" component={Assets} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/bills" component={Bills} />
      <Route path="/reports" component={Reports} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header theme={theme} toggleTheme={toggleTheme} />
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader theme={theme} toggleTheme={toggleTheme} />
      </div>
      
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20 lg:pb-6">
          {/* Legacy mobile nav - can be removed after testing */}
          <div className="hidden">
            <MobileNav />
          </div>
          <Router />
        </main>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
      
      {/* Floating Action Button */}
      {/* <FloatingActionButton /> */}
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading SpendTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If user is trying to access a protected route, redirect to login with return URL
    if (location !== '/auth' && !location.startsWith('/auth?')) {
      const loginUrl = createLoginUrl(location);
      setLocation(loginUrl);
      return null; // Prevent flash of auth page
    }
    return <AuthPage />;
  }

  // If user is authenticated but on auth page, redirect to dashboard
  if (isAuthenticated && (location === '/auth' || location.startsWith('/auth?'))) {
    setLocation('/');
    return null; // Prevent flash of auth page
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
