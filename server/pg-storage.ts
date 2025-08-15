import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { IStorage } from './storage';
import { 
  income, expenses, assets, bills, users, accounts,
  type Income, type InsertIncome, 
  type Expense, type InsertExpense, 
  type Asset, type InsertAsset, 
  type Bill, type InsertBill,
  type User, type Account, type InsertAccount
} from '@shared/schema';
import { eq, and, desc, sum, sql, isNotNull } from 'drizzle-orm';
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

  // Expose underlying Drizzle DB for modules that need direct queries (e.g., auth)
  public getDb() {
    return this.db;
  }

  // Accounts CRUD
  async createAccount(userId: string, data: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const [row] = await this.db.insert(accounts).values({ ...data, id, userId }).returning();
    return row;
  }
  async getAccounts(userId: string): Promise<Account[]> {
    return this.db.select().from(accounts).where(eq(accounts.userId, userId));
  }
  async updateAccount(userId: string, id: string, data: Partial<InsertAccount>): Promise<Account | undefined> {
    const [row] = await this.db.update(accounts).set(data).where(and(eq(accounts.id, id), eq(accounts.userId, userId))).returning();
    return row;
  }
  async deleteAccount(userId: string, id: string): Promise<boolean> {
    const rows = await this.db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId))).returning();
    return rows.length > 0;
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

  async updateIncome(id: string, userId: string, data: Partial<InsertIncome>): Promise<Income | undefined> {
    const results = await this.db
      .update(income)
      .set(data)
      .where(and(eq(income.id, id), eq(income.userId, userId)))
      .returning();
    return results[0];
  }

  async deleteIncome(id: string, userId: string): Promise<boolean> {
    const results = await this.db
      .delete(income)
      .where(and(eq(income.id, id), eq(income.userId, userId)))
      .returning();
    return results.length > 0;
  }

  // Expense methods
  async getExpense(id: string, userId: string): Promise<Expense | undefined> {
    const results = await this.db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return results[0];
  }

  async getAllExpenses(userId: string): Promise<Expense[]> {
    const results = await this.db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.createdAt));
    return results;
  }

  async createExpense(data: InsertExpense & { userId: string }): Promise<Expense> {
    // Insert expense
    const expenseData = { ...data, id: randomUUID() };
    const [created] = await this.db.insert(expenses).values(expenseData).returning();

    // If paid from an account, decrease asset balances; increase credit owed
    if ((created as any).accountId) {
      const amt = parseFloat(created.amount as unknown as string);
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, (created as any).accountId));
      if (acc) {
        const current = parseFloat(acc.balance as unknown as string);
        const isCredit = acc.type === 'credit_card';
        const newBal = isCredit ? current + amt : current - amt;
        if (!isCredit && newBal < 0) {
          throw new Error('Insufficient balance in selected account');
        }
        await this.db.update(accounts).set({ balance: newBal.toFixed(2) as any }).where(eq(accounts.id, acc.id));
      }
    }

    return created;
  }

  async updateExpense(id: string, userId: string, data: Partial<InsertExpense>): Promise<Expense | undefined> {
    // Fetch existing expense to compute delta and account changes
    const [existing] = await this.db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    if (!existing) return undefined;

    // Prepare validation against account balances before updating anything
    const oldAmt = parseFloat(existing.amount as unknown as string);
    const oldAccId = (existing as any).accountId as string | null;
    let oldAcc: any | undefined;
    let oldAfterRevert: number | undefined;
    if (oldAccId) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, oldAccId));
      if (acc) {
        oldAcc = acc;
        const current = parseFloat(acc.balance as unknown as string);
        const isCredit = acc.type === 'credit_card';
        // Revert old effect virtually
        oldAfterRevert = isCredit ? current - oldAmt : current + oldAmt;
        if (isCredit && oldAfterRevert < 0) {
          throw new Error('Reverting would make credit card owed negative');
        }
      }
    }

    // Determine new fields (merged)
    const newAmount = data.amount !== undefined ? parseFloat(data.amount as unknown as string) : oldAmt;
    const newAccId = (data as any).accountId !== undefined ? (data as any).accountId : (existing as any).accountId;

    if (newAccId) {
      if (newAccId === oldAccId && oldAcc) {
        const isCredit = oldAcc.type === 'credit_card';
        const currentBase = oldAfterRevert !== undefined ? oldAfterRevert : parseFloat(oldAcc.balance as unknown as string);
        const applied = isCredit ? currentBase + newAmount : currentBase - newAmount;
        if (!isCredit && applied < 0) {
          throw new Error('Insufficient balance in selected account');
        }
      } else {
        // Different destination account
        const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, newAccId));
        if (acc) {
          const current = parseFloat(acc.balance as unknown as string);
          const isCredit = acc.type === 'credit_card';
          const applied = isCredit ? current + newAmount : current - newAmount;
          if (!isCredit && applied < 0) {
            throw new Error('Insufficient balance in selected account');
          }
        }
      }
    }

    const [updated] = await this.db
      .update(expenses)
      .set(data)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();

    // Apply changes: revert old, then apply new
    const newAmt = parseFloat(updated.amount as unknown as string);
    const newAccIdApplied = (updated as any).accountId as string | null;

    if (oldAccId) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, oldAccId));
      if (acc) {
        const current = parseFloat(acc.balance as unknown as string);
        const isCredit = acc.type === 'credit_card';
        const reverted = isCredit ? current - oldAmt : current + oldAmt; // undo old effect
        await this.db.update(accounts).set({ balance: reverted.toFixed(2) as any }).where(eq(accounts.id, acc.id));
      }
    }

    if (newAccIdApplied) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, newAccIdApplied));
      if (acc) {
        const current = parseFloat(acc.balance as unknown as string);
        const isCredit = acc.type === 'credit_card';
        const applied = isCredit ? current + newAmt : current - newAmt; // apply new effect
        await this.db.update(accounts).set({ balance: applied.toFixed(2) as any }).where(eq(accounts.id, acc.id));
      }
    }

    return updated;
  }

  async deleteExpense(id: string, userId: string): Promise<boolean> {
    // Fetch existing to revert balance
    const [existing] = await this.db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    if (!existing) return false;

    // Validate revert won't make credit card owed negative
    if ((existing as any).accountId) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, (existing as any).accountId));
      if (acc) {
        const current = parseFloat(acc.balance as unknown as string);
        const amt = parseFloat(existing.amount as unknown as string);
        const isCredit = acc.type === 'credit_card';
        const reverted = isCredit ? current - amt : current + amt;
        if (isCredit && reverted < 0) {
          throw new Error('Deleting would make credit card owed negative');
        }
      }
    }

    const results = await this.db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();

    if (results.length > 0 && (existing as any).accountId) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, (existing as any).accountId));
      if (acc) {
        const current = parseFloat(acc.balance as unknown as string);
        const amt = parseFloat(existing.amount as unknown as string);
        const isCredit = acc.type === 'credit_card';
        const reverted = isCredit ? current - amt : current + amt;
        await this.db.update(accounts).set({ balance: reverted.toFixed(2) as any }).where(eq(accounts.id, acc.id));
      }
    }

    return results.length > 0;
  }

  // Asset methods
  async getAsset(id: string, userId: string): Promise<Asset | undefined> {
    const results = await this.db.select().from(assets).where(and(eq(assets.id, id), eq(assets.userId, userId)));
    return results[0];
  }

  async getAllAssets(userId: string): Promise<Asset[]> {
    const results = await this.db.select().from(assets).where(eq(assets.userId, userId)).orderBy(desc(assets.createdAt));
    return results;
  }

  async createAsset(data: InsertAsset & { userId: string }): Promise<Asset> {
    const assetData = { ...data, id: randomUUID() };
    const results = await this.db.insert(assets).values(assetData).returning();
    return results[0];
  }

  async updateAsset(id: string, userId: string, data: Partial<InsertAsset>): Promise<Asset | undefined> {
    const results = await this.db
      .update(assets)
      .set(data)
      .where(and(eq(assets.id, id), eq(assets.userId, userId)))
      .returning();
    return results[0];
  }

  async deleteAsset(id: string, userId: string): Promise<boolean> {
    const results = await this.db
      .delete(assets)
      .where(and(eq(assets.id, id), eq(assets.userId, userId)))
      .returning();
    return results.length > 0;
  }

  // Bill methods
  async getBill(id: string, userId: string): Promise<Bill | undefined> {
    const results = await this.db.select().from(bills).where(and(eq(bills.id, id), eq(bills.userId, userId)));
    return results[0];
  }

  async getAllBills(userId: string): Promise<Bill[]> {
    const results = await this.db.select().from(bills).where(eq(bills.userId, userId)).orderBy(desc(bills.createdAt));
    return results;
  }

  async createBill(data: InsertBill & { userId: string }): Promise<Bill> {
    const billData = { ...data, id: randomUUID() };
    const results = await this.db.insert(bills).values(billData).returning();
    return results[0];
  }

  async updateBill(id: string, userId: string, data: Partial<InsertBill>): Promise<Bill | undefined> {
    const results = await this.db
      .update(bills)
      .set(data)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)))
      .returning();
    return results[0];
  }

  async deleteBill(id: string, userId: string): Promise<boolean> {
    const results = await this.db
      .delete(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)))
      .returning();
    return results.length > 0;
  }

  async markBillAsPaid(id: string, userId: string): Promise<Bill | undefined> {
    const results = await this.db
      .update(bills)
      .set({ 
        status: 'paid',
        lastPaidDate: new Date().toISOString().split('T')[0]
      })
      .where(and(eq(bills.id, id), eq(bills.userId, userId)))
      .returning();
    return results[0];
  }

  // Transfers
  async transfer(userId: string, fromId: string, toId: string, amount: number): Promise<{ fromBalance: number; toBalance: number }> {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (fromId === toId) throw new Error('Source and destination must differ');

    const [from] = await this.db.select().from(accounts).where(and(eq(accounts.id, fromId), eq(accounts.userId, userId)));
    const [to] = await this.db.select().from(accounts).where(and(eq(accounts.id, toId), eq(accounts.userId, userId)));
    if (!from || !to) throw new Error('Account not found');

    const fromBal = parseFloat(from.balance as unknown as string);
    const toBal = parseFloat(to.balance as unknown as string);

    const isAsset = (t: string) => t !== 'credit_card';

    // Compute resulting balances with proper credit card semantics
    const newFrom = isAsset(from.type) ? (fromBal - amount) : (fromBal + amount); // assets decrease; credit owed increases on cash advance
    const newTo = isAsset(to.type) ? (toBal + amount) : (toBal - amount); // assets increase; credit owed decreases when paid

    // Validations
    if (isAsset(from.type) && newFrom < 0) {
      throw new Error('Insufficient balance in source account');
    }
    if (!isAsset(to.type) && newTo < 0) {
      throw new Error('Payment exceeds credit card owed amount');
    }

    await this.db.update(accounts).set({ balance: newFrom.toFixed(2) as any }).where(eq(accounts.id, from.id));
    await this.db.update(accounts).set({ balance: newTo.toFixed(2) as any }).where(eq(accounts.id, to.id));

    return { fromBalance: newFrom, toBalance: newTo };
  }

  // Summary methods
  async getSummary(userId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    totalAssetValue: number;
    netWorth: number;
    accounts: { id: string; name: string; type: string; balance: number }[];
  }> {
    try {
      // Get total income
      const incomeResult = await this.db
        .select({ total: sum(income.amount) })
        .from(income)
        .where(eq(income.userId, userId));
      
      const totalIncome = parseFloat(incomeResult[0]?.total || '0');

      // Get total expenses
      const expenseResult = await this.db
        .select({ total: sum(expenses.amount) })
        .from(expenses)
        .where(eq(expenses.userId, userId));
      
      const totalExpenses = parseFloat(expenseResult[0]?.total || '0');

      // Get total asset value
      const assetResult = await this.db
        .select({ total: sum(assets.currentValue) })
        .from(assets)
        .where(eq(assets.userId, userId));
      
      const totalAssetValue = parseFloat(assetResult[0]?.total || '0');

      const netBalance = totalIncome - totalExpenses;
      const netWorth = netBalance + totalAssetValue;

      // Accounts snapshot
      const accs = await this.db.select().from(accounts).where(eq(accounts.userId, userId));
      const accountsView = accs.map(a => ({ id: a.id, name: a.name, type: a.type, balance: parseFloat(a.balance as unknown as string) }));

      return {
        totalIncome,
        totalExpenses,
        netBalance,
        totalAssetValue,
        netWorth,
        accounts: accountsView,
      };
    } catch (error) {
      log('Error calculating summary:', error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        totalAssetValue: 0,
        netWorth: 0,
        accounts: [],
      };
    }
  }

  // Invoice methods
  async getAllInvoices(userId: string): Promise<any[]> {
    try {
      const invoices: any[] = [];

      // Get invoices from income
      const incomeInvoices = await this.db
        .select({
          id: income.id,
          type: sql<string>`'income'`,
          description: income.description,
          amount: income.amount,
          category: income.category,
          date: income.date,
          invoiceNumber: income.invoiceNumber,
          invoiceDate: income.invoiceDate,
          invoiceAmount: income.invoiceAmount,
          invoiceFileName: income.invoiceFileName,
          invoiceFilePath: income.invoiceFilePath,
          invoiceFileType: income.invoiceFileType,
          invoiceFileSize: income.invoiceFileSize,
          createdAt: income.createdAt,
        })
        .from(income)
        .where(and(
          eq(income.userId, userId),
          isNotNull(income.invoiceFileName)
        ));

      // Get invoices from expenses
      const expenseInvoices = await this.db
        .select({
          id: expenses.id,
          type: sql<string>`'expense'`,
          description: expenses.description,
          amount: expenses.amount,
          category: expenses.category,
          date: expenses.date,
          invoiceNumber: expenses.invoiceNumber,
          invoiceDate: expenses.invoiceDate,
          invoiceAmount: expenses.invoiceAmount,
          invoiceFileName: expenses.invoiceFileName,
          invoiceFilePath: expenses.invoiceFilePath,
          invoiceFileType: expenses.invoiceFileType,
          invoiceFileSize: expenses.invoiceFileSize,
          createdAt: expenses.createdAt,
        })
        .from(expenses)
        .where(and(
          eq(expenses.userId, userId),
          isNotNull(expenses.invoiceFileName)
        ));

      // Get invoices from assets
      const assetInvoices = await this.db
        .select({
          id: assets.id,
          type: sql<string>`'asset'`,
          description: assets.description,
          amount: assets.purchasePrice,
          category: assets.category,
          date: assets.purchaseDate,
          invoiceNumber: assets.invoiceNumber,
          invoiceDate: assets.invoiceDate,
          invoiceAmount: assets.invoiceAmount,
          invoiceFileName: assets.invoiceFileName,
          invoiceFilePath: assets.invoiceFilePath,
          invoiceFileType: assets.invoiceFileType,
          invoiceFileSize: assets.invoiceFileSize,
          createdAt: assets.createdAt,
        })
        .from(assets)
        .where(and(
          eq(assets.userId, userId),
          isNotNull(assets.invoiceFileName)
        ));

      // Combine all invoices
      invoices.push(...incomeInvoices, ...expenseInvoices, ...assetInvoices);

      // Sort by date (newest first)
      invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return invoices;
    } catch (error) {
      log('Error fetching invoices:', error);
      return [];
    }
  }

  // User methods for bill scheduler
  async getAllUsers(): Promise<User[]> {
    try {
      const results = await this.db.select().from(users);
      return results;
    } catch (error) {
      log('Error fetching all users:', error);
      return [];
    }
  }
}