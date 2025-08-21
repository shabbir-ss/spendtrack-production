import { useQuery } from "@tanstack/react-query";
import SummaryCards from "@/components/dashboard/summary-cards";
import MobileSummaryCards from "@/components/dashboard/mobile-summary-cards";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import AssetPortfolio from "@/components/dashboard/asset-portfolio";
import QuickReportGenerator from "@/components/reports/quick-report-generator";
import ResponsivePageHeader from "@/components/layout/responsive-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Wallet, FileText, Grid3X3, LayoutGrid, Maximize2, Minimize2, RefreshCw, Download, Settings } from "lucide-react";
import { getCurrentFinancialYear, formatIndianCurrency } from "@/lib/indian-financial-year";
import { api } from "@/lib/api";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssetValue: number;
  netWorth: number;
}

export default function Dashboard() {
  const {
    layoutMode,
    setLayoutMode,
    isMobile,
    isVerySmallScreen,
    isShortScreen,
    isCompactLayout,
    effectiveLayout,
    gridConfig,
  } = useResponsiveDashboard();

  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["/api/summary"],
    queryFn: () => api.get<SummaryData>("/summary"),
  });

  const currentFY = getCurrentFinancialYear();

  const handleRefreshData = () => {
    // Implement data refresh logic
    window.location.reload();
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log("Export data");
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log("Open settings");
  };

  const pageActions = [
    {
      label: "Refresh",
      onClick: handleRefreshData,
      variant: "outline" as const,
      icon: RefreshCw,
    },
    {
      label: "Export",
      onClick: handleExportData,
      variant: "outline" as const,
      icon: Download,
    },
    {
      label: "Settings",
      onClick: handleSettings,
      variant: "ghost" as const,
      icon: Settings,
    },
  ];

  return (
    <div className={cn(
      "min-h-0 flex flex-col",
      gridConfig.spacing,
      isShortScreen ? "max-h-screen overflow-hidden" : ""
    )}>
      {/* Enhanced Page Header */}
      <div className="flex-shrink-0">
        <ResponsivePageHeader
          title="Financial Dashboard"
          subtitle={`${currentFY.label} • April ${currentFY.startDate.getFullYear()} - March ${currentFY.endDate.getFullYear()}`}
          description="Track your income, expenses, and assets in one place"
          actions={pageActions}
          badge={{
            label: "Live Data",
            variant: "secondary"
          }}
        >
          {/* Quick Report Generator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Wallet className="h-4 w-4" />
              <span>Indian Financial Year System</span>
            </div>
            <QuickReportGenerator 
              triggerText={isVerySmallScreen ? "Report" : "Generate Report"}
              triggerVariant="outline"
              className="whitespace-nowrap text-sm"
            />
          </div>
        </ResponsivePageHeader>
      </div>

      {/* Summary Cards Section */}
      <div className="flex-shrink-0">
        {summaryLoading ? (
          <div className={cn("grid", gridConfig.summaryGrid)}>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className={gridConfig.cardPadding}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-3 lg:h-4 w-20 lg:w-24" />
                      <Skeleton className="h-6 lg:h-8 w-24 lg:w-32" />
                      <Skeleton className="h-2 lg:h-3 w-16 lg:w-20" />
                    </div>
                    <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : summary ? (
          isMobile ? (
            <MobileSummaryCards
              totalIncome={summary.totalIncome}
              totalExpenses={summary.totalExpenses}
              netBalance={summary.netBalance}
              totalAssetValue={summary.totalAssetValue}
            />
          ) : (
            <SummaryCards
              totalIncome={summary.totalIncome}
              totalExpenses={summary.totalExpenses}
              netBalance={summary.netBalance}
              totalAssetValue={summary.totalAssetValue}
            />
          )
        ) : null}
      </div>

      {/* Net Worth Card */}
      {!isVerySmallScreen && (
        <div className="flex-shrink-0">
          {summaryLoading ? (
            <Card>
              <CardContent className={gridConfig.cardPadding}>
                <Skeleton className="h-20 lg:h-24 w-full" />
              </CardContent>
            </Card>
          ) : summary ? (
            <div className={cn(
              "bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg text-white",
              gridConfig.cardPadding
            )}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-blue-100 text-xs lg:text-sm font-medium">Total Net Worth</p>
                  <p className={cn(
                    "font-bold truncate",
                    isCompactLayout ? "text-xl lg:text-2xl" : "text-2xl lg:text-4xl"
                  )}>
                    {formatIndianCurrency(summary.netWorth)}
                  </p>
                  <p className="text-blue-100 text-xs lg:text-sm">Income - Expenses + Assets</p>
                </div>
                <div className={cn(
                  "bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0",
                  isCompactLayout ? "w-10 h-10 lg:w-12 lg:h-12" : "w-12 h-12 lg:w-16 lg:h-16"
                )}>
                  <BarChart3 className={cn(
                    isCompactLayout ? "w-5 h-5 lg:w-6 lg:h-6" : "w-6 h-6 lg:w-8 lg:h-8"
                  )} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Main Content Grid */}
      <div className={cn(
        "flex-1 min-h-0",
        isShortScreen ? "overflow-hidden" : ""
      )}>
        <div className={cn("grid h-full", gridConfig.mainGrid)}>
          {/* Recent Transactions */}
          <div className="min-h-0 flex flex-col">
            <RecentTransactions />
          </div>
          
          {/* Category Breakdown */}
          <div className="min-h-0 flex flex-col">
            <CategoryBreakdown />
          </div>
          
          {/* Asset Portfolio - Responsive visibility */}
          {(!isCompactLayout || (!isMobile && !isShortScreen)) && (
            <div className={cn(
              "min-h-0 flex flex-col",
              effectiveLayout === "expanded" ? "xl:col-span-1" : "lg:col-span-2 xl:col-span-1"
            )}>
              <AssetPortfolio />
            </div>
          )}
        </div>
      </div>

      {/* Compact Asset Portfolio for small screens */}
      {isCompactLayout && (isMobile || isShortScreen) && summary && (
        <div className="flex-shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Asset Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Asset Value</p>
                  <p className="text-lg font-bold asset-color">
                    {formatIndianCurrency(summary.totalAssetValue)}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  View All Assets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
