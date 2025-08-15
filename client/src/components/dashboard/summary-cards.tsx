import { TrendingUp, TrendingDown, Scale, Gem } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatIndianCurrency } from "@/lib/indian-financial-year";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssetValue: number;
}

export default function SummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
  totalAssetValue,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Income
              </p>
              <p className="text-2xl font-bold income-color">
                {formatIndianCurrency(totalIncome)}
              </p>
              <p className="text-xs income-color">Income this period</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-500" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Expenses
              </p>
              <p className="text-2xl font-bold expense-color">
                {formatIndianCurrency(totalExpenses)}
              </p>
              <p className="text-xs expense-color">Expenses this period</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-red-500" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Balance Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Net Balance
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatIndianCurrency(netBalance)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Available balance
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Scale className="text-blue-500" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Portfolio Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Asset Portfolio
              </p>
              <p className="text-2xl font-bold asset-color">
                {formatIndianCurrency(totalAssetValue)}
              </p>
              <p className="text-xs asset-color">Current asset value</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Gem className="text-purple-500" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
