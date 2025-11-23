import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface BudgetCardProps {
  category: string;
  spent: number;
  limit: number;
  period: string;
}

export default function BudgetCard({ category, spent, limit, period }: BudgetCardProps) {
  const percentage = (spent / limit) * 100;
  const isOverBudget = spent > limit;
  const remaining = limit - spent;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>{category}</span>
          <span className="text-xs font-normal text-muted-foreground capitalize">{period}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress
          value={Math.min(percentage, 100)}
          className="h-3"
        />
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Spent</p>
            <p className="font-mono font-semibold">${spent.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Limit</p>
            <p className="font-mono font-semibold">${limit.toFixed(2)}</p>
          </div>
        </div>
        {isOverBudget ? (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Over budget by ${Math.abs(remaining).toFixed(2)}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            ${remaining.toFixed(2)} remaining
          </p>
        )}
      </CardContent>
    </Card>
  );
}
