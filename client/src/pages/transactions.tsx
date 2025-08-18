import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import AddIncomeModal from "@/components/modals/add-income-modal";
import AddExpenseModal from "@/components/modals/add-expense-modal";
import EnhancedTransactionsTable from "@/components/tables/enhanced-transactions-table";
import ResponsivePageHeader from "@/components/layout/responsive-page-header";
import { Income, Expense } from "@shared/schema";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";

export default function Transactions() {
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const { isMobile } = useResponsiveDashboard();

  const { data: income = [] } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const netAmount = totalIncome - totalExpenses;
  const totalTransactions = income.length + expenses.length;

  const pageActions = [
    {
      label: "Add Income",
      onClick: () => setShowAddIncomeModal(true),
      variant: "default" as const,
      icon: TrendingUp,
    },
    {
      label: "Add Expense",
      onClick: () => setShowAddExpenseModal(true),
      variant: "destructive" as const,
      icon: TrendingDown,
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Enhanced Page Header */}
      <ResponsivePageHeader
        title="All Transactions"
        subtitle="Complete view of your financial activity"
        description="Monitor all your income and expense transactions in one place"
        actions={pageActions}
        badge={{
          label: `${totalTransactions} transactions`,
          variant: "secondary"
        }}
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatIndianCurrency(totalIncome)}
                  </p>
                  <p className="text-xs text-gray-500">{income.length} entries</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatIndianCurrency(totalExpenses)}
                  </p>
                  <p className="text-xs text-gray-500">{expenses.length} entries</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Amount</p>
                  <p className={`text-2xl font-bold ${
                    netAmount >= 0 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {netAmount >= 0 ? "+" : ""}{formatIndianCurrency(netAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {netAmount >= 0 ? "Surplus" : "Deficit"}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  netAmount >= 0 
                    ? "bg-blue-100 dark:bg-blue-900" 
                    : "bg-orange-100 dark:bg-orange-900"
                }`}>
                  <ArrowUpDown className={`w-6 h-6 ${
                    netAmount >= 0 ? "text-blue-600" : "text-orange-600"
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalTransactions}
                  </p>
                  <p className="text-xs text-gray-500">All entries</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsivePageHeader>

      {/* Enhanced Transactions Table */}
      <div className="flex-1 min-h-0">
        <EnhancedTransactionsTable 
          pageSize={isMobile ? 10 : 25}
          showTitle={false}
        />
      </div>

      {/* Add Modals */}
      {showAddIncomeModal && (
        <AddIncomeModal onClose={() => setShowAddIncomeModal(false)} />
      )}

      {showAddExpenseModal && (
        <AddExpenseModal onClose={() => setShowAddExpenseModal(false)} />
      )}
    </div>
  );
}