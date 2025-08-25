import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, PiggyBank, TrendingUp, Calendar, DollarSign, Target, Calculator, FileText, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import SavingsAccountForm from "@/components/savings/savings-account-form";
import SavingsTransactionForm from "@/components/savings/savings-transaction-form";
import SavingsAccountDetails from "@/components/savings/savings-account-details";
import type { SavingsAccount, SavingsTransaction } from "@shared/schema";

// Savings scheme configurations
export const SAVINGS_SCHEMES = {
  sukanya_samriddhi: {
    name: "Sukanya Samriddhi Yojana",
    description: "Government scheme for girl child education and marriage",
    minContribution: 250,
    maxContribution: 150000,
    interestRate: 8.0,
    lockInPeriod: 21,
    taxBenefit: true,
    icon: "👧",
    color: "bg-pink-500"
  },
  ppf: {
    name: "Public Provident Fund",
    description: "15-year tax-saving investment scheme",
    minContribution: 500,
    maxContribution: 150000,
    interestRate: 7.1,
    lockInPeriod: 15,
    taxBenefit: true,
    icon: "🏛️",
    color: "bg-blue-500"
  },
  epf: {
    name: "Employee Provident Fund",
    description: "Retirement savings for salaried employees",
    minContribution: 0,
    maxContribution: null,
    interestRate: 8.25,
    lockInPeriod: null,
    taxBenefit: true,
    icon: "👔",
    color: "bg-green-500"
  },
  nsc: {
    name: "National Savings Certificate",
    description: "5-year fixed income investment",
    minContribution: 1000,
    maxContribution: null,
    interestRate: 6.8,
    lockInPeriod: 5,
    taxBenefit: true,
    icon: "📜",
    color: "bg-yellow-500"
  },
  fd: {
    name: "Fixed Deposit",
    description: "Bank fixed deposit with guaranteed returns",
    minContribution: 1000,
    maxContribution: null,
    interestRate: 6.5,
    lockInPeriod: null,
    taxBenefit: false,
    icon: "🏦",
    color: "bg-indigo-500"
  },
  rd: {
    name: "Recurring Deposit",
    description: "Monthly savings with fixed returns",
    minContribution: 100,
    maxContribution: null,
    interestRate: 6.0,
    lockInPeriod: null,
    taxBenefit: false,
    icon: "📅",
    color: "bg-purple-500"
  },
  custom: {
    name: "Custom Savings",
    description: "Create your own savings plan",
    minContribution: null,
    maxContribution: null,
    interestRate: 5.0,
    lockInPeriod: null,
    taxBenefit: false,
    icon: "⚙️",
    color: "bg-gray-500"
  }
};

export default function Savings() {
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch savings accounts
  const { data: savingsAccounts = [], isLoading } = useQuery<SavingsAccount[]>({
    queryKey: ["/api/savings-accounts"],
  });

  // Fetch savings transactions for selected account
  const { data: transactions = [] } = useQuery<SavingsTransaction[]>({
    queryKey: ["/api/savings-transactions", selectedAccount?.id],
    enabled: !!selectedAccount?.id,
  });

  // Delete savings account mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/savings-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-accounts"] });
      toast({
        title: "Success",
        description: "Savings account deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete savings account",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (account: SavingsAccount) => {
    if (confirm(`Are you sure you want to delete "${account.name}"?`)) {
      deleteMutation.mutate(account.id);
    }
  };

  const calculateProgress = (account: SavingsAccount) => {
    if (!account.targetAmount) return 0;
    return Math.min((parseFloat(account.currentBalance) / parseFloat(account.targetAmount)) * 100, 100);
  };

  const calculateMaturityValue = (account: SavingsAccount) => {
    if (!account.maturityDate || !account.interestRate) return null;
    
    const principal = parseFloat(account.currentBalance);
    const rate = parseFloat(account.interestRate) / 100;
    const years = new Date(account.maturityDate).getFullYear() - new Date().getFullYear();
    
    // Simple compound interest calculation
    return principal * Math.pow(1 + rate, years);
  };

  const getSchemeInfo = (schemeType: string) => {
    return SAVINGS_SCHEMES[schemeType as keyof typeof SAVINGS_SCHEMES] || SAVINGS_SCHEMES.custom;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Savings</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Savings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your long-term savings and investment accounts
          </p>
        </div>
        <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Savings Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Savings Account</DialogTitle>
              <DialogDescription>
                Add a new savings account to track your long-term investments
              </DialogDescription>
            </DialogHeader>
            <SavingsAccountForm
              onSuccess={() => {
                setShowAccountForm(false);
                queryClient.invalidateQueries({ queryKey: ["/api/savings-accounts"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {savingsAccounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{savingsAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {savingsAccounts.filter(acc => acc.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Interest Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(savingsAccounts.reduce((sum, acc) => sum + parseFloat(acc.interestRate), 0) / savingsAccounts.length).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Benefits</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {savingsAccounts.filter(acc => acc.taxBenefit).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Savings Accounts */}
      {savingsAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PiggyBank className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Savings Accounts</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Start building your financial future by creating your first savings account
            </p>
            <Button onClick={() => setShowAccountForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Savings Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savingsAccounts.map((account) => {
            const schemeInfo = getSchemeInfo(account.schemeType);
            const progress = calculateProgress(account);
            const maturityValue = calculateMaturityValue(account);
            
            return (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm", schemeInfo.color)}>
                        {schemeInfo.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>{schemeInfo.name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowAccountDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowAccountForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Current Balance */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
                      <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                        {account.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">₹{parseFloat(account.currentBalance).toLocaleString()}</div>
                  </div>

                  {/* Progress towards target */}
                  {account.targetAmount && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>₹{parseFloat(account.currentBalance).toLocaleString()}</span>
                        <span>₹{parseFloat(account.targetAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                      <div className="font-medium">{account.interestRate}% p.a.</div>
                    </div>
                    {account.maturityDate && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Maturity</span>
                        <div className="font-medium">
                          {new Date(account.maturityDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Maturity Value */}
                  {maturityValue && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-sm text-green-700 dark:text-green-300">Estimated Maturity Value</div>
                      <div className="text-lg font-bold text-green-800 dark:text-green-200">
                        ₹{maturityValue.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowTransactionForm(true);
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Transaction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Transaction Form Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a contribution, withdrawal, or interest for {selectedAccount?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <SavingsTransactionForm
              savingsAccount={selectedAccount}
              onSuccess={() => {
                setShowTransactionForm(false);
                queryClient.invalidateQueries({ queryKey: ["/api/savings-accounts"] });
                queryClient.invalidateQueries({ queryKey: ["/api/savings-transactions", selectedAccount.id] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Account Details Dialog */}
      <Dialog open={showAccountDetails} onOpenChange={setShowAccountDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAccount?.name} - Details</DialogTitle>
            <DialogDescription>
              Complete overview of your savings account
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <SavingsAccountDetails
              account={selectedAccount}
              transactions={transactions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}