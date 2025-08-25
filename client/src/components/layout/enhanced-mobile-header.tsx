import { useState, useEffect } from "react";
import { Wallet, Moon, Sun, User, LogOut, Settings, Menu, Search, Bell, ChevronDown, ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import NotificationsDropdown from "@/components/notifications/notifications-dropdown";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";
import { cn } from "@/lib/utils";

interface EnhancedMobileHeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost" | "destructive";
    badge?: string;
  }>;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

const navigationItems = [
  { path: "/", name: "Dashboard", icon: "🏠" },
  { path: "/income", name: "Income", icon: "💰" },
  { path: "/expenses", name: "Expenses", icon: "💸" },
  { path: "/assets", name: "Assets", icon: "🏦" },
  { path: "/bills", name: "Bills", icon: "📋" },
  { path: "/reports", name: "Reports", icon: "📊" },
  { path: "/planner", name: "Planner", icon: "📅" },
  { path: "/savings", name: "Savings", icon: "🏛️" },
  { path: "/accounts", name: "Accounts", icon: "💳" },
  { path: "/transactions", name: "Transactions", icon: "🔄" },
];

export default function EnhancedMobileHeader({
  theme,
  toggleTheme,
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  actions = [],
  searchable = false,
  onSearch,
  className,
}: EnhancedMobileHeaderProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const {
    config,
    isMobile,
    isVerySmall,
    isSmallPhone,
    hasNotch,
    safeAreaTop,
    width,
    height,
    isLandscape
  } = useEnhancedMobile();

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
    return title || currentItem?.name || "SpendTrack";
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Close mobile menu on window resize
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);

  // Dynamic header height based on device
  const headerHeight = isVerySmall ? "h-12" : isSmallPhone ? "h-14" : "h-16";
  const headerPadding = isVerySmall ? "px-2" : isSmallPhone ? "px-3" : "px-4";
  
  // Safe area handling
  const safeAreaStyle = hasNotch ? { paddingTop: `${safeAreaTop}px` } : {};

  const renderLogo = () => (
    <div className="flex items-center space-x-2 min-w-0 flex-1">
      {showBackButton ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackClick}
          className={cn(
            "flex-shrink-0",
            config.minTouchTarget,
            isVerySmall ? "h-8 w-8" : "h-9 w-9"
          )}
        >
          <ArrowLeft size={isVerySmall ? 16 : 18} />
        </Button>
      ) : (
        <div className={cn(
          "bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0",
          isVerySmall ? "w-6 h-6" : isSmallPhone ? "w-7 h-7" : "w-8 h-8"
        )}>
          <Wallet className="text-white" size={isVerySmall ? 12 : isSmallPhone ? 14 : 16} />
        </div>
      )}
      
      <div className="flex flex-col min-w-0 flex-1">
        <h1 className={cn(
          "font-semibold text-gray-900 dark:text-gray-100 truncate",
          isVerySmall ? "text-sm" : isSmallPhone ? "text-base" : "text-lg"
        )}>
          {getCurrentPageName()}
        </h1>
        {subtitle && !isVerySmall && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  const renderSearchBar = () => {
    if (!searchable || isVerySmall) return null;

    return (
      <div className="flex-1 max-w-xs mx-2">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-sm text-muted-foreground h-8"
            >
              <Search className="mr-2 h-3 w-3" />
              Search...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="center">
            <Command>
              <CommandInput
                placeholder="Search pages..."
                value={searchQuery}
                onValueChange={handleSearch}
              />
              <CommandList>
                <CommandEmpty>No pages found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                  {filteredNavItems.map((item) => (
                    <CommandItem
                      key={item.path}
                      onSelect={() => handleNavigation(item.path)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">{item.icon}</span>
                      <span>{item.name}</span>
                      {location === item.path && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Current
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const renderActions = () => (
    <div className="flex items-center space-x-1 flex-shrink-0">
      {/* Custom Actions */}
      {actions.length > 0 && (
        <>
          {actions.slice(0, isVerySmall ? 1 : 2).map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || "ghost"}
                size="icon"
                onClick={action.onClick}
                className={cn(
                  config.minTouchTarget,
                  isVerySmall ? "h-8 w-8" : "h-9 w-9"
                )}
              >
                {Icon ? <Icon size={isVerySmall ? 14 : 16} /> : null}
                {action.badge && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {action.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
          
          {actions.length > (isVerySmall ? 1 : 2) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    config.minTouchTarget,
                    isVerySmall ? "h-8 w-8" : "h-9 w-9"
                  )}
                >
                  <MoreVertical size={isVerySmall ? 14 : 16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.slice(isVerySmall ? 1 : 2).map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem key={index} onClick={action.onClick}>
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}

      {/* Quick Search for Very Small Screens */}
      {searchable && isVerySmall && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          className={cn(config.minTouchTarget, "h-8 w-8")}
        >
          <Search size={14} />
        </Button>
      )}

      {/* Theme Toggle */}
      {!isVerySmall && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={cn(config.minTouchTarget, "h-9 w-9")}
        >
          {theme === "dark" ? 
            <Sun size={16} /> : 
            <Moon size={16} />
          }
        </Button>
      )}

      {/* Notifications */}
      <NotificationsDropdown />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "relative rounded-full",
              config.minTouchTarget,
              isVerySmall ? "h-8 w-8" : "h-9 w-9"
            )}
          >
            <Avatar className={isVerySmall ? "h-7 w-7" : "h-8 w-8"}>
              <AvatarFallback className={cn(
                "bg-blue-500 text-white",
                isVerySmall ? "text-xs" : "text-sm"
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
          {isVerySmall && (
            <>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
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
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              config.minTouchTarget,
              isVerySmall ? "h-8 w-8" : "h-9 w-9"
            )}
          >
            <Menu size={isVerySmall ? 14 : 16} />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className={cn(
            isVerySmall ? "w-72" : "w-80",
            "safe-area-pt safe-area-pb"
          )}
        >
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <span>SpendTrack</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {/* Mobile Search */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Navigation Items */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Navigation
              </h3>
              {filteredNavItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start h-12"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
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

            {/* Device Info (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Device Info
                </h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Size: {width}×{height}</div>
                  <div>Orientation: {isLandscape ? 'Landscape' : 'Portrait'}</div>
                  <div>Type: {isVerySmall ? 'Very Small' : isSmallPhone ? 'Small Phone' : 'Mobile'}</div>
                  {hasNotch && <div>Has Notch: {safeAreaTop}px</div>}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        headerHeight,
        headerPadding,
        className
      )}
      style={safeAreaStyle}
    >
      <div className={cn(
        "flex items-center justify-between h-full",
        isLandscape && hasNotch ? "px-safe" : ""
      )}>
        {renderLogo()}
        {renderSearchBar()}
        {renderActions()}
      </div>

      {/* Full-screen search overlay for very small screens */}
      {searchable && isVerySmall && (
        <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
          <SheetContent side="top" className="h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                  className="h-8 w-8"
                >
                  <ArrowLeft size={16} />
                </Button>
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
              </div>
              
              <div className="flex-1 overflow-auto">
                {filteredNavItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start h-12 mb-1"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                    {location === item.path && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Current
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}