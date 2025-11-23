import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coffee, Car, Home, Heart, Smartphone, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface TransactionCardProps {
  id: string;
  merchant: string;
  amount: string;
  category: string;
  date: Date;
  type: "income" | "expense";
  isFraudulent?: boolean;
}

const categoryIcons: Record<string, any> = {
  "Shopping": ShoppingCart,
  "Food & Dining": Coffee,
  "Transportation": Car,
  "Groceries": Home,
  "Healthcare": Heart,
  "Entertainment": Smartphone,
};

export default function TransactionCard({
  id,
  merchant,
  amount,
  category,
  date,
  type,
  isFraudulent,
}: TransactionCardProps) {
  const Icon = categoryIcons[category] || ShoppingCart;
  const amountNum = parseFloat(amount);
  const isPositive = type === "income";

  return (
    <div
      className="flex items-center justify-between p-4 rounded-md hover-elevate active-elevate-2 cursor-pointer border"
      data-testid={`transaction-${id}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2 rounded-md ${isPositive ? 'bg-accent/10 text-accent' : 'bg-muted'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{merchant}</p>
            {isFraudulent && (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{category}</p>
            <span className="text-xs text-muted-foreground">•</span>
            <p className="text-sm text-muted-foreground">{format(date, "MMM d")}</p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-mono font-semibold ${isPositive ? 'text-accent' : 'text-foreground'}`}>
          {isPositive ? '+' : '-'}${Math.abs(amountNum).toFixed(2)}
        </p>
        {isFraudulent && (
          <Badge variant="destructive" className="text-xs mt-1">Fraud Alert</Badge>
        )}
      </div>
    </div>
  );
}
