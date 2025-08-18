import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp } from "lucide-react";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import AddIncomeModal from "@/components/modals/add-income-modal";
import EnhancedIncomeTable from "@/components/tables/enhanced-income-table";
import ResponsivePageHeader from "@/components/layout/responsive-page-header";
import { Income as IncomeType } from "@shared/schema";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";

export default function Income() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { isMobile } = useResponsiveDashboard();

  const { data: incomes = [], isLoading } = useQuery<IncomeType[]>({
    queryKey: ["/api/income"],
  });

  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
  const monthlyAverage = incomes.length > 0 ? totalIncome / Math.max(1, new Set(incomes.map(income => income.date.substring(0, 7))).size) : 0;

  const pageActions = [
    {
      label: "Add Income",
      onClick: () => setShowAddModal(true),
      variant: "default" as const,
      icon: Plus,
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Enhanced Page Header */}
      <ResponsivePageHeader
        title="Income Management"
        subtitle="Track and manage your income sources"
        description="Monitor your earnings across different categories and sources"
        actions={pageActions}
        badge={{
          label: `${incomes.length} entries`,
          variant: "secondary"
        }}
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatIndianCurrency(totalIncome)}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Average</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatIndianCurrency(monthlyAverage)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {incomes.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsivePageHeader>

      {/* Enhanced Income Table */}
      <div className="flex-1 min-h-0">
        <EnhancedIncomeTable 
          pageSize={isMobile ? 10 : 25}
          showTitle={false}
        />
      </div>

      {/* Add Income Modal */}
      {showAddModal && (
        <AddIncomeModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
