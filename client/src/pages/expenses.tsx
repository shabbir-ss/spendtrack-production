import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, TrendingDown, DollarSign } from "lucide-react";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import AddExpenseModal from "@/components/modals/add-expense-modal";
import EnhancedExpensesTable from "@/components/tables/enhanced-expenses-table";
import ResponsivePageHeader from "@/components/layout/responsive-page-header";
import { Expense as ExpenseType } from "@shared/schema";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";

export default function Expenses() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { isMobile } = useResponsiveDashboard();

  const { data: expenses = [], isLoading } = useQuery<ExpenseType[]>({
    queryKey: ["/api/expenses"],
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const monthlyAverage = expenses.length > 0 ? totalExpenses / Math.max(1, new Set(expenses.map(expense => expense.date.substring(0, 7))).size) : 0;
  
  // Category breakdown
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

  const pageActions = [
    {
      label: "Add Expense",
      onClick: () => setShowAddModal(true),
      variant: "destructive" as const,
      icon: Plus,
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Enhanced Page Header */}
      <ResponsivePageHeader
        title="Expense Management"
        subtitle="Track and categorize your expenses"
        description="Monitor your spending across different categories and merchants"
        actions={pageActions}
        badge={{
          label: `${expenses.length} entries`,
          variant: "secondary"
        }}
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatIndianCurrency(totalExpenses)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Average</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatIndianCurrency(monthlyAverage)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {expenses.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Category</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {topCategory ? topCategory[0] : "N/A"}
                  </p>
                  {topCategory && (
                    <p className="text-xs text-gray-500">
                      {formatIndianCurrency(topCategory[1])}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsivePageHeader>

      {/* Enhanced Expenses Table */}
      <div className="flex-1 min-h-0">
        <EnhancedExpensesTable 
          pageSize={isMobile ? 10 : 25}
          showTitle={false}
        />
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
