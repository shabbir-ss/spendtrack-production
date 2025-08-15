import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Bill } from "@shared/schema";

export interface Notification {
  id: string;
  type: "bill_due_tomorrow" | "bill_overdue";
  title: string;
  message: string;
  bill: Bill;
  createdAt: Date;
  isRead: boolean;
}

export function useNotifications() {
  const { data: bills = [], isLoading, error } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bills");
      return response.json();
    },
  });

  // Calculate notifications based on bills
  const notifications: Notification[] = [];
  
  // Early return if loading or error
  if (isLoading || error || !bills || !Array.isArray(bills)) {
    return {
      notifications: [],
      unreadCount: 0,
      hasNotifications: false,
      isLoading,
      error,
    };
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Format dates for comparison (YYYY-MM-DD)
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  bills.forEach((bill) => {
    if (bill.status === 'pending') {
      const billDueDate = new Date(bill.dueDate);
      const billDueDateStr = billDueDate.toISOString().split('T')[0];

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
  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    hasNotifications: notifications.length > 0,
    isLoading: false,
    error: null,
  };
}