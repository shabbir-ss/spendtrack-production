import { storage } from "./storage";
import { sendBillNotification } from "./notifications";
import { log } from "./vite";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { PostgresStorage } from "./pg-storage";

interface UserWithBills {
  id: string;
  name: string;
  email: string;
  mobile: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export class BillScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private storage: PostgresStorage;

  constructor(storageInstance: PostgresStorage) {
    this.storage = storageInstance;
  }

  start() {
    // Check for due bills every hour
    this.intervalId = setInterval(() => {
      this.checkDueBills();
    }, 60 * 60 * 1000); // 1 hour

    // Also run immediately on startup
    setTimeout(() => {
      this.checkDueBills();
    }, 5000); // Wait 5 seconds after startup

    log("Bill scheduler started - checking every hour");
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log("Bill scheduler stopped");
    }
  }

  private async checkDueBills() {
    try {
      log("Checking for due bills...");

      // Get all users with notification preferences
      const allUsers = await this.storage.getAllUsers();

      for (const user of allUsers) {
        if (!user.emailNotifications && !user.smsNotifications) {
          continue; // Skip users who don't want notifications
        }

        // Get user's bills
        const userBills = await this.storage.getAllBills(user.id);
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Format dates for comparison (YYYY-MM-DD)
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        for (const bill of userBills) {
          if (bill.status !== 'pending') {
            continue; // Skip paid bills
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
                smsNotifications: user.smsNotifications,
              },
              bill: {
                name: bill.name,
                amount: bill.amount,
                dueDate: bill.dueDate,
                category: bill.category,
              },
              type: isOverdue ? "overdue" as const : "due_tomorrow" as const,
            };

            try {
              const result = await sendBillNotification(notificationData);
              
              if (result.emailSent || result.smsSent) {
                log(`Notification sent for bill "${bill.name}" to user ${user.name}`);
                log(`  Email: ${result.emailSent ? 'sent' : 'skipped'}, SMS: ${result.smsSent ? 'sent' : 'skipped'}`);
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
}

let billScheduler: BillScheduler | null = null;

export function startBillScheduler(storageInstance: PostgresStorage) {
  if (billScheduler) {
    billScheduler.stop();
  }
  
  billScheduler = new BillScheduler(storageInstance);
  billScheduler.start();
  return billScheduler;
}

export function stopBillScheduler() {
  if (billScheduler) {
    billScheduler.stop();
    billScheduler = null;
  }
}

export function getBillScheduler() {
  return billScheduler;
}