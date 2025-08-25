import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Filter, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  FileText,
  Upload,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Receipt,
  MapPin
} from "lucide-react";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import EnhancedMobileTable from "@/components/ui/enhanced-mobile-table";
import EnhancedMobileForm from "@/components/ui/enhanced-mobile-form";
import { Expense as ExpenseType } from "@shared/schema";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  date: string;
  merchant?: string;
  location?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
  tags?: string[];
}

const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "bills", label: "Bills & Utilities" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "travel", label: "Travel" },
  { value: "groceries", label: "Groceries" },
  { value: "fuel", label: "Fuel" },
  { value: "insurance", label: "Insurance" },
  { value: "maintenance", label: "Maintenance" },
  { value: "subscription", label: "Subscriptions" },
  { value: "charity", label: "Charity" },
  { value: "other", label: "Other" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "upi", label: "UPI" },
  { value: "net_banking", label: "Net Banking" },
  { value: "wallet", label: "Digital Wallet" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export default function EnhancedExpensesFullPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const { config, isMobile, isVerySmall } = useEnhancedMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses = [], isLoading, refetch } = useQuery<ExpenseType[]>({
    queryKey: ["/api/expenses"],
    queryFn: () => api.get<ExpenseType[]>("/expenses"),
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => api.post("/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense entry added successfully",
      });
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense entry",
        variant: "destructive",
      });
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseFormData }) => 
      api.put(`/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense entry updated successfully",
      });
      setShowEditModal(false);
      setSelectedExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense entry",
        variant: "destructive",
      });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense entry deleted successfully",
      });
      setShowDeleteDialog(false);
      setSelectedExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense entry",
        variant: "destructive",
      });
    },
  });

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const monthlyAverage = expenses.length > 0 ? 
    totalExpenses / Math.max(1, new Set(expenses.map(expense => expense.date.substring(0, 7))).size) : 0;
  
  // Get current month expenses
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthExpenses = expenses
    .filter(expense => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Payment method breakdown
  const paymentMethodTotals = expenses.reduce((acc, expense) => {
    const method = expense.paymentMethod || 'unknown';
    acc[method] = (acc[method] || 0) + parseFloat(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (expense.merchant && expense.merchant.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (expense.location && expense.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
      const matchesPaymentMethod = filterPaymentMethod === "all" || expense.paymentMethod === filterPaymentMethod;
      return matchesSearch && matchesCategory && matchesPaymentMethod;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof ExpenseType];
      let bValue: any = b[sortBy as keyof ExpenseType];
      
      if (sortBy === "amount") {
        aValue = parseFloat(a.amount);
        bValue = parseFloat(b.amount);
      } else if (sortBy === "date") {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Transform data for enhanced table
  const tableItems = filteredExpenses.map(expense => ({
    id: expense.id,
    title: expense.description,
    subtitle: expense.merchant ? `${expense.merchant}${expense.location ? ` • ${expense.location}` : ''}` : expense.location || 'No merchant',
    amount: formatIndianCurrency(parseFloat(expense.amount)),
    category: expense.category,
    date: new Date(expense.date).toLocaleDateString('en-IN'),
    type: "expense" as const,
    tags: [expense.category, expense.paymentMethod].filter(Boolean),
    metadata: {
      merchant: expense.merchant,
      location: expense.location,
      paymentMethod: expense.paymentMethod,
      receiptNumber: expense.receiptNumber,
      notes: expense.notes,
      createdAt: new Date(expense.createdAt).toLocaleDateString('en-IN')
    },
    actions: {
      view: true,
      edit: true,
      delete: true,
      download: !!expense.receiptFilePath,
    }
  }));

  // Form configuration for adding/editing expense
  const getExpenseFormSections = (expense?: ExpenseType) => [
    {
      title: "Basic Information",
      fields: [
        {
          name: "description",
          label: "Description",
          type: "text" as const,
          placeholder: "Enter expense description",
          required: true,
          value: expense?.description || "",
        },
        {
          name: "amount",
          label: "Amount",
          type: "currency" as const,
          placeholder: "0.00",
          prefix: "₹",
          required: true,
          value: expense?.amount || "",
        },
        {
          name: "category",
          label: "Category",
          type: "select" as const,
          placeholder: "Select category",
          required: true,
          value: expense?.category || "",
          options: EXPENSE_CATEGORIES,
        },
        {
          name: "date",
          label: "Date",
          type: "date" as const,
          required: true,
          value: expense?.date || new Date().toISOString().split('T')[0],
        },
      ],
    },
    {
      title: "Transaction Details",
      description: "Merchant and payment information",
      collapsible: true,
      defaultExpanded: !!(expense?.merchant || expense?.paymentMethod),
      fields: [
        {
          name: "merchant",
          label: "Merchant/Vendor",
          type: "text" as const,
          placeholder: "Store or service provider name",
          value: expense?.merchant || "",
        },
        {
          name: "location",
          label: "Location",
          type: "text" as const,
          placeholder: "City or specific location",
          value: expense?.location || "",
        },
        {
          name: "paymentMethod",
          label: "Payment Method",
          type: "select" as const,
          placeholder: "How was this paid?",
          value: expense?.paymentMethod || "",
          options: PAYMENT_METHODS,
        },
        {
          name: "receiptNumber",
          label: "Receipt Number",
          type: "text" as const,
          placeholder: "Receipt or transaction ID",
          value: expense?.receiptNumber || "",
        },
        {
          name: "receiptFile",
          label: "Receipt File",
          type: "file" as const,
          accept: ".pdf,.jpg,.jpeg,.png",
          description: "Upload receipt or bill",
        },
      ],
    },
    {
      title: "Additional Information",
      description: "Notes and tags",
      collapsible: true,
      defaultExpanded: !!expense?.notes,
      fields: [
        {
          name: "notes",
          label: "Notes",
          type: "textarea" as const,
          placeholder: "Additional notes or comments",
          value: expense?.notes || "",
        },
        {
          name: "tags",
          label: "Tags",
          type: "text" as const,
          placeholder: "Comma-separated tags",
          description: "e.g., business, personal, urgent",
          value: expense?.tags?.join(", ") || "",
        },
      ],
    },
  ];

  // Event handlers
  const handleAddExpense = useCallback(async (data: Record<string, any>) => {
    const formData: ExpenseFormData = {
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      merchant: data.merchant || undefined,
      location: data.location || undefined,
      paymentMethod: data.paymentMethod || undefined,
      receiptNumber: data.receiptNumber || undefined,
      notes: data.notes || undefined,
      tags: data.tags ? data.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) : undefined,
    };
    
    addExpenseMutation.mutate(formData);
  }, [addExpenseMutation]);

  const handleEditExpense = useCallback(async (data: Record<string, any>) => {
    if (!selectedExpense) return;
    
    const formData: ExpenseFormData = {
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      merchant: data.merchant || undefined,
      location: data.location || undefined,
      paymentMethod: data.paymentMethod || undefined,
      receiptNumber: data.receiptNumber || undefined,
      notes: data.notes || undefined,
      tags: data.tags ? data.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) : undefined,
    };
    
    updateExpenseMutation.mutate({ id: selectedExpense.id, data: formData });
  }, [selectedExpense, updateExpenseMutation]);

  const handleViewExpense = useCallback((id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setSelectedExpense(expense);
      setShowViewModal(true);
    }
  }, [expenses]);

  const handleEditExpenseClick = useCallback((id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setSelectedExpense(expense);
      setShowEditModal(true);
    }
  }, [expenses]);

  const handleDeleteExpenseClick = useCallback((id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setSelectedExpense(expense);
      setShowDeleteDialog(true);
    }
  }, [expenses]);

  const handleConfirmDelete = useCallback(() => {
    if (selectedExpense) {
      deleteExpenseMutation.mutate(selectedExpense.id);
    }
  }, [selectedExpense, deleteExpenseMutation]);

  const handleDownloadReceipt = useCallback((id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense?.receiptFilePath) {
      // Create download link
      const link = document.createElement('a');
      link.href = `/api/expenses/${id}/receipt`;
      link.download = `receipt-${expense.receiptNumber || expense.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Receipt download has started",
      });
    }
  }, [expenses, toast]);

  const renderSummaryCards = () => (
    <div className={cn("grid gap-3", config.gridCols.summary)}>
      <Card className={config.cardPadding}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                Total Expenses
              </p>
              <p className={cn(
                "font-bold text-red-600 dark:text-red-400 truncate",
                isVerySmall ? "text-lg" : "text-xl"
              )}>
                {formatIndianCurrency(totalExpenses)}
              </p>
            </div>
            <div className={cn(
              "bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
              isVerySmall ? "w-10 h-10" : "w-12 h-12"
            )}>
              <TrendingDown className="text-red-600" size={isVerySmall ? 18 : 20} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={config.cardPadding}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                This Month
              </p>
              <p className={cn(
                "font-bold text-orange-600 dark:text-orange-400 truncate",
                isVerySmall ? "text-lg" : "text-xl"
              )}>
                {formatIndianCurrency(currentMonthExpenses)}
              </p>
            </div>
            <div className={cn(
              "bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
              isVerySmall ? "w-10 h-10" : "w-12 h-12"
            )}>
              <Calendar className="text-orange-600" size={isVerySmall ? 18 : 20} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={config.cardPadding}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                Monthly Avg
              </p>
              <p className={cn(
                "font-bold text-purple-600 dark:text-purple-400 truncate",
                isVerySmall ? "text-lg" : "text-xl"
              )}>
                {formatIndianCurrency(monthlyAverage)}
              </p>
            </div>
            <div className={cn(
              "bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
              isVerySmall ? "w-10 h-10" : "w-12 h-12"
            )}>
              <DollarSign className="text-purple-600" size={isVerySmall ? 18 : 20} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={config.cardPadding}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                Total Entries
              </p>
              <p className={cn(
                "font-bold text-gray-600 dark:text-gray-400 truncate",
                isVerySmall ? "text-lg" : "text-xl"
              )}>
                {expenses.length}
              </p>
            </div>
            <div className={cn(
              "bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
              isVerySmall ? "w-10 h-10" : "w-12 h-12"
            )}>
              <span className={cn(
                "font-bold text-gray-600",
                isVerySmall ? "text-sm" : "text-base"
              )}>
                {expenses.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTopCategories = () => {
    if (topCategories.length === 0) return null;

    return (
      <Card className={config.cardPadding}>
        <CardContent className="p-0">
          <h3 className={cn("font-semibold mb-3", config.fontSize.base)}>
            Top Expense Categories
          </h3>
          <div className="space-y-2">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    index === 0 ? "bg-red-500" :
                    index === 1 ? "bg-orange-500" : "bg-purple-500"
                  )} />
                  <span className={cn("capitalize", config.fontSize.sm)}>
                    {EXPENSE_CATEGORIES.find(cat => cat.value === category)?.label || category}
                  </span>
                </div>
                <span className={cn("font-semibold", config.fontSize.sm)}>
                  {formatIndianCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFiltersAndSearch = () => (
    <Card className={config.cardPadding}>
      <CardContent className="p-0">
        <div className={cn(
          "grid gap-3",
          isVerySmall ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-4"
        )}>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Method Filter */}
          <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {PAYMENT_METHODS.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <div className="flex space-x-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="description">Description</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={config.minTouchTarget}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <div>
        <h1 className={cn("font-bold text-foreground", config.fontSize.xl)}>
          Expense Management
        </h1>
        <p className={cn("text-muted-foreground", config.fontSize.sm)}>
          Track and categorize your expenses
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
          className={config.minTouchTarget}
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isLoading && "animate-spin"
          )} />
        </Button>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="destructive"
          className={cn("flex items-center space-x-2", config.minTouchTarget)}
        >
          <Plus size={16} />
          {!isVerySmall && <span>Add Expense</span>}
        </Button>
      </div>
    </div>
  );

  const renderViewModal = () => {
    if (!selectedExpense) return null;

    const ViewModal = isMobile ? Sheet : Dialog;
    const ViewModalContent = isMobile ? SheetContent : DialogContent;
    const ViewModalHeader = isMobile ? SheetHeader : DialogHeader;
    const ViewModalTitle = isMobile ? SheetTitle : DialogTitle;

    return (
      <ViewModal open={showViewModal} onOpenChange={setShowViewModal}>
        <ViewModalContent className={isMobile ? "max-h-[90vh]" : ""}>
          <ViewModalHeader>
            <ViewModalTitle>Expense Details</ViewModalTitle>
          </ViewModalHeader>
          <div className={cn("space-y-4", isMobile ? "overflow-auto" : "")}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm font-semibold">{selectedExpense.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                <p className="text-lg font-bold text-red-600">
                  {formatIndianCurrency(parseFloat(selectedExpense.amount))}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <Badge variant="secondary" className="capitalize">
                  {EXPENSE_CATEGORIES.find(cat => cat.value === selectedExpense.category)?.label || selectedExpense.category}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                <p className="text-sm">{new Date(selectedExpense.date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {(selectedExpense.merchant || selectedExpense.location || selectedExpense.paymentMethod || selectedExpense.receiptNumber) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedExpense.merchant && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Merchant</Label>
                      <p className="text-sm">{selectedExpense.merchant}</p>
                    </div>
                  )}
                  {selectedExpense.location && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                      <p className="text-sm">{selectedExpense.location}</p>
                    </div>
                  )}
                  {selectedExpense.paymentMethod && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                      <Badge variant="outline">
                        {PAYMENT_METHODS.find(method => method.value === selectedExpense.paymentMethod)?.label || selectedExpense.paymentMethod}
                      </Badge>
                    </div>
                  )}
                  {selectedExpense.receiptNumber && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Receipt Number</Label>
                      <p className="text-sm">{selectedExpense.receiptNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedExpense.notes && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                <p className="text-sm mt-1">{selectedExpense.notes}</p>
              </div>
            )}

            {selectedExpense.tags && selectedExpense.tags.length > 0 && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedExpense.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-sm">{new Date(selectedExpense.createdAt).toLocaleString('en-IN')}</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              {selectedExpense.receiptFilePath && (
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReceipt(selectedExpense.id)}
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download Receipt</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
                className="flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit</span>
              </Button>
            </div>
          </div>
        </ViewModalContent>
      </ViewModal>
    );
  };

  const FormModal = isMobile ? Sheet : Dialog;
  const FormModalContent = isMobile ? SheetContent : DialogContent;
  const FormModalHeader = isMobile ? SheetHeader : DialogHeader;
  const FormModalTitle = isMobile ? SheetTitle : DialogTitle;

  return (
    <div className={cn("space-y-4", config.spacing)}>
      {/* Header */}
      {renderHeader()}

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Top Categories - Only show on larger screens or when there's data */}
      {(!isVerySmall || topCategories.length > 0) && renderTopCategories()}

      {/* Filters and Search */}
      {renderFiltersAndSearch()}

      {/* Expense Table */}
      <EnhancedMobileTable
        items={tableItems}
        loading={isLoading}
        searchable={false} // We have custom search
        sortable={false} // We have custom sort
        onView={handleViewExpense}
        onEdit={handleEditExpenseClick}
        onDelete={handleDeleteExpenseClick}
        onDownload={handleDownloadReceipt}
        emptyMessage="No expense entries found"
        emptyDescription="Start by adding your first expense entry"
        showItemNumbers={!isVerySmall}
      />

      {/* Add Expense Modal */}
      <FormModal open={showAddModal} onOpenChange={setShowAddModal}>
        <FormModalContent className={isMobile ? "max-h-[90vh]" : ""}>
          <FormModalHeader>
            <FormModalTitle>Add New Expense</FormModalTitle>
          </FormModalHeader>
          <div className={isMobile ? "overflow-auto" : ""}>
            <EnhancedMobileForm
              title=""
              sections={getExpenseFormSections()}
              onSubmit={handleAddExpense}
              onCancel={() => setShowAddModal(false)}
              submitLabel="Add Expense"
              compactMode={isVerySmall}
              stickyActions={isMobile}
              loading={addExpenseMutation.isPending}
            />
          </div>
        </FormModalContent>
      </FormModal>

      {/* Edit Expense Modal */}
      <FormModal open={showEditModal} onOpenChange={setShowEditModal}>
        <FormModalContent className={isMobile ? "max-h-[90vh]" : ""}>
          <FormModalHeader>
            <FormModalTitle>Edit Expense</FormModalTitle>
          </FormModalHeader>
          <div className={isMobile ? "overflow-auto" : ""}>
            {selectedExpense && (
              <EnhancedMobileForm
                title=""
                sections={getExpenseFormSections(selectedExpense)}
                onSubmit={handleEditExpense}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedExpense(null);
                }}
                submitLabel="Update Expense"
                compactMode={isVerySmall}
                stickyActions={isMobile}
                loading={updateExpenseMutation.isPending}
              />
            )}
          </div>
        </FormModalContent>
      </FormModal>

      {/* View Expense Modal */}
      {renderViewModal()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense entry? This action cannot be undone.
              {selectedExpense && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="font-medium">{selectedExpense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatIndianCurrency(parseFloat(selectedExpense.amount))} • {selectedExpense.category}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteExpenseMutation.isPending}
            >
              {deleteExpenseMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}