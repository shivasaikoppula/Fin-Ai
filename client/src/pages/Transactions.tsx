import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Search, Image, LogOut } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Transactions() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showScreenshotDialog, setShowScreenshotDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Get userId from localStorage (current user)
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{"id":"demo-user"}');
  const userId = currentUser.id;

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions?userId=${userId}`],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/transactions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/financial-health/${userId}`] });
      setShowAddDialog(false);
      toast({
        title: "Transaction created",
        description: "Your transaction has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadCSVMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      const response = await fetch('/api/transactions/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload CSV');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/financial-health/${userId}`] });
      setShowUploadDialog(false);
      toast({
        title: "CSV uploaded successfully",
        description: `Imported ${data.created} transactions (${data.fraudulent} flagged as potentially fraudulent)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createTransactionMutation.mutate({
      userId,
      date: formData.get('date'),
      amount: formData.get('amount'),
      merchant: formData.get('merchant'),
      category: formData.get('category'),
      type: parseFloat(formData.get('amount') as string) >= 0 ? 'income' : 'expense',
      description: formData.get('description') || null,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCSVMutation.mutate(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    setLocation("/login");
  };

  const uploadScreenshotMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      const response = await fetch('/api/transactions/screenshot', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze screenshot');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/financial-health/${userId}`] });
      setShowScreenshotDialog(false);
      toast({
        title: "Screenshot analyzed",
        description: data.isFraudulent 
          ? `⚠️ Fraud detected: ${data.fraudReason}` 
          : "Transaction appears legitimate",
        variant: data.isFraudulent ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadScreenshotMutation.mutate(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
    }
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
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setShowUploadDialog(true)}
              variant="outline"
              className="gap-2"
              data-testid="button-upload-csv"
            >
              <Upload className="h-4 w-4" />
              Upload CSV
            </Button>
            <Button
              onClick={() => setShowScreenshotDialog(true)}
              variant="outline"
              className="gap-2"
              data-testid="button-upload-screenshot"
            >
              <Image className="h-4 w-4" />
              Scan Receipt
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
              data-testid="button-add-transaction"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="gap-2 ml-auto"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
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
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading transactions...</div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
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
            No transactions found matching your filters.
          </div>
        )}
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent data-testid="dialog-add-transaction">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Enter the transaction details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTransaction}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="merchant">Merchant</Label>
                <Input id="merchant" name="merchant" required data-testid="input-merchant" />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Use negative for expenses"
                  data-testid="input-amount"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="Other">
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Other">Other (Auto-categorize)</SelectItem>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                    <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  data-testid="input-date"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" data-testid="input-description" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createTransactionMutation.isPending} data-testid="button-submit-transaction">
                {createTransactionMutation.isPending ? 'Adding...' : 'Add Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent data-testid="dialog-upload-csv">
          <DialogHeader>
            <DialogTitle>Upload Transactions CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with columns: date, amount, merchant, category, description
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploadCSVMutation.isPending}
              data-testid="input-csv-file"
            />
          </div>
          {uploadCSVMutation.isPending && (
            <div className="text-sm text-muted-foreground">Uploading and processing...</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Screenshot Upload Dialog */}
      <Dialog open={showScreenshotDialog} onOpenChange={setShowScreenshotDialog}>
        <DialogContent data-testid="dialog-upload-screenshot">
          <DialogHeader>
            <DialogTitle>Scan Transaction Receipt</DialogTitle>
            <DialogDescription>
              Upload a screenshot or image of your receipt. Our AI will analyze it and check for fraud.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              ref={screenshotInputRef}
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              disabled={uploadScreenshotMutation.isPending}
              data-testid="input-screenshot-file"
            />
          </div>
          {uploadScreenshotMutation.isPending && (
            <div className="text-sm text-muted-foreground">Analyzing image...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
