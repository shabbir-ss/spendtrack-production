import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PDFExportButton from "@/components/ui/pdf-export-button";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  Target,
  FileText,
  Share2,
} from "lucide-react";
import { Income as IncomeType, Expense as ExpenseType, Asset as AssetType } from "@shared/schema";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, ASSET_CATEGORIES } from "@/lib/constants";
import { format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, subWeeks, subMonths, subYears, isWithinInterval } from "date-fns";
import { getCurrentFinancialYear, getPreviousFinancialYears, formatIndianCurrency } from "@/lib/indian-financial-year";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

type TimePeriod = "week" | "month" | "year" | "financial-year";
type ReportRange = "current" | "last" | "last3" | "last12";

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssetValue: number;
  netWorth: number;
}

interface ReportData {
  period: string;
  income: number;
  expenses: number;
  netBalance: number;
  assetValue: number;
}

export default function Reports() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("financial-year");
  const [reportRange, setReportRange] = useState<ReportRange>("last3");
  const { user } = useAuth();

  const { data: income = [], isLoading: incomeLoading } = useQuery<IncomeType[]>({
    queryKey: ["income"],
    queryFn: () => apiRequest("GET", "/income"),
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<ExpenseType[]>({
    queryKey: ["expenses"],
    queryFn: () => apiRequest("GET", "/expenses"),
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery<AssetType[]>({
    queryKey: ["assets"],
    queryFn: () => apiRequest("GET", "/assets"),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["summary"],
    queryFn: () => apiRequest("GET", "/summary"),
  });

  const isLoading = incomeLoading || expensesLoading || assetsLoading || summaryLoading;

  const reportData = useMemo(() => {
    if (isLoading) return [];

    const now = new Date();
    const periods: ReportData[] = [];

    // Determine number of periods based on range
    const periodCount = {
      current: 1,
      last: 2,
      last3: 3,
      last12: 12,
    }[reportRange];

    // Generate periods
    for (let i = periodCount - 1; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let periodLabel: string;

      if (timePeriod === "week") {
        const weekStart = startOfWeek(subWeeks(now, i));
        periodStart = weekStart;
        periodEnd = endOfWeek(weekStart);
        periodLabel = format(weekStart, "MMM dd");
      } else if (timePeriod === "month") {
        const monthStart = startOfMonth(subMonths(now, i));
        periodStart = monthStart;
        periodEnd = endOfMonth(monthStart);
        periodLabel = format(monthStart, "MMM yyyy");
      } else if (timePeriod === "financial-year") {
        const currentFY = getCurrentFinancialYear();
        const previousFYs = getPreviousFinancialYears(i);
        const targetFY = i === 0 ? currentFY : previousFYs[i - 1];
        periodStart = targetFY.startDate;
        periodEnd = targetFY.endDate;
        periodLabel = targetFY.label;
      } else {
        const yearStart = startOfYear(subYears(now, i));
        periodStart = yearStart;
        periodEnd = endOfYear(yearStart);
        periodLabel = format(yearStart, "yyyy");
      }

      // Calculate income for this period
      const periodIncome = Array.isArray(income) ? income
        .filter((item) =>
          isWithinInterval(new Date(item.date), { start: periodStart, end: periodEnd })
        )
        .reduce((sum, item) => sum + parseFloat(item.amount), 0) : 0;

      // Calculate expenses for this period
      const periodExpenses = Array.isArray(expenses) ? expenses
        .filter((item) =>
          isWithinInterval(new Date(item.date), { start: periodStart, end: periodEnd })
        )
        .reduce((sum, item) => sum + parseFloat(item.amount), 0) : 0;

      // Calculate asset value (current value of assets purchased during this period)
      const periodAssetValue = Array.isArray(assets) ? assets
        .filter((item) =>
          isWithinInterval(new Date(item.purchaseDate), { start: periodStart, end: periodEnd })
        )
        .reduce((sum, item) => sum + parseFloat(item.currentValue), 0) : 0;

      periods.push({
        period: periodLabel,
        income: periodIncome,
        expenses: periodExpenses,
        netBalance: periodIncome - periodExpenses,
        assetValue: periodAssetValue,
      });
    }

    return periods;
  }, [income, expenses, assets, timePeriod, reportRange, isLoading]);

  // Calculate category breakdowns
  const expenseCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    if (Array.isArray(expenses)) {
      expenses.forEach((expense) => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
      });
    }
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        label: EXPENSE_CATEGORIES.find(cat => cat.value === category)?.label || category,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const incomeCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    if (Array.isArray(income)) {
      income.forEach((item) => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + parseFloat(item.amount);
      });
    }
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        label: INCOME_CATEGORIES.find(cat => cat.value === category)?.label || category,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [income]);

  const assetCategories = useMemo(() => {
    const categoryTotals: Record<string, { currentValue: number; depreciation: number }> = {};
    if (Array.isArray(assets)) {
      assets.forEach((asset) => {
        const currentValue = parseFloat(asset.currentValue);
        const purchasePrice = parseFloat(asset.purchasePrice);
        const depreciation = purchasePrice - currentValue;
        
        if (!categoryTotals[asset.category]) {
          categoryTotals[asset.category] = { currentValue: 0, depreciation: 0 };
        }
        categoryTotals[asset.category].currentValue += currentValue;
        categoryTotals[asset.category].depreciation += depreciation;
      });
    }
    
    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        currentValue: data.currentValue,
        depreciation: data.depreciation,
        depreciationPercentage: data.currentValue > 0 ? (data.depreciation / (data.currentValue + data.depreciation)) * 100 : 0,
        label: ASSET_CATEGORIES.find(cat => cat.value === category)?.label || category,
      }))
      .sort((a, b) => b.currentValue - a.currentValue);
  }, [assets]);

  // Get period display name for export
  const getPeriodDisplayName = () => {
    const periodNames = {
      week: "Weekly",
      month: "Monthly", 
      year: "Yearly",
      "financial-year": "Financial Year"
    };
    
    const rangeNames = {
      current: "Current Period",
      last: "Last 2 Periods",
      last3: "Last 3 Periods", 
      last12: "Last 12 Periods"
    };
    
    return `${periodNames[timePeriod]} - ${rangeNames[reportRange]}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze your financial performance and trends
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <PDFExportButton
            reportData={reportData}
            summary={summary || {
              totalIncome: 0,
              totalExpenses: 0,
              netBalance: 0,
              totalAssetValue: 0,
              netWorth: 0,
            }}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            assetCategories={assetCategories}
            timePeriod={getPeriodDisplayName()}
            reportRange={reportRange}
            userInfo={user ? { name: user.name, email: user.email } : undefined}
            className="bg-primary hover:bg-primary/90"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
            <SelectItem value="financial-year">Financial Year (Indian)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={reportRange} onValueChange={(value: ReportRange) => setReportRange(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Period</SelectItem>
            <SelectItem value="last">Last 2 Periods</SelectItem>
            <SelectItem value="last3">Last 3 Periods</SelectItem>
            <SelectItem value="last12">Last 12 Periods</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold income-color">
                    {formatIndianCurrency(summary.totalIncome)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold expense-color">
                    {formatIndianCurrency(summary.totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Net Balance
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatIndianCurrency(summary.netBalance)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Net Worth
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatIndianCurrency(summary.netWorth)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar size={20} />
            <span>Financial Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No data available for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportData.map((period, index) => (
                <div key={period.period} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {period.period}
                    </h4>
                    <Badge 
                      variant={period.netBalance >= 0 ? "default" : "destructive"}
                      className={period.netBalance >= 0 ? "bg-income/10 text-income border-income/20" : "bg-expense/10 text-expense border-expense/20"}
                    >
                      Net: ₹{period.netBalance.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Income:</span>
                      <span className="ml-2 font-medium income-color">
                        ₹{period.income.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Expenses:</span>
                      <span className="ml-2 font-medium expense-color">
                        ₹{period.expenses.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Assets:</span>
                      <span className="ml-2 font-medium asset-color">
                        ₹{period.assetValue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Savings Rate:</span>
                      <span className="ml-2 font-medium">
                        {period.income > 0 ? ((period.netBalance / period.income) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} className="text-green-500" />
              <span>Income Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No income recorded
              </p>
            ) : (
              <div className="space-y-3">
                {incomeCategories.slice(0, 5).map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.label}
                    </span>
                    <span className="font-semibold income-color">
                      ₹{category.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown size={20} className="text-red-500" />
              <span>Expense Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No expenses recorded
              </p>
            ) : (
              <div className="space-y-3">
                {expenseCategories.slice(0, 5).map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.label}
                    </span>
                    <span className="font-semibold expense-color">
                      ₹{category.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart size={20} className="text-purple-500" />
              <span>Asset Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assetCategories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No assets recorded
              </p>
            ) : (
              <div className="space-y-3">
                {assetCategories.slice(0, 5).map((category) => (
                  <div key={category.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.label}
                      </span>
                      <span className="font-semibold asset-color">
                        ₹{category.currentValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-right depreciation-color">
                      -{category.depreciationPercentage.toFixed(1)}% depreciation
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {summary ? ((summary.netBalance / (summary.totalIncome || 1)) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold asset-color mb-1">
                {summary ? (summary.totalAssetValue / (summary.netWorth || 1) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Asset Allocation</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold expense-color mb-1">
                {summary ? ((summary.totalExpenses / (summary.totalIncome || 1)) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expense Ratio</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {reportData.length > 1 ? 
                  ((reportData[reportData.length - 1].netBalance - reportData[0].netBalance) / Math.abs(reportData[0].netBalance || 1) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Balance Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
