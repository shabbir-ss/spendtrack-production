import React, { useState } from 'react';
import { Plus, PiggyBank, TrendingUp, Calendar, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  nsc: {
    name: "National Savings Certificate",
    description: "5-year fixed deposit scheme",
    minContribution: 1000,
    maxContribution: null,
    interestRate: 6.8,
    lockInPeriod: 5,
    taxBenefit: true,
    icon: "📜",
    color: "bg-green-500"
  },
  fd: {
    name: "Fixed Deposit",
    description: "Traditional bank fixed deposit",
    minContribution: 1000,
    maxContribution: null,
    interestRate: 6.5,
    lockInPeriod: 1,
    taxBenefit: false,
    icon: "🏦",
    color: "bg-orange-500"
  },
  rd: {
    name: "Recurring Deposit",
    description: "Monthly savings scheme",
    minContribution: 500,
    maxContribution: null,
    interestRate: 6.0,
    lockInPeriod: 1,
    taxBenefit: false,
    icon: "📅",
    color: "bg-purple-500"
  }
};

export default function Savings() {
  const [showAccountForm, setShowAccountForm] = useState(false);

  // Mock data for demonstration
  const mockAccounts = [
    {
      id: "1",
      name: "My Daughter's Sukanya Samriddhi",
      schemeType: "sukanya_samriddhi",
      currentBalance: "45000",
      targetAmount: "500000",
      interestRate: "8.0",
      maturityDate: "2045-03-15",
      openingDate: "2024-03-15",
      institution: "State Bank of India"
    },
    {
      id: "2", 
      name: "Retirement PPF",
      schemeType: "ppf",
      currentBalance: "125000",
      targetAmount: "1500000",
      interestRate: "7.1",
      maturityDate: "2039-04-01",
      openingDate: "2024-04-01",
      institution: "HDFC Bank"
    }
  ];

  const calculateProgress = (current: string, target: string) => {
    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);
    return targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  };

  const calculateMaturityValue = (account: any) => {
    const scheme = SAVINGS_SCHEMES[account.schemeType as keyof typeof SAVINGS_SCHEMES];
    const currentBalance = parseFloat(account.currentBalance);
    const interestRate = parseFloat(account.interestRate) / 100;
    const yearsToMaturity = new Date(account.maturityDate).getFullYear() - new Date().getFullYear();
    
    // Simple compound interest calculation
    return currentBalance * Math.pow(1 + interestRate, yearsToMaturity);
  };

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
        <Button onClick={() => setShowAccountForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Savings Account
        </Button>
      </div>

      {/* Savings Schemes Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(SAVINGS_SCHEMES).map(([key, scheme]) => (
          <Card key={key} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{scheme.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{scheme.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {scheme.interestRate}% p.a. • {scheme.lockInPeriod} years
                    </CardDescription>
                  </div>
                </div>
                {scheme.taxBenefit && (
                  <Badge variant="secondary" className="text-xs">
                    Tax Benefit
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {scheme.description}
              </p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min: ₹{scheme.minContribution.toLocaleString()}</span>
                {scheme.maxContribution && (
                  <span>Max: ₹{scheme.maxContribution.toLocaleString()}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Savings Accounts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Savings Accounts</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {mockAccounts.map((account) => {
            const scheme = SAVINGS_SCHEMES[account.schemeType as keyof typeof SAVINGS_SCHEMES];
            const progress = calculateProgress(account.currentBalance, account.targetAmount);
            const maturityValue = calculateMaturityValue(account);

            return (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full ${scheme.color} flex items-center justify-center text-white text-xl`}>
                        {scheme.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{account.name}</CardTitle>
                        <CardDescription>{scheme.name}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{account.institution}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Balance */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{parseFloat(account.currentBalance).toLocaleString()}
                    </span>
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

                  {/* Account Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                      <div className="font-medium">{account.interestRate}% p.a.</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Maturity</span>
                      <div className="font-medium">
                        {new Date(account.maturityDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Maturity Value Projection */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-sm text-green-700 dark:text-green-300">Estimated Maturity Value</div>
                    <div className="text-lg font-bold text-green-800 dark:text-green-200">
                      ₹{maturityValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Plus className="mr-1 h-3 w-3" />
                      Add Transaction
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Account Form Placeholder */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Savings Account</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This form will allow you to create new savings accounts for various schemes.
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => setShowAccountForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setShowAccountForm(false)} className="flex-1">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}