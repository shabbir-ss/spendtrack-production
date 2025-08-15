import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionsTable from "@/components/tables/transactions-table";
import AddExpenseModal from "@/components/modals/add-expense-modal";
import { Plus } from "lucide-react";

export default function Expenses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and categorize your expenses</p>
        </div>
        <AddExpenseModal>
          <div className="bg-expense hover:bg-expense/90 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Expense</span>
          </div>
        </AddExpenseModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expense Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
