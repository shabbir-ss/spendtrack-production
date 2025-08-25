import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import type { InsertSavingsTransaction, SavingsAccount } from "@shared/schema";

const savingsTransactionSchema = z.object({
  type: z.enum(["contribution", "withdrawal", "interest", "maturity"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  transactionDate: z.string().min(1, "Transaction date is required"),
  referenceNumber: z.string().optional(),
});

type SavingsTransactionFormData = z.infer<typeof savingsTransactionSchema>;

interface SavingsTransactionFormProps {
  savingsAccount: SavingsAccount;
  onSuccess: () => void;
}

export default function SavingsTransactionForm({ savingsAccount, onSuccess }: SavingsTransactionFormProps) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SavingsTransactionFormData>({
    resolver: zodResolver(savingsTransactionSchema),
    defaultValues: {
      type: "contribution",
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SavingsTransactionFormData) => {
      const currentBalance = parseFloat(savingsAccount.currentBalance);
      const transactionAmount = parseFloat(data.amount);
      
      let newBalance: number;
      if (data.type === "contribution" || data.type === "interest") {
        newBalance = currentBalance + transactionAmount;
      } else {
        newBalance = currentBalance - transactionAmount;
      }

      const payload: Partial<InsertSavingsTransaction> = {
        savingsAccountId: savingsAccount.id,
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        transactionDate: data.transactionDate,
        balanceAfter: newBalance.toString(),
        referenceNumber: data.referenceNumber || null,
        interestEarned: data.type === "interest" ? data.amount : null,
      };

      return await apiRequest("POST", "/savings-transactions", payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction recorded successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SavingsTransactionFormData) => {
    mutation.mutate(data);
  };

  const transactionType = watch("type");

  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case "contribution":
        return {
          label: "Contribution",
          description: "Money added to the savings account",
          color: "text-green-600",
          placeholder: "Enter contribution amount",
        };
      case "withdrawal":
        return {
          label: "Withdrawal",
          description: "Money withdrawn from the savings account",
          color: "text-red-600",
          placeholder: "Enter withdrawal amount",
        };
      case "interest":
        return {
          label: "Interest",
          description: "Interest earned on the savings account",
          color: "text-blue-600",
          placeholder: "Enter interest amount",
        };
      case "maturity":
        return {
          label: "Maturity",
          description: "Maturity amount received",
          color: "text-purple-600",
          placeholder: "Enter maturity amount",
        };
      default:
        return {
          label: "Transaction",
          description: "",
          color: "text-gray-600",
          placeholder: "Enter amount",
        };
    }
  };

  const typeInfo = getTransactionTypeInfo(transactionType);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Account Info */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <div className="text-sm font-medium">{savingsAccount.name}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Current Balance: ₹{parseFloat(savingsAccount.currentBalance).toLocaleString()}
        </div>
      </div>

      {/* Transaction Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Transaction Type *</Label>
        <Select value={transactionType} onValueChange={(value) => setValue("type", value as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contribution">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">+</span>
                <span>Contribution</span>
              </div>
            </SelectItem>
            <SelectItem value="withdrawal">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">-</span>
                <span>Withdrawal</span>
              </div>
            </SelectItem>
            <SelectItem value="interest">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">%</span>
                <span>Interest</span>
              </div>
            </SelectItem>
            <SelectItem value="maturity">
              <div className="flex items-center space-x-2">
                <span className="text-purple-600">★</span>
                <span>Maturity</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {typeInfo.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{typeInfo.description}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount")}
          placeholder={typeInfo.placeholder}
          className={typeInfo.color}
        />
        {errors.amount && (
          <p className="text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Transaction Date */}
      <div className="space-y-2">
        <Label htmlFor="transactionDate">Transaction Date *</Label>
        <Input
          id="transactionDate"
          type="date"
          {...register("transactionDate")}
        />
        {errors.transactionDate && (
          <p className="text-sm text-red-600">{errors.transactionDate.message}</p>
        )}
      </div>

      {/* Reference Number */}
      <div className="space-y-2">
        <Label htmlFor="referenceNumber">Reference Number</Label>
        <Input
          id="referenceNumber"
          {...register("referenceNumber")}
          placeholder="Transaction reference or receipt number"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Additional notes about this transaction..."
          rows={2}
        />
      </div>

      {/* Balance Preview */}
      {watch("amount") && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-sm font-medium">Balance After Transaction</div>
          <div className="text-lg font-bold">
            ₹{(() => {
              const currentBalance = parseFloat(savingsAccount.currentBalance);
              const amount = parseFloat(watch("amount") || "0");
              const newBalance = transactionType === "contribution" || transactionType === "interest"
                ? currentBalance + amount
                : currentBalance - amount;
              return newBalance.toLocaleString();
            })()}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Recording..." : "Record Transaction"}
        </Button>
      </div>
    </form>
  );
}