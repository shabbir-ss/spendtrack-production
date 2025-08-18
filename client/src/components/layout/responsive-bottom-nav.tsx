import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  CreditCard,
  Plus,
  MoreHorizontal,
  PiggyBank,
  BarChart3,
  Wallet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  shortName: string;
  color: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  priority: number; // Lower number = higher priority
}

const allNavigation: NavigationItem[] = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: Home, 
    shortName: "Home",
    color: "text-blue-500",
    priority: 1
  },
  { 
    name: "Income", 
    href: "/income", 
    icon: TrendingUp, 
    shortName: "Income",
    color: "text-green-500",
    priority: 2
  },
  { 
    name: "Expenses", 
    href: "/expenses", 
    icon: TrendingDown, 
    shortName: "Expenses",
    color: "text-red-500",
    priority: 3
  },
  { 
    name: "Transactions", 
    href: "/transactions", 
    icon: ArrowUpDown, 
    shortName: "All",
    color: "text-blue-500",
    priority: 4
  },
  { 
    name: "Bills & Reminders", 
    href: "/bills", 
    icon: CreditCard, 
    shortName: "Bills",
    color: "text-orange-500",
    badge: { label: "3", variant: "destructive" },
    priority: 5
  },
  { 
    name: "Planner", 
    href: "/planner", 
    icon: Calculator, 
    shortName: "Planner",
    color: "text-indigo-500",
    priority: 6
  },
  { 
    name: "Assets", 
    href: "/assets", 
    icon: PiggyBank, 
    shortName: "Assets",
    color: "text-purple-500",
    priority: 7
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: BarChart3, 
    shortName: "Reports",
    color: "text-gray-500",
    priority: 8
  },
  { 
    name: "Accounts", 
    href: "/accounts", 
    icon: Wallet, 
    shortName: "Accounts",
    color: "text-amber-500",
    priority: 8
  },
];

interface ResponsiveBottomNavProps {
  className?: string;
}

export default function ResponsiveBottomNav({ className }: ResponsiveBottomNavProps) {
  const [location] = useLocation();
  const [showFAB, setShowFAB] = useState(false);
  
  const { 
    isMobile, 
    isVerySmallScreen, 
    windowSize 
  } = useResponsiveDashboard();

  // Determine how many items to show based on screen width
  const getMaxItems = () => {
    if (isVerySmallScreen) return 4; // Very small screens
    if (windowSize.width < 400) return 4; // Small phones
    return 5; // Standard mobile
  };

  const maxItems = getMaxItems();
  const primaryNavigation = allNavigation
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxItems - 1); // Reserve one slot for "More"
  
  const secondaryNavigation = allNavigation
    .sort((a, b) => a.priority - b.priority)
    .slice(maxItems - 1);

  // Show/hide FAB based on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowFAB(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMobile) return null;

  const renderNavItem = (item: NavigationItem, isInDropdown = false) => {
    const isActive = location === item.href;
    const Icon = item.icon;

    if (isInDropdown) {
      return (
        <DropdownMenuItem key={item.name} asChild>
          <Link href={item.href}>
            <div className="flex items-center space-x-3 w-full cursor-pointer">
              <Icon size={18} className={isActive ? "text-blue-500" : item.color} />
              <span className={cn(
                "flex-1",
                isActive ? "text-blue-600 dark:text-blue-400 font-medium" : ""
              )}>
                {item.name}
              </span>
              {item.badge && (
                <Badge variant={item.badge.variant || "default"} className="text-xs">
                  {item.badge.label}
                </Badge>
              )}
            </div>
          </Link>
        </DropdownMenuItem>
      );
    }

    return (
      <Link key={item.name} href={item.href}>
        <div
          className={cn(
            "flex flex-col items-center justify-center h-full space-y-1 transition-all duration-200 cursor-pointer relative px-1",
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          <div className="relative">
            <Icon size={isVerySmallScreen ? 18 : 20} />
            {item.badge && (
              <Badge 
                variant={item.badge.variant || "default"}
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs scale-75"
              >
                {item.badge.label}
              </Badge>
            )}
          </div>
          <span className={cn(
            "font-medium leading-tight text-center",
            isVerySmallScreen ? "text-xs" : "text-xs"
          )}>
            {item.shortName}
          </span>
          {isActive && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full" />
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-50 transition-transform duration-300",
        className
      )}>
        <div className={cn(
          "grid h-16 safe-area-pb",
          `grid-cols-${maxItems}`
        )}>
          {/* Primary Navigation Items */}
          {primaryNavigation.map((item) => renderNavItem(item))}
          
          {/* More Menu */}
          {secondaryNavigation.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center justify-center h-full space-y-1 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <MoreHorizontal size={isVerySmallScreen ? 18 : 20} />
                  <span className={cn(
                    "font-medium",
                    isVerySmallScreen ? "text-xs" : "text-xs"
                  )}>
                    More
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="top" 
                className="w-56 mb-2"
                sideOffset={8}
              >
                {secondaryNavigation.map((item) => renderNavItem(item, true))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className={cn(
        "fixed bottom-20 right-4 z-40 transition-all duration-300 lg:hidden",
        showFAB ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus size={24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top" 
            className="w-48 mb-2"
            sideOffset={8}
          >
            <DropdownMenuItem asChild>
              <Link href="/income/add">
                <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                <span>Add Income</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/expenses/add">
                <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                <span>Add Expense</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/assets/add">
                <PiggyBank className="mr-2 h-4 w-4 text-purple-500" />
                <span>Add Asset</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/bills/add">
                <CreditCard className="mr-2 h-4 w-4 text-orange-500" />
                <span>Add Bill</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}