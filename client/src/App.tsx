import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FinanceDashboard from "@/pages/FinanceDashboard";
import Transactions from "@/pages/Transactions";
import BudgetsGoals from "@/pages/BudgetsGoals";
import NotFound from "@/pages/not-found";

function Router() {
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
