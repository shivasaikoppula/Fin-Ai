import { useState } from "react";
import FinanceNavbar from "@/components/FinanceNavbar";
import TransactionCard from "@/components/TransactionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, Search, Filter } from "lucide-react";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // TODO: remove mock data - fetch from API
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
      merchant: "Amazon.com",
      amount: "89.99",
      category: "Shopping",
      date: new Date(2025, 10, 20),
      type: "expense" as const,
    },
    {
      id: "4",
      merchant: "Starbucks",
      amount: "15.67",
      category: "Food & Dining",
      date: new Date(2025, 10, 19),
      type: "expense" as const,
    },
    {
      id: "5",
      merchant: "Monthly Salary",
      amount: "5200.00",
      category: "Income",
      date: new Date(2025, 10, 1),
      type: "income" as const,
    },
    {
      id: "6",
      merchant: "Netflix Subscription",
      amount: "15.99",
      category: "Entertainment",
      date: new Date(2025, 10, 15),
      type: "expense" as const,
    },
    {
      id: "7",
      merchant: "Uber",
      amount: "28.50",
      category: "Transportation",
      date: new Date(2025, 10, 18),
      type: "expense" as const,
    },
    {
      id: "8",
      merchant: "CVS Pharmacy",
      amount: "42.33",
      category: "Healthcare",
      date: new Date(2025, 10, 17),
      type: "expense" as const,
    },
  ];

  const filteredTransactions = mockTransactions.filter((t) => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUploadCSV = () => {
    console.log('Upload CSV clicked');
    // TODO: implement CSV upload dialog
  };

  const handleAddTransaction = () => {
    console.log('Add transaction clicked');
    // TODO: implement add transaction dialog
  };

  return (
    <div className="min-h-screen bg-background">
      <FinanceNavbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif font-bold text-3xl md:text-4xl mb-2">
              Transactions
            </h1>
            <p className="text-muted-foreground">
              View and manage all your transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUploadCSV} variant="outline" className="gap-2" data-testid="button-upload-csv">
              <Upload className="h-4 w-4" />
              Upload CSV
            </Button>
            <Button onClick={handleAddTransaction} className="gap-2" data-testid="button-add-transaction">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-transactions"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category-filter">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="Groceries">Groceries</SelectItem>
              <SelectItem value="Food & Dining">Food & Dining</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} {...transaction} />
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              No transactions found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
