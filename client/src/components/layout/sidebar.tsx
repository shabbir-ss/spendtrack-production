import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { PieChart, PlusCircle, MinusCircle, Briefcase, BarChart3, Bell, Wallet, Calendar, FileText, ChevronLeft } from "lucide-react";

type NavItem = { name: string; href: string; icon: React.ComponentType<any>; color: string };

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: PieChart, color: "text-blue-500" },
      { name: "Reports", href: "/reports", icon: BarChart3, color: "text-gray-500" },
    ],
  },
  {
    title: "Money",
    items: [
      { name: "Income", href: "/income", icon: PlusCircle, color: "text-green-500" },
      { name: "Expenses", href: "/expenses", icon: MinusCircle, color: "text-red-500" },
      { name: "Assets", href: "/assets", icon: Briefcase, color: "text-purple-500" },
      { name: "Accounts", href: "/accounts", icon: Wallet, color: "text-amber-500" },
    ],
  },
  {
    title: "Planning",
    items: [
      { name: "Bills & Reminders", href: "/bills", icon: Bell, color: "text-orange-500" },
      { name: "Planner", href: "/planner", icon: Calendar, color: "text-indigo-500" },
      { name: "Invoice Viewer", href: "/invoices", icon: FileText, color: "text-teal-500" },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 hidden lg:flex h-full flex-shrink-0 flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Sidebar Header */}
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
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform duration-200",
            isCollapsed ? "rotate-180" : ""
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        isCollapsed ? "p-2 space-y-1" : "p-4 space-y-2"
      )}>
        {navGroups.map((group, gi) => (
          <div key={group.title}>
            {!isCollapsed && (
              <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                {group.title}
              </div>
            )}
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center rounded-lg font-medium transition-all cursor-pointer border-l-2",
                        isCollapsed ? "justify-center p-3" : "px-4 py-3 space-x-3",
                        isActive
                          ? "text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400 border-blue-500"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon size={isCollapsed ? 20 : 18} className={isActive ? "text-blue-500" : item.color} />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
            {gi < navGroups.length - 1 && !isCollapsed && (
              <div className="my-2">
                <div className="h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
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
