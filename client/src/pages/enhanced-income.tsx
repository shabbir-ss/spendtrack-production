import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, DollarSign, Calendar, Filter, Search } from "lucide-react";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import EnhancedMobileTable from "@/components/ui/enhanced-mobile-table";
import EnhancedMobileForm from "@/components/ui/enhanced-mobile-form";
import { Income as IncomeType } from "@shared/schema";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function EnhancedIncome() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { config, isMobile, isVerySmall } = useEnhancedMobile();

  const { data: incomes = [], isLoading, refetch } = useQuery<IncomeType[]>({
    queryKey: ["/api/income"],
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

  // Transform data for enhanced table
  const tableItems = incomes.map(income => ({
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
  const incomeFormSections = [
    {
      title: "Basic Information",
      fields: [
        {
          name: "description",
          label: "Description",
          type: "text" as const,
          placeholder: "Enter income description",
          required: true,
          value: selectedIncome?.description || "",
        },
        {
          name: "amount",
          label: "Amount",
          type: "currency" as const,
          placeholder: "0.00",
          prefix: "₹",
          required: true,
          value: selectedIncome?.amount || "",
        },
        {
          name: "category",
          label: "Category",
          type: "select" as const,
          placeholder: "Select category",
          required: true,
          value: selectedIncome?.category || "",
          options: [
            { value: "salary", label: "Salary" },
            { value: "freelance", label: "Freelance" },
            { value: "business", label: "Business" },
            { value: "investment", label: "Investment" },
            { value: "rental", label: "Rental" },
            { value: "other", label: "Other" },
          ],
        },
        {
          name: "date",
          label: "Date",
          type: "date" as const,
          required: true,
          value: selectedIncome?.date || new Date().toISOString().split('T')[0],
        },
      ],
    },
    {
      title: "Invoice Details",
      description: "Optional invoice information",
      collapsible: true,
      defaultExpanded: false,
      fields: [
        {
          name: "invoiceNumber",
          label: "Invoice Number",
          type: "text" as const,
          placeholder: "INV-001",
          value: selectedIncome?.invoiceNumber || "",
        },
        {
          name: "invoiceDate",
          label: "Invoice Date",
          type: "date" as const,
          value: selectedIncome?.invoiceDate || "",
        },
        {
          name: "invoiceAmount",
          label: "Invoice Amount",
          type: "currency" as const,
          placeholder: "0.00",
          prefix: "₹",
          description: "For verification purposes",
          value: selectedIncome?.invoiceAmount || "",
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
  ];

  const handleAddIncome = async (data: Record<string, any>) => {
    try {
      // API call to add income
      console.log("Adding income:", data);
      await refetch();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  const handleEditIncome = async (data: Record<string, any>) => {
    try {
      // API call to edit income
      console.log("Editing income:", data);
      await refetch();
      setSelectedIncome(null);
    } catch (error) {
      console.error("Error editing income:", error);
    }
  };

  const handleViewIncome = (id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income) {
      setSelectedIncome(income);
    }
  };

  const handleEditIncomeClick = (id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income) {
      setSelectedIncome(income);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (confirm("Are you sure you want to delete this income entry?")) {
      try {
        // API call to delete income
        console.log("Deleting income:", id);
        await refetch();
      } catch (error) {
        console.error("Error deleting income:", error);
      }
    }
  };

  const handleDownloadInvoice = (id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income?.invoiceFilePath) {
      // Download invoice file
      console.log("Downloading invoice for:", id);
    }
  };

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
      <Button
        onClick={() => setShowAddModal(true)}
        className={cn("flex items-center space-x-2", config.minTouchTarget)}
      >
        <Plus size={16} />
        {!isVerySmall && <span>Add Income</span>}
      </Button>
    </div>
  );

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

      {/* Income Table */}
      <EnhancedMobileTable
        items={tableItems}
        loading={isLoading}
        searchable={true}
        sortable={true}
        onView={handleViewIncome}
        onEdit={handleEditIncomeClick}
        onDelete={handleDeleteIncome}
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
              sections={incomeFormSections}
              onSubmit={handleAddIncome}
              onCancel={() => setShowAddModal(false)}
              submitLabel="Add Income"
              compactMode={isVerySmall}
              stickyActions={isMobile}
            />
          </div>
        </FormModalContent>
      </FormModal>

      {/* Edit Income Modal */}
      <FormModal open={!!selectedIncome} onOpenChange={() => setSelectedIncome(null)}>
        <FormModalContent className={isMobile ? "max-h-[90vh]" : ""}>
          <FormModalHeader>
            <FormModalTitle>
              {selectedIncome ? "Edit Income" : "View Income"}
            </FormModalTitle>
          </FormModalHeader>
          <div className={isMobile ? "overflow-auto" : ""}>
            {selectedIncome && (
              <EnhancedMobileForm
                title=""
                sections={incomeFormSections}
                onSubmit={handleEditIncome}
                onCancel={() => setSelectedIncome(null)}
                submitLabel="Update Income"
                compactMode={isVerySmall}
                stickyActions={isMobile}
              />
            )}
          </div>
        </FormModalContent>
      </FormModal>
    </div>
  );
}