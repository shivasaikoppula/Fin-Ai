import { useQuery } from "@tanstack/react-query";
import FinanceNavbar from "@/components/FinanceNavbar";
import HealthScoreCard from "@/components/HealthScoreCard";
import TransactionCard from "@/components/TransactionCard";
import BudgetCard from "@/components/BudgetCard";
import GoalCard from "@/components/GoalCard";
import FraudAlert from "@/components/FraudAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { Transaction, Budget, Goal, FinancialHealth } from "@shared/schema";

export default function FinanceDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{"id":"demo-user"}');
  const userId = currentUser.id;

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions?userId=${userId}`],
  });

  const { data: budgets = [], isLoading: loadingBudgets } = useQuery<Budget[]>({
    queryKey: [`/api/budgets?userId=${userId}`],
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery<Goal[]>({
    queryKey: [`/api/goals?userId=${userId}`],
  });

  const { data: healthData } = useQuery<FinancialHealth>({
    queryKey: [`/api/financial-health/${userId}`],
  });

  // Calculate dashboard metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalSpend = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const savings = totalIncome - totalSpend;

  const fraudulentTransactions = transactions.filter(t => t.isFraudulent);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate budget metrics
  const budgetMetrics = budgets.map(budget => {
    const categoryTransactions = monthlyTransactions.filter(
      t => t.category === budget.category && t.type === 'expense'
    );
    const spent = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return {
      category: budget.category,
      spent,
      limit: parseFloat(budget.amount),
      period: budget.period,
    };
  });

  if (loadingTransactions || loadingBudgets || loadingGoals) {
    return (
      <div className="min-h-screen bg-background">
        <FinanceNavbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-16 text-muted-foreground">Loading your financial data...</div>
        </div>
      </div>
    );
  }

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
        {fraudulentTransactions.length > 0 && (
          <div className="mb-6 space-y-4">
            {fraudulentTransactions.slice(0, 3).map((transaction) => (
              <FraudAlert
                key={transaction.id}
                merchant={transaction.merchant}
                amount={transaction.amount}
                reason={transaction.fraudReason || "Suspicious activity detected"}
                onDismiss={() => console.log('Fraud dismissed')}
                onConfirm={() => console.log('Transaction confirmed legitimate')}
              />
            ))}
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
                ${totalIncome.toFixed(2)}
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
                ${totalSpend.toFixed(2)}
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
              <div className={`text-2xl font-bold font-mono ${savings >= 0 ? 'text-primary' : 'text-destructive'}`}>
                ${savings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0}% savings rate
              </p>
            </CardContent>
          </Card>

          {healthData ? (
            <HealthScoreCard
              score={healthData.score}
              components={{
                incomeStability: healthData.incomeStability,
                expenseRatio: healthData.expenseRatio,
                savingsRate: healthData.savingsRate,
                debtRatio: healthData.debtRatio,
                liquidity: healthData.liquidity,
              }}
            />
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Financial Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm">
                  Add more transactions to calculate your health score
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-serif font-semibold text-xl">Recent Transactions</h2>
            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    id={transaction.id}
                    merchant={transaction.merchant}
                    amount={transaction.amount}
                    category={transaction.category}
                    date={new Date(transaction.date)}
                    type={transaction.type as "income" | "expense"}
                    isFraudulent={transaction.isFraudulent}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                No transactions yet. Add your first transaction to get started.
              </div>
            )}
          </div>

          {/* Sidebar: Budgets and Goals */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif font-semibold text-xl mb-4">Budget Overview</h2>
              {budgetMetrics.length > 0 ? (
                <div className="space-y-4">
                  {budgetMetrics.slice(0, 3).map((budget, idx) => (
                    <BudgetCard key={idx} {...budget} />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No budgets set. Create budgets to track your spending.
                </div>
              )}
            </div>

            <div>
              <h2 className="font-serif font-semibold text-xl mb-4">Active Goals</h2>
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.filter(g => g.status === 'active').slice(0, 2).map((goal) => (
                    <GoalCard
                      key={goal.id}
                      name={goal.name}
                      current={parseFloat(goal.currentAmount)}
                      target={parseFloat(goal.targetAmount)}
                      deadline={goal.deadline ? new Date(goal.deadline) : undefined}
                      type={goal.type as any}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No goals set. Create goals to track your financial progress.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
