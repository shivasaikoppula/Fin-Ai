import {
  type User,
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type Budget,
  type InsertBudget,
  type Goal,
  type InsertGoal,
  type FinancialHealth,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  
  // Budget methods
  getBudget(id: string): Promise<Budget | undefined>;
  getBudgetsByUser(userId: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;
  
  // Goal methods
  getGoal(id: string): Promise<Goal | undefined>;
  getGoalsByUser(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Financial Health methods
  getFinancialHealth(userId: string): Promise<FinancialHealth | undefined>;
  createOrUpdateFinancialHealth(health: Omit<FinancialHealth, "id" | "calculatedAt">): Promise<FinancialHealth>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;
  private budgets: Map<string, Budget>;
  private goals: Map<string, Goal>;
  private financialHealth: Map<string, FinancialHealth>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.goals = new Map();
    this.financialHealth = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      monthlyIncome: insertUser.monthlyIncome || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => {
        const transDate = new Date(t.date);
        return t.userId === userId && transDate >= startDate && transDate <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      id,
      ...insertTransaction,
      date: typeof insertTransaction.date === 'string' ? new Date(insertTransaction.date) : insertTransaction.date,
      isFraudulent: insertTransaction.isFraudulent || false,
      fraudReason: insertTransaction.fraudReason || null,
      description: insertTransaction.description || null,
      location: insertTransaction.location || null,
      accountId: insertTransaction.accountId || null,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updated = { ...transaction, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Budget methods
  async getBudget(id: string): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async getBudgetsByUser(userId: string): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter((b) => b.userId === userId);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = {
      id,
      ...insertBudget,
      createdAt: new Date(),
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const updated = { ...budget, ...updates };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Goal methods
  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getGoalsByUser(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter((g) => g.userId === userId);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      id,
      ...insertGoal,
      currentAmount: "0",
      deadline: insertGoal.deadline ? (typeof insertGoal.deadline === 'string' ? new Date(insertGoal.deadline) : insertGoal.deadline) : null,
      status: "active",
      createdAt: new Date(),
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updated = { ...goal, ...updates };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Financial Health methods
  async getFinancialHealth(userId: string): Promise<FinancialHealth | undefined> {
    return Array.from(this.financialHealth.values()).find((fh) => fh.userId === userId);
  }

  async createOrUpdateFinancialHealth(
    health: Omit<FinancialHealth, "id" | "calculatedAt">
  ): Promise<FinancialHealth> {
    const existing = await this.getFinancialHealth(health.userId);
    
    if (existing) {
      const updated: FinancialHealth = {
        ...existing,
        ...health,
        calculatedAt: new Date(),
      };
      this.financialHealth.set(existing.id, updated);
      return updated;
    }
    
    const id = randomUUID();
    const newHealth: FinancialHealth = {
      id,
      ...health,
      calculatedAt: new Date(),
    };
    this.financialHealth.set(id, newHealth);
    return newHealth;
  }
}

export const storage = new MemStorage();
