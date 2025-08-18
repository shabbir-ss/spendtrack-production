import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ResponsiveBreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const defaultBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  "/": [
    { label: "Dashboard", path: "/", icon: Home }
  ],
  "/income": [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Income", path: "/income" }
  ],
  "/expenses": [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Expenses", path: "/expenses" }
  ],
  "/assets": [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Assets", path: "/assets" }
  ],
  "/bills": [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Bills & Reminders", path: "/bills" }
  ],
  "/reports": [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Reports", path: "/reports" }
  ],
  "/planner": [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Financial Planner", path: "/planner" }
  ],
};

export default function ResponsiveBreadcrumb({ 
  items, 
  className 
}: ResponsiveBreadcrumbProps) {
  const [location, setLocation] = useLocation();
  const { isMobile, isVerySmallScreen } = useResponsiveDashboard();

  const breadcrumbItems = items || defaultBreadcrumbs[location] || [
    { label: "Dashboard", path: "/", icon: Home }
  ];

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for single items
  }

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  // For very small screens, show only current page with dropdown
  if (isVerySmallScreen) {
    const currentItem = breadcrumbItems[breadcrumbItems.length - 1];
    const previousItems = breadcrumbItems.slice(0, -1);

    if (previousItems.length === 0) return null;

    return (
      <div className={cn("flex items-center space-x-1 text-sm", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <span className="mr-1">...</span>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {previousItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="cursor-pointer"
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-gray-900 dark:text-gray-100 font-medium truncate">
          {currentItem.label}
        </span>
      </div>
    );
  }

  // For mobile, show condensed breadcrumb
  if (isMobile && breadcrumbItems.length > 3) {
    const firstItem = breadcrumbItems[0];
    const lastTwoItems = breadcrumbItems.slice(-2);
    const middleItems = breadcrumbItems.slice(1, -2);

    return (
      <nav className={cn("flex items-center space-x-1 text-sm", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation(firstItem.path)}
          className="h-6 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          {firstItem.icon && <firstItem.icon className="h-3 w-3 mr-1" />}
          {firstItem.label}
        </Button>

        {middleItems.length > 0 && (
          <>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <span>...</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {middleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="cursor-pointer"
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {lastTwoItems.map((item, index) => (
          <div key={item.path} className="flex items-center space-x-1">
            <ChevronRight className="h-3 w-3 text-gray-400" />
            {index === lastTwoItems.length - 1 ? (
              <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-32">
                {item.label}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className="h-6 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 truncate max-w-24"
              >
                {item.label}
              </Button>
            )}
          </div>
        ))}
      </nav>
    );
  }

  // Full breadcrumb for desktop
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <div key={item.path} className="flex items-center space-x-1">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            {isLast ? (
              <span className="text-gray-900 dark:text-gray-100 font-medium flex items-center">
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.label}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className="h-7 px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center"
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.label}
              </Button>
            )}
          </div>
        );
      })}
    </nav>
  );
}