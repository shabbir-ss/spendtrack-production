import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  CreditCard,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle
} from "lucide-react";
import { getCurrentFinancialYear, formatIndianCurrency } from "@/lib/indian-financial-year";
import { api } from "@/lib/api";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssetValue: number;
  netWorth: number;
}

interface QuickStat {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  href?: string;
}

interface RecentTransaction {
  id: string;
  title: string;
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
}

export default function EnhancedDashboard() {
  const [, setLocation] = useLocation();
  const {
    config,
    isMobile,
    isVerySmall,
    isSmallPhone,
    width,
    height,
    isLandscape
  } = useEnhancedMobile();

  const { data: summary, isLoading: summaryLoading, refetch } = useQuery<SummaryData>({
    queryKey: ["/api/summary"],
    queryFn: () => api.get<SummaryData>("/summary"),
  });

  const currentFY = getCurrentFinancialYear();

  // Mock recent transactions - replace with actual API call
  const recentTransactions: RecentTransaction[] = [
    {
      id: "1",
      title: "Salary Credit",
      amount: "₹85,000",
      type: "income",
      category: "Salary",
      date: "Today"
    },
    {
      id: "2",
      title: "Grocery Shopping",
      amount: "₹2,450",
      type: "expense",
      category: "Food",
      date: "Yesterday"
    },
    {
      id: "3",
      title: "Electricity Bill",
      amount: "₹1,200",
      type: "expense",
      category: "Utilities",
      date: "2 days ago"
    }
  ];

  const quickStats: QuickStat[] = [
    {
      title: "Total Income",
      value: summary ? formatIndianCurrency(summary.totalIncome) : "₹0",
      change: "+12.5%",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      href: "/income"
    },
    {
      title: "Total Expenses",
      value: summary ? formatIndianCurrency(summary.totalExpenses) : "₹0",
      change: "+8.2%",
      changeType: "negative",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      href: "/expenses"
    },
    {
      title: "Net Balance",
      value: summary ? formatIndianCurrency(summary.netBalance) : "₹0",
      change: summary && summary.netBalance > 0 ? "+4.3%" : "-2.1%",
      changeType: summary && summary.netBalance > 0 ? "positive" : "negative",
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      href: "/accounts"
    },
    {
      title: "Assets Value",
      value: summary ? formatIndianCurrency(summary.totalAssetValue) : "₹0",
      change: "+15.7%",
      changeType: "positive",
      icon: PiggyBank,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      href: "/assets"
    }
  ];

  const quickActions = [
    {
      title: "Add Income",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-500",
      href: "/income/add"
    },
    {
      title: "Add Expense",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-500",
      href: "/expenses/add"
    },
    {
      title: "View Reports",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-500",
      href: "/reports"
    },
    {
      title: "Pay Bills",
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-500",
      href: "/bills"
    }
  ];

  const handleRefresh = () => {
    refetch();
  };

  const renderQuickStats = () => {
    if (summaryLoading) {
      return (
        <div className={cn("grid gap-3", config.gridCols.summary)}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className={config.cardPadding}>
              <CardContent className="p-0">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className={cn("grid gap-3", config.gridCols.summary)}>
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95",
                config.cardPadding
              )}
              onClick={() => stat.href && setLocation(stat.href)}
            >
              <CardContent className="p-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-muted-foreground truncate",
                      config.fontSize.xs
                    )}>
                      {stat.title}
                    </p>
                    <p className={cn(
                      "font-bold text-foreground mt-1",
                      isVerySmall ? "text-sm" : "text-lg"
                    )}>
                      {stat.value}
                    </p>
                    {stat.change && (
                      <div className={cn(
                        "flex items-center mt-1",
                        config.fontSize.xs,
                        stat.changeType === "positive" ? "text-green-600" : 
                        stat.changeType === "negative" ? "text-red-600" : "text-gray-600"
                      )}>
                        {stat.changeType === "positive" ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "rounded-lg flex items-center justify-center flex-shrink-0",
                    stat.bgColor,
                    isVerySmall ? "w-8 h-8" : "w-10 h-10"
                  )}>
                    <Icon 
                      className={cn(stat.color)} 
                      size={isVerySmall ? 16 : 20} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderQuickActions = () => (
    <Card className={config.cardPadding}>
      <CardHeader className="p-0 pb-3">
        <CardTitle className={config.fontSize.base}>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn(
          "grid gap-2",
          isVerySmall ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
        )}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "h-auto p-3 flex flex-col items-center space-y-2 transition-all duration-200 hover:shadow-sm active:scale-95",
                  config.minTouchTarget
                )}
                onClick={() => setLocation(action.href)}
              >
                <div className={cn(
                  "rounded-lg p-2",
                  action.bgColor.replace('bg-', 'bg-').replace('-500', '-100'),
                  "dark:" + action.bgColor.replace('bg-', 'bg-').replace('-500', '-900/20')
                )}>
                  <Icon className={cn(action.color)} size={isVerySmall ? 16 : 18} />
                </div>
                <span className={cn(
                  "text-center leading-tight",
                  config.fontSize.xs
                )}>
                  {action.title}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderRecentTransactions = () => (
    <Card className={config.cardPadding}>
      <CardHeader className="p-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={config.fontSize.base}>Recent Transactions</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/transactions")}
            className="text-blue-600 hover:text-blue-700"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={cn(
                  "rounded-full p-2 flex-shrink-0",
                  transaction.type === "income" 
                    ? "bg-green-100 dark:bg-green-900/20" 
                    : "bg-red-100 dark:bg-red-900/20"
                )}>
                  {transaction.type === "income" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-foreground truncate",
                    config.fontSize.sm
                  )}>
                    {transaction.title}
                  </p>
                  <p className={cn(
                    "text-muted-foreground truncate",
                    config.fontSize.xs
                  )}>
                    {transaction.category} • {transaction.date}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={cn(
                  "font-semibold",
                  config.fontSize.sm,
                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                )}>
                  {transaction.type === "expense" ? "-" : "+"}{transaction.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderFinancialOverview = () => {
    if (!summary) return null;

    const netWorthColor = summary.netWorth > 0 ? "text-green-600" : "text-red-600";
    const netWorthBg = summary.netWorth > 0 ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10";

    return (
      <Card className={cn(config.cardPadding, netWorthBg)}>
        <CardContent className="p-0">
          <div className="text-center space-y-2">
            <p className={cn("text-muted-foreground", config.fontSize.sm)}>
              Net Worth
            </p>
            <p className={cn(
              "font-bold",
              netWorthColor,
              isVerySmall ? "text-xl" : "text-2xl"
            )}>
              {formatIndianCurrency(summary.netWorth)}
            </p>
            <p className={cn("text-muted-foreground", config.fontSize.xs)}>
              {currentFY.label}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHeader = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("font-bold text-foreground", config.fontSize.xl)}>
            Financial Dashboard
          </h1>
          <p className={cn("text-muted-foreground", config.fontSize.sm)}>
            {currentFY.label} • {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={summaryLoading}
          className={config.minTouchTarget}
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            summaryLoading && "animate-spin"
          )} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-4", config.spacing)}>
      {/* Header */}
      {renderHeader()}

      {/* Financial Overview - Prominent on mobile */}
      {isMobile && renderFinancialOverview()}

      {/* Quick Stats */}
      {renderQuickStats()}

      {/* Financial Overview - Inline on desktop */}
      {!isMobile && renderFinancialOverview()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Recent Transactions */}
      {renderRecentTransactions()}

      {/* Additional Cards for larger screens */}
      {!isVerySmall && (
        <div className={cn("grid gap-4", config.gridCols.main)}>
          <Card className={config.cardPadding}>
            <CardHeader className="p-0 pb-3">
              <CardTitle className={config.fontSize.base}>Monthly Budget</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={config.fontSize.sm}>Spent this month</span>
                  <span className={cn("font-semibold", config.fontSize.sm)}>
                    ₹45,230 / ₹60,000
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                  ₹14,770 remaining
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={config.cardPadding}>
            <CardHeader className="p-0 pb-3">
              <CardTitle className={config.fontSize.base}>Upcoming Bills</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className={config.fontSize.sm}>Electricity</span>
                  </div>
                  <span className={cn("font-semibold text-orange-600", config.fontSize.sm)}>
                    ₹1,200
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className={config.fontSize.sm}>Internet</span>
                  </div>
                  <span className={cn("font-semibold text-blue-600", config.fontSize.sm)}>
                    ₹899
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/bills")}
                  className="w-full mt-2 text-blue-600 hover:text-blue-700"
                >
                  View All Bills
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Screen: {width}×{height}</div>
              <div>Device: {isVerySmall ? 'Very Small' : isSmallPhone ? 'Small Phone' : 'Mobile'}</div>
              <div>Orientation: {isLandscape ? 'Landscape' : 'Portrait'}</div>
              <div>Grid: {config.gridCols.summary}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}