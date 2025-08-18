import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Income } from "@shared/schema";
import { INCOME_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import ResponsiveDataTable, { 
  DataTableColumn, 
  DataTableAction, 
  DataTableFilter 
} from "@/components/ui/responsive-data-table";
import EditIncomeModal from "@/components/modals/edit-income-modal";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  DollarSign,
  FileText,
  TrendingUp,
  Building,
  CreditCard
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import { cn } from "@/lib/utils";

interface EnhancedIncomeTableProps {
  className?: string;
  pageSize?: number;
  showTitle?: boolean;
  dateRange?: { start: Date; end: Date };
}

export default function EnhancedIncomeTable({
  className,
  pageSize = 25,
  showTitle = true,
  dateRange,
}: EnhancedIncomeTableProps) {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: income = [], isLoading } = useQuery<Income[]>({
    queryKey: ["/api/income"],
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

  // Filter income by date range if provided
  const filteredIncome = useMemo(() => {
    if (!dateRange) return income;
    
    return income.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, dateRange);
    });
  }, [income, dateRange]);

  const getCategoryLabel = (category: string) => {
    return INCOME_CATEGORIES.find((cat) => cat.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    const categoryMap: Record<string, React.ComponentType<{ className?: string }>> = {
      salary: Building,
      freelance: CreditCard,
      business: Building,
      investment: TrendingUp,
      rental: Building,
      other: DollarSign,
    };
    return categoryMap[category] || DollarSign;
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
  };

  const handleDelete = (income: Income) => {
    if (window.confirm("Are you sure you want to delete this income entry?")) {
      deleteIncomeMutation.mutate(income.id);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Date", "Description", "Category", "Amount", "Invoice Number", "Invoice Date", "Invoice Amount"].join(","),
      ...filteredIncome.map(item => [
        item.date,
        `"${item.description}"`,
        `"${getCategoryLabel(item.category)}"`,
        item.amount,
        item.invoiceNumber || "",
        item.invoiceDate || "",
        item.invoiceAmount || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/income"] });
  };

  // Calculate totals
  const totalAmount = filteredIncome.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const monthlyAverage = filteredIncome.length > 0 ? totalAmount / Math.max(1, new Set(filteredIncome.map(item => format(parseISO(item.date), "yyyy-MM"))).size) : 0;

  // Define table columns
  const columns: DataTableColumn<Income>[] = [
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
          {row.invoiceNumber && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <FileText className="h-3 w-3" />
              Invoice: {row.invoiceNumber}
              {row.invoiceDate && (
                <span className="ml-1">
                  ({format(parseISO(row.invoiceDate), "MMM dd")})
                </span>
              )}
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
      priority: 3,
      width: "150px",
      render: (value) => {
        const Icon = getCategoryIcon(value);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
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
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="font-bold text-lg text-green-600 dark:text-green-400">
            +{formatIndianCurrency(parseFloat(value))}
          </span>
        </div>
      ),
      mobileRender: (value) => (
        <span className="font-bold text-lg text-green-600 dark:text-green-400">
          +{formatIndianCurrency(parseFloat(value))}
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
      render: (value) => value ? (
        <span className="text-gray-600 dark:text-gray-400">
          {formatIndianCurrency(parseFloat(value))}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      sortable: true,
      hideOnMobile: true,
      width: "120px",
      render: (value) => value ? (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {format(parseISO(value), "MMM dd, yyyy")}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
  ];

  // Define table actions
  const actions: DataTableAction<Income>[] = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (row) => {
        // Implement view details modal
        console.log("View income details:", row);
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
      disabled: () => deleteIncomeMutation.isPending,
    },
  ];

  // Define table filters
  const tableFilters: DataTableFilter[] = [
    {
      key: "category",
      label: "Category",
      options: INCOME_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label })),
    },
  ];

  return (
    <>
      <ResponsiveDataTable
        data={filteredIncome}
        columns={columns}
        actions={actions}
        filters={tableFilters}
        loading={isLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        searchPlaceholder="Search income entries..."
        emptyMessage="No income entries found"
        emptyDescription="Start by adding your first income entry to track your earnings"
        title={showTitle ? "Income Entries" : undefined}
        subtitle={showTitle ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span>{filteredIncome.length} entries</span>
            <span className="text-gray-400">•</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              Total: {formatIndianCurrency(totalAmount)}
            </span>
            {monthlyAverage > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span>Avg: {formatIndianCurrency(monthlyAverage)}/month</span>
              </>
            )}
          </div>
        ) : undefined}
        pageSize={pageSize}
        className={className}
      />

      {/* Edit Modal */}
      {editingIncome && (
        <EditIncomeModal
          id={editingIncome.id}
          initial={{
            amount: parseFloat(editingIncome.amount),
            description: editingIncome.description,
            category: editingIncome.category,
            date: editingIncome.date,
            invoiceNumber: editingIncome.invoiceNumber,
            invoiceDate: editingIncome.invoiceDate,
            invoiceAmount: editingIncome.invoiceAmount ? parseFloat(editingIncome.invoiceAmount) : null,
          }}
          onClose={() => setEditingIncome(null)}
        />
      )}
    </>
  );
}