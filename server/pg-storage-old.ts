import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { IStorage } from './storage';
import { 
  income, expenses, assets, bills,
  type Income, type InsertIncome, 
  type Expense, type InsertExpense, 
  type Asset, type InsertAsset, 
  type Bill, type InsertBill 
} from '@shared/schema';
import { eq, and, desc, sum } from 'drizzle-orm';
import { log } from './vite';
import { randomUUID } from 'crypto';

export class PostgresStorage implements IStorage {
  private db;
  
  constructor(connectionString: string) {
    if (!connectionString) {
      throw new Error('Database connection string is required');
    }
    
    const client = postgres(connectionString);
    this.db = drizzle(client);
    log('PostgreSQL database connection established');
  }

  // Income methods
  async getIncome(id: string, userId: string): Promise<Income | undefined> {
    const results = await this.db.select().from(income).where(and(eq(income.id, id), eq(income.userId, userId)));
    return results[0];
  }

  async getAllIncome(userId: string): Promise<Income[]> {
    const results = await this.db.select().from(income).where(eq(income.userId, userId)).orderBy(desc(income.createdAt));
    return results;
  }

  async createIncome(data: InsertIncome & { userId: string }): Promise<Income> {
    const incomeData = { ...data, id: randomUUID() };
    const results = await this.db.insert(income).values(incomeData).returning();
    return results[0];
  }

  async updateIncome(id: string, data: Partial<InsertIncome>): Promise<Income | undefined> {
    const results = await this.db.update(income)
      .set(data)
      .where(eq(income.id, id))
      .returning();
    return results[0];
  }

  async deleteIncome(id: string): Promise<boolean> {
    const results = await this.db.delete(income).where(eq(income.id, id)).returning();
    return results.length > 0;
  }

  // Expense methods
  async getExpense(id: string): Promise<Expense | undefined> {
    const results = await this.db.select().from(expenses).where(eq(expenses.id, id));
    return results[0];
  }

  async getAllExpenses(): Promise<Expense[]> {
    const results = await this.db.select().from(expenses).orderBy(expenses.createdAt);
    return results.reverse(); // Most recent first
  }

  async createExpense(data: InsertExpense): Promise<Expense> {
    const expenseData = { ...data, id: randomUUID() };
    const results = await this.db.insert(expenses).values(expenseData).returning();
    return results[0];
  }

  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined> {
    const results = await this.db.update(expenses)
      .set(data)
      .where(eq(expenses.id, id))
      .returning();
    return results[0];
  }

  async deleteExpense(id: string): Promise<boolean> {
    const results = await this.db.delete(expenses).where(eq(expenses.id, id)).returning();
    return results.length > 0;
  }

  // Asset methods
  async getAsset(id: string): Promise<Asset | undefined> {
    const results = await this.db.select().from(assets).where(eq(assets.id, id));
    return results[0];
  }

  async getAllAssets(): Promise<Asset[]> {
    const results = await this.db.select().from(assets).orderBy(assets.createdAt);
    return results.reverse(); // Most recent first
  }

  async createAsset(data: InsertAsset): Promise<Asset> {
    const assetData = { ...data, id: randomUUID() };
    const results = await this.db.insert(assets).values(assetData).returning();
    return results[0];
  }

  async updateAsset(id: string, data: Partial<InsertAsset>): Promise<Asset | undefined> {
    const results = await this.db.update(assets)
      .set(data)
      .where(eq(assets.id, id))
      .returning();
    return results[0];
  }

  async deleteAsset(id: string): Promise<boolean> {
    const results = await this.db.delete(assets).where(eq(assets.id, id)).returning();
    return results.length > 0;
  }

  // Bill methods
  async getBill(id: string): Promise<Bill | undefined> {
    const results = await this.db.select().from(bills).where(eq(bills.id, id));
    return results[0];
  }

  async getAllBills(): Promise<Bill[]> {
    const results = await this.db.select().from(bills).orderBy(bills.dueDate);
    return results; // Ordered by due date
  }

  async createBill(data: InsertBill): Promise<Bill> {
    const billData = { ...data, id: randomUUID(), status: 'pending' };
    const results = await this.db.insert(bills).values(billData).returning();
    return results[0];
  }

  async updateBill(id: string, data: Partial<InsertBill>): Promise<Bill | undefined> {
    const results = await this.db.update(bills)
      .set(data)
      .where(eq(bills.id, id))
      .returning();
    return results[0];
  }

  async deleteBill(id: string): Promise<boolean> {
    const results = await this.db.delete(bills).where(eq(bills.id, id)).returning();
    return results.length > 0;
  }

  async markBillAsPaid(id: string): Promise<Bill | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const results = await this.db.update(bills)
      .set({ 
        status: 'paid',
        lastPaidDate: today
      })
      .where(eq(bills.id, id))
      .returning();
    return results[0];
  }
}