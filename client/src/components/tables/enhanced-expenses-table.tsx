import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Expense } from "@shared/schema";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import ResponsiveDataTable, { 
  DataTableColumn, 
  DataTableAction, 
  DataTableFilter 
} from "@/components/ui/responsive-data-table";
import EditExpenseModal from "@/components/modals/edit-expense-modal";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  DollarSign,
  FileText,
  TrendingDown,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Wallet
} from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import { cn } from "@/lib/utils";

interface EnhancedExpensesTableProps {
  className?: string;
  pageSize?: number;
  showTitle?: boolean;
  dateRange?: { start: Date; end: Date };
}

export default function EnhancedExpensesTable({
  className,
  pageSize = 25,
  showTitle = true,
  dateRange,
}: EnhancedExpensesTableProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
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

  // Filter expenses by date range if provided
  const filteredExpenses = useMemo(() => {
    if (!dateRange) return expenses;
    
    return expenses.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, dateRange);
    });
  }, [expenses, dateRange]);

  const getCategoryLabel = (category: string) => {
    return EXPENSE_CATEGORIES.find((cat) => cat.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    const categoryMap: Record<string, React.ComponentType<{ className?: string }>> = {
      food: Utensils,
      transportation: Car,
      housing: Home,
      utilities: Home,
      healthcare: Heart,
      entertainment: Gamepad2,
      shopping: ShoppingCart,
      education: GraduationCap,
      other: Wallet,
    };
    return categoryMap[category] || Wallet;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      food: "text-orange-500",
      transportation: "text-blue-500",
      housing: "text-purple-500",
      utilities: "text-yellow-500",
      healthcare: "text-red-500",
      entertainment: "text-pink-500",
      shopping: "text-green-500",
      education: "text-indigo-500",
      other: "text-gray-500",
    };
    return colorMap[category] || "text-gray-500";
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = (expense: Expense) => {
    if (window.confirm("Are you sure you want to delete this expense entry?")) {
      deleteExpenseMutation.mutate(expense.id);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Date", "Description", "Category", "Amount", "Account", "Invoice Number", "Invoice Date", "Invoice Amount"].join(","),
      ...filteredExpenses.map(item => [
        item.date,
        `"${item.description}"`,
        `"${getCategoryLabel(item.category)}"`,
        item.amount,
        item.accountId || "",
        item.invoiceNumber || "",
        item.invoiceDate || "",
        item.invoiceAmount || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
  };

  // Calculate totals and analytics
  const totalAmount = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const monthlyAverage = filteredExpenses.length > 0 ? totalAmount / Math.max(1, new Set(filteredExpenses.map(item => format(parseISO(item.date), "yyyy-MM"))).size) : 0;
  
  // Category breakdown
  const categoryTotals = filteredExpenses.reduce((acc, item) => {
    const category = item.category;
    acc[category] = (acc[category] || 0) + parseFloat(item.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

  // Define table columns
  const columns: DataTableColumn<Expense>[] = [
    {
      key: "date",
      label: "Date",
      sortable: true,
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
      key: "description",
      label: "Description",
      sortable: true,
      searchable: true,
      priority: 2,
      minWidth: "200px",
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {value}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {row.accountId && (
              <div className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                <span>Account: {row.accountId}</span>
              </div>
            )}
            {row.invoiceNumber && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Invoice: {row.invoiceNumber}</span>
                {row.invoiceDate && (
                  <span className="ml-1">
                    ({format(parseISO(row.invoiceDate), "MMM dd")})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ),
      mobileRender: (value, row) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          {(row.accountId || row.invoiceNumber) && (
            <div className="text-xs text-gray-500 space-y-1">
              {row.accountId && <div>Account: {row.accountId}</div>}
              {row.invoiceNumber && <div>Invoice: {row.invoiceNumber}</div>}
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
      priority: 3,
      width: "150px",
      render: (value) => {
        const Icon = getCategoryIcon(value);
        const colorClass = getCategoryColor(value);
        return (
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", colorClass)} />
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              {getCategoryLabel(value)}
            </Badge>
          </div>
        );
      },
      mobileRender: (value) => getCategoryLabel(value),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      priority: 1,
      width: "140px",
      align: "right",
      render: (value) => (
        <div className="flex items-center justify-end gap-2">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="font-bold text-lg text-red-600 dark:text-red-400">
            -{formatIndianCurrency(parseFloat(value))}
          </span>
        </div>
      ),
      mobileRender: (value) => (
        <span className="font-bold text-lg text-red-600 dark:text-red-400">
          -{formatIndianCurrency(parseFloat(value))}
        </span>
      ),
    },
    {
      key: "accountId",
      label: "Account",
      sortable: true,
      hideOnMobile: true,
      width: "120px",
      render: (value) => value ? (
        <div className="flex items-center gap-1">
          <Wallet className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {value}
          </span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: "invoiceAmount",
      label: "Invoice Amount",
      sortable: true,
      hideOnMobile: true,
      width: "120px",
      align: "right",
      render: (value) => value ? (
        <span className="text-gray-600 dark:text-gray-400">
          {formatIndianCurrency(parseFloat(value))}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
  ];

  // Define table actions
  const actions: DataTableAction<Expense>[] = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (row) => {
        // Implement view details modal
        console.log("View expense details:", row);
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
      disabled: () => deleteExpenseMutation.isPending,
    },
  ];

  // Define table filters
  const tableFilters: DataTableFilter[] = [
    {
      key: "category",
      label: "Category",
      options: EXPENSE_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label })),
    },
  ];

  return (
    <>
      <ResponsiveDataTable
        data={filteredExpenses}
        columns={columns}
        actions={actions}
        filters={tableFilters}
        loading={isLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        searchPlaceholder="Search expense entries..."
        emptyMessage="No expense entries found"
        emptyDescription="Start by adding your first expense entry to track your spending"
        title={showTitle ? "Expense Entries" : undefined}
        subtitle={showTitle ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span>{filteredExpenses.length} entries</span>
            <span className="text-gray-400">•</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              Total: {formatIndianCurrency(totalAmount)}
            </span>
            {monthlyAverage > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span>Avg: {formatIndianCurrency(monthlyAverage)}/month</span>
              </>
            )}
            {topCategory && (
              <>
                <span className="text-gray-400">•</span>
                <span>Top: {getCategoryLabel(topCategory[0])} ({formatIndianCurrency(topCategory[1])})</span>
              </>
            )}
          </div>
        ) : undefined}
        pageSize={pageSize}
        className={className}
      />

      {/* Edit Modal */}
      {editingExpense && (
        <EditExpenseModal
          id={editingExpense.id}
          initial={{
            amount: parseFloat(editingExpense.amount),
            description: editingExpense.description,
            category: editingExpense.category,
            date: editingExpense.date,
            accountId: editingExpense.accountId,
            invoiceNumber: editingExpense.invoiceNumber,
            invoiceDate: editingExpense.invoiceDate,
            invoiceAmount: editingExpense.invoiceAmount ? parseFloat(editingExpense.invoiceAmount) : null,
          }}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </>
  );
}