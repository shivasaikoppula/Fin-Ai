import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FinanceNavbar from "@/components/FinanceNavbar";
import HealthScoreCard from "@/components/HealthScoreCard";
import TransactionCard from "@/components/TransactionCard";
import BudgetCard from "@/components/BudgetCard";
import GoalCard from "@/components/GoalCard";
import FraudAlert from "@/components/FraudAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";

export default function FinanceDashboard() {
  // TODO: replace with real user ID from auth
  const userId = "demo-user";

  // TODO: remove mock data - fetch from API
  const mockDashboardData = {
    totalSpend: 3245.67,
    totalIncome: 5200.00,
    savings: 1954.33,
    fraudAlerts: 2,
    healthScore: 78,
    transactionCount: 42,
  };

  const mockHealthComponents = {
    incomeStability: 85,
    expenseRatio: 72,
    savingsRate: 68,
    debtRatio: 80,
    liquidity: 75,
  };

  const mockTransactions = [
    {
      id: "1",
      merchant: "Whole Foods Market",
      amount: "127.43",
      category: "Groceries",
      date: new Date(2025, 10, 22),
      type: "expense" as const,
    },
    {
      id: "2",
      merchant: "Shell Gas Station",
      amount: "52.18",
      category: "Transportation",
      date: new Date(2025, 10, 21),
      type: "expense" as const,
    },
    {
      id: "3",
      merchant: "Monthly Salary",
      amount: "5200.00",
      category: "Income",
      date: new Date(2025, 10, 1),
      type: "income" as const,
    },
    {
      id: "4",
      merchant: "Unknown Merchant XYZ",
      amount: "999.99",
      category: "Shopping",
      date: new Date(2025, 10, 23),
      type: "expense" as const,
      isFraudulent: true,
    },
  ];

  const mockBudgets = [
    { category: "Food & Dining", spent: 425.67, limit: 500, period: "monthly" },
    { category: "Transportation", spent: 280.50, limit: 250, period: "monthly" },
    { category: "Shopping", spent: 180.00, limit: 300, period: "monthly" },
  ];

  const mockGoals = [
    {
      name: "Emergency Fund",
      current: 3500,
      target: 10000,
      deadline: new Date(2026, 5, 1),
      type: "emergency_fund" as const,
    },
    {
      name: "Vacation to Europe",
      current: 1200,
      target: 3000,
      deadline: new Date(2026, 2, 15),
      type: "vacation" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FinanceNavbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl md:text-4xl mb-2">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your complete financial overview at a glance
          </p>
        </div>

        {/* Fraud Alerts */}
        {mockTransactions.filter(t => t.isFraudulent).length > 0 && (
          <div className="mb-6">
            <FraudAlert
              merchant="Unknown Merchant XYZ"
              amount="999.99"
              reason="First-time merchant with large amount"
              onDismiss={() => console.log('Fraud dismissed')}
              onConfirm={() => console.log('Transaction confirmed legitimate')}
            />
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-accent">
                ${mockDashboardData.totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                ${mockDashboardData.totalSpend.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-primary">
                ${mockDashboardData.savings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {((mockDashboardData.savings / mockDashboardData.totalIncome) * 100).toFixed(1)}% savings rate
              </p>
            </CardContent>
          </Card>

          <HealthScoreCard
            score={mockDashboardData.healthScore}
            change={5}
            components={mockHealthComponents}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-serif font-semibold text-xl">Recent Transactions</h2>
            <div className="space-y-2">
              {mockTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} {...transaction} />
              ))}
            </div>
          </div>

          {/* Sidebar: Budgets and Goals */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif font-semibold text-xl mb-4">Budget Overview</h2>
              <div className="space-y-4">
                {mockBudgets.map((budget, idx) => (
                  <BudgetCard key={idx} {...budget} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif font-semibold text-xl mb-4">Active Goals</h2>
              <div className="space-y-4">
                {mockGoals.map((goal, idx) => (
                  <GoalCard key={idx} {...goal} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
