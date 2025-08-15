import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { formatIndianCurrency } from './indian-financial-year';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

interface PDFExportOptions {
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
}

export class PDFExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  private addHeader(title: string, subtitle?: string) {
    // Add logo/brand area
    this.doc.setFillColor(59, 130, 246); // Blue-500
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
    
    // Add title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SpendTrack Financial Report', this.margin + 10, this.currentY + 15);
    
    // Add date
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const dateText = `Generated on ${format(new Date(), 'PPP')}`;
    const dateWidth = this.doc.getTextWidth(dateText);
    this.doc.text(dateText, this.pageWidth - this.margin - dateWidth - 10, this.currentY + 15);
    
    this.currentY += 35;
    
    // Add report title and subtitle
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;
    
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, this.margin, this.currentY);
      this.currentY += 15;
    } else {
      this.currentY += 10;
    }
  }

  private addSummarySection(summary: SummaryData) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Financial Summary', this.margin, this.currentY);
    this.currentY += 15;

    // Create summary table
    const summaryData = [
      ['Total Income', formatIndianCurrency(summary.totalIncome)],
      ['Total Expenses', formatIndianCurrency(summary.totalExpenses)],
      ['Net Balance', formatIndianCurrency(summary.netBalance)],
      ['Total Asset Value', formatIndianCurrency(summary.totalAssetValue)],
      ['Net Worth', formatIndianCurrency(summary.netWorth)],
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Amount']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: 'right' },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addTrendsSection(reportData: ReportData[]) {
    this.checkPageBreak(60);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Financial Trends', this.margin, this.currentY);
    this.currentY += 15;

    if (reportData.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('No data available for the selected period', this.margin, this.currentY);
      this.currentY += 20;
      return;
    }

    // Create trends table
    const trendsData = reportData.map(period => [
      period.period,
      formatIndianCurrency(period.income),
      formatIndianCurrency(period.expenses),
      formatIndianCurrency(period.netBalance),
      formatIndianCurrency(period.assetValue),
      period.income > 0 ? `${((period.netBalance / period.income) * 100).toFixed(1)}%` : '0%'
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Period', 'Income', 'Expenses', 'Net Balance', 'Assets', 'Savings Rate']],
      body: trendsData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'center' },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addCategoryBreakdown(
    title: string,
    categories: CategoryData[] | AssetCategoryData[],
    color: [number, number, number]
  ) {
    this.checkPageBreak(80);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;

    if (categories.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('No data available', this.margin, this.currentY);
      this.currentY += 20;
      return;
    }

    let tableData: string[][];
    let headers: string[];

    if ('currentValue' in categories[0]) {
      // Asset categories
      const assetCategories = categories as AssetCategoryData[];
      headers = ['Category', 'Current Value', 'Depreciation', 'Depreciation %'];
      tableData = assetCategories.slice(0, 10).map(category => [
        category.label,
        formatIndianCurrency(category.currentValue),
        formatIndianCurrency(category.depreciation),
        `${category.depreciationPercentage.toFixed(1)}%`
      ]);
    } else {
      // Income/Expense categories
      const regularCategories = categories as CategoryData[];
      headers = ['Category', 'Amount', 'Percentage'];
      const total = regularCategories.reduce((sum, cat) => sum + cat.amount, 0);
      tableData = regularCategories.slice(0, 10).map(category => [
        category.label,
        formatIndianCurrency(category.amount),
        `${total > 0 ? ((category.amount / total) * 100).toFixed(1) : 0}%`
      ]);
    }

    this.doc.autoTable({
      startY: this.currentY,
      head: [headers],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: color,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'center' },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addFinancialHealthMetrics(summary: SummaryData, reportData: ReportData[]) {
    this.checkPageBreak(60);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Financial Health Metrics', this.margin, this.currentY);
    this.currentY += 15;

    const savingsRate = summary.totalIncome > 0 ? ((summary.netBalance / summary.totalIncome) * 100).toFixed(1) : '0';
    const assetAllocation = summary.netWorth > 0 ? (summary.totalAssetValue / summary.netWorth * 100).toFixed(1) : '0';
    const expenseRatio = summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) : '0';
    
    let balanceGrowth = '0';
    if (reportData.length > 1) {
      const firstBalance = reportData[0].netBalance;
      const lastBalance = reportData[reportData.length - 1].netBalance;
      if (Math.abs(firstBalance) > 0) {
        balanceGrowth = (((lastBalance - firstBalance) / Math.abs(firstBalance)) * 100).toFixed(1);
      }
    }

    const metricsData = [
      ['Savings Rate', `${savingsRate}%`],
      ['Asset Allocation', `${assetAllocation}%`],
      ['Expense Ratio', `${expenseRatio}%`],
      ['Balance Growth', `${balanceGrowth}%`],
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Value']],
      body: metricsData,
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234], // Purple-600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addFooter(userInfo?: { name: string; email: string }) {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Add footer line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight - 25, this.pageWidth - this.margin, this.pageHeight - 25);
      
      // Add footer text
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      
      // Left side - user info or app name
      const leftText = userInfo ? `Generated for ${userInfo.name}` : 'SpendTrack Financial Report';
      this.doc.text(leftText, this.margin, this.pageHeight - 15);
      
      // Right side - page number
      const pageText = `Page ${i} of ${pageCount}`;
      const pageTextWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.pageWidth - this.margin - pageTextWidth, this.pageHeight - 15);
      
      // Center - generation date
      const dateText = format(new Date(), 'PPP');
      const dateTextWidth = this.doc.getTextWidth(dateText);
      this.doc.text(dateText, (this.pageWidth - dateTextWidth) / 2, this.pageHeight - 15);
    }
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  public generateReport(options: PDFExportOptions): void {
    const {
      reportData,
      summary,
      incomeCategories,
      expenseCategories,
      assetCategories,
      timePeriod,
      reportRange,
      userInfo
    } = options;

    // Add header
    this.addHeader(
      'Financial Performance Report',
      `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Analysis - ${reportRange.replace(/([A-Z])/g, ' $1').trim()}`
    );

    // Add summary section
    this.addSummarySection(summary);

    // Add trends section
    this.addTrendsSection(reportData);

    // Add category breakdowns
    if (incomeCategories.length > 0) {
      this.addCategoryBreakdown('Income Sources', incomeCategories, [34, 197, 94]); // Green-500
    }

    if (expenseCategories.length > 0) {
      this.addCategoryBreakdown('Expense Categories', expenseCategories, [239, 68, 68]); // Red-500
    }

    if (assetCategories.length > 0) {
      this.addCategoryBreakdown('Asset Performance', assetCategories, [168, 85, 247]); // Purple-500
    }

    // Add financial health metrics
    this.addFinancialHealthMetrics(summary, reportData);

    // Add footer
    this.addFooter(userInfo);

    // Save the PDF
    const fileName = `SpendTrack-Report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
    this.doc.save(fileName);
  }
}

// Utility function to export PDF
export const exportFinancialReportToPDF = (options: PDFExportOptions) => {
  const pdfService = new PDFExportService();
  pdfService.generateReport(options);
};