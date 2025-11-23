import { useState } from "react";
import FinanceNavbar from "@/components/FinanceNavbar";
import BudgetCard from "@/components/BudgetCard";
import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BudgetsGoals() {
  // TODO: remove mock data - fetch from API
  const mockBudgets = [
    { category: "Food & Dining", spent: 425.67, limit: 500, period: "monthly" },
    { category: "Transportation", spent: 280.50, limit: 250, period: "monthly" },
    { category: "Shopping", spent: 180.00, limit: 300, period: "monthly" },
    { category: "Entertainment", spent: 95.00, limit: 150, period: "monthly" },
    { category: "Healthcare", spent: 50.00, limit: 200, period: "monthly" },
    { category: "Utilities", spent: 175.00, limit: 200, period: "monthly" },
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
    {
      name: "Investment Portfolio",
      current: 5000,
      target: 20000,
      deadline: new Date(2027, 11, 31),
      type: "investment" as const,
    },
    {
      name: "Pay Off Credit Card",
      current: 1500,
      target: 3000,
      deadline: new Date(2026, 0, 1),
      type: "debt_payoff" as const,
    },
  ];

  const handleCreateBudget = () => {
    console.log('Create budget clicked');
    // TODO: implement budget creation dialog
  };

  const handleCreateGoal = () => {
    console.log('Create goal clicked');
    // TODO: implement goal creation dialog
  };

  return (
    <div className="min-h-screen bg-background">
      <FinanceNavbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl md:text-4xl mb-2">
            Budgets & Goals
          </h1>
          <p className="text-muted-foreground">
            Track your spending and achieve your financial goals
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Budgets Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif font-semibold text-2xl">Monthly Budgets</h2>
              <Button onClick={handleCreateBudget} className="gap-2" data-testid="button-create-budget">
                <Plus className="h-4 w-4" />
                Create Budget
              </Button>
            </div>
            <div className="space-y-4">
              {mockBudgets.map((budget, idx) => (
                <BudgetCard key={idx} {...budget} />
              ))}
            </div>
          </div>

          {/* Goals Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif font-semibold text-2xl">Financial Goals</h2>
              <Button onClick={handleCreateGoal} className="gap-2" data-testid="button-create-goal">
                <Plus className="h-4 w-4" />
                Create Goal
              </Button>
            </div>
            <div className="space-y-4">
              {mockGoals.map((goal, idx) => (
                <GoalCard key={idx} {...goal} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
