import { type Income, type InsertIncome, type Expense, type InsertExpense, type Asset, type InsertAsset, type Bill, type InsertBill, type Plan, type InsertPlan, type PlanItem, type InsertPlanItem, type SavingsAccount, type InsertSavingsAccount, type SavingsTransaction, type InsertSavingsTransaction, type Invoice, type InsertInvoice } from "@shared/schema";
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
  getAllInvoices(userId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice>;
  deleteInvoice(id: string, userId: string): Promise<boolean>;

  // Summary methods
  getSummary(userId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    totalAssetValue: number;
    netWorth: number;
    accounts: { id: string; name: string; type: string; balance: number }[];
  }>;

  // Planner methods
  getAllPlans(userId: string, filters?: { category?: string; status?: string; isTemplate?: boolean }): Promise<Plan[]>;
  getPlanWithItems(id: string, userId: string): Promise<(Plan & { items: PlanItem[] }) | undefined>;
  createPlan(plan: InsertPlan & { userId: string }): Promise<Plan>;
  updatePlan(id: string, userId: string, plan: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: string, userId: string): Promise<boolean>;
  createPlanFromTemplate(templateId: string, userId: string, data: { name: string; plannedDate?: string }): Promise<Plan | undefined>;
  
  // Plan item methods
  addPlanItem(item: InsertPlanItem, userId: string): Promise<PlanItem | undefined>;
  updatePlanItem(itemId: string, planId: string, userId: string, item: Partial<InsertPlanItem>): Promise<PlanItem | undefined>;
  deletePlanItem(itemId: string, planId: string, userId: string): Promise<boolean>;

  // Savings account methods
  getSavingsAccount(id: string, userId: string): Promise<SavingsAccount | undefined>;
  getAllSavingsAccounts(userId: string): Promise<SavingsAccount[]>;
  createSavingsAccount(account: InsertSavingsAccount & { userId: string }): Promise<SavingsAccount>;
  updateSavingsAccount(id: string, userId: string, account: Partial<InsertSavingsAccount>): Promise<SavingsAccount | undefined>;
  deleteSavingsAccount(id: string, userId: string): Promise<boolean>;

  // Savings transaction methods
  getSavingsTransactions(accountId: string, userId: string): Promise<SavingsTransaction[]>;
  createSavingsTransaction(transaction: InsertSavingsTransaction & { userId: string }): Promise<SavingsTransaction>;
  deleteSavingsTransaction(id: string, userId: string): Promise<boolean>;
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
      lastPaidDate: null,
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

  async getAllInvoices(userId: string): Promise<any[]> {
    // Stub implementation - not used in production
    return [];
  }

  // Planner methods (in-memory implementation)
  private planMap = new Map<string, Plan>();
  private planItemMap = new Map<string, PlanItem>();

  async getAllPlans(userId: string, filters?: { category?: string; status?: string; isTemplate?: boolean }): Promise<Plan[]> {
    let plans = Array.from(this.planMap.values())
      .filter((p) => (p as any).userId === userId);

    if (filters?.category) {
      plans = plans.filter((p) => p.category === filters.category);
    }
    if (filters?.status) {
      plans = plans.filter((p) => p.status === filters.status);
    }
    if (filters?.isTemplate !== undefined) {
      plans = plans.filter((p) => p.isTemplate === filters.isTemplate);
    }

    return plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPlanWithItems(id: string, userId: string): Promise<(Plan & { items: PlanItem[] }) | undefined> {
    const plan = this.planMap.get(id);
    if (!plan || (plan as any).userId !== userId) return undefined;

    const items = Array.from(this.planItemMap.values())
      .filter((item) => item.planId === id);

    return { ...plan, items };
  }

  async createPlan(insertPlan: InsertPlan & { userId: string }): Promise<Plan> {
    const id = randomUUID();
    const plan: Plan = {
      ...insertPlan,
      id,
      totalAmount: "0",
      status: insertPlan.status || "draft",
      isTemplate: insertPlan.isTemplate || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Plan;
    
    this.planMap.set(id, plan);
    return plan;
  }

  async updatePlan(id: string, userId: string, updateData: Partial<InsertPlan>): Promise<Plan | undefined> {
    const existing = this.planMap.get(id);
    if (!existing || (existing as any).userId !== userId) return undefined;

    const updated: Plan = { 
      ...(existing as any), 
      ...updateData,
      updatedAt: new Date()
    } as Plan;
    
    this.planMap.set(id, updated);
    return updated;
  }

  async deletePlan(id: string, userId: string): Promise<boolean> {
    const existing = this.planMap.get(id);
    if (!existing || (existing as any).userId !== userId) return false;

    // Delete associated items
    const itemsToDelete = Array.from(this.planItemMap.entries())
      .filter(([_, item]) => item.planId === id)
      .map(([itemId, _]) => itemId);
    
    itemsToDelete.forEach(itemId => this.planItemMap.delete(itemId));
    
    return this.planMap.delete(id);
  }

  async createPlanFromTemplate(templateId: string, userId: string, data: { name: string; plannedDate?: string }): Promise<Plan | undefined> {
    const template = this.planMap.get(templateId);
    if (!template || (template as any).userId !== userId || !template.isTemplate) return undefined;

    // Create new plan from template
    const newPlan = await this.createPlan({
      name: data.name,
      description: template.description,
      category: template.category,
      plannedDate: data.plannedDate,
      isTemplate: false,
      userId,
    });

    // Copy items from template
    const templateItems = Array.from(this.planItemMap.values())
      .filter((item) => item.planId === templateId);

    for (const templateItem of templateItems) {
      await this.addPlanItem({
        planId: newPlan.id,
        name: templateItem.name,
        quantity: templateItem.quantity,
        unit: templateItem.unit,
        rate: templateItem.rate,
        notes: templateItem.notes,
      }, userId);
    }

    return newPlan;
  }

  async addPlanItem(insertItem: InsertPlanItem, userId: string): Promise<PlanItem | undefined> {
    // Verify plan exists and belongs to user
    const plan = this.planMap.get(insertItem.planId);
    if (!plan || (plan as any).userId !== userId) return undefined;

    const id = randomUUID();
    const totalAmount = insertItem.quantity * insertItem.rate;
    
    const item: PlanItem = {
      ...insertItem,
      id,
      totalAmount: totalAmount.toString(),
      createdAt: new Date(),
    } as PlanItem;
    
    this.planItemMap.set(id, item);

    // Update plan total
    await this.updatePlanTotal(insertItem.planId);
    
    return item;
  }

  async updatePlanItem(itemId: string, planId: string, userId: string, updateData: Partial<InsertPlanItem>): Promise<PlanItem | undefined> {
    const existing = this.planItemMap.get(itemId);
    if (!existing || existing.planId !== planId) return undefined;

    // Verify plan belongs to user
    const plan = this.planMap.get(planId);
    if (!plan || (plan as any).userId !== userId) return undefined;

    const updated: PlanItem = { ...existing, ...updateData } as PlanItem;
    
    // Recalculate total amount if quantity or rate changed
    if (updateData.quantity !== undefined || updateData.rate !== undefined) {
      const quantity = updateData.quantity ?? existing.quantity;
      const rate = updateData.rate ?? existing.rate;
      updated.totalAmount = (quantity * rate).toString();
    }
    
    this.planItemMap.set(itemId, updated);

    // Update plan total
    await this.updatePlanTotal(planId);
    
    return updated;
  }

  async deletePlanItem(itemId: string, planId: string, userId: string): Promise<boolean> {
    const existing = this.planItemMap.get(itemId);
    if (!existing || existing.planId !== planId) return false;

    // Verify plan belongs to user
    const plan = this.planMap.get(planId);
    if (!plan || (plan as any).userId !== userId) return false;

    const deleted = this.planItemMap.delete(itemId);
    
    if (deleted) {
      // Update plan total
      await this.updatePlanTotal(planId);
    }
    
    return deleted;
  }

  private async updatePlanTotal(planId: string): Promise<void> {
    const items = Array.from(this.planItemMap.values())
      .filter((item) => item.planId === planId);
    
    const total = items.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);
    
    const plan = this.planMap.get(planId);
    if (plan) {
      const updated = { ...plan, totalAmount: total.toString(), updatedAt: new Date() };
      this.planMap.set(planId, updated);
    }
  }

  // Savings account methods (stub implementations for MemStorage)
  async getSavingsAccount(id: string, userId: string): Promise<SavingsAccount | undefined> {
    throw new Error("Savings accounts not implemented in MemStorage");
  }

  async getAllSavingsAccounts(userId: string): Promise<SavingsAccount[]> {
    throw new Error("Savings accounts not implemented in MemStorage");
  }

  async createSavingsAccount(account: InsertSavingsAccount & { userId: string }): Promise<SavingsAccount> {
    throw new Error("Savings accounts not implemented in MemStorage");
  }

  async updateSavingsAccount(id: string, userId: string, account: Partial<InsertSavingsAccount>): Promise<SavingsAccount | undefined> {
    throw new Error("Savings accounts not implemented in MemStorage");
  }

  async deleteSavingsAccount(id: string, userId: string): Promise<boolean> {
    throw new Error("Savings accounts not implemented in MemStorage");
  }

  // Savings transaction methods (stub implementations for MemStorage)
  async getSavingsTransactions(accountId: string, userId: string): Promise<SavingsTransaction[]> {
    throw new Error("Savings transactions not implemented in MemStorage");
  }

  async createSavingsTransaction(transaction: InsertSavingsTransaction & { userId: string }): Promise<SavingsTransaction> {
    throw new Error("Savings transactions not implemented in MemStorage");
  }

  async deleteSavingsTransaction(id: string, userId: string): Promise<boolean> {
    throw new Error("Savings transactions not implemented in MemStorage");
  }

  // Invoice methods (stub implementations for MemStorage)
  async getAllInvoices(userId: string): Promise<Invoice[]> {
    return [];
  }

  async createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice> {
    throw new Error("Invoices not implemented in MemStorage");
  }

  async deleteInvoice(id: string, userId: string): Promise<boolean> {
    throw new Error("Invoices not implemented in MemStorage");
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
