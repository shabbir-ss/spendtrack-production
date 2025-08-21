import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SAVINGS_SCHEMES } from "@/pages/savings";
import type { InsertSavingsAccount, SavingsAccount } from "@shared/schema";

const savingsAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  schemeType: z.string().min(1, "Scheme type is required"),
  accountNumber: z.string().optional(),
  institution: z.string().optional(),
  interestRate: z.string().min(1, "Interest rate is required"),
  maturityDate: z.string().optional(),
  maturityAmount: z.string().optional(),
  targetAmount: z.string().optional(),
  minContribution: z.string().optional(),
  maxContribution: z.string().optional(),
  contributionFrequency: z.string().default("monthly"),
  lockInPeriod: z.string().optional(),
  taxBenefit: z.boolean().default(false),
  openingDate: z.string().min(1, "Opening date is required"),
  notes: z.string().optional(),
});

type SavingsAccountFormData = z.infer<typeof savingsAccountSchema>;

interface SavingsAccountFormProps {
  account?: SavingsAccount;
  onSuccess: () => void;
}

export default function SavingsAccountForm({ account, onSuccess }: SavingsAccountFormProps) {
  const [selectedScheme, setSelectedScheme] = useState(account?.schemeType || "");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SavingsAccountFormData>({
    resolver: zodResolver(savingsAccountSchema),
    defaultValues: account ? {
      name: account.name,
      schemeType: account.schemeType,
      accountNumber: account.accountNumber || "",
      institution: account.institution || "",
      interestRate: account.interestRate,
      maturityDate: account.maturityDate || "",
      maturityAmount: account.maturityAmount || "",
      targetAmount: account.targetAmount || "",
      minContribution: account.minContribution || "",
      maxContribution: account.maxContribution || "",
      contributionFrequency: account.contributionFrequency || "monthly",
      lockInPeriod: account.lockInPeriod?.toString() || "",
      taxBenefit: account.taxBenefit || false,
      openingDate: account.openingDate,
      notes: account.notes || "",
    } : {
      contributionFrequency: "monthly",
      taxBenefit: false,
      openingDate: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SavingsAccountFormData) => {
      const url = account ? `/api/savings-accounts/${account.id}` : "/api/savings-accounts";
      const method = account ? "PUT" : "POST";
      
      const payload: Partial<InsertSavingsAccount> = {
        name: data.name,
        schemeType: data.schemeType,
        accountNumber: data.accountNumber || null,
        institution: data.institution || null,
        interestRate: data.interestRate,
        maturityDate: data.maturityDate || null,
        maturityAmount: data.maturityAmount || null,
        targetAmount: data.targetAmount || null,
        minContribution: data.minContribution || null,
        maxContribution: data.maxContribution || null,
        contributionFrequency: data.contributionFrequency,
        lockInPeriod: data.lockInPeriod ? parseInt(data.lockInPeriod) : null,
        taxBenefit: data.taxBenefit,
        openingDate: data.openingDate,
        notes: data.notes || null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save savings account");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Savings account ${account ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${account ? 'update' : 'create'} savings account`,
        variant: "destructive",
      });
    },
  });

  const handleSchemeChange = (schemeType: string) => {
    setSelectedScheme(schemeType);
    const scheme = SAVINGS_SCHEMES[schemeType as keyof typeof SAVINGS_SCHEMES];
    
    if (scheme) {
      setValue("schemeType", schemeType);
      setValue("interestRate", scheme.interestRate.toString());
      setValue("taxBenefit", scheme.taxBenefit);
      
      if (scheme.minContribution) {
        setValue("minContribution", scheme.minContribution.toString());
      }
      if (scheme.maxContribution) {
        setValue("maxContribution", scheme.maxContribution.toString());
      }
      if (scheme.lockInPeriod) {
        setValue("lockInPeriod", scheme.lockInPeriod.toString());
      }
    }
  };

  const calculateMaturityDate = () => {
    const openingDate = watch("openingDate");
    const lockInPeriod = watch("lockInPeriod");
    
    if (openingDate && lockInPeriod) {
      const opening = new Date(openingDate);
      const maturity = new Date(opening);
      maturity.setFullYear(maturity.getFullYear() + parseInt(lockInPeriod));
      setValue("maturityDate", maturity.toISOString().split('T')[0]);
    }
  };

  const onSubmit = (data: SavingsAccountFormData) => {
    mutation.mutate(data);
  };

  const schemeInfo = selectedScheme ? SAVINGS_SCHEMES[selectedScheme as keyof typeof SAVINGS_SCHEMES] : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Scheme Selection */}
      <div className="space-y-2">
        <Label htmlFor="schemeType">Savings Scheme *</Label>
        <Select value={selectedScheme} onValueChange={handleSchemeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a savings scheme" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SAVINGS_SCHEMES).map(([key, scheme]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center space-x-2">
                  <span>{scheme.icon}</span>
                  <div>
                    <div className="font-medium">{scheme.name}</div>
                    <div className="text-xs text-gray-500">{scheme.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.schemeType && (
          <p className="text-sm text-red-600">{errors.schemeType.message}</p>
        )}
      </div>

      {/* Scheme Info Card */}
      {schemeInfo && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <span>{schemeInfo.icon}</span>
              <span>{schemeInfo.name}</span>
            </CardTitle>
            <CardDescription>{schemeInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
                <div className="font-medium">{schemeInfo.interestRate}% p.a.</div>
              </div>
              {schemeInfo.lockInPeriod && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Lock-in Period:</span>
                  <div className="font-medium">{schemeInfo.lockInPeriod} years</div>
                </div>
              )}
              {schemeInfo.minContribution && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Min Contribution:</span>
                  <div className="font-medium">₹{schemeInfo.minContribution.toLocaleString()}</div>
                </div>
              )}
              {schemeInfo.maxContribution && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Max Contribution:</span>
                  <div className="font-medium">₹{schemeInfo.maxContribution.toLocaleString()}</div>
                </div>
              )}
            </div>
            {schemeInfo.taxBenefit && (
              <div className="mt-2 text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                ✓ Tax benefits available under Section 80C
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Account Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g., My PPF Account"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            {...register("institution")}
            placeholder="e.g., SBI, HDFC Bank"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            {...register("accountNumber")}
            placeholder="Account/Policy number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="openingDate">Opening Date *</Label>
          <Input
            id="openingDate"
            type="date"
            {...register("openingDate")}
            onChange={(e) => {
              register("openingDate").onChange(e);
              calculateMaturityDate();
            }}
          />
          {errors.openingDate && (
            <p className="text-sm text-red-600">{errors.openingDate.message}</p>
          )}
        </div>
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (% p.a.) *</Label>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            {...register("interestRate")}
            placeholder="7.5"
          />
          {errors.interestRate && (
            <p className="text-sm text-red-600">{errors.interestRate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount (₹)</Label>
          <Input
            id="targetAmount"
            type="number"
            {...register("targetAmount")}
            placeholder="500000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minContribution">Min Contribution (₹)</Label>
          <Input
            id="minContribution"
            type="number"
            {...register("minContribution")}
            placeholder="500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxContribution">Max Contribution (₹)</Label>
          <Input
            id="maxContribution"
            type="number"
            {...register("maxContribution")}
            placeholder="150000"
          />
        </div>
      </div>

      {/* Maturity Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lockInPeriod">Lock-in Period (Years)</Label>
          <Input
            id="lockInPeriod"
            type="number"
            {...register("lockInPeriod")}
            placeholder="15"
            onChange={(e) => {
              register("lockInPeriod").onChange(e);
              calculateMaturityDate();
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maturityDate">Maturity Date</Label>
          <Input
            id="maturityDate"
            type="date"
            {...register("maturityDate")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maturityAmount">Expected Maturity Amount (₹)</Label>
          <Input
            id="maturityAmount"
            type="number"
            {...register("maturityAmount")}
            placeholder="1000000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contributionFrequency">Contribution Frequency</Label>
          <Select value={watch("contributionFrequency")} onValueChange={(value) => setValue("contributionFrequency", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tax Benefit */}
      <div className="flex items-center space-x-2">
        <Switch
          id="taxBenefit"
          checked={watch("taxBenefit")}
          onCheckedChange={(checked) => setValue("taxBenefit", checked)}
        />
        <Label htmlFor="taxBenefit">Tax benefits available</Label>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes about this savings account..."
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : account ? "Update Account" : "Create Account"}
        </Button>
      </div>
    </form>
  );
}