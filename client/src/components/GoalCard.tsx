import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Plane, Home as HomeIcon, TrendingUp, CreditCard } from "lucide-react";
import { differenceInDays, format } from "date-fns";

interface GoalCardProps {
  name: string;
  current: number;
  target: number;
  deadline?: Date;
  type: "emergency_fund" | "vacation" | "investment" | "debt_payoff";
}

const goalIcons = {
  emergency_fund: Target,
  vacation: Plane,
  investment: TrendingUp,
  debt_payoff: CreditCard,
};

export default function GoalCard({ name, current, target, deadline, type }: GoalCardProps) {
  const percentage = (current / target) * 100;
  const Icon = goalIcons[type] || Target;
  const remaining = target - current;
  const daysLeft = deadline ? differenceInDays(deadline, new Date()) : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span>{name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={Math.min(percentage, 100)} className="h-3" />
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="font-mono font-semibold text-accent">${current.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Target</p>
            <p className="font-mono font-semibold">${target.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {percentage >= 100 ? 'Goal achieved!' : `$${remaining.toFixed(2)} to go`}
          </span>
          {daysLeft !== null && daysLeft > 0 && deadline && (
            <span className="text-muted-foreground">
              {daysLeft} days until {format(deadline, "MMM d")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
