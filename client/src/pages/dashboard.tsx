import { useQuery } from "@tanstack/react-query";
import SummaryCards from "@/components/dashboard/summary-cards";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import AssetPortfolio from "@/components/dashboard/asset-portfolio";
import QuickReportGenerator from "@/components/reports/quick-report-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Wallet, FileText } from "lucide-react";
import { getCurrentFinancialYear, formatIndianCurrency } from "@/lib/indian-financial-year";
import { api } from "@/lib/api";

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssetValue: number;
  netWorth: number;
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["/api/summary"],
    queryFn: () => api.get<SummaryData>("/summary"),
  });

  const currentFY = getCurrentFinancialYear();

  return (
    <div className="space-y-6">
      {/* Financial Year Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {currentFY.label} • April {currentFY.startDate.getFullYear()} - March {currentFY.endDate.getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Indian Financial Year</span>
          </div>
          <QuickReportGenerator 
            triggerText="Generate Report"
            triggerVariant="outline"
            className="whitespace-nowrap"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <SummaryCards
          totalIncome={summary.totalIncome}
          totalExpenses={summary.totalExpenses}
          netBalance={summary.netBalance}
          totalAssetValue={summary.totalAssetValue}
        />
      ) : null}

      {/* Net Worth Card */}
      {summaryLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : summary ? (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Net Worth</p>
              <p className="text-4xl font-bold">{formatIndianCurrency(summary.netWorth)}</p>
              <p className="text-blue-100 text-sm">Income - Expenses + Assets</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 size={32} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Recent Transactions and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <CategoryBreakdown />
      </div>

      {/* Asset Portfolio Overview */}
      <AssetPortfolio />
    </div>
  );
}
