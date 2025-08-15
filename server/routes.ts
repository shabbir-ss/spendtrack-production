import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncomeSchema, insertExpenseSchema, insertAssetSchema, insertBillSchema, insertAccountSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken, type AuthRequest } from "./auth";
import { upload, deleteUploadedFile, getFileInfo } from "./file-upload";
import path from "path";
import fs from "fs";

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

  const httpServer = createServer(app);
  return httpServer;
}