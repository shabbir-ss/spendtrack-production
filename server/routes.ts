import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncomeSchema, insertExpenseSchema, insertAssetSchema, insertBillSchema, insertAccountSchema, insertPlanSchema, insertPlanItemSchema, insertSavingsAccountSchema, insertSavingsTransactionSchema, insertInvoiceSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken, type AuthRequest } from "./auth";
import { upload, deleteUploadedFile, getFileInfo } from "./file-upload";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

export async function registerRoutes(app: Express): Promise<Server> {
  // Income routes (protected)
  app.get("/api/income", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const income = await storage.getAllIncome(req.user!.id);
      res.json(income);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch income" });
    }
  });

  app.post("/api/income", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertIncomeSchema.parse(req.body);
      const income = await storage.createIncome({ ...data, userId: req.user!.id });
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create income" });
      }
    }
  });

  app.put("/api/income/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const data = insertIncomeSchema.partial().parse(req.body);
      const income = await storage.updateIncome(id, req.user!.id, data);
      if (!income) {
        res.status(404).json({ message: "Income not found" });
        return;
      }
      res.json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update income" });
      }
    }
  });

  app.delete("/api/income/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteIncome(id, req.user!.id);
      if (!success) {
        res.status(404).json({ message: "Income not found" });
        return;
      }
      res.json({ message: "Income deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Expense routes (protected)
  app.get("/api/expenses", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const expenses = await storage.getAllExpenses(req.user!.id);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({ ...data, userId: req.user!.id });
      
      // If expense is paid from an account, deduct the amount
      if (data.accountId) {
        const db = req.app.get('db');
        if (db && 'updateAccountBalance' in db) {
          await (db as any).updateAccountBalance(req.user!.id, data.accountId, -parseFloat(data.amount));
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

  app.put("/api/expenses/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const data = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, req.user!.id, data);
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

  app.delete("/api/expenses/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteExpense(id, req.user!.id);
      if (!success) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Asset routes (protected)
  app.get("/api/assets", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const assets = await storage.getAllAssets(req.user!.id);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset({ ...data, userId: req.user!.id });
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create asset" });
      }
    }
  });

  app.put("/api/assets/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const data = insertAssetSchema.partial().parse(req.body);
      const asset = await storage.updateAsset(id, req.user!.id, data);
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

  app.delete("/api/assets/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAsset(id, req.user!.id);
      if (!success) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }
      res.json({ message: "Asset deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Bill routes (protected)
  app.get("/api/bills", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const bills = await storage.getAllBills(req.user!.id);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertBillSchema.parse(req.body);
      const bill = await storage.createBill({ ...data, userId: req.user!.id });
      res.status(201).json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bill" });
      }
    }
  });

  app.put("/api/bills/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const data = insertBillSchema.partial().parse(req.body);
      const bill = await storage.updateBill(id, req.user!.id, data);
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

  app.delete("/api/bills/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBill(id, req.user!.id);
      if (!success) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.json({ message: "Bill deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });

  app.patch("/api/bills/:id/pay", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.markBillAsPaid(id, req.user!.id);
      if (!bill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark bill as paid" });
    }
  });

  // Accounts CRUD (protected)
  app.get("/api/accounts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = req.app.get('db');
      if (!db || !('getAccounts' in db)) return res.json([]);
      const accounts = await (db as any).getAccounts(req.user!.id);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertAccountSchema.parse(req.body);
      const db = req.app.get('db');
      if (!db || !('createAccount' in db)) return res.status(501).json({ message: 'Accounts not supported' });
      const account = await (db as any).createAccount(req.user!.id, data);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  });

  app.put("/api/accounts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const db = req.app.get('db');
      if (!db || !('updateAccount' in db)) return res.status(501).json({ message: 'Accounts not supported' });
      const account = await (db as any).updateAccount(req.user!.id, id, req.body);
      if (!account) return res.status(404).json({ message: 'Account not found' });
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const db = req.app.get('db');
      if (!db || !('deleteAccount' in db)) return res.status(501).json({ message: 'Accounts not supported' });
      const ok = await (db as any).deleteAccount(req.user!.id, id);
      if (!ok) return res.status(404).json({ message: 'Account not found' });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Summary route (protected)
  app.get("/api/summary", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const summary = await storage.getSummary(req.user!.id);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  // Transfer endpoint (protected)
  app.post("/api/accounts/transfer", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { fromId, toId, amount } = req.body || {};
      if (!fromId || !toId || typeof amount !== 'number') {
        return res.status(400).json({ message: "fromId, toId, and numeric amount are required" });
      }
      const db = req.app.get('db');
      if (!db || !('transfer' in db)) return res.status(501).json({ message: 'Accounts not supported' });
      const result = await (db as any).transfer(req.user!.id, fromId, toId, amount);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to transfer" });
    }
  });

  // Test notification route (protected)
  app.post("/api/test-notification", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { testNotifications } = await import("./notifications");
      const result = await testNotifications(req.user!.email);
      
      if (result) {
        res.json({ message: "Test notification sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test notification" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // File upload routes (protected)
  app.post("/api/upload/invoice", authenticateToken, upload.single('invoice'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileInfo = getFileInfo(req.file, req.body.transactionId || 'temp');
      
      res.json({
        message: "File uploaded successfully",
        file: {
          originalName: fileInfo.fileName,
          filename: path.basename(fileInfo.filePath),
          path: fileInfo.relativePath,
          mimetype: fileInfo.fileType,
          size: fileInfo.fileSize
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to upload file" });
    }
  });

  // Serve uploaded files (protected)
  app.get("/api/files/:transactionId/:filename", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { transactionId, filename } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', transactionId, filename);
      
      // Verify file exists and user has access to this transaction
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // TODO: Add authorization check to ensure user owns this transaction
      
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // View invoice file (protected) - supports both header and query token
  app.get("/api/files/:transactionId/:filename", async (req: AuthRequest, res) => {
    try {
      // Check for token in query parameter or header
      const token = req.query.token as string || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Verify token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = decoded;
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { transactionId, filename } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', transactionId, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // TODO: Add authorization check to ensure user owns this transaction
      
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Download invoice file (protected)
  app.get("/api/download/:transactionId/:filename", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { transactionId, filename } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', transactionId, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // TODO: Add authorization check to ensure user owns this transaction
      
      res.download(filePath);
    } catch (error) {
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Get all invoices for a user (protected)
  app.get("/api/invoices", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const invoices = await storage.getAllInvoices(req.user!.id);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Delete invoice file (protected)
  app.delete("/api/files/:transactionId/:filename", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { transactionId, filename } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', transactionId, filename);
      
      // TODO: Add authorization check to ensure user owns this transaction
      
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

  // Planner routes (protected)
  
  // Get all plans for a user
  app.get("/api/plans", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { category, status, isTemplate } = req.query;
      const plans = await storage.getAllPlans(req.user!.id, {
        category: category as string,
        status: status as string,
        isTemplate: isTemplate === 'true'
      });
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  // Get a specific plan with items
  app.get("/api/plans/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.getPlanWithItems(id, req.user!.id);
      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  // Create a new plan
  app.post("/api/plans", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan({ ...data, userId: req.user!.id });
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create plan" });
      }
    }
  });

  // Update a plan
  app.put("/api/plans/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const data = insertPlanSchema.partial().parse(req.body);
      const plan = await storage.updatePlan(id, req.user!.id, data);
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

  // Delete a plan
  app.delete("/api/plans/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePlan(id, req.user!.id);
      if (!deleted) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Create plan from template
  app.post("/api/plans/:templateId/create-from-template", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { templateId } = req.params;
      const { name, plannedDate } = req.body;
      const plan = await storage.createPlanFromTemplate(templateId, req.user!.id, { name, plannedDate });
      if (!plan) {
        res.status(404).json({ message: "Template not found" });
        return;
      }
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create plan from template" });
    }
  });

  // Plan Items routes
  
  // Add item to plan
  app.post("/api/plans/:planId/items", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { planId } = req.params;
      
      // Convert numbers to strings for decimal fields
      const processedBody = {
        ...req.body,
        planId,
        quantity: req.body.quantity?.toString(),
        rate: req.body.rate?.toString(),
      };
      
      const data = insertPlanItemSchema.parse(processedBody);
      const item = await storage.addPlanItem(data, req.user!.id);
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

  // Update plan item
  app.put("/api/plans/:planId/items/:itemId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { planId, itemId } = req.params;
      
      // Convert numbers to strings for decimal fields
      const processedBody = {
        ...req.body,
        quantity: req.body.quantity?.toString(),
        rate: req.body.rate?.toString(),
      };
      
      const data = insertPlanItemSchema.partial().parse(processedBody);
      const item = await storage.updatePlanItem(itemId, planId, req.user!.id, data);
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

  // Delete plan item
  app.delete("/api/plans/:planId/items/:itemId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { planId, itemId } = req.params;
      const deleted = await storage.deletePlanItem(itemId, planId, req.user!.id);
      if (!deleted) {
        res.status(404).json({ message: "Plan item not found" });
        return;
      }
      res.json({ message: "Plan item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan item" });
    }
  });

  // Savings accounts routes
  app.get("/api/savings-accounts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const accounts = await storage.getAllSavingsAccounts(req.user!.id);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings accounts" });
    }
  });

  app.post("/api/savings-accounts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertSavingsAccountSchema.parse(req.body);
      const account = await storage.createSavingsAccount({ ...data, userId: req.user!.id });
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create savings account" });
      }
    }
  });

  app.put("/api/savings-accounts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const data = insertSavingsAccountSchema.partial().parse(req.body);
      const account = await storage.updateSavingsAccount(id, req.user!.id, data);
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

  app.delete("/api/savings-accounts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSavingsAccount(id, req.user!.id);
      if (!deleted) {
        res.status(404).json({ message: "Savings account not found" });
        return;
      }
      res.json({ message: "Savings account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete savings account" });
    }
  });

  // Savings transactions routes
  app.get("/api/savings-transactions/:accountId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { accountId } = req.params;
      const transactions = await storage.getSavingsTransactions(accountId, req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings transactions" });
    }
  });

  app.post("/api/savings-transactions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertSavingsTransactionSchema.parse(req.body);
      const transaction = await storage.createSavingsTransaction({ ...data, userId: req.user!.id });
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create savings transaction" });
      }
    }
  });

  app.delete("/api/savings-transactions/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSavingsTransaction(id, req.user!.id);
      if (!deleted) {
        res.status(404).json({ message: "Savings transaction not found" });
        return;
      }
      res.json({ message: "Savings transaction deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete savings transaction" });
    }
  });

  // Invoice routes (protected)
  app.get("/api/invoices", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const invoices = await storage.getAllInvoices(req.user!.id);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice({ ...data, userId: req.user!.id });
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create invoice" });
      }
    }
  });

  app.delete("/api/invoices/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteInvoice(id, req.user!.id);
      if (!success) {
        res.status(404).json({ message: "Invoice not found" });
        return;
      }
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Summary endpoint for dashboard
  app.get("/api/summary", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const [income, expenses, assets] = await Promise.all([
        storage.getAllIncome(req.user!.id),
        storage.getAllExpenses(req.user!.id),
        storage.getAllAssets(req.user!.id)
      ]);

      const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const totalAssetValue = assets.reduce((sum, item) => sum + parseFloat(item.currentValue), 0);
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

  const httpServer = createServer(app);
  return httpServer;
}