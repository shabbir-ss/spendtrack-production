import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncomeSchema, insertExpenseSchema, insertAssetSchema, insertBillSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken, type AuthRequest } from "./auth";

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

  app.delete("/api/income/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteIncome(id);
      if (!deleted) {
        res.status(404).json({ message: "Income not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (_req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(data);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, data);
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

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Asset routes
  app.get("/api/assets", async (_req, res) => {
    try {
      const assets = await storage.getAllAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const data = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(data);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create asset" });
      }
    }
  });

  app.put("/api/assets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertAssetSchema.partial().parse(req.body);
      const asset = await storage.updateAsset(id, data);
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

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAsset(id);
      if (!deleted) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Bills routes
  app.get("/api/bills", async (_req, res) => {
    try {
      const bills = await storage.getAllBills();
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills", async (req, res) => {
    try {
      console.log("Received bill data:", req.body);
      const data = insertBillSchema.parse(req.body);
      console.log("Parsed bill data:", data);
      const bill = await storage.createBill(data);
      console.log("Created bill:", bill);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Bill creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bill", error: error.message });
      }
    }
  });

  app.put("/api/bills/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertBillSchema.partial().parse(req.body);
      const bill = await storage.updateBill(id, data);
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

  app.patch("/api/bills/:id/pay", async (req, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.markBillAsPaid(id);
      if (!bill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark bill as paid" });
    }
  });

  app.delete("/api/bills/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBill(id);
      if (!deleted) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });

  // Notifications route
  app.get("/api/notifications", async (_req, res) => {
    try {
      const bills = await storage.getAllBills();
      const notifications = [];
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      bills.forEach((bill) => {
        if (bill.status === 'pending') {
          const billDueDateStr = bill.dueDate;

          // Bill due tomorrow
          if (billDueDateStr === tomorrowStr) {
            notifications.push({
              id: `bill_due_${bill.id}`,
              type: "bill_due_tomorrow",
              title: "Bill Due Tomorrow",
              message: `${bill.name} (₹${bill.amount}) is due tomorrow`,
              bill,
              createdAt: new Date(),
              isRead: false,
            });
          }

          // Overdue bills
          if (billDueDateStr < todayStr) {
            notifications.push({
              id: `bill_overdue_${bill.id}`,
              type: "bill_overdue",
              title: "Overdue Bill",
              message: `${bill.name} (₹${bill.amount}) is overdue`,
              bill,
              createdAt: new Date(),
              isRead: false,
            });
          }
        }
      });

      // Sort by creation date (newest first)
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({
        notifications,
        unreadCount: notifications.length,
        hasNotifications: notifications.length > 0,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Summary stats route
  app.get("/api/summary", async (_req, res) => {
    try {
      const [income, expenses, assets] = await Promise.all([
        storage.getAllIncome(),
        storage.getAllExpenses(),
        storage.getAllAssets(),
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
        netWorth,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
