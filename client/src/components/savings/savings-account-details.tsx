import { useState } from "react";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Percent, Star, Calendar, DollarSign, Target, FileText, Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SAVINGS_SCHEMES } from "@/pages/savings";
import type { SavingsAccount, SavingsTransaction } from "@shared/schema";

interface SavingsAccountDetailsProps {
  account: SavingsAccount;
  transactions: SavingsTransaction[];
}

export default function SavingsAccountDetails({ account, transactions }: SavingsAccountDetailsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const schemeInfo = SAVINGS_SCHEMES[account.schemeType as keyof typeof SAVINGS_SCHEMES] || SAVINGS_SCHEMES.custom;

  // Calculate various metrics
  const totalContributions = transactions
    .filter(t => t.type === "contribution")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalInterest = transactions
    .filter(t => t.type === "interest")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const currentBalance = parseFloat(account.currentBalance);
  const targetAmount = account.targetAmount ? parseFloat(account.targetAmount) : null;
  const progress = targetAmount ? Math.min((currentBalance / targetAmount) * 100, 100) : 0;

  // Calculate projected maturity value
  const calculateProjectedMaturity = () => {
    if (!account.maturityDate || !account.interestRate) return null;
    
    const yearsToMaturity = (new Date(account.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (yearsToMaturity <= 0) return currentBalance;
    
    const rate = parseFloat(account.interestRate) / 100;
    return currentBalance * Math.pow(1 + rate, yearsToMaturity);
  };

  const projectedMaturity = calculateProjectedMaturity();

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "contribution":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "withdrawal":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "interest":
        return <Percent className="h-4 w-4 text-blue-600" />;
      case "maturity":
        return <Star className="h-4 w-4 text-purple-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get transaction color
  const getTransactionColor = (type: string) => {
    switch (type) {
      case "contribution":
        return "text-green-600";
      case "withdrawal":
        return "text-red-600";
      case "interest":
        return "text-blue-600";
      case "maturity":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{currentBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {account.status === 'active' ? 'Active' : 'Inactive'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === "contribution").length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalInterest.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {account.interestRate}% p.a.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalContributions > 0 ? (((currentBalance - totalContributions + totalWithdrawals) / totalContributions) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Total return
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Projections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Target Progress */}
        {targetAmount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Target Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span>₹{currentBalance.toLocaleString()}</span>
                <span>₹{targetAmount.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Remaining: ₹{Math.max(0, targetAmount - currentBalance).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Maturity Projection */}
        {projectedMaturity && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Maturity Projection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Maturity Date</div>
                <div className="font-medium">
                  {account.maturityDate ? format(new Date(account.maturityDate), "PPP") : "Not set"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Projected Value</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{projectedMaturity.toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Expected gain: ₹{(projectedMaturity - currentBalance).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-sm", schemeInfo.color)}>
              {schemeInfo.icon}
            </div>
            <span>Account Details</span>
          </CardTitle>
          <CardDescription>{schemeInfo.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Account Number</div>
              <div className="font-medium">{account.accountNumber || "Not provided"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Institution</div>
              <div className="font-medium">{account.institution || "Not provided"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Opening Date</div>
              <div className="font-medium">{format(new Date(account.openingDate), "PPP")}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</div>
              <div className="font-medium">{account.interestRate}% p.a.</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contribution Frequency</div>
              <div className="font-medium capitalize">{account.contributionFrequency}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tax Benefit</div>
              <div className="font-medium">
                {account.taxBenefit ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>
            </div>
            {account.lockInPeriod && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Lock-in Period</div>
                <div className="font-medium">{account.lockInPeriod} years</div>
              </div>
            )}
            {account.minContribution && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Min Contribution</div>
                <div className="font-medium">₹{parseFloat(account.minContribution).toLocaleString()}</div>
              </div>
            )}
            {account.maxContribution && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Max Contribution</div>
                <div className="font-medium">₹{parseFloat(account.maxContribution).toLocaleString()}</div>
              </div>
            )}
          </div>
          {account.notes && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Notes</div>
              <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                {account.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Transaction History</span>
          </CardTitle>
          <CardDescription>
            {transactions.length} transactions recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transactionDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span className={cn("capitalize", getTransactionColor(transaction.type))}>
                            {transaction.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("font-medium", getTransactionColor(transaction.type))}>
                          {transaction.type === "withdrawal" ? "-" : "+"}₹{parseFloat(transaction.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        ₹{parseFloat(transaction.balanceAfter).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.referenceNumber || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}