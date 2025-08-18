import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Income, Expense } from "@shared/schema";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ResponsiveDataTable, { 
  DataTableColumn, 
  DataTableAction, 
  DataTableFilter 
} from "@/components/ui/responsive-data-table";
import EditExpenseModal from "@/components/modals/edit-expense-modal";
import EditIncomeModal from "@/components/modals/edit-income-modal";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Calendar,
  Tag,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import { cn } from "@/lib/utils";

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

interface EnhancedTransactionsTableProps {
  className?: string;
  pageSize?: number;
  showTitle?: boolean;
  filters?: string[];
}

export default function EnhancedTransactionsTable({
  className,
  pageSize = 25,
  showTitle = true,
  filters = ["type", "category", "date"],
}: EnhancedTransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
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

  // Combine and transform transactions
  const allTransactions: Transaction[] = useMemo(() => {
    const transactions = [
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
    ];

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [income, expenses]);

  const getCategoryLabel = (category: string, type: string) => {
    const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categories.find((cat) => cat.value === category)?.label || category;
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Are you sure you want to delete this ${transaction.type}?`)) {
      if (transaction.type === "income") {
        deleteIncomeMutation.mutate(transaction.id);
      } else {
        deleteExpenseMutation.mutate(transaction.id);
      }
    }
  };

  const handleExport = () => {
    // Implement CSV export
    const csvContent = [
      ["Date", "Type", "Description", "Category", "Amount", "Invoice Number"].join(","),
      ...allTransactions.map(t => [
        t.date,
        t.type,
        `"${t.description}"`,
        `"${getCategoryLabel(t.category, t.type)}"`,
        t.amount,
        t.invoiceNumber || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/income"] });
    queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
  };

  // Define table columns
  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      searchable: false,
      priority: 1,
      width: "120px",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-medium">
            {format(parseISO(value), "MMM dd, yyyy")}
          </span>
        </div>
      ),
      mobileRender: (value) => format(parseISO(value), "MMM dd, yyyy"),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      filterable: true,
      priority: 2,
      width: "100px",
      render: (value, row) => (
        <Badge
          variant={value === "income" ? "default" : "destructive"}
          className={cn(
            "flex items-center gap-1",
            value === "income"
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          )}
        >
          {value === "income" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {value === "income" ? "Income" : "Expense"}
        </Badge>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      searchable: true,
      priority: 3,
      minWidth: "200px",
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {value}
          </div>
          {row.invoiceNumber && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <FileText className="h-3 w-3" />
              Invoice: {row.invoiceNumber}
            </div>
          )}
        </div>
      ),
      mobileRender: (value, row) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          {row.invoiceNumber && (
            <div className="text-xs text-gray-500">
              Invoice: {row.invoiceNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      filterable: true,
      priority: 4,
      width: "150px",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {getCategoryLabel(value, row.type)}
          </span>
        </div>
      ),
      mobileRender: (value, row) => getCategoryLabel(value, row.type),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      priority: 1,
      width: "120px",
      align: "right",
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span
            className={cn(
              "font-bold text-lg",
              row.type === "income" 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            )}
          >
            {row.type === "income" ? "+" : "-"}
            {formatIndianCurrency(value)}
          </span>
        </div>
      ),
      mobileRender: (value, row) => (
        <span
          className={cn(
            "font-bold text-lg",
            row.type === "income" 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          )}
        >
          {row.type === "income" ? "+" : "-"}
          {formatIndianCurrency(value)}
        </span>
      ),
    },
    {
      key: "invoiceAmount",
      label: "Invoice Amount",
      sortable: true,
      hideOnMobile: true,
      width: "120px",
      align: "right",
      render: (value) => value ? formatIndianCurrency(value) : "-",
    },
  ];

  // Define table actions
  const actions: DataTableAction<Transaction>[] = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (row) => {
        // Implement view details modal
        console.log("View details:", row);
      },
      variant: "ghost",
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: handleEdit,
      variant: "ghost",
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      variant: "destructive",
      disabled: (row) => deleteIncomeMutation.isPending || deleteExpenseMutation.isPending,
    },
  ];

  // Define table filters
  const tableFilters: DataTableFilter[] = [];

  if (filters.includes("type")) {
    tableFilters.push({
      key: "type",
      label: "Type",
      options: [
        { value: "income", label: "Income" },
        { value: "expense", label: "Expense" },
      ],
    });
  }

  if (filters.includes("category")) {
    tableFilters.push({
      key: "category",
      label: "Category",
      options: [
        ...INCOME_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label })),
        ...EXPENSE_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label })),
      ],
    });
  }

  return (
    <>
      <ResponsiveDataTable
        data={allTransactions}
        columns={columns}
        actions={actions}
        filters={tableFilters}
        loading={isLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        searchPlaceholder="Search transactions..."
        emptyMessage="No transactions found"
        emptyDescription="Start by adding some income or expenses to see them here"
        title={showTitle ? "All Transactions" : undefined}
        subtitle={showTitle ? `${allTransactions.length} total transactions` : undefined}
        pageSize={pageSize}
        className={className}
      />

      {/* Edit Modals */}
      {editingTransaction && editingTransaction.type === "expense" && (
        <EditExpenseModal
          id={editingTransaction.id}
          initial={{
            amount: editingTransaction.amount,
            description: editingTransaction.description,
            category: editingTransaction.category,
            date: editingTransaction.date,
            accountId: editingTransaction.accountId,
            invoiceNumber: editingTransaction.invoiceNumber,
            invoiceDate: editingTransaction.invoiceDate,
            invoiceAmount: editingTransaction.invoiceAmount,
          }}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {editingTransaction && editingTransaction.type === "income" && (
        <EditIncomeModal
          id={editingTransaction.id}
          initial={{
            amount: editingTransaction.amount,
            description: editingTransaction.description,
            category: editingTransaction.category,
            date: editingTransaction.date,
            invoiceNumber: editingTransaction.invoiceNumber,
            invoiceDate: editingTransaction.invoiceDate,
            invoiceAmount: editingTransaction.invoiceAmount,
          }}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  );
}