import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { createLoginUrl } from "@/lib/auth-utils";
import Header from "@/components/layout/header";
import ResponsiveHeader from "@/components/layout/responsive-header";
import EnhancedMobileHeader from "@/components/layout/enhanced-mobile-header";
import ResponsiveStatusBar from "@/components/layout/responsive-status-bar";
import ResponsiveSidebar from "@/components/layout/responsive-sidebar";
import ResponsiveBottomNav from "@/components/layout/responsive-bottom-nav";
import EnhancedBottomNav from "@/components/layout/enhanced-bottom-nav";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNav from "@/components/layout/bottom-nav";
import FloatingActionButton from "@/components/ui/floating-action-button";
import Dashboard from "./pages/dashboard";
import Income from "./pages/income";
import Expenses from "./pages/expenses";
import Transactions from "./pages/transactions";
import Assets from "./pages/assets";
import Accounts from "./pages/accounts";
import Bills from "./pages/bills";
import Planner from "./pages/planner";
import Invoices from "./pages/invoices";
import Reports from "./pages/reports";
import Savings from "./pages/savings";
import AuthPage from "./pages/auth";
import NotFound from "./pages/not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";
import { cn } from "@/lib/utils";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      {/* <Route path="/dashboard" component={Dashboard} /> */}
      <Route path="/income" component={Income} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/assets" component={Assets} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/bills" component={Bills} />
      <Route path="/planner" component={Planner} />
      <Route path="/savings" component={Savings} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/reports" component={Reports} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { theme, toggleTheme } = useTheme();
  const { isMobile, config } = useEnhancedMobile();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Mobile Header for mobile, Responsive Header for desktop */}
      {isMobile ? (
        <EnhancedMobileHeader 
          theme={theme} 
          toggleTheme={toggleTheme}
          searchable={true}
        />
      ) : (
        <ResponsiveHeader theme={theme} toggleTheme={toggleTheme} />
      )}
      
      <div className="flex flex-1 min-h-0">
        {!isMobile && <ResponsiveSidebar />}
        <main className={cn(
          "flex-1 flex flex-col min-h-0",
          config.containerPadding,
          isMobile ? "pb-20" : "pb-6"
        )}>
          <div className="flex-1 min-h-0">
            <Router />
          </div>
        </main>
      </div>
      
      {/* Enhanced Bottom Navigation for Mobile */}
      {isMobile ? (
        <EnhancedBottomNav 
          showLabels={!config.isVerySmall}
          showFAB={true}
        />
      ) : (
        <ResponsiveBottomNav />
      )}
      
      {/* Responsive Status Bar */}
      <ResponsiveStatusBar showDebugInfo={process.env.NODE_ENV === 'development'} />
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
