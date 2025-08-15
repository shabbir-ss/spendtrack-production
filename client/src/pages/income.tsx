import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionsTable from "@/components/tables/transactions-table";
import AddIncomeModal from "@/components/modals/add-income-modal";
import { Plus } from "lucide-react";

export default function Income() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Income</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your income sources</p>
        </div>
        <AddIncomeModal>
          <div className="bg-income hover:bg-income/90 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Income</span>
          </div>
        </AddIncomeModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Income Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
