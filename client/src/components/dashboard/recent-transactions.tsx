import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Gem } from "lucide-react";
import { Income, Expense, Asset } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  type: "income" | "expense" | "asset";
  description: string;
  amount: number;
  date: string;
  category: string;
}

export default function RecentTransactions() {
  const { data: income = [], isLoading: incomeLoading } = useQuery<Income[]>({
    queryKey: ["/api/income"],
    queryFn: () => api.get<Income[]>("/income"),
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    queryFn: () => api.get<Expense[]>("/expenses"),
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
    queryFn: () => api.get<Asset[]>("/assets"),
  });

  const isLoading = incomeLoading || expensesLoading || assetsLoading;

  // Combine and sort transactions
  const allTransactions: Transaction[] = [
    ...income.map((item) => ({
      id: item.id,
      type: "income" as const,
      description: item.description,
      amount: parseFloat(item.amount),
      date: item.date,
      category: item.category,
    })),
    ...expenses.map((item) => ({
      id: item.id,
      type: "expense" as const,
      description: item.description,
      amount: parseFloat(item.amount),
      date: item.date,
      category: item.category,
    })),
    ...assets.map((item) => ({
      id: item.id,
      type: "asset" as const,
      description: item.name,
      amount: parseFloat(item.currentValue),
      date: item.purchaseDate,
      category: item.category,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentTransactions = allTransactions.slice(0, 5);

  const getIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="text-green-500" size={16} />;
      case "expense":
        return <TrendingDown className="text-red-500" size={16} />;
      case "asset":
        return <Gem className="text-purple-500" size={16} />;
      default:
        return null;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "income":
        return "income-color";
      case "expense":
        return "expense-color";
      case "asset":
        return "asset-color";
      default:
        return "text-gray-600";
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === "expense" ? "-" : type === "income" ? "+" : "";
    return `${prefix}${formatIndianCurrency(amount)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Your recent financial activities will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/expenses">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-500 hover:text-blue-600"
            >
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  {getIcon(transaction.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              <span className={`font-semibold ${getAmountColor(transaction.type)}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
