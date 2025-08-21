import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, date, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Digital accounts (bank, wallet, credit card, cash)
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // bank | wallet | credit_card | cash
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  institution: text("institution"),
  last4: text("last4"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const income = pgTable("income", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  invoiceNumber: text("invoice_number"), // optional invoice/receipt number
  invoiceDate: date("invoice_date"), // optional invoice date
  invoiceAmount: decimal("invoice_amount", { precision: 10, scale: 2 }), // optional invoice amount (for verification)
  invoiceFileName: text("invoice_file_name"), // original filename
  invoiceFilePath: text("invoice_file_path"), // stored file path
  invoiceFileType: text("invoice_file_type"), // file mime type
  invoiceFileSize: integer("invoice_file_size"), // file size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  accountId: varchar("account_id").references(() => accounts.id), // optional: paid from account
  invoiceNumber: text("invoice_number"), // optional invoice/receipt number
  invoiceDate: date("invoice_date"), // optional invoice date
  invoiceAmount: decimal("invoice_amount", { precision: 10, scale: 2 }), // optional invoice amount (for verification)
  invoiceFileName: text("invoice_file_name"), // original filename
  invoiceFilePath: text("invoice_file_path"), // stored file path
  invoiceFileType: text("invoice_file_type"), // file mime type
  invoiceFileSize: integer("invoice_file_size"), // file size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: date("purchase_date").notNull(),
  invoiceNumber: text("invoice_number"), // optional invoice/receipt number
  invoiceDate: date("invoice_date"), // optional invoice date
  invoiceAmount: decimal("invoice_amount", { precision: 10, scale: 2 }), // optional invoice amount (for verification)
  invoiceFileName: text("invoice_file_name"), // original filename
  invoiceFilePath: text("invoice_file_path"), // stored file path
  invoiceFileType: text("invoice_file_type"), // file mime type
  invoiceFileSize: integer("invoice_file_size"), // file size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  recurringType: text("recurring_type").notNull(), // monthly, quarterly, yearly, one-time
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  lastPaidDate: date("last_paid_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Plans for quotation/planning purposes
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // grocery, shopping, travel, etc.
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  plannedDate: date("planned_date"), // optional: when planning to execute
  status: text("status").notNull().default("draft"), // draft, active, completed, cancelled
  isTemplate: boolean("is_template").default(false), // true if this is a reusable template
  templateName: text("template_name"), // name for template (if isTemplate = true)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual items within a plan
export const planItems = pgTable("plan_items", {
  id: varchar("id").primaryKey(),
  planId: varchar("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // kg, pieces, liters, etc.
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(), // price per unit
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(), // quantity * rate
  notes: text("notes"), // optional notes for the item
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertIncomeSchema = createInsertSchema(income).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
  status: true,
  lastPaidDate: true,
  userId: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalAmount: true,
  userId: true,
});

export const insertPlanItemSchema = createInsertSchema(planItems).omit({
  id: true,
  createdAt: true,
  totalAmount: true,
});

// Savings accounts for long-term savings schemes
export const savingsAccounts = pgTable("savings_accounts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  schemeType: text("scheme_type").notNull(), // sukanya_samriddhi, ppf, epf, nsc, fd, rd, custom
  accountNumber: text("account_number"),
  institution: text("institution"), // bank/post office name
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(), // annual interest rate
  maturityDate: date("maturity_date"),
  maturityAmount: decimal("maturity_amount", { precision: 12, scale: 2 }),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }),
  minContribution: decimal("min_contribution", { precision: 10, scale: 2 }),
  maxContribution: decimal("max_contribution", { precision: 10, scale: 2 }),
  contributionFrequency: text("contribution_frequency").default("monthly"), // monthly, quarterly, yearly, custom
  lockInPeriod: integer("lock_in_period"), // in years
  taxBenefit: boolean("tax_benefit").default(false),
  status: text("status").notNull().default("active"), // active, matured, closed
  openingDate: date("opening_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Standalone invoices table for invoice viewer
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  vendor: text("vendor"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  invoiceDate: date("invoice_date"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Savings contributions/transactions
export const savingsTransactions = pgTable("savings_transactions", {
  id: varchar("id").primaryKey(),
  savingsAccountId: varchar("savings_account_id").notNull().references(() => savingsAccounts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // contribution, withdrawal, interest, maturity
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  transactionDate: date("transaction_date").notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  interestEarned: decimal("interest_earned", { precision: 10, scale: 2 }),
  referenceNumber: text("reference_number"),
  invoiceFileName: text("invoice_file_name"), // optional receipt/statement
  invoiceFilePath: text("invoice_file_path"),
  invoiceFileType: text("invoice_file_type"),
  invoiceFileSize: integer("invoice_file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavingsAccountSchema = createInsertSchema(savingsAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentBalance: true,
  userId: true,
});

export const insertSavingsTransactionSchema = createInsertSchema(savingsTransactions).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Income = typeof income.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type PlanItem = typeof planItems.$inferSelect;
export type InsertPlanItem = z.infer<typeof insertPlanItemSchema>;
export type SavingsAccount = typeof savingsAccounts.$inferSelect;
export type InsertSavingsAccount = z.infer<typeof insertSavingsAccountSchema>;
export type SavingsTransaction = typeof savingsTransactions.$inferSelect;
export type InsertSavingsTransaction = z.infer<typeof insertSavingsTransactionSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
