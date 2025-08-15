// Indian Financial Year utilities
// Indian FY runs from April 1 to March 31

export interface FinancialYear {
  startDate: Date;
  endDate: Date;
  label: string;
  shortLabel: string;
}

export function getCurrentFinancialYear(): FinancialYear {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (0 = January)

  let fyStartYear: number;
  let fyEndYear: number;

  if (currentMonth >= 3) { // April (3) onwards
    fyStartYear = currentYear;
    fyEndYear = currentYear + 1;
  } else { // January to March
    fyStartYear = currentYear - 1;
    fyEndYear = currentYear;
  }

  return {
    startDate: new Date(fyStartYear, 3, 1), // April 1
    endDate: new Date(fyEndYear, 2, 31), // March 31
    label: `FY ${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
    shortLabel: `${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
  };
}

export function getFinancialYear(date: Date): FinancialYear {
  const year = date.getFullYear();
  const month = date.getMonth();

  let fyStartYear: number;
  let fyEndYear: number;

  if (month >= 3) { // April onwards
    fyStartYear = year;
    fyEndYear = year + 1;
  } else { // January to March
    fyStartYear = year - 1;
    fyEndYear = year;
  }

  return {
    startDate: new Date(fyStartYear, 3, 1),
    endDate: new Date(fyEndYear, 2, 31),
    label: `FY ${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
    shortLabel: `${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
  };
}

export function getFinancialYearsList(count: number = 5): FinancialYear[] {
  const currentFY = getCurrentFinancialYear();
  const fyList: FinancialYear[] = [];

  for (let i = 0; i < count; i++) {
    const fyStartYear = currentFY.startDate.getFullYear() - i;
    const fyEndYear = fyStartYear + 1;

    fyList.push({
      startDate: new Date(fyStartYear, 3, 1),
      endDate: new Date(fyEndYear, 2, 31),
      label: `FY ${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
      shortLabel: `${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
    });
  }

  return fyList;
}

export function getPreviousFinancialYears(count: number): FinancialYear[] {
  return getFinancialYearsList(count + 1).slice(1); // Exclude current year, get previous ones
}

export function getFinancialQuarters(fy: FinancialYear): Array<{
  quarter: string;
  startDate: Date;
  endDate: Date;
  label: string;
}> {
  const fyStartYear = fy.startDate.getFullYear();
  const fyEndYear = fy.endDate.getFullYear();

  return [
    {
      quarter: 'Q1',
      startDate: new Date(fyStartYear, 3, 1), // Apr 1
      endDate: new Date(fyStartYear, 5, 30), // Jun 30
      label: `Q1 ${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
    },
    {
      quarter: 'Q2',
      startDate: new Date(fyStartYear, 6, 1), // Jul 1
      endDate: new Date(fyStartYear, 8, 30), // Sep 30
      label: `Q2 ${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
    },
    {
      quarter: 'Q3',
      startDate: new Date(fyStartYear, 9, 1), // Oct 1
      endDate: new Date(fyStartYear, 11, 31), // Dec 31
      label: `Q3 ${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
    },
    {
      quarter: 'Q4',
      startDate: new Date(fyEndYear, 0, 1), // Jan 1
      endDate: new Date(fyEndYear, 2, 31), // Mar 31
      label: `Q4 ${fyStartYear}-${fyEndYear.toString().slice(-2)}`,
    },
  ];
}

export function isDateInFinancialYear(date: Date, fy: FinancialYear): boolean {
  return date >= fy.startDate && date <= fy.endDate;
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatIndianNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}