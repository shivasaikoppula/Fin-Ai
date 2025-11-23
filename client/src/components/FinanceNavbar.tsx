import { DollarSign, LayoutDashboard, Receipt, Target, TrendingUp, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "./ThemeToggle";
import { Link, useLocation } from "wouter";

export default function FinanceNavbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 cursor-pointer">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="font-serif font-bold text-xl">Finance AI</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/dashboard" data-testid="link-dashboard">
              <Button
                variant={location === "/dashboard" ? "secondary" : "ghost"}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/transactions" data-testid="link-transactions">
              <Button
                variant={location === "/transactions" ? "secondary" : "ghost"}
                className="gap-2"
              >
                <Receipt className="h-4 w-4" />
                Transactions
              </Button>
            </Link>
            <Link href="/budgets" data-testid="link-budgets">
              <Button
                variant={location === "/budgets" ? "secondary" : "ghost"}
                className="gap-2"
              >
                <Target className="h-4 w-4" />
                Budgets & Goals
              </Button>
            </Link>
            <Link href="/insights" data-testid="link-insights">
              <Button
                variant={location === "/insights" ? "secondary" : "ghost"}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Insights
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-security">
              <Shield className="h-5 w-5 text-accent" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              <Badge className="absolute top-1 right-1 h-2 w-2 p-0 bg-destructive" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
