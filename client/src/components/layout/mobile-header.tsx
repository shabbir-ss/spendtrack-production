import { Wallet, Moon, Sun, User, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationsDropdown from "@/components/notifications/notifications-dropdown";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";

interface MobileHeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/income": "Income",
  "/expenses": "Expenses", 
  "/assets": "Assets",
  "/bills": "Bills & Reminders",
  "/reports": "Reports",
};

export default function MobileHeader({ theme, toggleTheme }: MobileHeaderProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const currentPageName = pageNames[location] || "SpendTrack";

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 lg:hidden">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wallet className="text-white" size={16} />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currentPageName}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            
            <NotificationsDropdown />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
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
          </div>
        </div>
      </div>
    </header>
  );
}