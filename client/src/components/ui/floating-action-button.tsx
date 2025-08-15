import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, PlusCircle, MinusCircle, Gem, Bell, X, FileText, ArrowLeftRight } from "lucide-react";
import AddIncomeModal from "@/components/modals/add-income-modal";
import AddExpenseModal from "@/components/modals/add-expense-modal";
import AddAssetModal from "@/components/modals/add-asset-modal";
import AddBillModal from "@/components/modals/add-bill-modal";
import QuickReportGenerator from "@/components/reports/quick-report-generator";
import TransferModal from "@/components/modals/transfer-modal";

const quickActions = [
  {
    name: "Add Income",
    icon: PlusCircle,
    color: "bg-green-500 hover:bg-green-600",
    component: AddIncomeModal,
  },
  {
    name: "Add Expense", 
    icon: MinusCircle,
    color: "bg-red-500 hover:bg-red-600",
    component: AddExpenseModal,
  },
  {
    name: "Add Asset",
    icon: Gem,
    color: "bg-purple-500 hover:bg-purple-600", 
    component: AddAssetModal,
  },
  {
    name: "Add Bill",
    icon: Bell,
    color: "bg-orange-500 hover:bg-orange-600",
    component: AddBillModal,
  },
  {
    name: "Generate Report",
    icon: FileText,
    color: "bg-blue-500 hover:bg-blue-600",
    component: QuickReportGenerator,
  },
  {
    name: "Transfer",
    icon: ArrowLeftRight,
    color: "bg-amber-500 hover:bg-amber-600",
    component: TransferModal,
  },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40">
      {/* Quick Action Buttons */}
      <div className={cn(
        "flex flex-col space-y-3 mb-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          const Component = action.component;
          
          return (
            <Component key={action.name}>
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg text-white transition-all hover:scale-105",
                  action.color
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Component>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-105",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}