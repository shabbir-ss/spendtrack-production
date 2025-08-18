import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { PieChart, PlusCircle, MinusCircle, Calendar, Bell } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: PieChart, shortName: "Home" },
  { name: "Income", href: "/income", icon: PlusCircle, shortName: "Income" },
  { name: "Expenses", href: "/expenses", icon: MinusCircle, shortName: "Expenses" },
  { name: "Planner", href: "/planner", icon: Calendar, shortName: "Planner" },
  { name: "Bills", href: "/bills", icon: Bell, shortName: "Bills" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-50">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center h-full space-y-1 transition-colors cursor-pointer",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.shortName}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}