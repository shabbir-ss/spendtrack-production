import { format } from 'date-fns';
import { formatIndianCurrency } from '@/lib/indian-financial-year';

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

export interface ReportTemplateData {
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

// HTML template for print-friendly reports
export const generateHTMLReport = (data: ReportTemplateData): string => {
  const {
    reportData,
    summary,
    incomeCategories,
    expenseCategories,
    assetCategories,
    timePeriod,
    reportRange,
    userInfo
  } = data;

  const currentDate = format(new Date(), 'PPP');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SpendTrack Financial Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .header .subtitle {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .header .date {
          font-size: 14px;
          opacity: 0.8;
          margin-top: 10px;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        
        .summary-card .label {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .summary-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
        }
        
        .summary-card.income .value {
          color: #059669;
        }
        
        .summary-card.expense .value {
          color: #dc2626;
        }
        
        .summary-card.balance .value {
          color: #2563eb;
        }
        
        .summary-card.asset .value {
          color: #7c3aed;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        th {
          background: #f1f5f9;
          font-weight: 600;
          color: #334155;
        }
        
        tr:hover {
          background: #f8fafc;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        
        .category-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
        }
        
        .category-section h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #1e293b;
        }
        
        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .category-item:last-child {
          border-bottom: none;
        }
        
        .category-label {
          font-weight: 500;
        }
        
        .category-amount {
          font-weight: 600;
        }
        
        .income-amount {
          color: #059669;
        }
        
        .expense-amount {
          color: #dc2626;
        }
        
        .asset-amount {
          color: #7c3aed;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }
        
        .metric-card {
          text-align: center;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 5px;
        }
        
        .metric-label {
          font-size: 14px;
          color: #64748b;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        
        @media print {
          .container {
            padding: 0;
            max-width: none;
          }
          
          .section {
            page-break-inside: avoid;
          }
          
          .header {
            background: #3b82f6 !important;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>SpendTrack Financial Report</h1>
          <div class="subtitle">${timePeriod} - ${reportRange}</div>
          ${userInfo ? `<div class="date">Generated for ${userInfo.name} on ${currentDate}</div>` : `<div class="date">Generated on ${currentDate}</div>`}
        </div>

        <!-- Summary Section -->
        <div class="section">
          <h2 class="section-title">Financial Summary</h2>
          <div class="summary-grid">
            <div class="summary-card income">
              <div class="label">Total Income</div>
              <div class="value">${formatIndianCurrency(summary.totalIncome)}</div>
            </div>
            <div class="summary-card expense">
              <div class="label">Total Expenses</div>
              <div class="value">${formatIndianCurrency(summary.totalExpenses)}</div>
            </div>
            <div class="summary-card balance">
              <div class="label">Net Balance</div>
              <div class="value">${formatIndianCurrency(summary.netBalance)}</div>
            </div>
            <div class="summary-card asset">
              <div class="label">Total Assets</div>
              <div class="value">${formatIndianCurrency(summary.totalAssetValue)}</div>
            </div>
          </div>
        </div>

        <!-- Trends Section -->
        ${reportData.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Financial Trends</h2>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th class="text-right">Income</th>
                <th class="text-right">Expenses</th>
                <th class="text-right">Net Balance</th>
                <th class="text-right">Assets</th>
                <th class="text-center">Savings Rate</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(period => `
                <tr>
                  <td>${period.period}</td>
                  <td class="text-right income-amount">${formatIndianCurrency(period.income)}</td>
                  <td class="text-right expense-amount">${formatIndianCurrency(period.expenses)}</td>
                  <td class="text-right">${formatIndianCurrency(period.netBalance)}</td>
                  <td class="text-right asset-amount">${formatIndianCurrency(period.assetValue)}</td>
                  <td class="text-center">${period.income > 0 ? ((period.netBalance / period.income) * 100).toFixed(1) : 0}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Category Breakdowns -->
        <div class="section">
          <h2 class="section-title">Category Analysis</h2>
          <div class="category-grid">
            ${incomeCategories.length > 0 ? `
            <div class="category-section">
              <h3>Income Sources</h3>
              ${incomeCategories.slice(0, 8).map(category => `
                <div class="category-item">
                  <span class="category-label">${category.label}</span>
                  <span class="category-amount income-amount">${formatIndianCurrency(category.amount)}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${expenseCategories.length > 0 ? `
            <div class="category-section">
              <h3>Expense Categories</h3>
              ${expenseCategories.slice(0, 8).map(category => `
                <div class="category-item">
                  <span class="category-label">${category.label}</span>
                  <span class="category-amount expense-amount">${formatIndianCurrency(category.amount)}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${assetCategories.length > 0 ? `
            <div class="category-section">
              <h3>Asset Performance</h3>
              ${assetCategories.slice(0, 8).map(category => `
                <div class="category-item">
                  <span class="category-label">${category.label}</span>
                  <span class="category-amount asset-amount">${formatIndianCurrency(category.currentValue)}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Financial Health Metrics -->
        <div class="section">
          <h2 class="section-title">Financial Health Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${summary.totalIncome > 0 ? ((summary.netBalance / summary.totalIncome) * 100).toFixed(1) : 0}%</div>
              <div class="metric-label">Savings Rate</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${summary.netWorth > 0 ? (summary.totalAssetValue / summary.netWorth * 100).toFixed(1) : 0}%</div>
              <div class="metric-label">Asset Allocation</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) : 0}%</div>
              <div class="metric-label">Expense Ratio</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${formatIndianCurrency(summary.netWorth)}</div>
              <div class="metric-label">Net Worth</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Generated by SpendTrack Financial Management System</p>
          ${userInfo ? `<p>Report prepared for ${userInfo.name} (${userInfo.email})</p>` : ''}
          <p>This report contains confidential financial information</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to print HTML report
export const printHTMLReport = (data: ReportTemplateData) => {
  const htmlContent = generateHTMLReport(data);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};