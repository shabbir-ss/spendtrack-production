import { TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, CreditCard } from "lucide-react";
import ResponsiveCard from "@/components/ui/responsive-card";
import { formatIndianCurrency } from "@/lib/indian-financial-year";

interface MobileSummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssetValue: number;
}

export default function MobileSummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
  totalAssetValue,
}: MobileSummaryCardsProps) {
  const cards = [
    {
      title: "Total Income",
      value: formatIndianCurrency(totalIncome),
      icon: TrendingUp,
      iconColor: "text-green-500",
      subtitle: "This financial year",
    },
    {
      title: "Total Expenses", 
      value: formatIndianCurrency(totalExpenses),
      icon: TrendingDown,
      iconColor: "text-red-500",
      subtitle: "This financial year",
    },
    {
      title: "Net Balance",
      value: formatIndianCurrency(netBalance),
      icon: DollarSign,
      iconColor: netBalance >= 0 ? "text-green-500" : "text-red-500",
      subtitle: "Income - Expenses",
    },
    {
      title: "Total Assets",
      value: formatIndianCurrency(totalAssetValue),
      icon: PiggyBank,
      iconColor: "text-purple-500",
      subtitle: "Current value",
    },
  ];

  return (
    <>
      {/* Mobile: 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {cards.map((card) => (
          <ResponsiveCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconColor={card.iconColor}
            compact={true}
          />
        ))}
      </div>

      {/* Tablet: 2x2 Grid with more space */}
      <div className="hidden sm:grid md:hidden grid-cols-2 gap-4">
        {cards.map((card) => (
          <ResponsiveCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      {/* Desktop: 4 columns */}
      <div className="hidden md:grid grid-cols-4 gap-6">
        {cards.map((card) => (
          <ResponsiveCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            iconColor={card.iconColor}
          />
        ))}
      </div>
    </>
  );
}