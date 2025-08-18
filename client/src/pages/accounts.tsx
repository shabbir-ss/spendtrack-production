import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Wallet, CreditCard, Banknote, Building2, Trash2, Edit3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type: string; // bank | wallet | credit_card | cash
  balance: string | number;
  institution?: string | null;
  last4?: string | null;
}

export default function AccountsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch accounts
  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: () => apiRequest("GET", "/accounts"),
  });

  // Create account
  const createMutation = useMutation({
    mutationFn: (data: Partial<Account>) => apiRequest("POST", "/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast({ title: "Success", description: "Account created successfully!" });
      setForm({ name: "", type: "bank", balance: "0.00", institution: "", last4: "" });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to create account" }),
  });

  // Update account
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Account> & { id: string }) => apiRequest("PUT", `/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast({ title: "Updated", description: "Account updated successfully!" });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update account" }),
  });

  // Delete account
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast({ title: "Deleted", description: "Account deleted successfully!" });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to delete account" }),
  });

  // Local form
  const [form, setForm] = useState({ name: "", type: "bank", balance: "0.00", institution: "", last4: "" });

  const onCreate = () => {
    if (!form.name.trim()) return toast({ variant: "destructive", title: "Name required" });
    createMutation.mutate(form);
  };

  // Simple inline edit for balance (manual adjustments supported)
  const onInlineUpdate = (acc: Account, patch: Partial<Account>) => {
    updateMutation.mutate({ id: acc.id, ...patch });
  };

  const totalByType = useMemo(() => {
    const res: Record<string, number> = {};
    accounts.forEach(a => {
      const bal = typeof a.balance === "string" ? parseFloat(a.balance) : a.balance;
      res[a.type] = (res[a.type] || 0) + (bal || 0);
    });
    return res;
  }, [accounts]);

  const accountTypeIcons = {
    bank: Building2,
    wallet: Wallet,
    credit_card: CreditCard,
    cash: Banknote,
  };

  const accountTypeLabels = {
    bank: "Bank Account",
    wallet: "Digital Wallet",
    credit_card: "Credit Card",
    cash: "Cash",
  };

  const totalBalance = accounts.reduce((sum, acc) => {
    const bal = typeof acc.balance === "string" ? parseFloat(acc.balance) : acc.balance;
    return sum + (bal || 0);
  }, 0);

  return (
    <div className="h-full flex flex-col space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Accounts</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Manage your financial accounts and balances</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-4">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
                  <p className="text-2xl lg:text-3xl font-bold text-blue-600">{formatCurrency(totalBalance)}</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {accounts.length} accounts
                  </p>
                </div>
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Account Form */}
      <div className="flex-shrink-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Name</label>
                <Input 
                  placeholder="e.g., Main Checking" 
                  value={form.name} 
                  onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <Select value={form.type} onValueChange={(v) => setForm(s => ({ ...s, type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="wallet">Digital Wallet</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    ₹
                  </span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className="pl-8"
                    value={form.balance} 
                    onChange={(e) => setForm(s => ({ ...s, balance: e.target.value }))} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution (Optional)</label>
                <Input 
                  placeholder="e.g., Chase Bank" 
                  value={form.institution} 
                  onChange={(e) => setForm(s => ({ ...s, institution: e.target.value }))} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Last 4 Digits (Optional)</label>
                <Input 
                  placeholder="1234" 
                  maxLength={4}
                  value={form.last4} 
                  onChange={(e) => setForm(s => ({ ...s, last4: e.target.value }))} 
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={onCreate} 
                  disabled={createMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? "Adding..." : "Add Account"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No accounts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Add your first account to start tracking your finances
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const bal = typeof acc.balance === "string" ? parseFloat(acc.balance) : acc.balance;
                const isCredit = acc.type === "credit_card";
                const IconComponent = accountTypeIcons[acc.type as keyof typeof accountTypeIcons] || Wallet;
                
                return (
                  <Card key={acc.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{acc.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {accountTypeLabels[acc.type as keyof typeof accountTypeLabels] || acc.type}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMutation.mutate(acc.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {isCredit ? `Owed: ${formatCurrency(bal)}` : formatCurrency(bal)}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={bal}
                            onChange={(e) => onInlineUpdate(acc, { balance: e.target.value })}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onInlineUpdate(acc, { balance: acc.balance })}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {(acc.institution || acc.last4) && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {acc.institution} {acc.last4 ? `• ****${acc.last4}` : ""}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Account Type Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(totalByType).map(([type, value]) => {
                    const IconComponent = accountTypeIcons[type as keyof typeof accountTypeIcons] || Wallet;
                    return (
                      <div key={type} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <div className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">
                            {accountTypeLabels[type as keyof typeof accountTypeLabels] || type}
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}