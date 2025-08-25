import { TrendingUp, TrendingDown, Scale, Diamond } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssetValue: number;
  compact?: boolean;
  className?: string;
}

export default function SummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
  totalAssetValue,
  compact = false,
  className,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Income",
      value: formatIndianCurrency(totalIncome),
      subtitle: "Income this period",
      icon: TrendingUp,
      iconColor: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/50",
      valueColor: "income-color",
    },
    {
      title: "Total Expenses",
      value: formatIndianCurrency(totalExpenses),
      subtitle: "Expenses this period",
      icon: TrendingDown,
      iconColor: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/50",
      valueColor: "expense-color",
    },
    {
      title: "Net Balance",
      value: formatIndianCurrency(netBalance),
      subtitle: "Available balance",
      icon: Scale,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/50",
      valueColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Asset Portfolio",
      value: formatIndianCurrency(totalAssetValue),
      subtitle: "Current asset value",
      icon: Diamond,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/50",
      valueColor: "asset-color",
    },
  ];

  return (
    <div className={cn(
      "grid gap-4",
      compact 
        ? "grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4" 
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6",
      className
    )}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="transition-all hover:shadow-md">
            <CardContent className={cn(
              compact ? "p-4 lg:p-6" : "p-6"
            )}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "font-medium text-gray-600 dark:text-gray-400 truncate",
                    compact ? "text-xs sm:text-sm" : "text-sm"
                  )}>
                    {card.title}
                  </p>
                  <p className={cn(
                    "font-bold truncate",
                    card.valueColor,
                    compact ? "text-lg sm:text-xl lg:text-2xl" : "text-2xl"
                  )}>
                    {card.value}
                  </p>
                  <p className={cn(
                    card.valueColor,
                    compact ? "text-xs hidden sm:block" : "text-xs"
                  )}>
                    {card.subtitle}
                  </p>
                </div>
                <div className={cn(
                  "rounded-lg flex items-center justify-center flex-shrink-0",
                  card.bgColor,
                  compact ? "w-10 h-10 sm:w-12 sm:h-12" : "w-12 h-12"
                )}>
                  <Icon className={cn(
                    card.iconColor,
                    compact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5"
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
