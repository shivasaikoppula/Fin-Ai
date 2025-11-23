import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FinanceDashboard from "@/pages/FinanceDashboard";
import Transactions from "@/pages/Transactions";
import BudgetsGoals from "@/pages/BudgetsGoals";
import LoginRegister from "@/pages/LoginRegister";
import NotFound from "@/pages/not-found";

function Router({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={LoginRegister} />
        <Route path="/login" component={LoginRegister} />
        <Route component={LoginRegister} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={FinanceDashboard} />
      <Route path="/dashboard" component={FinanceDashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/budgets" component={BudgetsGoals} />
      <Route path="/insights" component={FinanceDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router isAuthenticated={isAuthenticated} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
