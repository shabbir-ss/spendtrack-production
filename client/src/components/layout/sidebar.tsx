import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { PieChart, PlusCircle, MinusCircle, Gem, BarChart3, Bell, Wallet, Calendar, FileText } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: PieChart, color: "text-blue-500" },
  { name: "Income", href: "/income", icon: PlusCircle, color: "text-green-500" },
  { name: "Expenses", href: "/expenses", icon: MinusCircle, color: "text-red-500" },
  { name: "Assets", href: "/assets", icon: Gem, color: "text-purple-500" },
  { name: "Accounts", href: "/accounts", icon: Wallet, color: "text-amber-500" },
  { name: "Bills & Reminders", href: "/bills", icon: Bell, color: "text-orange-500" },
  { name: "Planner", href: "/planner", icon: Calendar, color: "text-indigo-500" },
  { name: "Invoice Viewer", href: "/invoices", icon: FileText, color: "text-teal-500" },
  { name: "Reports", href: "/reports", icon: BarChart3, color: "text-gray-500" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 hidden lg:block">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                  isActive
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <Icon size={18} className={isActive ? "text-blue-500" : item.color} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
