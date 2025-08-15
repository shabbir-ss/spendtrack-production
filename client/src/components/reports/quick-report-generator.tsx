import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { exportFinancialReportToPDF } from "@/lib/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Income, Expense, Asset } from "@shared/schema";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, ASSET_CATEGORIES } from "@/lib/constants";
import { formatIndianCurrency, getCurrentFinancialYear } from "@/lib/indian-financial-year";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";

type QuickReportType = "monthly" | "yearly" | "financial-year" | "custom";

interface QuickReportGeneratorProps {
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export default function QuickReportGenerator({
  triggerText = "Generate Report",
  triggerVariant = "outline",
  className,
}: QuickReportGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<QuickReportType>("monthly");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: income = [] } = useQuery<Income[]>({
    queryKey: ["/api/income"],
    queryFn: () => api.get<Income[]>("/income"),
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    queryFn: () => api.get<Expense[]>("/expenses"),
  });

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
    queryFn: () => api.get<Asset[]>("/assets"),
  });

  const { data: summary } = useQuery({
    queryKey: ["/api/summary"],
    queryFn: () => api.get("/summary"),
  });

  const generateQuickReport = async () => {
    try {
      setIsGenerating(true);

      // Determine date range based on report type
      let startDate: Date;
      let endDate: Date;
      let periodLabel: string;

      const now = new Date();

      switch (reportType) {
        case "monthly":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          periodLabel = format(now, "MMMM yyyy");
          break;
        case "yearly":
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          periodLabel = format(now, "yyyy");
          break;
        case "financial-year":
          const currentFY = getCurrentFinancialYear();
          startDate = currentFY.startDate;
          endDate = currentFY.endDate;
          periodLabel = currentFY.label;
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          periodLabel = format(now, "MMMM yyyy");
      }

      // Filter data for the selected period
      const periodIncome = income.filter((item) =>
        isWithinInterval(new Date(item.date), { start: startDate, end: endDate })
      );

      const periodExpenses = expenses.filter((item) =>
        isWithinInterval(new Date(item.date), { start: startDate, end: endDate })
      );

      const periodAssets = assets.filter((item) =>
        isWithinInterval(new Date(item.purchaseDate), { start: startDate, end: endDate })
      );

      // Calculate totals
      const totalIncome = periodIncome.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const totalExpenses = periodExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const totalAssetValue = periodAssets.reduce((sum, item) => sum + parseFloat(item.currentValue), 0);

      // Create report data
      const reportData = [{
        period: periodLabel,
        income: totalIncome,
        expenses: totalExpenses,
        netBalance: totalIncome - totalExpenses,
        assetValue: totalAssetValue,
      }];

      // Calculate category breakdowns
      const incomeCategories = Object.entries(
        periodIncome.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
          return acc;
        }, {} as Record<string, number>)
      ).map(([category, amount]) => ({
        category,
        amount,
        label: INCOME_CATEGORIES.find(cat => cat.value === category)?.label || category,
      })).sort((a, b) => b.amount - a.amount);

      const expenseCategories = Object.entries(
        periodExpenses.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
          return acc;
        }, {} as Record<string, number>)
      ).map(([category, amount]) => ({
        category,
        amount,
        label: EXPENSE_CATEGORIES.find(cat => cat.value === category)?.label || category,
      })).sort((a, b) => b.amount - a.amount);

      const assetCategories = Object.entries(
        periodAssets.reduce((acc, asset) => {
          const currentValue = parseFloat(asset.currentValue);
          const purchasePrice = parseFloat(asset.purchasePrice);
          const depreciation = purchasePrice - currentValue;
          
          if (!acc[asset.category]) {
            acc[asset.category] = { currentValue: 0, depreciation: 0 };
          }
          acc[asset.category].currentValue += currentValue;
          acc[asset.category].depreciation += depreciation;
          return acc;
        }, {} as Record<string, { currentValue: number; depreciation: number }>)
      ).map(([category, data]) => ({
        category,
        currentValue: data.currentValue,
        depreciation: data.depreciation,
        depreciationPercentage: data.currentValue > 0 ? (data.depreciation / (data.currentValue + data.depreciation)) * 100 : 0,
        label: ASSET_CATEGORIES.find(cat => cat.value === category)?.label || category,
      })).sort((a, b) => b.currentValue - a.currentValue);

      // Generate PDF
      await exportFinancialReportToPDF({
        reportData,
        summary: summary || {
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          totalAssetValue,
          netWorth: totalIncome - totalExpenses + totalAssetValue,
        },
        incomeCategories,
        expenseCategories,
        assetCategories,
        timePeriod: reportType.replace("-", " "),
        reportRange: "current",
        userInfo: user ? { name: user.name, email: user.email } : undefined,
      });

      toast({
        title: "Report Generated",
        description: `Your ${periodLabel} financial report has been downloaded.`,
      });

      setOpen(false);
    } catch (error) {
      console.error("Quick report generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportPreview = () => {
    const now = new Date();
    let periodLabel: string;
    let description: string;

    switch (reportType) {
      case "monthly":
        periodLabel = format(now, "MMMM yyyy");
        description = "Current month's financial summary";
        break;
      case "yearly":
        periodLabel = format(now, "yyyy");
        description = "Current year's financial summary";
        break;
      case "financial-year":
        const currentFY = getCurrentFinancialYear();
        periodLabel = currentFY.label;
        description = "Current financial year summary (April - March)";
        break;
      default:
        periodLabel = format(now, "MMMM yyyy");
        description = "Current month's financial summary";
    }

    return { periodLabel, description };
  };

  const preview = getReportPreview();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={className}>
          <FileText className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Report Generator
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive financial report for a specific period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Period</label>
            <Select value={reportType} onValueChange={(value: QuickReportType) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Current Month</SelectItem>
                <SelectItem value="yearly">Current Year</SelectItem>
                <SelectItem value="financial-year">Current Financial Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Period:</span>
                <Badge variant="outline">{preview.periodLabel}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{preview.description}</p>
              
              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Income analysis & sources</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span>Expense breakdown & categories</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <BarChart3 className="h-3 w-3 text-blue-500" />
                  <span>Financial health metrics</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={generateQuickReport}
              className="flex-1"
              disabled={isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}