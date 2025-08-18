import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PieChart, BarChart3 } from "lucide-react";
import { Expense } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function CategoryBreakdown() {
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: () => apiRequest("GET", "/expenses"),
  });

  // Filter expenses by date
  const getFilteredExpenses = () => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (dateFilter) {
      case "thisMonth":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "thisYear":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        return expenses;
    }

    return expenses.filter(expense =>
      isWithinInterval(new Date(expense.date), { start: startDate, end: endDate })
    );
  };

  const filteredExpenses = getFilteredExpenses();

  // Group expenses by category and calculate totals
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    const amount = parseFloat(expense.amount);
    acc[expense.category] = (acc[expense.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Show top 6 categories

  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6366F1"
  ];

  const chartData = {
    labels: sortedCategories.map(([category]) => category.charAt(0).toUpperCase() + category.slice(1)),
    datasets: [
      {
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: colors,
        borderColor: colors.map(color => color + "80"),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${formatCurrency(context.parsed || context.raw)}`;
          }
        }
      }
    },
    ...(chartType === 'bar' && {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return formatCurrency(value);
            }
          }
        }
      }
    })
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add some expenses to see category breakdown
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-lg">Expense Categories</CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("pie")}
              className="h-7 w-7 p-0"
            >
              <PieChart className="h-3 w-3" />
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="h-7 w-7 p-0"
            >
              <BarChart3 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
        <div className="h-48 sm:h-56 lg:h-64 mb-3 sm:mb-4">
          {chartType === "pie" ? (
            <Pie data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
        <div className="space-y-1 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto dashboard-scroll">
          {sortedCategories.map(([category, amount], index) => (
            <div key={category} className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: colors[index] || "#6B7280" }}
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 capitalize truncate">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0 ml-2">
                {formatCurrency(amount)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
