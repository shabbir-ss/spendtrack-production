var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// client/src/lib/indian-financial-year.ts
function formatIndianCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
var init_indian_financial_year = __esm({
  "client/src/lib/indian-financial-year.ts"() {
    "use strict";
  }
});

// server/notifications.ts
var notifications_exports = {};
__export(notifications_exports, {
  sendBillNotification: () => sendBillNotification,
  sendEmailNotification: () => sendEmailNotification,
  sendSMSNotification: () => sendSMSNotification,
  testNotifications: () => testNotifications
});
import nodemailer from "nodemailer";
import twilio from "twilio";
async function sendEmailNotification(data) {
  if (!data.user.emailNotifications || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return false;
  }
  try {
    const subject = data.type === "due_tomorrow" ? `Bill Reminder: ${data.bill.name} due tomorrow` : `Overdue Bill: ${data.bill.name}`;
    const html = generateEmailTemplate(data);
    await emailTransporter.sendMail({
      from: `"SpendTrack" <${process.env.SMTP_USER}>`,
      to: data.user.email,
      subject,
      html
    });
    console.log(`Email sent to ${data.user.email} for bill: ${data.bill.name}`);
    return true;
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  }
}
async function sendSMSNotification(data) {
  if (!data.user.smsNotifications) {
    return false;
  }
  const message = generateSMSMessage(data);
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${data.user.mobile}`
      });
      console.log(`SMS sent via Twilio to ${data.user.mobile} for bill: ${data.bill.name}`);
      return true;
    } catch (error) {
      console.error("Twilio SMS error:", error);
    }
  }
  if (TEXTLOCAL_API_KEY) {
    try {
      const tlNumber = data.user.mobile.startsWith("91") ? data.user.mobile : `91${data.user.mobile}`;
      const response = await fetch("https://api.textlocal.in/send/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          apikey: TEXTLOCAL_API_KEY,
          numbers: tlNumber,
          // Must be 91-prefixed without plus sign
          message,
          sender: TEXTLOCAL_SENDER
        })
      });
      const result = await response.json();
      if (result.status === "success") {
        console.log(`SMS sent via TextLocal to ${data.user.mobile} for bill: ${data.bill.name}`);
        return true;
      } else {
        console.error("TextLocal SMS error:", result);
      }
    } catch (error) {
      console.error("TextLocal SMS error:", error);
    }
  }
  console.log("SMS notification skipped - no service configured");
  return false;
}
function generateEmailTemplate(data) {
  const { user, bill, type } = data;
  const amount = formatIndianCurrency(parseFloat(bill.amount));
  const dueDate = new Date(bill.dueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const isOverdue = type === "overdue";
  const statusColor = isOverdue ? "#ef4444" : "#f59e0b";
  const statusText = isOverdue ? "OVERDUE" : "DUE TOMORROW";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SpendTrack Bill Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SpendTrack</h1>
        <p style="color: #e2e8f0; margin: 5px 0 0 0;">Your Financial Assistant</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a202c; margin-top: 0;">Hello ${user.name}!</h2>
        
        <div style="background: ${isOverdue ? "#fef2f2" : "#fffbeb"}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${statusText}</span>
          </div>
          <h3 style="margin: 10px 0; color: #1a202c;">${bill.name}</h3>
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: ${statusColor};">${amount}</p>
          <p style="margin: 5px 0; color: #64748b;">Due Date: ${dueDate}</p>
          <p style="margin: 5px 0; color: #64748b;">Category: ${bill.category}</p>
        </div>
        
        ${isOverdue ? `<p style="color: #dc2626; font-weight: bold;">\u26A0\uFE0F This bill is overdue. Please make the payment as soon as possible to avoid late fees.</p>` : `<p style="color: #d97706; font-weight: bold;">\u23F0 This bill is due tomorrow. Don't forget to make the payment!</p>`}
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1a202c;">Quick Actions:</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Log into your SpendTrack account to mark this bill as paid</li>
            <li>Set up automatic reminders for future bills</li>
            <li>Review your financial dashboard for better planning</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL || "http://localhost:3000"}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Open SpendTrack
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          You're receiving this because you have bill notifications enabled.<br>
          To change your notification preferences, visit your account settings.
        </p>
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
          \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} SpendTrack. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}
function generateSMSMessage(data) {
  const { user, bill, type } = data;
  const amount = formatIndianCurrency(parseFloat(bill.amount));
  const dueDate = new Date(bill.dueDate).toLocaleDateString("en-IN");
  if (type === "overdue") {
    return `SpendTrack Alert: Your ${bill.name} bill of ${amount} was due on ${dueDate} and is now OVERDUE. Please make payment ASAP. - SpendTrack`;
  } else {
    return `SpendTrack Reminder: Your ${bill.name} bill of ${amount} is due tomorrow (${dueDate}). Don't forget to pay! - SpendTrack`;
  }
}
async function sendBillNotification(data) {
  const [emailSent, smsSent] = await Promise.all([
    sendEmailNotification(data),
    sendSMSNotification(data)
  ]);
  return { emailSent, smsSent };
}
async function testNotifications(userEmail) {
  try {
    const testData = {
      user: {
        name: "Test User",
        email: userEmail,
        mobile: "9999999999",
        emailNotifications: true,
        smsNotifications: false
        // Only test email
      },
      bill: {
        name: "Test Bill",
        amount: "1000.00",
        dueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        category: "utilities"
      },
      type: "due_tomorrow"
    };
    const result = await sendEmailNotification(testData);
    return result;
  } catch (error) {
    console.error("Test notification error:", error);
    return false;
  }
}
var emailTransporter, twilioClient, TEXTLOCAL_API_KEY, TEXTLOCAL_SENDER;
var init_notifications = __esm({
  "server/notifications.ts"() {
    "use strict";
    init_indian_financial_year();
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID.startsWith("AC") ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
    TEXTLOCAL_API_KEY = process.env.TEXTLOCAL_API_KEY;
    TEXTLOCAL_SENDER = (process.env.TEXTLOCAL_SENDER || "SPNTRK").slice(0, 6).toUpperCase();
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID as randomUUID2 } from "crypto";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/pg-storage.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
import { pgTable, text, varchar, decimal, date, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var accounts = pgTable("accounts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // bank | wallet | credit_card | cash
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  institution: text("institution"),
  last4: text("last4"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var income = pgTable("income", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  invoiceNumber: text("invoice_number"),
  // optional invoice/receipt number
  invoiceDate: date("invoice_date"),
  // optional invoice date
  invoiceAmount: decimal("invoice_amount", { precision: 10, scale: 2 }),
  // optional invoice amount (for verification)
  invoiceFileName: text("invoice_file_name"),
  // original filename
  invoiceFilePath: text("invoice_file_path"),
  // stored file path
  invoiceFileType: text("invoice_file_type"),
  // file mime type
  invoiceFileSize: integer("invoice_file_size"),
  // file size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var expenses = pgTable("expenses", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  accountId: varchar("account_id").references(() => accounts.id),
  // optional: paid from account
  invoiceNumber: text("invoice_number"),
  // optional invoice/receipt number
  invoiceDate: date("invoice_date"),
  // optional invoice date
  invoiceAmount: decimal("invoice_amount", { precision: 10, scale: 2 }),
  // optional invoice amount (for verification)
  invoiceFileName: text("invoice_file_name"),
  // original filename
  invoiceFilePath: text("invoice_file_path"),
  // stored file path
  invoiceFileType: text("invoice_file_type"),
  // file mime type
  invoiceFileSize: integer("invoice_file_size"),
  // file size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var assets = pgTable("assets", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: date("purchase_date").notNull(),
  invoiceNumber: text("invoice_number"),
  // optional invoice/receipt number
  invoiceDate: date("invoice_date"),
  // optional invoice date
  invoiceAmount: decimal("invoice_amount", { precision: 10, scale: 2 }),
  // optional invoice amount (for verification)
  invoiceFileName: text("invoice_file_name"),
  // original filename
  invoiceFilePath: text("invoice_file_path"),
  // stored file path
  invoiceFileType: text("invoice_file_type"),
  // file mime type
  invoiceFileSize: integer("invoice_file_size"),
  // file size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var bills = pgTable("bills", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  recurringType: text("recurring_type").notNull(),
  // monthly, quarterly, yearly, one-time
  status: text("status").notNull().default("pending"),
  // pending, paid, overdue
  lastPaidDate: date("last_paid_date"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var plans = pgTable("plans", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  // grocery, shopping, travel, etc.
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  plannedDate: date("planned_date"),
  // optional: when planning to execute
  status: text("status").notNull().default("draft"),
  // draft, active, completed, cancelled
  isTemplate: boolean("is_template").default(false),
  // true if this is a reusable template
  templateName: text("template_name"),
  // name for template (if isTemplate = true)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var planItems = pgTable("plan_items", {
  id: varchar("id").primaryKey(),
  planId: varchar("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  // kg, pieces, liters, etc.
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  // price per unit
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  // quantity * rate
  notes: text("notes"),
  // optional notes for the item
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  userId: true
});
var insertIncomeSchema = createInsertSchema(income).omit({
  id: true,
  createdAt: true,
  userId: true
});
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  userId: true
});
var insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  userId: true
});
var insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
  status: true,
  lastPaidDate: true,
  userId: true
});
var insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalAmount: true,
  userId: true
});
var insertPlanItemSchema = createInsertSchema(planItems).omit({
  id: true,
  createdAt: true,
  totalAmount: true
});
var savingsAccounts = pgTable("savings_accounts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  schemeType: text("scheme_type").notNull(),
  // sukanya_samriddhi, ppf, epf, nsc, fd, rd, custom
  accountNumber: text("account_number"),
  institution: text("institution"),
  // bank/post office name
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  // annual interest rate
  maturityDate: date("maturity_date"),
  maturityAmount: decimal("maturity_amount", { precision: 12, scale: 2 }),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }),
  minContribution: decimal("min_contribution", { precision: 10, scale: 2 }),
  maxContribution: decimal("max_contribution", { precision: 10, scale: 2 }),
  contributionFrequency: text("contribution_frequency").default("monthly"),
  // monthly, quarterly, yearly, custom
  lockInPeriod: integer("lock_in_period"),
  // in years
  taxBenefit: boolean("tax_benefit").default(false),
  status: text("status").notNull().default("active"),
  // active, matured, closed
  openingDate: date("opening_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var invoices = pgTable("invoices", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var savingsTransactions = pgTable("savings_transactions", {
  id: varchar("id").primaryKey(),
  savingsAccountId: varchar("savings_account_id").notNull().references(() => savingsAccounts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  // contribution, withdrawal, interest, maturity
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  transactionDate: date("transaction_date").notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  interestEarned: decimal("interest_earned", { precision: 10, scale: 2 }),
  referenceNumber: text("reference_number"),
  invoiceFileName: text("invoice_file_name"),
  // optional receipt/statement
  invoiceFilePath: text("invoice_file_path"),
  invoiceFileType: text("invoice_file_type"),
  invoiceFileSize: integer("invoice_file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertSavingsAccountSchema = createInsertSchema(savingsAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentBalance: true,
  userId: true
});
var insertSavingsTransactionSchema = createInsertSchema(savingsTransactions).omit({
  id: true,
  createdAt: true,
  userId: true
});
var insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  userId: true
});

// server/pg-storage.ts
import { eq, and, desc, sum, sql, isNotNull } from "drizzle-orm";
import { randomUUID } from "crypto";
var PostgresStorage = class {
  db;
  constructor(connectionString) {
    if (!connectionString) {
      throw new Error("Database connection string is required");
    }
    const client = postgres(connectionString);
    this.db = drizzle(client);
    log("PostgreSQL database connection established");
  }
  // Expose underlying Drizzle DB for modules that need direct queries (e.g., auth)
  getDb() {
    return this.db;
  }
  // Accounts CRUD
  async createAccount(userId, data) {
    const id = randomUUID();
    const [row] = await this.db.insert(accounts).values({ ...data, id, userId }).returning();
    return row;
  }
  async getAccounts(userId) {
    return this.db.select().from(accounts).where(eq(accounts.userId, userId));
  }
  async updateAccount(userId, id, data) {
    const [row] = await this.db.update(accounts).set(data).where(and(eq(accounts.id, id), eq(accounts.userId, userId))).returning();
    return row;
  }
  async deleteAccount(userId, id) {
    const rows = await this.db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId))).returning();
    return rows.length > 0;
  }
  async updateAccountBalance(userId, accountId, amount) {
    const [account] = await this.db.select().from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
    if (!account) throw new Error("Account not found");
    const currentBalance = parseFloat(account.balance);
    const newBalance = currentBalance + amount;
    await this.db.update(accounts).set({ balance: newBalance.toFixed(2) }).where(eq(accounts.id, accountId));
  }
  // Income methods
  async getIncome(id, userId) {
    const results = await this.db.select().from(income).where(and(eq(income.id, id), eq(income.userId, userId)));
    return results[0];
  }
  async getAllIncome(userId) {
    const results = await this.db.select().from(income).where(eq(income.userId, userId)).orderBy(desc(income.createdAt));
    return results;
  }
  async createIncome(data) {
    const incomeData = { ...data, id: randomUUID() };
    const results = await this.db.insert(income).values(incomeData).returning();
    return results[0];
  }
  async updateIncome(id, userId, data) {
    const results = await this.db.update(income).set(data).where(and(eq(income.id, id), eq(income.userId, userId))).returning();
    return results[0];
  }
  async deleteIncome(id, userId) {
    const results = await this.db.delete(income).where(and(eq(income.id, id), eq(income.userId, userId))).returning();
    return results.length > 0;
  }
  // Expense methods
  async getExpense(id, userId) {
    const results = await this.db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return results[0];
  }
  async getAllExpenses(userId) {
    const results = await this.db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.createdAt));
    return results;
  }
  async createExpense(data) {
    const expenseData = { ...data, id: randomUUID() };
    const [created] = await this.db.insert(expenses).values(expenseData).returning();
    if (created.accountId) {
      const amt = parseFloat(created.amount);
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, created.accountId));
      if (acc) {
        const current = parseFloat(acc.balance);
        const isCredit = acc.type === "credit_card";
        const newBal = isCredit ? current + amt : current - amt;
        if (!isCredit && newBal < 0) {
          throw new Error("Insufficient balance in selected account");
        }
        await this.db.update(accounts).set({ balance: newBal.toFixed(2) }).where(eq(accounts.id, acc.id));
      }
    }
    return created;
  }
  async updateExpense(id, userId, data) {
    const [existing] = await this.db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    if (!existing) return void 0;
    const oldAmt = parseFloat(existing.amount);
    const oldAccId = existing.accountId;
    let oldAcc;
    let oldAfterRevert;
    if (oldAccId) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, oldAccId));
      if (acc) {
        oldAcc = acc;
        const current = parseFloat(acc.balance);
        const isCredit = acc.type === "credit_card";
        oldAfterRevert = isCredit ? current - oldAmt : current + oldAmt;
        if (isCredit && oldAfterRevert < 0) {
          throw new Error("Reverting would make credit card owed negative");
        }
      }
    }
    const newAmount = data.amount !== void 0 ? parseFloat(data.amount) : oldAmt;
    const newAccId = data.accountId !== void 0 ? data.accountId : existing.accountId;
    if (newAccId) {
      if (newAccId === oldAccId && oldAcc) {
        const isCredit = oldAcc.type === "credit_card";
        const currentBase = oldAfterRevert !== void 0 ? oldAfterRevert : parseFloat(oldAcc.balance);
        const applied = isCredit ? currentBase + newAmount : currentBase - newAmount;
        if (!isCredit && applied < 0) {
          throw new Error("Insufficient balance in selected account");
        }
      } else {
        const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, newAccId));
        if (acc) {
          const current = parseFloat(acc.balance);
          const isCredit = acc.type === "credit_card";
          const applied = isCredit ? current + newAmount : current - newAmount;
          if (!isCredit && applied < 0) {
            throw new Error("Insufficient balance in selected account");
          }
        }
      }
    }
    const [updated] = await this.db.update(expenses).set(data).where(and(eq(expenses.id, id), eq(expenses.userId, userId))).returning();
    const newAmt = parseFloat(updated.amount);
    const newAccIdApplied = updated.accountId;
    if (oldAccId) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, oldAccId));
      if (acc) {
        const current = parseFloat(acc.balance);
        const isCredit = acc.type === "credit_card";
        const reverted = isCredit ? current - oldAmt : current + oldAmt;
        await this.db.update(accounts).set({ balance: reverted.toFixed(2) }).where(eq(accounts.id, acc.id));
      }
    }
    if (newAccIdApplied) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, newAccIdApplied));
      if (acc) {
        const current = parseFloat(acc.balance);
        const isCredit = acc.type === "credit_card";
        const applied = isCredit ? current + newAmt : current - newAmt;
        await this.db.update(accounts).set({ balance: applied.toFixed(2) }).where(eq(accounts.id, acc.id));
      }
    }
    return updated;
  }
  async deleteExpense(id, userId) {
    const [existing] = await this.db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    if (!existing) return false;
    if (existing.accountId) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, existing.accountId));
      if (acc) {
        const current = parseFloat(acc.balance);
        const amt = parseFloat(existing.amount);
        const isCredit = acc.type === "credit_card";
        const reverted = isCredit ? current - amt : current + amt;
        if (isCredit && reverted < 0) {
          throw new Error("Deleting would make credit card owed negative");
        }
      }
    }
    const results = await this.db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId))).returning();
    if (results.length > 0 && existing.accountId) {
      const [acc] = await this.db.select().from(accounts).where(eq(accounts.id, existing.accountId));
      if (acc) {
        const current = parseFloat(acc.balance);
        const amt = parseFloat(existing.amount);
        const isCredit = acc.type === "credit_card";
        const reverted = isCredit ? current - amt : current + amt;
        await this.db.update(accounts).set({ balance: reverted.toFixed(2) }).where(eq(accounts.id, acc.id));
      }
    }
    return results.length > 0;
  }
  // Asset methods
  async getAsset(id, userId) {
    const results = await this.db.select().from(assets).where(and(eq(assets.id, id), eq(assets.userId, userId)));
    return results[0];
  }
  async getAllAssets(userId) {
    const results = await this.db.select().from(assets).where(eq(assets.userId, userId)).orderBy(desc(assets.createdAt));
    return results;
  }
  async createAsset(data) {
    const assetData = { ...data, id: randomUUID() };
    const results = await this.db.insert(assets).values(assetData).returning();
    return results[0];
  }
  async updateAsset(id, userId, data) {
    const results = await this.db.update(assets).set(data).where(and(eq(assets.id, id), eq(assets.userId, userId))).returning();
    return results[0];
  }
  async deleteAsset(id, userId) {
    const results = await this.db.delete(assets).where(and(eq(assets.id, id), eq(assets.userId, userId))).returning();
    return results.length > 0;
  }
  // Bill methods
  async getBill(id, userId) {
    const results = await this.db.select().from(bills).where(and(eq(bills.id, id), eq(bills.userId, userId)));
    return results[0];
  }
  async getAllBills(userId) {
    const results = await this.db.select().from(bills).where(eq(bills.userId, userId)).orderBy(desc(bills.createdAt));
    return results;
  }
  async createBill(data) {
    const billData = { ...data, id: randomUUID() };
    const results = await this.db.insert(bills).values(billData).returning();
    return results[0];
  }
  async updateBill(id, userId, data) {
    const results = await this.db.update(bills).set(data).where(and(eq(bills.id, id), eq(bills.userId, userId))).returning();
    return results[0];
  }
  async deleteBill(id, userId) {
    const results = await this.db.delete(bills).where(and(eq(bills.id, id), eq(bills.userId, userId))).returning();
    return results.length > 0;
  }
  async markBillAsPaid(id, userId) {
    const results = await this.db.update(bills).set({
      status: "paid",
      lastPaidDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    }).where(and(eq(bills.id, id), eq(bills.userId, userId))).returning();
    return results[0];
  }
  // Transfers
  async transfer(userId, fromId, toId, amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
    if (fromId === toId) throw new Error("Source and destination must differ");
    const [from] = await this.db.select().from(accounts).where(and(eq(accounts.id, fromId), eq(accounts.userId, userId)));
    const [to] = await this.db.select().from(accounts).where(and(eq(accounts.id, toId), eq(accounts.userId, userId)));
    if (!from || !to) throw new Error("Account not found");
    const fromBal = parseFloat(from.balance);
    const toBal = parseFloat(to.balance);
    const isAsset = (t) => t !== "credit_card";
    const newFrom = isAsset(from.type) ? fromBal - amount : fromBal + amount;
    const newTo = isAsset(to.type) ? toBal + amount : toBal - amount;
    if (isAsset(from.type) && newFrom < 0) {
      throw new Error("Insufficient balance in source account");
    }
    if (!isAsset(to.type) && newTo < 0) {
      throw new Error("Payment exceeds credit card owed amount");
    }
    await this.db.update(accounts).set({ balance: newFrom.toFixed(2) }).where(eq(accounts.id, from.id));
    await this.db.update(accounts).set({ balance: newTo.toFixed(2) }).where(eq(accounts.id, to.id));
    return { fromBalance: newFrom, toBalance: newTo };
  }
  // Summary methods
  async getSummary(userId) {
    try {
      const incomeResult = await this.db.select({ total: sum(income.amount) }).from(income).where(eq(income.userId, userId));
      const totalIncome = parseFloat(incomeResult[0]?.total || "0");
      const expenseResult = await this.db.select({ total: sum(expenses.amount) }).from(expenses).where(eq(expenses.userId, userId));
      const totalExpenses = parseFloat(expenseResult[0]?.total || "0");
      const assetResult = await this.db.select({ total: sum(assets.currentValue) }).from(assets).where(eq(assets.userId, userId));
      const totalAssetValue = parseFloat(assetResult[0]?.total || "0");
      const netBalance = totalIncome - totalExpenses;
      const netWorth = netBalance + totalAssetValue;
      const accs = await this.db.select().from(accounts).where(eq(accounts.userId, userId));
      const accountsView = accs.map((a) => ({ id: a.id, name: a.name, type: a.type, balance: parseFloat(a.balance) }));
      return {
        totalIncome,
        totalExpenses,
        netBalance,
        totalAssetValue,
        netWorth,
        accounts: accountsView
      };
    } catch (error) {
      log("Error calculating summary:", error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        totalAssetValue: 0,
        netWorth: 0,
        accounts: []
      };
    }
  }
  // Invoice methods
  async getAllInvoices(userId) {
    try {
      const invoices2 = [];
      const incomeInvoices = await this.db.select({
        id: income.id,
        type: sql`'income'`,
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
        createdAt: income.createdAt
      }).from(income).where(and(
        eq(income.userId, userId),
        isNotNull(income.invoiceFileName)
      ));
      const expenseInvoices = await this.db.select({
        id: expenses.id,
        type: sql`'expense'`,
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
        createdAt: expenses.createdAt
      }).from(expenses).where(and(
        eq(expenses.userId, userId),
        isNotNull(expenses.invoiceFileName)
      ));
      const assetInvoices = await this.db.select({
        id: assets.id,
        type: sql`'asset'`,
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
        createdAt: assets.createdAt
      }).from(assets).where(and(
        eq(assets.userId, userId),
        isNotNull(assets.invoiceFileName)
      ));
      invoices2.push(...incomeInvoices, ...expenseInvoices, ...assetInvoices);
      invoices2.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return invoices2;
    } catch (error) {
      log("Error fetching invoices:", error);
      return [];
    }
  }
  // User methods for bill scheduler
  async getAllUsers() {
    try {
      const results = await this.db.select().from(users);
      return results;
    } catch (error) {
      log("Error fetching all users:", error);
      return [];
    }
  }
  // Planner methods
  async getAllPlans(userId, filters) {
    try {
      let query = this.db.select().from(plans).where(eq(plans.userId, userId));
      if (filters?.category) {
        query = query.where(and(eq(plans.userId, userId), eq(plans.category, filters.category)));
      }
      if (filters?.status) {
        query = query.where(and(eq(plans.userId, userId), eq(plans.status, filters.status)));
      }
      if (filters?.isTemplate !== void 0) {
        query = query.where(and(eq(plans.userId, userId), eq(plans.isTemplate, filters.isTemplate)));
      }
      const results = await query.orderBy(desc(plans.createdAt));
      return results;
    } catch (error) {
      log("Error fetching plans:", error);
      return [];
    }
  }
  async getPlanWithItems(id, userId) {
    try {
      const [plan] = await this.db.select().from(plans).where(and(eq(plans.id, id), eq(plans.userId, userId)));
      if (!plan) return void 0;
      const items = await this.db.select().from(planItems).where(eq(planItems.planId, id));
      return { ...plan, items };
    } catch (error) {
      log("Error fetching plan with items:", error);
      return void 0;
    }
  }
  async createPlan(insertPlan) {
    const id = randomUUID();
    const [row] = await this.db.insert(plans).values({ ...insertPlan, id }).returning();
    return row;
  }
  async updatePlan(id, userId, updateData) {
    const [row] = await this.db.update(plans).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(plans.id, id), eq(plans.userId, userId))).returning();
    return row;
  }
  async deletePlan(id, userId) {
    const rows = await this.db.delete(plans).where(and(eq(plans.id, id), eq(plans.userId, userId))).returning();
    return rows.length > 0;
  }
  async createPlanFromTemplate(templateId, userId, data) {
    try {
      const template = await this.getPlanWithItems(templateId, userId);
      if (!template || !template.isTemplate) return void 0;
      const newPlan = await this.createPlan({
        name: data.name,
        description: template.description,
        category: template.category,
        plannedDate: data.plannedDate,
        status: "draft",
        isTemplate: false,
        templateName: null,
        userId
      });
      for (const item of template.items) {
        await this.addPlanItem({
          planId: newPlan.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.rate,
          notes: item.notes
        }, userId);
      }
      return newPlan;
    } catch (error) {
      log("Error creating plan from template:", error);
      return void 0;
    }
  }
  // Plan item methods
  async addPlanItem(item, userId) {
    try {
      const [plan] = await this.db.select().from(plans).where(and(eq(plans.id, item.planId), eq(plans.userId, userId)));
      if (!plan) return void 0;
      const id = randomUUID();
      const totalAmount = parseFloat(item.quantity.toString()) * parseFloat(item.rate.toString());
      const [newItem] = await this.db.insert(planItems).values({
        ...item,
        id,
        totalAmount: totalAmount.toString()
      }).returning();
      await this.updatePlanTotalAmount(item.planId);
      return newItem;
    } catch (error) {
      log("Error adding plan item:", error);
      return void 0;
    }
  }
  async updatePlanItem(itemId, planId, userId, updateData) {
    try {
      const [plan] = await this.db.select().from(plans).where(and(eq(plans.id, planId), eq(plans.userId, userId)));
      if (!plan) return void 0;
      let totalAmount;
      if (updateData.quantity !== void 0 || updateData.rate !== void 0) {
        const [currentItem] = await this.db.select().from(planItems).where(eq(planItems.id, itemId));
        if (currentItem) {
          const quantity = updateData.quantity !== void 0 ? parseFloat(updateData.quantity.toString()) : parseFloat(currentItem.quantity.toString());
          const rate = updateData.rate !== void 0 ? parseFloat(updateData.rate.toString()) : parseFloat(currentItem.rate.toString());
          totalAmount = (quantity * rate).toString();
        }
      }
      const [updatedItem] = await this.db.update(planItems).set({ ...updateData, ...totalAmount && { totalAmount } }).where(and(eq(planItems.id, itemId), eq(planItems.planId, planId))).returning();
      await this.updatePlanTotalAmount(planId);
      return updatedItem;
    } catch (error) {
      log("Error updating plan item:", error);
      return void 0;
    }
  }
  async deletePlanItem(itemId, planId, userId) {
    try {
      const [plan] = await this.db.select().from(plans).where(and(eq(plans.id, planId), eq(plans.userId, userId)));
      if (!plan) return false;
      const rows = await this.db.delete(planItems).where(and(eq(planItems.id, itemId), eq(planItems.planId, planId))).returning();
      await this.updatePlanTotalAmount(planId);
      return rows.length > 0;
    } catch (error) {
      log("Error deleting plan item:", error);
      return false;
    }
  }
  // Helper method to update plan total amount
  async updatePlanTotalAmount(planId) {
    try {
      const [result] = await this.db.select({ total: sum(planItems.totalAmount) }).from(planItems).where(eq(planItems.planId, planId));
      const totalAmount = result?.total || "0";
      await this.db.update(plans).set({ totalAmount, updatedAt: /* @__PURE__ */ new Date() }).where(eq(plans.id, planId));
    } catch (error) {
      log("Error updating plan total amount:", error);
    }
  }
  // Savings account methods
  async getSavingsAccount(id, userId) {
    const [row] = await this.db.select().from(savingsAccounts).where(and(eq(savingsAccounts.id, id), eq(savingsAccounts.userId, userId)));
    return row;
  }
  async getAllSavingsAccounts(userId) {
    return this.db.select().from(savingsAccounts).where(eq(savingsAccounts.userId, userId)).orderBy(desc(savingsAccounts.createdAt));
  }
  async createSavingsAccount(account) {
    const id = randomUUID();
    const [row] = await this.db.insert(savingsAccounts).values({ ...account, id }).returning();
    return row;
  }
  async updateSavingsAccount(id, userId, account) {
    const [row] = await this.db.update(savingsAccounts).set({ ...account, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(savingsAccounts.id, id), eq(savingsAccounts.userId, userId))).returning();
    return row;
  }
  async deleteSavingsAccount(id, userId) {
    const rows = await this.db.delete(savingsAccounts).where(and(eq(savingsAccounts.id, id), eq(savingsAccounts.userId, userId))).returning();
    return rows.length > 0;
  }
  // Savings transaction methods
  async getSavingsTransactions(accountId, userId) {
    const [account] = await this.db.select().from(savingsAccounts).where(and(eq(savingsAccounts.id, accountId), eq(savingsAccounts.userId, userId)));
    if (!account) return [];
    return this.db.select().from(savingsTransactions).where(eq(savingsTransactions.savingsAccountId, accountId)).orderBy(desc(savingsTransactions.transactionDate), desc(savingsTransactions.createdAt));
  }
  async createSavingsTransaction(transaction) {
    const id = randomUUID();
    const [newTransaction] = await this.db.insert(savingsTransactions).values({ ...transaction, id }).returning();
    await this.db.update(savingsAccounts).set({
      currentBalance: transaction.balanceAfter,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(savingsAccounts.id, transaction.savingsAccountId));
    return newTransaction;
  }
  async deleteSavingsTransaction(id, userId) {
    const [transaction] = await this.db.select({
      id: savingsTransactions.id,
      savingsAccountId: savingsTransactions.savingsAccountId,
      type: savingsTransactions.type,
      amount: savingsTransactions.amount,
      userId: savingsAccounts.userId
    }).from(savingsTransactions).innerJoin(savingsAccounts, eq(savingsTransactions.savingsAccountId, savingsAccounts.id)).where(and(eq(savingsTransactions.id, id), eq(savingsAccounts.userId, userId)));
    if (!transaction) return false;
    const rows = await this.db.delete(savingsTransactions).where(eq(savingsTransactions.id, id)).returning();
    if (rows.length > 0) {
      const [balanceResult] = await this.db.select({
        balance: sql`
            COALESCE(
              SUM(
                CASE 
                  WHEN ${savingsTransactions.type} IN ('contribution', 'interest') THEN ${savingsTransactions.amount}::numeric
                  ELSE -${savingsTransactions.amount}::numeric
                END
              ), 
              0
            )
          `
      }).from(savingsTransactions).where(eq(savingsTransactions.savingsAccountId, transaction.savingsAccountId));
      const newBalance = balanceResult?.balance || "0";
      await this.db.update(savingsAccounts).set({
        currentBalance: newBalance,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(savingsAccounts.id, transaction.savingsAccountId));
    }
    return rows.length > 0;
  }
  // Invoice methods
  async getAllInvoices(userId) {
    const rows = await this.db.select().from(invoices).where(eq(invoices.userId, userId));
    return rows;
  }
  async createInvoice(invoice) {
    const id = randomUUID();
    const [row] = await this.db.insert(invoices).values({ ...invoice, id }).returning();
    return row;
  }
  async deleteInvoice(id, userId) {
    const rows = await this.db.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId))).returning();
    return rows.length > 0;
  }
};

// server/storage.ts
var MemStorage = class {
  incomeMap;
  expenseMap;
  assetMap;
  billMap;
  constructor() {
    this.incomeMap = /* @__PURE__ */ new Map();
    this.expenseMap = /* @__PURE__ */ new Map();
    this.assetMap = /* @__PURE__ */ new Map();
    this.billMap = /* @__PURE__ */ new Map();
    log("Using in-memory storage");
  }
  // Income methods
  async getIncome(id, userId) {
    const row = this.incomeMap.get(id);
    return row && row.userId === userId ? row : void 0;
  }
  async getAllIncome(userId) {
    return Array.from(this.incomeMap.values()).filter((r) => r.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createIncome(insertIncome) {
    const id = randomUUID2();
    const income2 = {
      ...insertIncome,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.incomeMap.set(id, income2);
    return income2;
  }
  async updateIncome(id, userId, updateData) {
    const existing = this.incomeMap.get(id);
    if (!existing || existing.userId !== userId) return void 0;
    const updated = { ...existing, ...updateData };
    this.incomeMap.set(id, updated);
    return updated;
  }
  async deleteIncome(id, userId) {
    const existing = this.incomeMap.get(id);
    if (!existing || existing.userId !== userId) return false;
    return this.incomeMap.delete(id);
  }
  // Expense methods
  async getExpense(id, userId) {
    const row = this.expenseMap.get(id);
    return row && row.userId === userId ? row : void 0;
  }
  async getAllExpenses(userId) {
    return Array.from(this.expenseMap.values()).filter((r) => r.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createExpense(insertExpense) {
    const id = randomUUID2();
    const expense = {
      ...insertExpense,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.expenseMap.set(id, expense);
    return expense;
  }
  async updateExpense(id, userId, updateData) {
    const existing = this.expenseMap.get(id);
    if (!existing || existing.userId !== userId) return void 0;
    const updated = { ...existing, ...updateData };
    this.expenseMap.set(id, updated);
    return updated;
  }
  async deleteExpense(id, userId) {
    const existing = this.expenseMap.get(id);
    if (!existing || existing.userId !== userId) return false;
    return this.expenseMap.delete(id);
  }
  // Asset methods
  async getAsset(id, userId) {
    const row = this.assetMap.get(id);
    return row && row.userId === userId ? row : void 0;
  }
  async getAllAssets(userId) {
    return Array.from(this.assetMap.values()).filter((r) => r.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createAsset(insertAsset) {
    const id = randomUUID2();
    const asset = {
      ...insertAsset,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      description: insertAsset.description || null
    };
    this.assetMap.set(id, asset);
    return asset;
  }
  async updateAsset(id, userId, updateData) {
    const existing = this.assetMap.get(id);
    if (!existing || existing.userId !== userId) return void 0;
    const updated = { ...existing, ...updateData };
    this.assetMap.set(id, updated);
    return updated;
  }
  async deleteAsset(id, userId) {
    const existing = this.assetMap.get(id);
    if (!existing || existing.userId !== userId) return false;
    return this.assetMap.delete(id);
  }
  // Bill methods
  async getBill(id, userId) {
    const row = this.billMap.get(id);
    return row && row.userId === userId ? row : void 0;
  }
  async getAllBills(userId) {
    return Array.from(this.billMap.values()).filter((r) => r.userId === userId).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }
  async createBill(insertBill) {
    const id = randomUUID2();
    const bill = {
      ...insertBill,
      id,
      status: "pending",
      lastPaidDate: null,
      description: insertBill.description || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.billMap.set(id, bill);
    return bill;
  }
  async updateBill(id, userId, updateData) {
    const existing = this.billMap.get(id);
    if (!existing || existing.userId !== userId) return void 0;
    const updated = { ...existing, ...updateData };
    this.billMap.set(id, updated);
    return updated;
  }
  async deleteBill(id, userId) {
    const existing = this.billMap.get(id);
    if (!existing || existing.userId !== userId) return false;
    return this.billMap.delete(id);
  }
  async markBillAsPaid(id, userId) {
    const existing = this.billMap.get(id);
    if (!existing || existing.userId !== userId) return void 0;
    const updated = {
      ...existing,
      status: "paid",
      lastPaidDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    this.billMap.set(id, updated);
    return updated;
  }
  // Transfers (not supported in-memory)
  async transfer(_userId, _fromId, _toId, _amount) {
    throw new Error("Accounts not supported in in-memory storage");
  }
  // Summary
  async getSummary(userId) {
    const incomes = await this.getAllIncome(userId);
    const expenses2 = await this.getAllExpenses(userId);
    const assets2 = await this.getAllAssets(userId);
    const sum2 = (arr, key) => arr.reduce((acc, r) => acc + parseFloat(r[key]), 0);
    const totalIncome = sum2(incomes, "amount");
    const totalExpenses = sum2(expenses2, "amount");
    const totalAssetValue = sum2(assets2, "currentValue");
    const netBalance = totalIncome - totalExpenses;
    const netWorth = totalAssetValue + netBalance;
    return { totalIncome, totalExpenses, netBalance, totalAssetValue, netWorth, accounts: [] };
  }
  async getAllInvoices(userId) {
    return [];
  }
  // Planner methods (in-memory implementation)
  planMap = /* @__PURE__ */ new Map();
  planItemMap = /* @__PURE__ */ new Map();
  async getAllPlans(userId, filters) {
    let plans2 = Array.from(this.planMap.values()).filter((p) => p.userId === userId);
    if (filters?.category) {
      plans2 = plans2.filter((p) => p.category === filters.category);
    }
    if (filters?.status) {
      plans2 = plans2.filter((p) => p.status === filters.status);
    }
    if (filters?.isTemplate !== void 0) {
      plans2 = plans2.filter((p) => p.isTemplate === filters.isTemplate);
    }
    return plans2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getPlanWithItems(id, userId) {
    const plan = this.planMap.get(id);
    if (!plan || plan.userId !== userId) return void 0;
    const items = Array.from(this.planItemMap.values()).filter((item) => item.planId === id);
    return { ...plan, items };
  }
  async createPlan(insertPlan) {
    const id = randomUUID2();
    const plan = {
      ...insertPlan,
      id,
      totalAmount: "0",
      status: insertPlan.status || "draft",
      isTemplate: insertPlan.isTemplate || false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.planMap.set(id, plan);
    return plan;
  }
  async updatePlan(id, userId, updateData) {
    const existing = this.planMap.get(id);
    if (!existing || existing.userId !== userId) return void 0;
    const updated = {
      ...existing,
      ...updateData,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.planMap.set(id, updated);
    return updated;
  }
  async deletePlan(id, userId) {
    const existing = this.planMap.get(id);
    if (!existing || existing.userId !== userId) return false;
    const itemsToDelete = Array.from(this.planItemMap.entries()).filter(([_, item]) => item.planId === id).map(([itemId, _]) => itemId);
    itemsToDelete.forEach((itemId) => this.planItemMap.delete(itemId));
    return this.planMap.delete(id);
  }
  async createPlanFromTemplate(templateId, userId, data) {
    const template = this.planMap.get(templateId);
    if (!template || template.userId !== userId || !template.isTemplate) return void 0;
    const newPlan = await this.createPlan({
      name: data.name,
      description: template.description,
      category: template.category,
      plannedDate: data.plannedDate,
      isTemplate: false,
      userId
    });
    const templateItems = Array.from(this.planItemMap.values()).filter((item) => item.planId === templateId);
    for (const templateItem of templateItems) {
      await this.addPlanItem({
        planId: newPlan.id,
        name: templateItem.name,
        quantity: templateItem.quantity,
        unit: templateItem.unit,
        rate: templateItem.rate,
        notes: templateItem.notes
      }, userId);
    }
    return newPlan;
  }
  async addPlanItem(insertItem, userId) {
    const plan = this.planMap.get(insertItem.planId);
    if (!plan || plan.userId !== userId) return void 0;
    const id = randomUUID2();
    const totalAmount = insertItem.quantity * insertItem.rate;
    const item = {
      ...insertItem,
      id,
      totalAmount: totalAmount.toString(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.planItemMap.set(id, item);
    await this.updatePlanTotal(insertItem.planId);
    return item;
  }
  async updatePlanItem(itemId, planId, userId, updateData) {
    const existing = this.planItemMap.get(itemId);
    if (!existing || existing.planId !== planId) return void 0;
    const plan = this.planMap.get(planId);
    if (!plan || plan.userId !== userId) return void 0;
    const updated = { ...existing, ...updateData };
    if (updateData.quantity !== void 0 || updateData.rate !== void 0) {
      const quantity = updateData.quantity ?? existing.quantity;
      const rate = updateData.rate ?? existing.rate;
      updated.totalAmount = (quantity * rate).toString();
    }
    this.planItemMap.set(itemId, updated);
    await this.updatePlanTotal(planId);
    return updated;
  }
  async deletePlanItem(itemId, planId, userId) {
    const existing = this.planItemMap.get(itemId);
    if (!existing || existing.planId !== planId) return false;
    const plan = this.planMap.get(planId);
    if (!plan || plan.userId !== userId) return false;
    const deleted = this.planItemMap.delete(itemId);
    if (deleted) {
      await this.updatePlanTotal(planId);
    }
    return deleted;
  }
  async updatePlanTotal(planId) {
    const items = Array.from(this.planItemMap.values()).filter((item) => item.planId === planId);
    const total = items.reduce((sum2, item) => sum2 + parseFloat(item.totalAmount), 0);
    const plan = this.planMap.get(planId);
    if (plan) {
      const updated = { ...plan, totalAmount: total.toString(), updatedAt: /* @__PURE__ */ new Date() };
      this.planMap.set(planId, updated);
    }
  }
  // Savings account methods (stub implementations for MemStorage)
  async getSavingsAccount(id, userId) {
    throw new Error("Savings accounts not implemented in MemStorage");
  }
  async getAllSavingsAccounts(userId) {
    throw new Error("Savings accounts not implemented in MemStorage");
  }
  async createSavingsAccount(account) {
    throw new Error("Savings accounts not implemented in MemStorage");
  }
  async updateSavingsAccount(id, userId, account) {
    throw new Error("Savings accounts not implemented in MemStorage");
  }
  async deleteSavingsAccount(id, userId) {
    throw new Error("Savings accounts not implemented in MemStorage");
  }
  // Savings transaction methods (stub implementations for MemStorage)
  async getSavingsTransactions(accountId, userId) {
    throw new Error("Savings transactions not implemented in MemStorage");
  }
  async createSavingsTransaction(transaction) {
    throw new Error("Savings transactions not implemented in MemStorage");
  }
  async deleteSavingsTransaction(id, userId) {
    throw new Error("Savings transactions not implemented in MemStorage");
  }
  // Invoice methods (stub implementations for MemStorage)
  async getAllInvoices(userId) {
    return [];
  }
  async createInvoice(invoice) {
    throw new Error("Invoices not implemented in MemStorage");
  }
  async deleteInvoice(id, userId) {
    throw new Error("Invoices not implemented in MemStorage");
  }
};
function createStorage() {
  if (process.env.DATABASE_URL) {
    try {
      return new PostgresStorage(process.env.DATABASE_URL);
    } catch (error) {
      console.error("Failed to initialize PostgreSQL storage:", error);
      log("Falling back to in-memory storage due to database connection error");
      return new MemStorage();
    }
  }
  return new MemStorage();
}
var storage = createStorage();

// server/routes.ts
import { z } from "zod";

// server/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq as eq2 } from "drizzle-orm";
import { randomUUID as randomUUID3 } from "crypto";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
var memUsers = [];
function findMemUserByEmail(email) {
  return memUsers.find((u) => u.email === email);
}
function findMemUserById(id) {
  return memUsers.find((u) => u.id === id);
}
function generateAccessToken(userId) {
  return jwt.sign({ userId, type: "access" }, JWT_SECRET, { expiresIn: "15m" });
}
function generateRefreshToken(userId) {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
}
function generateTokens(userId) {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
}
function verifyToken(token, expectedType) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (expectedType && decoded.type !== expectedType) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
async function authenticateToken(req, res, next) {
  const storageInstance = req.app.get("db");
  const isMemMode = !storageInstance;
  if (isMemMode) {
    const authHeader2 = req.headers.authorization;
    const token2 = authHeader2 && authHeader2.split(" ")[1];
    if (!token2) {
      return res.status(401).json({ message: "Access token required" });
    }
    const decoded2 = verifyToken(token2, "access");
    if (!decoded2) {
      return res.status(403).json({ message: "Invalid or expired access token" });
    }
    const mem = findMemUserById(decoded2.userId);
    if (!mem) {
      return res.status(403).json({ message: "User not found" });
    }
    req.user = {
      id: mem.id,
      email: mem.email,
      name: mem.name,
      mobile: mem.mobile,
      emailNotifications: mem.emailNotifications,
      smsNotifications: mem.smsNotifications
    };
    return next();
  }
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  const decoded = verifyToken(token, "access");
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
  try {
    const db = storageInstance?.getDb ? storageInstance.getDb() : storageInstance;
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      mobile: users.mobile,
      emailNotifications: users.emailNotifications,
      smsNotifications: users.smsNotifications
    }).from(users).where(eq2(users.id, decoded.userId));
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
}
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
function setupAuthRoutes(app2, db) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, mobile, password, emailNotifications, smsNotifications } = req.body;
      const storage3 = app2.get("db");
      const db2 = storage3?.getDb ? storage3.getDb() : storage3;
      const isMemMode = !db2;
      if (isMemMode) {
        const existingUser = findMemUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "User already exists with this email" });
        }
      } else {
        const [existingUser] = await db2.select().from(users).where(eq2(users.email, email));
        if (existingUser) {
          return res.status(400).json({ message: "User already exists with this email" });
        }
      }
      const hashedPassword = await hashPassword(password);
      const userId = randomUUID3();
      let newUser;
      if (isMemMode) {
        const now = /* @__PURE__ */ new Date();
        memUsers.push({
          id: userId,
          name,
          email,
          mobile,
          password: hashedPassword,
          emailNotifications: emailNotifications ?? true,
          smsNotifications: smsNotifications ?? true,
          createdAt: now
        });
        newUser = {
          id: userId,
          name,
          email,
          mobile,
          emailNotifications: emailNotifications ?? true,
          smsNotifications: smsNotifications ?? true,
          createdAt: now
        };
      } else {
        [newUser] = await db2.insert(users).values({
          id: userId,
          name,
          email,
          mobile,
          password: hashedPassword,
          emailNotifications: emailNotifications ?? true,
          smsNotifications: smsNotifications ?? true
        }).returning({
          id: users.id,
          name: users.name,
          email: users.email,
          mobile: users.mobile,
          emailNotifications: users.emailNotifications,
          smsNotifications: users.smsNotifications,
          createdAt: users.createdAt
        });
      }
      const tokens = generateTokens(userId);
      res.status(201).json({
        message: "User created successfully",
        user: newUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const storage3 = app2.get("db");
      const db2 = storage3?.getDb ? storage3.getDb() : storage3;
      const isMemMode = !db2;
      let user;
      if (isMemMode) {
        user = findMemUserByEmail(email);
      } else {
        [user] = await db2.select().from(users).where(eq2(users.email, email));
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const tokens = generateTokens(user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
    res.json({ user: req.user });
  });
  app2.post("/api/auth/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }
      const decoded = verifyToken(refreshToken, "refresh");
      if (!decoded) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }
      const storage3 = app2.get("db");
      const db2 = storage3?.getDb ? storage3.getDb() : storage3;
      const isMemMode = !db2;
      let user;
      if (isMemMode) {
        user = findMemUserById(decoded.userId);
      } else {
        [user] = await db2.select({
          id: users.id,
          email: users.email,
          name: users.name,
          mobile: users.mobile,
          emailNotifications: users.emailNotifications,
          smsNotifications: users.smsNotifications
        }).from(users).where(eq2(users.id, decoded.userId));
      }
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }
      const tokens = generateTokens(decoded.userId);
      res.json({
        message: "Tokens refreshed successfully",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ message: "Token refresh failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });
  app2.patch("/api/auth/preferences", authenticateToken, async (req, res) => {
    try {
      const { emailNotifications, smsNotifications } = req.body;
      const userId = req.user.id;
      const storage3 = app2.get("db");
      const db2 = storage3?.getDb ? storage3.getDb() : storage3;
      const isMemMode = !db2;
      let updatedUser;
      if (isMemMode) {
        const u = findMemUserById(userId);
        if (!u) return res.status(404).json({ message: "User not found" });
        u.emailNotifications = emailNotifications ?? u.emailNotifications;
        u.smsNotifications = smsNotifications ?? u.smsNotifications;
        updatedUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          mobile: u.mobile,
          emailNotifications: u.emailNotifications,
          smsNotifications: u.smsNotifications
        };
      } else {
        [updatedUser] = await db2.update(users).set({
          emailNotifications,
          smsNotifications
        }).where(eq2(users.id, userId)).returning({
          id: users.id,
          name: users.name,
          email: users.email,
          mobile: users.mobile,
          emailNotifications: users.emailNotifications,
          smsNotifications: users.smsNotifications
        });
      }
      res.json({
        message: "Preferences updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });
}

// server/file-upload.ts
import multer from "multer";
import path3 from "path";
import fs2 from "fs";
import { v4 as uuidv4 } from "uuid";
var uploadsDir = path3.join(process.cwd(), "uploads");
if (!fs2.existsSync(uploadsDir)) {
  fs2.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    const transactionId = req.body.transactionId || "temp";
    const uploadPath = path3.join(uploadsDir, transactionId);
    if (!fs2.existsSync(uploadPath)) {
      fs2.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path3.extname(file.originalname);
    const filename = `invoice_${uniqueId}${extension}`;
    cb(null, filename);
  }
});
var fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and images (JPG, PNG, WEBP) are allowed."));
  }
};
var upload = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB limit (can be adjusted)
  }
});
var deleteUploadedFile = (filePath) => {
  try {
    if (fs2.existsSync(filePath)) {
      fs2.unlinkSync(filePath);
      const dir = path3.dirname(filePath);
      try {
        fs2.rmdirSync(dir);
      } catch (e) {
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};
var getFileInfo = (file, transactionId) => {
  return {
    fileName: file.originalname,
    filePath: file.path,
    fileType: file.mimetype,
    fileSize: file.size,
    relativePath: path3.relative(process.cwd(), file.path)
  };
};

// server/routes.ts
import path4 from "path";
import fs3 from "fs";
import jwt2 from "jsonwebtoken";
async function registerRoutes(app2) {
  app2.get("/api/income", authenticateToken, async (req, res) => {
    try {
      const income2 = await storage.getAllIncome(req.user.id);
      res.json(income2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch income" });
    }
  });
  app2.post("/api/income", authenticateToken, async (req, res) => {
    try {
      const data = insertIncomeSchema.parse(req.body);
      const income2 = await storage.createIncome({ ...data, userId: req.user.id });
      res.status(201).json(income2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create income" });
      }
    }
  });
  app2.put("/api/income/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertIncomeSchema.partial().parse(req.body);
      const income2 = await storage.updateIncome(id, req.user.id, data);
      if (!income2) {
        res.status(404).json({ message: "Income not found" });
        return;
      }
      res.json(income2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update income" });
      }
    }
  });
  app2.delete("/api/income/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteIncome(id, req.user.id);
      if (!success) {
        res.status(404).json({ message: "Income not found" });
        return;
      }
      res.json({ message: "Income deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });
  app2.get("/api/expenses", authenticateToken, async (req, res) => {
    try {
      const expenses2 = await storage.getAllExpenses(req.user.id);
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.post("/api/expenses", authenticateToken, async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({ ...data, userId: req.user.id });
      if (data.accountId) {
        const db = req.app.get("db");
        if (db && "updateAccountBalance" in db) {
          await db.updateAccountBalance(req.user.id, data.accountId, -parseFloat(data.amount));
        }
      }
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });
  app2.put("/api/expenses/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, req.user.id, data);
      if (!expense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update expense" });
      }
    }
  });
  app2.delete("/api/expenses/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteExpense(id, req.user.id);
      if (!success) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  app2.get("/api/assets", authenticateToken, async (req, res) => {
    try {
      const assets2 = await storage.getAllAssets(req.user.id);
      res.json(assets2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });
  app2.post("/api/assets", authenticateToken, async (req, res) => {
    try {
      const data = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset({ ...data, userId: req.user.id });
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create asset" });
      }
    }
  });
  app2.put("/api/assets/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertAssetSchema.partial().parse(req.body);
      const asset = await storage.updateAsset(id, req.user.id, data);
      if (!asset) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }
      res.json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update asset" });
      }
    }
  });
  app2.delete("/api/assets/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAsset(id, req.user.id);
      if (!success) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }
      res.json({ message: "Asset deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });
  app2.get("/api/bills", authenticateToken, async (req, res) => {
    try {
      const bills2 = await storage.getAllBills(req.user.id);
      res.json(bills2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });
  app2.post("/api/bills", authenticateToken, async (req, res) => {
    try {
      const data = insertBillSchema.parse(req.body);
      const bill = await storage.createBill({ ...data, userId: req.user.id });
      res.status(201).json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bill" });
      }
    }
  });
  app2.put("/api/bills/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertBillSchema.partial().parse(req.body);
      const bill = await storage.updateBill(id, req.user.id, data);
      if (!bill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update bill" });
      }
    }
  });
  app2.delete("/api/bills/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBill(id, req.user.id);
      if (!success) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.json({ message: "Bill deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });
  app2.patch("/api/bills/:id/pay", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.markBillAsPaid(id, req.user.id);
      if (!bill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark bill as paid" });
    }
  });
  app2.get("/api/accounts", authenticateToken, async (req, res) => {
    try {
      const db = req.app.get("db");
      if (!db || !("getAccounts" in db)) return res.json([]);
      const accounts2 = await db.getAccounts(req.user.id);
      res.json(accounts2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });
  app2.post("/api/accounts", authenticateToken, async (req, res) => {
    try {
      const data = insertAccountSchema.parse(req.body);
      const db = req.app.get("db");
      if (!db || !("createAccount" in db)) return res.status(501).json({ message: "Accounts not supported" });
      const account = await db.createAccount(req.user.id, data);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  });
  app2.put("/api/accounts/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const db = req.app.get("db");
      if (!db || !("updateAccount" in db)) return res.status(501).json({ message: "Accounts not supported" });
      const account = await db.updateAccount(req.user.id, id, req.body);
      if (!account) return res.status(404).json({ message: "Account not found" });
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to update account" });
    }
  });
  app2.delete("/api/accounts/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const db = req.app.get("db");
      if (!db || !("deleteAccount" in db)) return res.status(501).json({ message: "Accounts not supported" });
      const ok = await db.deleteAccount(req.user.id, id);
      if (!ok) return res.status(404).json({ message: "Account not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });
  app2.get("/api/summary", authenticateToken, async (req, res) => {
    try {
      const summary = await storage.getSummary(req.user.id);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });
  app2.post("/api/accounts/transfer", authenticateToken, async (req, res) => {
    try {
      const { fromId, toId, amount } = req.body || {};
      if (!fromId || !toId || typeof amount !== "number") {
        return res.status(400).json({ message: "fromId, toId, and numeric amount are required" });
      }
      const db = req.app.get("db");
      if (!db || !("transfer" in db)) return res.status(501).json({ message: "Accounts not supported" });
      const result = await db.transfer(req.user.id, fromId, toId, amount);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to transfer" });
    }
  });
  app2.post("/api/test-notification", authenticateToken, async (req, res) => {
    try {
      const { testNotifications: testNotifications2 } = await Promise.resolve().then(() => (init_notifications(), notifications_exports));
      const result = await testNotifications2(req.user.email);
      if (result) {
        res.json({ message: "Test notification sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test notification" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });
  app2.post("/api/upload/invoice", authenticateToken, upload.single("invoice"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileInfo = getFileInfo(req.file, req.body.transactionId || "temp");
      res.json({
        message: "File uploaded successfully",
        file: {
          originalName: fileInfo.fileName,
          filename: path4.basename(fileInfo.filePath),
          path: fileInfo.relativePath,
          mimetype: fileInfo.fileType,
          size: fileInfo.fileSize
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to upload file" });
    }
  });
  app2.get("/api/files/:transactionId/:filename", authenticateToken, async (req, res) => {
    try {
      const { transactionId, filename } = req.params;
      const filePath = path4.join(process.cwd(), "uploads", transactionId, filename);
      if (!fs3.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ message: "Failed to serve file" });
    }
  });
  app2.get("/api/files/:transactionId/:filename", async (req, res) => {
    try {
      const token = req.query.token || req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      try {
        const decoded = jwt2.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
      const { transactionId, filename } = req.params;
      const filePath = path4.join(process.cwd(), "uploads", transactionId, filename);
      if (!fs3.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.sendFile(path4.resolve(filePath));
    } catch (error) {
      res.status(500).json({ message: "Failed to serve file" });
    }
  });
  app2.get("/api/download/:transactionId/:filename", authenticateToken, async (req, res) => {
    try {
      const { transactionId, filename } = req.params;
      const filePath = path4.join(process.cwd(), "uploads", transactionId, filename);
      if (!fs3.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.download(filePath);
    } catch (error) {
      res.status(500).json({ message: "Failed to download file" });
    }
  });
  app2.get("/api/invoices", authenticateToken, async (req, res) => {
    try {
      const invoices2 = await storage.getAllInvoices(req.user.id);
      res.json(invoices2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  app2.delete("/api/files/:transactionId/:filename", authenticateToken, async (req, res) => {
    try {
      const { transactionId, filename } = req.params;
      const filePath = path4.join(process.cwd(), "uploads", transactionId, filename);
      const deleted = deleteUploadedFile(filePath);
      if (deleted) {
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(404).json({ message: "File not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });
  app2.get("/api/plans", authenticateToken, async (req, res) => {
    try {
      const { category, status, isTemplate } = req.query;
      const plans2 = await storage.getAllPlans(req.user.id, {
        category,
        status,
        isTemplate: isTemplate === "true"
      });
      res.json(plans2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  app2.get("/api/plans/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.getPlanWithItems(id, req.user.id);
      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });
  app2.post("/api/plans", authenticateToken, async (req, res) => {
    try {
      const data = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan({ ...data, userId: req.user.id });
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create plan" });
      }
    }
  });
  app2.put("/api/plans/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertPlanSchema.partial().parse(req.body);
      const plan = await storage.updatePlan(id, req.user.id, data);
      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }
      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update plan" });
      }
    }
  });
  app2.delete("/api/plans/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePlan(id, req.user.id);
      if (!deleted) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });
  app2.post("/api/plans/:templateId/create-from-template", authenticateToken, async (req, res) => {
    try {
      const { templateId } = req.params;
      const { name, plannedDate } = req.body;
      const plan = await storage.createPlanFromTemplate(templateId, req.user.id, { name, plannedDate });
      if (!plan) {
        res.status(404).json({ message: "Template not found" });
        return;
      }
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create plan from template" });
    }
  });
  app2.post("/api/plans/:planId/items", authenticateToken, async (req, res) => {
    try {
      const { planId } = req.params;
      const processedBody = {
        ...req.body,
        planId,
        quantity: req.body.quantity?.toString(),
        rate: req.body.rate?.toString()
      };
      const data = insertPlanItemSchema.parse(processedBody);
      const item = await storage.addPlanItem(data, req.user.id);
      if (!item) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add plan item" });
      }
    }
  });
  app2.put("/api/plans/:planId/items/:itemId", authenticateToken, async (req, res) => {
    try {
      const { planId, itemId } = req.params;
      const processedBody = {
        ...req.body,
        quantity: req.body.quantity?.toString(),
        rate: req.body.rate?.toString()
      };
      const data = insertPlanItemSchema.partial().parse(processedBody);
      const item = await storage.updatePlanItem(itemId, planId, req.user.id, data);
      if (!item) {
        res.status(404).json({ message: "Plan item not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update plan item" });
      }
    }
  });
  app2.delete("/api/plans/:planId/items/:itemId", authenticateToken, async (req, res) => {
    try {
      const { planId, itemId } = req.params;
      const deleted = await storage.deletePlanItem(itemId, planId, req.user.id);
      if (!deleted) {
        res.status(404).json({ message: "Plan item not found" });
        return;
      }
      res.json({ message: "Plan item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan item" });
    }
  });
  app2.get("/api/savings-accounts", authenticateToken, async (req, res) => {
    try {
      const accounts2 = await storage.getAllSavingsAccounts(req.user.id);
      res.json(accounts2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings accounts" });
    }
  });
  app2.post("/api/savings-accounts", authenticateToken, async (req, res) => {
    try {
      const data = insertSavingsAccountSchema.parse(req.body);
      const account = await storage.createSavingsAccount({ ...data, userId: req.user.id });
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create savings account" });
      }
    }
  });
  app2.put("/api/savings-accounts/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertSavingsAccountSchema.partial().parse(req.body);
      const account = await storage.updateSavingsAccount(id, req.user.id, data);
      if (!account) {
        res.status(404).json({ message: "Savings account not found" });
        return;
      }
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update savings account" });
      }
    }
  });
  app2.delete("/api/savings-accounts/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSavingsAccount(id, req.user.id);
      if (!deleted) {
        res.status(404).json({ message: "Savings account not found" });
        return;
      }
      res.json({ message: "Savings account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete savings account" });
    }
  });
  app2.get("/api/savings-transactions/:accountId", authenticateToken, async (req, res) => {
    try {
      const { accountId } = req.params;
      const transactions = await storage.getSavingsTransactions(accountId, req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings transactions" });
    }
  });
  app2.post("/api/savings-transactions", authenticateToken, async (req, res) => {
    try {
      const data = insertSavingsTransactionSchema.parse(req.body);
      const transaction = await storage.createSavingsTransaction({ ...data, userId: req.user.id });
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create savings transaction" });
      }
    }
  });
  app2.delete("/api/savings-transactions/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSavingsTransaction(id, req.user.id);
      if (!deleted) {
        res.status(404).json({ message: "Savings transaction not found" });
        return;
      }
      res.json({ message: "Savings transaction deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete savings transaction" });
    }
  });
  app2.get("/api/invoices", authenticateToken, async (req, res) => {
    try {
      const invoices2 = await storage.getAllInvoices(req.user.id);
      res.json(invoices2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  app2.post("/api/invoices", authenticateToken, async (req, res) => {
    try {
      const data = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice({ ...data, userId: req.user.id });
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create invoice" });
      }
    }
  });
  app2.delete("/api/invoices/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteInvoice(id, req.user.id);
      if (!success) {
        res.status(404).json({ message: "Invoice not found" });
        return;
      }
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });
  app2.get("/api/summary", authenticateToken, async (req, res) => {
    try {
      const [income2, expenses2, assets2] = await Promise.all([
        storage.getAllIncome(req.user.id),
        storage.getAllExpenses(req.user.id),
        storage.getAllAssets(req.user.id)
      ]);
      const totalIncome = income2.reduce((sum2, item) => sum2 + parseFloat(item.amount), 0);
      const totalExpenses = expenses2.reduce((sum2, item) => sum2 + parseFloat(item.amount), 0);
      const totalAssetValue = assets2.reduce((sum2, item) => sum2 + parseFloat(item.currentValue), 0);
      const netBalance = totalIncome - totalExpenses;
      const netWorth = netBalance + totalAssetValue;
      res.json({
        totalIncome,
        totalExpenses,
        netBalance,
        totalAssetValue,
        netWorth
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/bill-scheduler.ts
init_notifications();
var BillScheduler = class {
  intervalId = null;
  storage;
  constructor(storageInstance) {
    this.storage = storageInstance;
  }
  start() {
    this.intervalId = setInterval(() => {
      this.checkDueBills();
    }, 60 * 60 * 1e3);
    setTimeout(() => {
      this.checkDueBills();
    }, 5e3);
    log("Bill scheduler started - checking every hour");
  }
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log("Bill scheduler stopped");
    }
  }
  async checkDueBills() {
    try {
      log("Checking for due bills...");
      const allUsers = await this.storage.getAllUsers();
      for (const user of allUsers) {
        if (!user.emailNotifications && !user.smsNotifications) {
          continue;
        }
        const userBills = await this.storage.getAllBills(user.id);
        const today = /* @__PURE__ */ new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayStr = today.toISOString().split("T")[0];
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        for (const bill of userBills) {
          if (bill.status !== "pending") {
            continue;
          }
          const billDueDate = bill.dueDate;
          const isOverdue = billDueDate < todayStr;
          const isDueTomorrow = billDueDate === tomorrowStr;
          if (isOverdue || isDueTomorrow) {
            const notificationData = {
              user: {
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications
              },
              bill: {
                name: bill.name,
                amount: bill.amount,
                dueDate: bill.dueDate,
                category: bill.category
              },
              type: isOverdue ? "overdue" : "due_tomorrow"
            };
            try {
              const result = await sendBillNotification(notificationData);
              if (result.emailSent || result.smsSent) {
                log(`Notification sent for bill "${bill.name}" to user ${user.name}`);
                log(`  Email: ${result.emailSent ? "sent" : "skipped"}, SMS: ${result.smsSent ? "sent" : "skipped"}`);
              }
            } catch (error) {
              log(`Failed to send notification for bill "${bill.name}" to user ${user.name}:`, error);
            }
          }
        }
      }
    } catch (error) {
      log("Error checking due bills:", error);
    }
  }
  // Manual trigger for testing
  async triggerCheck() {
    await this.checkDueBills();
  }
};
var billScheduler = null;
function startBillScheduler(storageInstance) {
  if (billScheduler) {
    billScheduler.stop();
  }
  billScheduler = new BillScheduler(storageInstance);
  billScheduler.start();
  return billScheduler;
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const db = storage instanceof PostgresStorage ? storage : null;
  if (db) {
    app.set("db", db);
  }
  setupAuthRoutes(app, db);
  const server = await registerRoutes(app);
  if (db && db instanceof PostgresStorage) {
    startBillScheduler(db);
  }
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
