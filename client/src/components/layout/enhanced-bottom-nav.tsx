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
  Wallet,
  ArrowUpDown,
  Landmark,
  FileText,
  Settings,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  shortName: string;
  color: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    color?: string;
  };
  priority: number;
  category: "primary" | "secondary" | "utility";
}

const allNavigation: NavigationItem[] = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: Home, 
    shortName: "Home",
    color: "text-blue-500",
    priority: 1,
    category: "primary"
  },
  { 
    name: "Income", 
    href: "/income", 
    icon: TrendingUp, 
    shortName: "Income",
    color: "text-green-500",
    priority: 2,
    category: "primary"
  },
  { 
    name: "Expenses", 
    href: "/expenses", 
    icon: TrendingDown, 
    shortName: "Expenses",
    color: "text-red-500",
    priority: 3,
    category: "primary"
  },
  { 
    name: "Transactions", 
    href: "/transactions", 
    icon: ArrowUpDown, 
    shortName: "All",
    color: "text-blue-500",
    priority: 4,
    category: "primary"
  },
  { 
    name: "Bills & Reminders", 
    href: "/bills", 
    icon: CreditCard, 
    shortName: "Bills",
    color: "text-orange-500",
    priority: 5,
    category: "secondary"
  },
  { 
    name: "Planner", 
    href: "/planner", 
    icon: Calculator, 
    shortName: "Planner",
    color: "text-indigo-500",
    priority: 6,
    category: "secondary"
  },
  { 
    name: "Savings", 
    href: "/savings", 
    icon: Landmark, 
    shortName: "Savings",
    color: "text-emerald-500",
    priority: 7,
    category: "secondary"
  },
  { 
    name: "Assets", 
    href: "/assets", 
    icon: PiggyBank, 
    shortName: "Assets",
    color: "text-purple-500",
    priority: 8,
    category: "secondary"
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: BarChart3, 
    shortName: "Reports",
    color: "text-gray-500",
    priority: 9,
    category: "utility"
  },
  { 
    name: "Accounts", 
    href: "/accounts", 
    icon: Wallet, 
    shortName: "Accounts",
    color: "text-amber-500",
    priority: 10,
    category: "utility"
  },
  { 
    name: "Invoices", 
    href: "/invoices", 
    icon: FileText, 
    shortName: "Invoices",
    color: "text-cyan-500",
    priority: 11,
    category: "utility"
  },
];

const quickActions = [
  {
    name: "Add Income",
    href: "/income/add",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500",
  },
  {
    name: "Add Expense",
    href: "/expenses/add",
    icon: TrendingDown,
    color: "text-red-500",
    bgColor: "bg-red-500",
  },
  {
    name: "Add Asset",
    href: "/assets/add",
    icon: PiggyBank,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
  },
  {
    name: "Add Bill",
    href: "/bills/add",
    icon: CreditCard,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
  },
  {
    name: "Transfer Money",
    href: "/accounts/transfer",
    icon: ArrowUpDown,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
  },
];

interface EnhancedBottomNavProps {
  className?: string;
  showLabels?: boolean;
  showFAB?: boolean;
  customActions?: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
  }>;
}

export default function EnhancedBottomNav({ 
  className,
  showLabels = true,
  showFAB = true,
  customActions = quickActions
}: EnhancedBottomNavProps) {
  const [location] = useLocation();
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const { 
    config,
    isMobile, 
    isVerySmall, 
    isSmallPhone,
    width,
    height,
    hasNotch,
    safeAreaBottom,
    isLandscape
  } = useEnhancedMobile();

  // Determine how many items to show based on screen width
  const getMaxItems = () => {
    if (isVerySmall) return 4; // Very small screens
    if (isSmallPhone) return 4; // Small phones
    if (width < 400) return 4; // Narrow phones
    return 5; // Standard mobile
  };

  const maxItems = getMaxItems();
  
  // Smart navigation selection based on current route and priorities
  const getSmartNavigation = () => {
    const currentItem = allNavigation.find(item => item.href === location);
    let primaryItems = allNavigation
      .filter(item => item.category === "primary")
      .sort((a, b) => a.priority - b.priority);
    
    // Always include current page if it's not in primary
    if (currentItem && currentItem.category !== "primary") {
      primaryItems = [currentItem, ...primaryItems.slice(0, maxItems - 2)];
    } else {
      primaryItems = primaryItems.slice(0, maxItems - 1);
    }
    
    const secondaryItems = allNavigation
      .filter(item => !primaryItems.includes(item))
      .sort((a, b) => a.priority - b.priority);
    
    return { primaryItems, secondaryItems };
  };

  const { primaryItems, secondaryItems } = getSmartNavigation();

  // Handle scroll-based visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = 10;

      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        setIsVisible(!scrollingDown || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Hide on desktop
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
                <Badge 
                  variant={item.badge.variant || "default"} 
                  className={cn("text-xs", item.badge.color)}
                >
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
            "flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer relative",
            config.minTouchTarget,
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          <div className="relative">
            <Icon size={isVerySmall ? 18 : 20} />
            {item.badge && (
              <Badge 
                variant={item.badge.variant || "default"}
                className={cn(
                  "absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs scale-75",
                  item.badge.color
                )}
              >
                {item.badge.label}
              </Badge>
            )}
          </div>
          {showLabels && (
            <span className={cn(
              "font-medium leading-tight text-center mt-1",
              isVerySmall ? "text-xs" : "text-xs",
              "max-w-full truncate"
            )}>
              {item.shortName}
            </span>
          )}
          {isActive && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full" />
          )}
        </div>
      </Link>
    );
  };

  const renderFAB = () => {
    if (!showFAB) return null;

    return (
      <div className={cn(
        "fixed z-40 transition-all duration-300",
        isLandscape ? "bottom-4 right-4" : "bottom-20 right-4",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      )}>
        <DropdownMenu open={showFABMenu} onOpenChange={setShowFABMenu}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200",
                config.fabSize,
                showFABMenu && "rotate-45"
              )}
            >
              <Plus size={isVerySmall ? 20 : 24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top" 
            className="w-48 mb-2"
            sideOffset={8}
          >
            {customActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem key={index} asChild>
                  <Link href={action.href}>
                    <Icon className={cn("mr-2 h-4 w-4", action.color)} />
                    <span>{action.name}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const bottomNavHeight = showLabels ? "h-16" : "h-12";
  const safeAreaStyle = hasNotch ? { paddingBottom: `${safeAreaBottom}px` } : {};

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300",
        bottomNavHeight,
        isVisible ? "translate-y-0" : "translate-y-full",
        className
      )} style={safeAreaStyle}>
        <div className={cn(
          "grid h-full",
          `grid-cols-${maxItems}`,
          "px-1"
        )}>
          {/* Primary Navigation Items */}
          {primaryItems.map((item) => renderNavItem(item))}
          
          {/* More Menu */}
          {secondaryItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className={cn(
                  "flex flex-col items-center justify-center h-full transition-colors cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                  config.minTouchTarget
                )}>
                  <MoreHorizontal size={isVerySmall ? 18 : 20} />
                  {showLabels && (
                    <span className={cn(
                      "font-medium mt-1",
                      isVerySmall ? "text-xs" : "text-xs"
                    )}>
                      More
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="top" 
                className="w-56 mb-2"
                sideOffset={8}
              >
                {/* Secondary Navigation */}
                {secondaryItems.filter(item => item.category === "secondary").map((item) => 
                  renderNavItem(item, true)
                )}
                
                {secondaryItems.some(item => item.category === "utility") && (
                  <>
                    <DropdownMenuSeparator />
                    {secondaryItems.filter(item => item.category === "utility").map((item) => 
                      renderNavItem(item, true)
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {renderFAB()}

      {/* Bottom padding for content */}
      <div className={cn(
        "h-16", // Match bottom nav height
        hasNotch && `pb-[${safeAreaBottom}px]`
      )} />
    </>
  );
}