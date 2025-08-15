import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table, ChevronDown, Printer, Globe } from "lucide-react";
import { exportFinancialReportToPDF } from "@/lib/pdf-export";
import { printHTMLReport, generateHTMLReport } from "@/components/reports/report-templates";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  period: string;
  income: number;
  expenses: number;
  netBalance: number;
  assetValue: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssetValue: number;
  netWorth: number;
}

interface CategoryData {
  category: string;
  amount: number;
  label: string;
}

interface AssetCategoryData {
  category: string;
  currentValue: number;
  depreciation: number;
  depreciationPercentage: number;
  label: string;
}

interface PDFExportButtonProps {
  reportData: ReportData[];
  summary: SummaryData;
  incomeCategories: CategoryData[];
  expenseCategories: CategoryData[];
  assetCategories: AssetCategoryData[];
  timePeriod: string;
  reportRange: string;
  userInfo?: {
    name: string;
    email: string;
  };
  className?: string;
}

export default function PDFExportButton({
  reportData,
  summary,
  incomeCategories,
  expenseCategories,
  assetCategories,
  timePeriod,
  reportRange,
  userInfo,
  className,
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handlePDFExport = async () => {
    try {
      setIsExporting(true);
      
      await exportFinancialReportToPDF({
        reportData,
        summary,
        incomeCategories,
        expenseCategories,
        assetCategories,
        timePeriod,
        reportRange,
        userInfo,
      });

      toast({
        title: "PDF Export Successful",
        description: "Your financial report has been downloaded as PDF.",
      });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = () => {
    try {
      // Create CSV data
      const csvData = [
        ["Period", "Income", "Expenses", "Net Balance", "Asset Value", "Savings Rate"],
        ...reportData.map(row => [
          row.period,
          row.income.toFixed(2),
          row.expenses.toFixed(2),
          row.netBalance.toFixed(2),
          row.assetValue.toFixed(2),
          row.income > 0 ? ((row.netBalance / row.income) * 100).toFixed(1) + "%" : "0%"
        ])
      ];

      const csvContent = csvData.map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `SpendTrack-Data-${format(new Date(), "yyyy-MM-dd")}.csv`);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "CSV Export Successful",
        description: "Your financial data has been downloaded as CSV.",
      });
    } catch (error) {
      console.error("CSV export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrintReport = () => {
    try {
      const templateData = {
        reportData,
        summary,
        incomeCategories,
        expenseCategories,
        assetCategories,
        timePeriod,
        reportRange,
        userInfo,
      };

      printHTMLReport(templateData);

      toast({
        title: "Print Dialog Opened",
        description: "Your report is ready for printing.",
      });
    } catch (error) {
      console.error("Print failed:", error);
      toast({
        title: "Print Failed",
        description: "There was an error preparing the report for printing.",
        variant: "destructive",
      });
    }
  };

  const handleHTMLExport = () => {
    try {
      const templateData = {
        reportData,
        summary,
        incomeCategories,
        expenseCategories,
        assetCategories,
        timePeriod,
        reportRange,
        userInfo,
      };

      const htmlContent = generateHTMLReport(templateData);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `SpendTrack-Report-${format(new Date(), "yyyy-MM-dd")}.html`);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "HTML Export Successful",
        description: "Your report has been downloaded as HTML file.",
      });
    } catch (error) {
      console.error("HTML export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the HTML file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className={className}
          disabled={isExporting}
        >
          <Download size={16} className="mr-2" />
          {isExporting ? "Exporting..." : "Export Report"}
          <ChevronDown size={14} className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handlePDFExport} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>PDF Report</span>
            <span className="text-xs text-muted-foreground">
              Complete formatted report
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handlePrintReport} disabled={isExporting}>
          <Printer className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>Print Report</span>
            <span className="text-xs text-muted-foreground">
              Print-friendly format
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleHTMLExport} disabled={isExporting}>
          <Globe className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>HTML Report</span>
            <span className="text-xs text-muted-foreground">
              Web-friendly format
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCSVExport} disabled={isExporting}>
          <Table className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>CSV Data</span>
            <span className="text-xs text-muted-foreground">
              Raw data for analysis
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}