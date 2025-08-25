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
  TrendingUp, 
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
  RefreshCw
} from "lucide-react";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import EnhancedMobileTable from "@/components/ui/enhanced-mobile-table";
import EnhancedMobileForm from "@/components/ui/enhanced-mobile-form";
import { Income as IncomeType } from "@shared/schema";
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

interface IncomeFormData {
  description: string;
  amount: string;
  category: string;
  date: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceAmount?: string;
  notes?: string;
}

const INCOME_CATEGORIES = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "business", label: "Business" },
  { value: "investment", label: "Investment" },
  { value: "rental", label: "Rental" },
  { value: "dividend", label: "Dividend" },
  { value: "interest", label: "Interest" },
  { value: "bonus", label: "Bonus" },
  { value: "commission", label: "Commission" },
  { value: "other", label: "Other" },
];

export default function EnhancedIncomeFullPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const { config, isMobile, isVerySmall } = useEnhancedMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch incomes
  const { data: incomes = [], isLoading, refetch } = useQuery<IncomeType[]>({
    queryKey: ["/api/income"],
    queryFn: () => api.get<IncomeType[]>("/income"),
  });

  // Add income mutation
  const addIncomeMutation = useMutation({
    mutationFn: (data: IncomeFormData) => api.post("/income", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      toast({
        title: "Success",
        description: "Income entry added successfully",
      });
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add income entry",
        variant: "destructive",
      });
    },
  });

  // Update income mutation
  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IncomeFormData }) => 
      api.put(`/income/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      toast({
        title: "Success",
        description: "Income entry updated successfully",
      });
      setShowEditModal(false);
      setSelectedIncome(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update income entry",
        variant: "destructive",
      });
    },
  });

  // Delete income mutation
  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      toast({
        title: "Success",
        description: "Income entry deleted successfully",
      });
      setShowDeleteDialog(false);
      setSelectedIncome(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete income entry",
        variant: "destructive",
      });
    },
  });

  // Calculate statistics
  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
  const monthlyAverage = incomes.length > 0 ? 
    totalIncome / Math.max(1, new Set(incomes.map(income => income.date.substring(0, 7))).size) : 0;
  
  // Get current month income
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthIncome = incomes
    .filter(income => income.date.startsWith(currentMonth))
    .reduce((sum, income) => sum + parseFloat(income.amount), 0);

  // Category breakdown
  const categoryTotals = incomes.reduce((acc, income) => {
    const category = income.category;
    acc[category] = (acc[category] || 0) + parseFloat(income.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Filter and sort incomes
  const filteredIncomes = incomes
    .filter(income => {
      const matchesSearch = income.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           income.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (income.invoiceNumber && income.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === "all" || income.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof IncomeType];
      let bValue: any = b[sortBy as keyof IncomeType];
      
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
  const tableItems = filteredIncomes.map(income => ({
    id: income.id,
    title: income.description,
    subtitle: `Invoice: ${income.invoiceNumber || 'N/A'}`,
    amount: formatIndianCurrency(parseFloat(income.amount)),
    category: income.category,
    date: new Date(income.date).toLocaleDateString('en-IN'),
    type: "income" as const,
    tags: [income.category],
    metadata: {
      invoiceNumber: income.invoiceNumber,
      invoiceDate: income.invoiceDate,
      invoiceAmount: income.invoiceAmount,
      notes: income.notes,
      createdAt: new Date(income.createdAt).toLocaleDateString('en-IN')
    },
    actions: {
      view: true,
      edit: true,
      delete: true,
      download: !!income.invoiceFilePath,
    }
  }));

  // Form configuration for adding/editing income
  const getIncomeFormSections = (income?: IncomeType) => [
    {
      title: "Basic Information",
      fields: [
        {
          name: "description",
          label: "Description",
          type: "text" as const,
          placeholder: "Enter income description",
          required: true,
          value: income?.description || "",
        },
        {
          name: "amount",
          label: "Amount",
          type: "currency" as const,
          placeholder: "0.00",
          prefix: "₹",
          required: true,
          value: income?.amount || "",
        },
        {
          name: "category",
          label: "Category",
          type: "select" as const,
          placeholder: "Select category",
          required: true,
          value: income?.category || "",
          options: INCOME_CATEGORIES,
        },
        {
          name: "date",
          label: "Date",
          type: "date" as const,
          required: true,
          value: income?.date || new Date().toISOString().split('T')[0],
        },
      ],
    },
    {
      title: "Invoice Details",
      description: "Optional invoice information",
      collapsible: true,
      defaultExpanded: !!(income?.invoiceNumber || income?.invoiceDate),
      fields: [
        {
          name: "invoiceNumber",
          label: "Invoice Number",
          type: "text" as const,
          placeholder: "INV-001",
          value: income?.invoiceNumber || "",
        },
        {
          name: "invoiceDate",
          label: "Invoice Date",
          type: "date" as const,
          value: income?.invoiceDate || "",
        },
        {
          name: "invoiceAmount",
          label: "Invoice Amount",
          type: "currency" as const,
          placeholder: "0.00",
          prefix: "₹",
          description: "For verification purposes",
          value: income?.invoiceAmount || "",
        },
        {
          name: "invoiceFile",
          label: "Invoice File",
          type: "file" as const,
          accept: ".pdf,.jpg,.jpeg,.png",
          description: "Upload invoice document",
        },
      ],
    },
    {
      title: "Additional Information",
      description: "Optional notes and details",
      collapsible: true,
      defaultExpanded: !!income?.notes,
      fields: [
        {
          name: "notes",
          label: "Notes",
          type: "textarea" as const,
          placeholder: "Additional notes or comments",
          value: income?.notes || "",
        },
      ],
    },
  ];

  // Event handlers
  const handleAddIncome = useCallback(async (data: Record<string, any>) => {
    const formData: IncomeFormData = {
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      invoiceNumber: data.invoiceNumber || undefined,
      invoiceDate: data.invoiceDate || undefined,
      invoiceAmount: data.invoiceAmount || undefined,
      notes: data.notes || undefined,
    };
    
    addIncomeMutation.mutate(formData);
  }, [addIncomeMutation]);

  const handleEditIncome = useCallback(async (data: Record<string, any>) => {
    if (!selectedIncome) return;
    
    const formData: IncomeFormData = {
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      invoiceNumber: data.invoiceNumber || undefined,
      invoiceDate: data.invoiceDate || undefined,
      invoiceAmount: data.invoiceAmount || undefined,
      notes: data.notes || undefined,
    };
    
    updateIncomeMutation.mutate({ id: selectedIncome.id, data: formData });
  }, [selectedIncome, updateIncomeMutation]);

  const handleViewIncome = useCallback((id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income) {
      setSelectedIncome(income);
      setShowViewModal(true);
    }
  }, [incomes]);

  const handleEditIncomeClick = useCallback((id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income) {
      setSelectedIncome(income);
      setShowEditModal(true);
    }
  }, [incomes]);

  const handleDeleteIncomeClick = useCallback((id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income) {
      setSelectedIncome(income);
      setShowDeleteDialog(true);
    }
  }, [incomes]);

  const handleConfirmDelete = useCallback(() => {
    if (selectedIncome) {
      deleteIncomeMutation.mutate(selectedIncome.id);
    }
  }, [selectedIncome, deleteIncomeMutation]);

  const handleDownloadInvoice = useCallback((id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income?.invoiceFilePath) {
      // Create download link
      const link = document.createElement('a');
      link.href = `/api/income/${id}/invoice`;
      link.download = `invoice-${income.invoiceNumber || income.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Invoice download has started",
      });
    }
  }, [incomes, toast]);

  const renderSummaryCards = () => (
    <div className={cn("grid gap-3", config.gridCols.summary)}>
      <Card className={config.cardPadding}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                Total Income
              </p>
              <p className={cn(
                "font-bold text-green-600 dark:text-green-400 truncate",
                isVerySmall ? "text-lg" : "text-xl"
              )}>
                {formatIndianCurrency(totalIncome)}
              </p>
            </div>
            <div className={cn(
              "bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
              isVerySmall ? "w-10 h-10" : "w-12 h-12"
            )}>
              <TrendingUp className="text-green-600" size={isVerySmall ? 18 : 20} />
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
                "font-bold text-blue-600 dark:text-blue-400 truncate",
                isVerySmall ? "text-lg" : "text-xl"
              )}>
                {formatIndianCurrency(currentMonthIncome)}
              </p>
            </div>
            <div className={cn(
              "bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
              isVerySmall ? "w-10 h-10" : "w-12 h-12"
            )}>
              <Calendar className="text-blue-600" size={isVerySmall ? 18 : 20} />
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
                {incomes.length}
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
                {incomes.length}
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
            Top Categories
          </h3>
          <div className="space-y-2">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    index === 0 ? "bg-green-500" :
                    index === 1 ? "bg-blue-500" : "bg-purple-500"
                  )} />
                  <span className={cn("capitalize", config.fontSize.sm)}>
                    {category}
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
          isVerySmall ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"
        )}>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search income entries..."
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
              {INCOME_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
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
          Income Management
        </h1>
        <p className={cn("text-muted-foreground", config.fontSize.sm)}>
          Track and manage your income sources
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
          className={cn("flex items-center space-x-2", config.minTouchTarget)}
        >
          <Plus size={16} />
          {!isVerySmall && <span>Add Income</span>}
        </Button>
      </div>
    </div>
  );

  const renderViewModal = () => {
    if (!selectedIncome) return null;

    const ViewModal = isMobile ? Sheet : Dialog;
    const ViewModalContent = isMobile ? SheetContent : DialogContent;
    const ViewModalHeader = isMobile ? SheetHeader : DialogHeader;
    const ViewModalTitle = isMobile ? SheetTitle : DialogTitle;

    return (
      <ViewModal open={showViewModal} onOpenChange={setShowViewModal}>
        <ViewModalContent className={isMobile ? "max-h-[90vh]" : ""}>
          <ViewModalHeader>
            <ViewModalTitle>Income Details</ViewModalTitle>
          </ViewModalHeader>
          <div className={cn("space-y-4", isMobile ? "overflow-auto" : "")}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm font-semibold">{selectedIncome.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                <p className="text-lg font-bold text-green-600">
                  {formatIndianCurrency(parseFloat(selectedIncome.amount))}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <Badge variant="secondary" className="capitalize">
                  {selectedIncome.category}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                <p className="text-sm">{new Date(selectedIncome.date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {(selectedIncome.invoiceNumber || selectedIncome.invoiceDate || selectedIncome.invoiceAmount) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Invoice Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedIncome.invoiceNumber && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Invoice Number</Label>
                      <p className="text-sm">{selectedIncome.invoiceNumber}</p>
                    </div>
                  )}
                  {selectedIncome.invoiceDate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Invoice Date</Label>
                      <p className="text-sm">{new Date(selectedIncome.invoiceDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                  {selectedIncome.invoiceAmount && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Invoice Amount</Label>
                      <p className="text-sm font-semibold">
                        {formatIndianCurrency(parseFloat(selectedIncome.invoiceAmount))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedIncome.notes && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                <p className="text-sm mt-1">{selectedIncome.notes}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-sm">{new Date(selectedIncome.createdAt).toLocaleString('en-IN')}</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              {selectedIncome.invoiceFilePath && (
                <Button
                  variant="outline"
                  onClick={() => handleDownloadInvoice(selectedIncome.id)}
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download Invoice</span>
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

      {/* Income Table */}
      <EnhancedMobileTable
        items={tableItems}
        loading={isLoading}
        searchable={false} // We have custom search
        sortable={false} // We have custom sort
        onView={handleViewIncome}
        onEdit={handleEditIncomeClick}
        onDelete={handleDeleteIncomeClick}
        onDownload={handleDownloadInvoice}
        emptyMessage="No income entries found"
        emptyDescription="Start by adding your first income entry"
        showItemNumbers={!isVerySmall}
      />

      {/* Add Income Modal */}
      <FormModal open={showAddModal} onOpenChange={setShowAddModal}>
        <FormModalContent className={isMobile ? "max-h-[90vh]" : ""}>
          <FormModalHeader>
            <FormModalTitle>Add New Income</FormModalTitle>
          </FormModalHeader>
          <div className={isMobile ? "overflow-auto" : ""}>
            <EnhancedMobileForm
              title=""
              sections={getIncomeFormSections()}
              onSubmit={handleAddIncome}
              onCancel={() => setShowAddModal(false)}
              submitLabel="Add Income"
              compactMode={isVerySmall}
              stickyActions={isMobile}
              loading={addIncomeMutation.isPending}
            />
          </div>
        </FormModalContent>
      </FormModal>

      {/* Edit Income Modal */}
      <FormModal open={showEditModal} onOpenChange={setShowEditModal}>
        <FormModalContent className={isMobile ? "max-h-[90vh]" : ""}>
          <FormModalHeader>
            <FormModalTitle>Edit Income</FormModalTitle>
          </FormModalHeader>
          <div className={isMobile ? "overflow-auto" : ""}>
            {selectedIncome && (
              <EnhancedMobileForm
                title=""
                sections={getIncomeFormSections(selectedIncome)}
                onSubmit={handleEditIncome}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedIncome(null);
                }}
                submitLabel="Update Income"
                compactMode={isVerySmall}
                stickyActions={isMobile}
                loading={updateIncomeMutation.isPending}
              />
            )}
          </div>
        </FormModalContent>
      </FormModal>

      {/* View Income Modal */}
      {renderViewModal()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income entry? This action cannot be undone.
              {selectedIncome && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="font-medium">{selectedIncome.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatIndianCurrency(parseFloat(selectedIncome.amount))} • {selectedIncome.category}
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
              disabled={deleteIncomeMutation.isPending}
            >
              {deleteIncomeMutation.isPending ? (
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