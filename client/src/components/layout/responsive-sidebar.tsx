import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PieChart, 
  PlusCircle, 
  MinusCircle, 
  Gem, 
  BarChart3, 
  Bell, 
  Wallet, 
  Calendar, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  PiggyBank,
  CreditCard,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  description?: string;
}

const navigation: NavigationItem[] = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: Home, 
    color: "text-blue-500",
    description: "Overview of your finances"
  },
  { 
    name: "Income", 
    href: "/income", 
    icon: TrendingUp, 
    color: "text-green-500",
    description: "Track your earnings"
  },
  { 
    name: "Expenses", 
    href: "/expenses", 
    icon: TrendingDown, 
    color: "text-red-500",
    description: "Monitor your spending"
  },
  { 
    name: "Transactions", 
    href: "/transactions", 
    icon: ArrowUpDown, 
    color: "text-blue-500",
    description: "All financial activity"
  },
  { 
    name: "Assets", 
    href: "/assets", 
    icon: PiggyBank, 
    color: "text-purple-500",
    description: "Manage your investments"
  },
  { 
    name: "Accounts", 
    href: "/accounts", 
    icon: Wallet, 
    color: "text-amber-500",
    description: "Bank accounts & cards"
  },
  { 
    name: "Bills & Reminders", 
    href: "/bills", 
    icon: CreditCard, 
    color: "text-orange-500",
    badge: { label: "3", variant: "destructive" },
    description: "Upcoming payments"
  },
  { 
    name: "Planner", 
    href: "/planner", 
    icon: Calculator, 
    color: "text-indigo-500",
    description: "Financial planning tools"
  },
  { 
    name: "Invoice Viewer", 
    href: "/invoices", 
    icon: FileText, 
    color: "text-teal-500",
    description: "View and manage invoices"
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: BarChart3, 
    color: "text-gray-500",
    description: "Analytics and insights"
  },
];

interface ResponsiveSidebarProps {
  className?: string;
}

export default function ResponsiveSidebar({ className }: ResponsiveSidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const { 
    isMobile, 
    isVerySmallScreen, 
    windowSize,
    isCompactLayout 
  } = useResponsiveDashboard();

  // Auto-collapse on smaller desktop screens
  useEffect(() => {
    if (!isMobile && windowSize.width < 1200 && windowSize.width > 1024) {
      setIsCollapsed(true);
    } else if (!isMobile && windowSize.width >= 1200) {
      setIsCollapsed(false);
    }
  }, [windowSize.width, isMobile]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const renderNavigationItem = (item: NavigationItem, isCollapsed: boolean = false) => {
    const isActive = location === item.href;
    const Icon = item.icon;

    return (
      <Link key={item.name} href={item.href}>
        <div
          className={cn(
            "flex items-center rounded-lg font-medium transition-all duration-200 cursor-pointer group relative",
            isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3 space-x-3",
            isActive
              ? "text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
          )}
          title={isCollapsed ? item.name : undefined}
        >
          <div className="relative flex items-center">
            <Icon 
              size={isCollapsed ? 20 : 18} 
              className={cn(
                "transition-colors",
                isActive ? "text-blue-500" : item.color
              )} 
            />
            {item.badge && (
              <Badge 
                variant={item.badge.variant || "default"}
                className={cn(
                  "absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs",
                  isCollapsed ? "scale-75" : ""
                )}
              >
                {item.badge.label}
              </Badge>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <Badge 
                  variant={item.badge.variant || "default"}
                  className="ml-auto text-xs"
                >
                  {item.badge.label}
                </Badge>
              )}
            </div>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {item.name}
              {item.description && (
                <div className="text-xs text-gray-300 mt-1">
                  {item.description}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  // Mobile Sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-800 shadow-md"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside className={cn(
          "fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}>
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Wallet className="text-white" size={16} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  SpendTrack
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => renderNavigationItem(item, false))}
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                SpendTrack v1.0.0
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside className={cn(
      "bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 hidden lg:flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Desktop Header */}
      <div className={cn(
        "flex items-center border-b border-gray-200 dark:border-gray-700 transition-all duration-300",
        isCollapsed ? "p-3 justify-center" : "p-4 justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wallet className="text-white" size={16} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              SpendTrack
            </h2>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={cn(
            "h-8 w-8 transition-transform duration-200",
            isCollapsed ? "rotate-180" : ""
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={16} />
        </Button>
      </div>

      {/* Desktop Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        isCollapsed ? "p-2 space-y-1" : "p-4 space-y-2"
      )}>
        {navigation.map((item) => renderNavigationItem(item, isCollapsed))}
      </nav>

      {/* Desktop Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            SpendTrack v1.0.0
          </div>
        </div>
      )}
    </aside>
  );
}