import { type Income, type InsertIncome, type Expense, type InsertExpense, type Asset, type InsertAsset, type Bill, type InsertBill } from "@shared/schema";
import { randomUUID } from "crypto";
import { log } from "./vite";
import { PostgresStorage } from "./pg-storage";

export interface IStorage {
  // Income methods
  getIncome(id: string, userId: string): Promise<Income | undefined>;
  getAllIncome(userId: string): Promise<Income[]>;
  createIncome(income: InsertIncome & { userId: string }): Promise<Income>;
  updateIncome(id: string, userId: string, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: string, userId: string): Promise<boolean>;

  // Expense methods
  getExpense(id: string, userId: string): Promise<Expense | undefined>;
  getAllExpenses(userId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense & { userId: string }): Promise<Expense>;
  updateExpense(id: string, userId: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string, userId: string): Promise<boolean>;

  // Asset methods
  getAsset(id: string, userId: string): Promise<Asset | undefined>;
  getAllAssets(userId: string): Promise<Asset[]>;
  createAsset(asset: InsertAsset & { userId: string }): Promise<Asset>;
  updateAsset(id: string, userId: string, asset: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: string, userId: string): Promise<boolean>;

  // Bill methods
  getBill(id: string, userId: string): Promise<Bill | undefined>;
  getAllBills(userId: string): Promise<Bill[]>;
  createBill(bill: InsertBill & { userId: string }): Promise<Bill>;
  updateBill(id: string, userId: string, bill: Partial<InsertBill>): Promise<Bill | undefined>;
  deleteBill(id: string, userId: string): Promise<boolean>;
  markBillAsPaid(id: string, userId: string): Promise<Bill | undefined>;

  // Transfers
  transfer(userId: string, fromId: string, toId: string, amount: number): Promise<{ fromBalance: number; toBalance: number }>;

  // Invoice methods
  getAllInvoices(userId: string): Promise<any[]>;

  // Summary methods
  getSummary(userId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    totalAssetValue: number;
    netWorth: number;
    accounts: { id: string; name: string; type: string; balance: number }[];
  }>;
}

export class MemStorage implements IStorage {
  private incomeMap: Map<string, Income>;
  private expenseMap: Map<string, Expense>;
  private assetMap: Map<string, Asset>;
  private billMap: Map<string, Bill>;

  constructor() {
    this.incomeMap = new Map();
    this.expenseMap = new Map();
    this.assetMap = new Map();
    this.billMap = new Map();
    log('Using in-memory storage');
  }

  // Income methods
  async getIncome(id: string, userId: string): Promise<Income | undefined> {
    const row = this.incomeMap.get(id);
    return row && (row as any).userId === userId ? row : undefined;
  }

  async getAllIncome(userId: string): Promise<Income[]> {
    return Array.from(this.incomeMap.values())
      .filter((r) => (r as any).userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createIncome(insertIncome: InsertIncome & { userId: string }): Promise<Income> {
    const id = randomUUID();
    const income: Income = {
      ...insertIncome,
      id,
      createdAt: new Date(),
    } as Income;
    this.incomeMap.set(id, income);
    return income;
  }

  async updateIncome(id: string, userId: string, updateData: Partial<InsertIncome>): Promise<Income | undefined> {
    const existing = this.incomeMap.get(id);
    if (!existing || (existing as any).userId !== userId) return undefined;

    const updated: Income = { ...(existing as any), ...updateData } as Income;
    this.incomeMap.set(id, updated);
    return updated;
  }

  async deleteIncome(id: string, userId: string): Promise<boolean> {
    const existing = this.incomeMap.get(id);
    if (!existing || (existing as any).userId !== userId) return false;
    return this.incomeMap.delete(id);
  }

  // Expense methods
  async getExpense(id: string, userId: string): Promise<Expense | undefined> {
    const row = this.expenseMap.get(id);
    return row && (row as any).userId === userId ? row : undefined;
  }

  async getAllExpenses(userId: string): Promise<Expense[]> {
    return Array.from(this.expenseMap.values())
      .filter((r) => (r as any).userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createExpense(insertExpense: InsertExpense & { userId: string }): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: new Date(),
    } as Expense;
    this.expenseMap.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, userId: string, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existing = this.expenseMap.get(id);
    if (!existing || (existing as any).userId !== userId) return undefined;

    const updated: Expense = { ...(existing as any), ...updateData } as Expense;
    this.expenseMap.set(id, updated);
    return updated;
  }

  async deleteExpense(id: string, userId: string): Promise<boolean> {
    const existing = this.expenseMap.get(id);
    if (!existing || (existing as any).userId !== userId) return false;
    return this.expenseMap.delete(id);
  }

  // Asset methods
  async getAsset(id: string, userId: string): Promise<Asset | undefined> {
    const row = this.assetMap.get(id);
    return row && (row as any).userId === userId ? row : undefined;
  }

  async getAllAssets(userId: string): Promise<Asset[]> {
    return Array.from(this.assetMap.values())
      .filter((r) => (r as any).userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAsset(insertAsset: InsertAsset & { userId: string }): Promise<Asset> {
    const id = randomUUID();
    const asset: Asset = {
      ...insertAsset,
      id,
      createdAt: new Date(),
      description: insertAsset.description || null,
    } as Asset;
    this.assetMap.set(id, asset);
    return asset;
  }

  async updateAsset(id: string, userId: string, updateData: Partial<InsertAsset>): Promise<Asset | undefined> {
    const existing = this.assetMap.get(id);
    if (!existing || (existing as any).userId !== userId) return undefined;

    const updated: Asset = { ...(existing as any), ...updateData } as Asset;
    this.assetMap.set(id, updated);
    return updated;
  }

  async deleteAsset(id: string, userId: string): Promise<boolean> {
    const existing = this.assetMap.get(id);
    if (!existing || (existing as any).userId !== userId) return false;
    return this.assetMap.delete(id);
  }

  // Bill methods
  async getBill(id: string, userId: string): Promise<Bill | undefined> {
    const row = this.billMap.get(id);
    return row && (row as any).userId === userId ? row : undefined;
  }

  async getAllBills(userId: string): Promise<Bill[]> {
    return Array.from(this.billMap.values())
      .filter((r) => (r as any).userId === userId)
      .sort((a, b) => new Date((a as any).dueDate as any).getTime() - new Date((b as any).dueDate as any).getTime());
  }

  async createBill(insertBill: InsertBill & { userId: string }): Promise<Bill> {
    const id = randomUUID();
    const bill: Bill = {
      ...insertBill,
      id,
      status: "pending",
      lastPaidDate: insertBill.lastPaidDate || null,
      description: insertBill.description || null,
      createdAt: new Date(),
    } as Bill;
    this.billMap.set(id, bill);
    return bill;
  }

  async updateBill(id: string, userId: string, updateData: Partial<InsertBill>): Promise<Bill | undefined> {
    const existing = this.billMap.get(id);
    if (!existing || (existing as any).userId !== userId) return undefined;

    const updated: Bill = { ...(existing as any), ...updateData } as Bill;
    this.billMap.set(id, updated);
    return updated;
  }

  async deleteBill(id: string, userId: string): Promise<boolean> {
    const existing = this.billMap.get(id);
    if (!existing || (existing as any).userId !== userId) return false;
    return this.billMap.delete(id);
  }

  async markBillAsPaid(id: string, userId: string): Promise<Bill | undefined> {
    const existing = this.billMap.get(id);
    if (!existing || (existing as any).userId !== userId) return undefined;

    const updated: Bill = {
      ...(existing as any),
      status: "paid",
      lastPaidDate: new Date().toISOString().split('T')[0]
    } as Bill;
    this.billMap.set(id, updated);
    return updated;
  }

  // Transfers (not supported in-memory)
  async transfer(_userId: string, _fromId: string, _toId: string, _amount: number): Promise<{ fromBalance: number; toBalance: number }> {
    throw new Error('Accounts not supported in in-memory storage');
  }

  // Summary
  async getSummary(userId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    totalAssetValue: number;
    netWorth: number;
    accounts: { id: string; name: string; type: string; balance: number }[];
  }> {
    const incomes = await this.getAllIncome(userId);
    const expenses = await this.getAllExpenses(userId);
    const assets = await this.getAllAssets(userId);

    const sum = (arr: { amount?: any; currentValue?: any }[], key: 'amount' | 'currentValue') =>
      arr.reduce((acc, r) => acc + parseFloat((r as any)[key] as unknown as string), 0);

    const totalIncome = sum(incomes as any, 'amount');
    const totalExpenses = sum(expenses as any, 'amount');
    const totalAssetValue = sum(assets as any, 'currentValue');
    const netBalance = totalIncome - totalExpenses;
    const netWorth = totalAssetValue + netBalance;

    return { totalIncome, totalExpenses, netBalance, totalAssetValue, netWorth, accounts: [] };
  }
}

/**
 * Creates the appropriate storage implementation based on environment
 */
export function createStorage(): IStorage {
  // Check if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      return new PostgresStorage(process.env.DATABASE_URL);
    } catch (error) {
      console.error('Failed to initialize PostgreSQL storage:', error);
      log('Falling back to in-memory storage due to database connection error');
      return new MemStorage();
    }
  }
  
  // Fall back to in-memory storage if no DATABASE_URL
  return new MemStorage();
}

// Export the storage instance
export const storage = createStorage();
