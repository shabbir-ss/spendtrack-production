import { useState, useEffect } from "react";
import { Wallet, Moon, Sun, User, LogOut, Settings, Menu, Search, Bell, ChevronDown, Home, TrendingUp, TrendingDown, PiggyBank, FileText, Calculator, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import NotificationsDropdown from "@/components/notifications/notifications-dropdown";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";

interface ResponsiveHeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const navigationItems = [
  { path: "/", name: "Dashboard", icon: Home },
  { path: "/income", name: "Income", icon: TrendingUp },
  { path: "/expenses", name: "Expenses", icon: TrendingDown },
  { path: "/assets", name: "Assets", icon: PiggyBank },
  { path: "/bills", name: "Bills & Reminders", icon: CreditCard },
  { path: "/reports", name: "Reports", icon: FileText },
  { path: "/planner", name: "Financial Planner", icon: Calculator },
];

export default function ResponsiveHeader({ theme, toggleTheme }: ResponsiveHeaderProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const {
    isMobile,
    isVerySmallScreen,
    windowSize,
    layoutMode,
    setLayoutMode,
  } = useResponsiveDashboard();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCurrentPageName = () => {
    const currentItem = navigationItems.find(item => item.path === location);
    return currentItem?.name || "SpendTrack";
  };

  const getCurrentPageIcon = () => {
    const currentItem = navigationItems.find(item => item.path === location);
    return currentItem?.icon || Home;
  };

  const filteredNavItems = navigationItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigation = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Close mobile menu on window resize
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);

  const renderLogo = () => (
    <div className="flex items-center space-x-2 sm:space-x-3">
      <div className={cn(
        "bg-blue-500 rounded-lg flex items-center justify-center",
        isVerySmallScreen ? "w-7 h-7" : "w-8 h-8"
      )}>
        <Wallet className="text-white" size={isVerySmallScreen ? 14 : 16} />
      </div>
      <div className="flex flex-col">
        <h1 className={cn(
          "font-semibold text-gray-900 dark:text-gray-100",
          isVerySmallScreen ? "text-sm" : "text-lg sm:text-xl"
        )}>
          {isMobile ? getCurrentPageName() : "SpendTrack"}
        </h1>
        {!isMobile && (
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Financial Management
          </span>
        )}
      </div>
    </div>
  );

  const renderSearchBar = () => {
    if (isVerySmallScreen) return null;

    return (
      <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-sm text-muted-foreground"
            >
              <Search className="mr-2 h-4 w-4" />
              Search pages...
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search pages..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No pages found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem
                        key={item.path}
                        onSelect={() => handleNavigation(item.path)}
                        className="cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                        {location === item.path && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Current
                          </Badge>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const renderLayoutControls = () => {
    if (isMobile || location !== "/") return null;

    return (
      <div className="hidden lg:flex items-center gap-1">
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={layoutMode === "compact" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("compact")}
            className="h-7 w-7 p-0"
            title="Compact Layout"
          >
            <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </Button>
          <Button
            variant={layoutMode === "auto" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("auto")}
            className="h-7 w-7 p-0"
            title="Auto Layout"
          >
            <div className="w-3 h-3 grid grid-cols-3 gap-0.5">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm col-span-2"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </Button>
          <Button
            variant={layoutMode === "expanded" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("expanded")}
            className="h-7 w-7 p-0"
            title="Expanded Layout"
          >
            <div className="w-3 h-3 grid grid-cols-3 gap-0.5">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </Button>
        </div>
      </div>
    );
  };

  const renderActions = () => (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {/* Quick Search for Mobile */}
      {isMobile && !isVerySmallScreen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          className={cn(
            "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            isVerySmallScreen ? "h-7 w-7" : "h-8 w-8"
          )}
        >
          <Search size={isVerySmallScreen ? 14 : 16} />
        </Button>
      )}

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
          isVerySmallScreen ? "h-7 w-7" : "h-8 w-8"
        )}
      >
        {theme === "dark" ? 
          <Sun size={isVerySmallScreen ? 14 : 16} /> : 
          <Moon size={isVerySmallScreen ? 14 : 16} />
        }
      </Button>

      {/* Notifications */}
      <NotificationsDropdown />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn(
            "relative rounded-full",
            isVerySmallScreen ? "h-7 w-7" : "h-8 w-8"
          )}>
            <Avatar className={isVerySmallScreen ? "h-7 w-7" : "h-8 w-8"}>
              <AvatarFallback className={cn(
                "bg-blue-500 text-white",
                isVerySmallScreen ? "text-xs" : "text-sm"
              )}>
                {user ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile Menu */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                isVerySmallScreen ? "h-7 w-7" : "h-8 w-8"
              )}
            >
              <Menu size={isVerySmallScreen ? 14 : 16} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-blue-500" />
                <span>SpendTrack</span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Navigation
                </h3>
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      <span>{item.name}</span>
                      {isActive && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Current
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Window Size Info (Debug) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Debug Info
                  </h4>
                  <div className="text-xs space-y-1">
                    <div>Screen: {windowSize.width} × {windowSize.height}</div>
                    <div>Mobile: {isMobile ? "Yes" : "No"}</div>
                    <div>Very Small: {isVerySmallScreen ? "Yes" : "No"}</div>
                    <div>Layout: {layoutMode}</div>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className={cn(
          "flex justify-between items-center",
          isVerySmallScreen ? "h-12" : "h-14 sm:h-16"
        )}>
          {/* Left Section */}
          <div className="flex items-center min-w-0 flex-1">
            {renderLogo()}
            {renderSearchBar()}
          </div>

          {/* Center Section - Layout Controls */}
          {renderLayoutControls()}

          {/* Right Section */}
          {renderActions()}
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isMobile && (
        <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
          <SheetContent side="top" className="h-full">
            <div className="mt-6">
              <Command>
                <CommandInput
                  placeholder="Search pages..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="text-lg"
                />
                <CommandList className="mt-4">
                  <CommandEmpty>No pages found.</CommandEmpty>
                  <CommandGroup>
                    {filteredNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <CommandItem
                          key={item.path}
                          onSelect={() => handleNavigation(item.path)}
                          className="cursor-pointer py-3"
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          <span className="text-base">{item.name}</span>
                          {location === item.path && (
                            <Badge variant="secondary" className="ml-auto">
                              Current
                            </Badge>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}