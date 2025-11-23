import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertBudgetSchema, insertGoalSchema } from "@shared/schema";
import { detectFraud, categorizeTransaction } from "./fraud-detection";
import { calculateFinancialHealth } from "./financial-health";
import multer from "multer";
import { parse } from "csv-parse/sync";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============ TRANSACTION ROUTES ============
  
  // Get all transactions for a user
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const { userId, startDate, endDate } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "userId is required" });
      }

      let transactions;
      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(
          userId,
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        transactions = await storage.getTransactionsByUser(userId);
      }

      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a single transaction
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      
      // Auto-categorize if no category provided
      if (!data.category || data.category === 'Other') {
        data.category = categorizeTransaction(
          data.merchant,
          parseFloat(data.amount as string)
        );
      }

      // Ensure date is a Date object
      const transactionData = {
        ...data,
        date: typeof data.date === 'string' ? new Date(data.date) : data.date,
      };

      // Check for fraud
      const recentTransactions = await storage.getTransactionsByUser(data.userId);
      const fraudCheck = await detectFraud(transactionData, recentTransactions);
      
      if (fraudCheck.isFraudulent) {
        transactionData.isFraudulent = true;
        transactionData.fraudReason = fraudCheck.reason;
      }

      const transaction = await storage.createTransaction(transactionData);
      
      // Recalculate financial health after new transaction
      const user = await storage.getUser(data.userId);
      if (user) {
        const allTransactions = await storage.getTransactionsByUser(data.userId);
        const healthMetrics = calculateFinancialHealth(
          allTransactions,
          parseFloat(user.monthlyIncome as string || "0")
        );
        await storage.createOrUpdateFinancialHealth({
          userId: data.userId,
          ...healthMetrics,
        });
      }

      res.status(201).json({ transaction, fraudCheck });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Upload CSV transactions
  app.post("/api/transactions/upload", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
      }) as Array<Record<string, string>>;

      const createdTransactions = [];
      const fraudulentTransactions = [];

      for (const record of records) {
        const category = categorizeTransaction(
          record.merchant || record.description || 'Unknown',
          parseFloat(record.amount || '0')
        );

        const transactionData = {
          userId,
          date: new Date(record.date || new Date().toISOString()),
          amount: record.amount || '0',
          merchant: record.merchant || record.description || 'Unknown',
          category: category,
          type: parseFloat(record.amount || '0') >= 0 ? 'income' : 'expense',
          description: record.description || null,
          location: record.location || null,
          accountId: record.accountId || null,
          isFraudulent: false,
          fraudReason: null,
        };

        const recentTransactions = await storage.getTransactionsByUser(userId);
        const fraudCheck = await detectFraud(transactionData, recentTransactions);

        if (fraudCheck.isFraudulent) {
          transactionData.isFraudulent = true;
          transactionData.fraudReason = fraudCheck.reason;
          fraudulentTransactions.push(transactionData);
        }

        const transaction = await storage.createTransaction(transactionData);
        createdTransactions.push(transaction);
      }

      // Recalculate financial health
      const user = await storage.getUser(userId);
      if (user) {
        const allTransactions = await storage.getTransactionsByUser(userId);
        const healthMetrics = calculateFinancialHealth(
          allTransactions,
          parseFloat(user.monthlyIncome as string || "0")
        );
        await storage.createOrUpdateFinancialHealth({
          userId,
          ...healthMetrics,
        });
      }

      res.status(201).json({
        count: createdTransactions.length,
        transactions: createdTransactions,
        fraudCount: fraudulentTransactions.length,
        fraudulent: fraudulentTransactions,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update transaction
  app.patch("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const transaction = await storage.updateTransaction(id, updates);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete transaction
  app.delete("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTransaction(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ BUDGET ROUTES ============
  
  app.get("/api/budgets", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "userId is required" });
      }

      const budgets = await storage.getBudgetsByUser(userId);
      res.json(budgets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/budgets", async (req: Request, res: Response) => {
    try {
      const data = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(data);
      res.status(201).json(budget);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const budget = await storage.updateBudget(id, req.body);
      
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }

      res.json(budget);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBudget(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Budget not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GOAL ROUTES ============
  
  app.get("/api/goals", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "userId is required" });
      }

      const goals = await storage.getGoalsByUser(userId);
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/goals", async (req: Request, res: Response) => {
    try {
      const data = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(data);
      res.status(201).json(goal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const goal = await storage.updateGoal(id, req.body);
      
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      res.json(goal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGoal(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Goal not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ FINANCIAL HEALTH ROUTES ============
  
  app.get("/api/financial-health", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "userId is required" });
      }

      const health = await storage.getFinancialHealth(userId);
      res.json(health);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ ANALYTICS ROUTES ============
  
  app.get("/api/analytics/dashboard", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "userId is required" });
      }

      const transactions = await storage.getTransactionsByUser(userId);
      const budgets = await storage.getBudgetsByUser(userId);
      const goals = await storage.getGoalsByUser(userId);
      const health = await storage.getFinancialHealth(userId);

      // Calculate summary metrics
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const thisMonthTransactions = transactions.filter(
        t => new Date(t.date) >= thisMonthStart
      );

      const totalSpend = thisMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount as string), 0);

      const totalIncome = thisMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount as string), 0);

      const savings = totalIncome - totalSpend;

      const fraudAlerts = transactions.filter(t => t.isFraudulent).length;

      res.json({
        totalSpend,
        totalIncome,
        savings,
        fraudAlerts,
        activeGoals: goals.filter(g => g.status === 'active').length,
        budgetCount: budgets.length,
        healthScore: health?.score || 0,
        transactionCount: thisMonthTransactions.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/spending-by-category", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "userId is required" });
      }

      const transactions = await storage.getTransactionsByUser(userId);
      const expenses = transactions.filter(t => t.type === 'expense');

      const categoryTotals = expenses.reduce((acc, t) => {
        const category = t.category;
        acc[category] = (acc[category] || 0) + parseFloat(t.amount as string);
        return acc;
      }, {} as Record<string, number>);

      const result = Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
      })).sort((a, b) => b.amount - a.amount);

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
