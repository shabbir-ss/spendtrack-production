import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { PieChart, PlusCircle, MinusCircle, Gem, BarChart3, Bell } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: PieChart, color: "text-blue-500" },
  { name: "Income", href: "/income", icon: PlusCircle, color: "text-green-500" },
  { name: "Expenses", href: "/expenses", icon: MinusCircle, color: "text-red-500" },
  { name: "Assets", href: "/assets", icon: Gem, color: "text-purple-500" },
  { name: "Bills", href: "/bills", icon: Bell, color: "text-orange-500" },
  { name: "Reports", href: "/reports", icon: BarChart3, color: "text-gray-500" },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
      <div className="flex space-x-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon size={14} className={isActive ? "text-white" : item.color} />
                <span className="hidden sm:inline">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
