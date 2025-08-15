import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Income, Expense } from "@shared/schema";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Search } from "lucide-react";
import EditExpenseModal from "@/components/modals/edit-expense-modal";
import EditIncomeModal from "@/components/modals/edit-income-modal";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  category: string;
  date: string;
  accountId?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  invoiceAmount?: number | null;
}

export default function TransactionsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: income = [], isLoading: incomeLoading } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "Success",
        description: "Income entry deleted successfully!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete income entry.",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "Success",
        description: "Expense entry deleted successfully!",
      });
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to delete expense entry.';
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
    },
  });

  const isLoading = incomeLoading || expensesLoading;

  // Combine and sort transactions
  const allTransactions: Transaction[] = [
    ...income.map((item) => ({
      id: item.id,
      type: "income" as const,
      description: item.description,
      amount: parseFloat(item.amount),
      category: item.category,
      date: item.date,
      invoiceNumber: item.invoiceNumber,
      invoiceDate: item.invoiceDate,
      invoiceAmount: item.invoiceAmount ? parseFloat(item.invoiceAmount) : null,
    })),
    ...expenses.map((item) => ({
      id: item.id,
      type: "expense" as const,
      description: item.description,
      amount: parseFloat(item.amount),
      category: item.category,
      date: item.date,
      accountId: item.accountId,
      invoiceNumber: item.invoiceNumber,
      invoiceDate: item.invoiceDate,
      invoiceAmount: item.invoiceAmount ? parseFloat(item.invoiceAmount) : null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter transactions
  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || transaction.category === categoryFilter;
    const matchesType = !typeFilter || typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryLabel = (category: string, type: string) => {
    const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categories.find((cat) => cat.value === category)?.label || category;
  };

  const handleEdit = (transaction: Transaction) => {
    // no-op: handled by inline modal per-row
  };

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      if (transaction.type === "income") {
        deleteIncomeMutation.mutate(transaction.id);
      } else {
        deleteExpenseMutation.mutate(transaction.id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {/* Table skeleton */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((category) => (
              <SelectItem key={`${category.value}-filter`} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {searchTerm || categoryFilter || typeFilter
                      ? "Try adjusting your filters"
                      : "Start by adding some income or expenses"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={transaction.type === "income" ? "default" : "destructive"}
                      className={
                        transaction.type === "income"
                          ? "bg-income/10 text-income border-income/20"
                          : "bg-expense/10 text-expense border-expense/20"
                      }
                    >
                      {transaction.type === "income" ? "Income" : "Expense"}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    {getCategoryLabel(transaction.category, transaction.type)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold ${
                        transaction.type === "income" ? "income-color" : "expense-color"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}₹
                      {transaction.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {transaction.type === "expense" ? (
                        <EditExpenseModal
                          id={transaction.id}
                          initial={{
                            amount: transaction.amount,
                            description: transaction.description,
                            category: transaction.category,
                            date: transaction.date,
                            accountId: transaction.accountId,
                            invoiceNumber: transaction.invoiceNumber,
                            invoiceDate: transaction.invoiceDate,
                            invoiceAmount: transaction.invoiceAmount,
                          }}
                        >
                          <Button 
                            variant="ghost" 
                            size="sm"
                          >
                            <Edit size={14} />
                          </Button>
                        </EditExpenseModal>
                      ) : (
                        <EditIncomeModal
                          id={transaction.id}
                          initial={{
                            amount: transaction.amount,
                            description: transaction.description,
                            category: transaction.category,
                            date: transaction.date,
                            invoiceNumber: transaction.invoiceNumber,
                            invoiceDate: transaction.invoiceDate,
                            invoiceAmount: transaction.invoiceAmount,
                          }}
                        >
                          <Button 
                            variant="ghost" 
                            size="sm"
                          >
                            <Edit size={14} />
                          </Button>
                        </EditIncomeModal>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction)}
                        disabled={
                          deleteIncomeMutation.isPending || deleteExpenseMutation.isPending
                        }
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
