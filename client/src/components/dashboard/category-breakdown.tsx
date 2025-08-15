import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Expense } from "@shared/schema";

export default function CategoryBreakdown() {
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // Group expenses by category and calculate totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const amount = parseFloat(expense.amount);
    acc[expense.category] = (acc[expense.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Show top 6 categories

  const colors = [
    "bg-blue-500",
    "bg-green-500", 
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-indigo-500",
  ];

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
    <Card>
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCategories.map(([category, amount], index) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${colors[index] || "bg-gray-500"}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ₹{amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
