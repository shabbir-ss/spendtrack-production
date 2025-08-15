import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bill } from "@shared/schema";
import BillsTable from "@/components/tables/bills-table";
import { Bell, Calendar, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { formatIndianCurrency } from "@/lib/indian-financial-year";
import { api } from "@/lib/api";

export default function Bills() {
  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
    queryFn: () => api.get<Bill[]>("/bills"),
  });

  const upcomingBills = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return bill.status === "pending" && isAfter(dueDate, today) && isBefore(dueDate, nextWeek);
  });

  const overdueBills = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    return bill.status === "pending" && isBefore(dueDate, today);
  });

  const totalUpcoming = upcomingBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
  const totalOverdue = overdueBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bills & Reminders</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Upcoming Bills (7 days)
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatIndianCurrency(totalUpcoming)}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {upcomingBills.length} bills due
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                <Calendar className="text-orange-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overdue Bills
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatIndianCurrency(totalOverdue)}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {overdueBills.length} bills overdue
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Bills
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {bills.length}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Active reminders
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Bell className="text-blue-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center">
              <Bell className="mr-2" size={18} />
              Upcoming Bills (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingBills.slice(0, 3).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-sm text-gray-500">Due: {format(new Date(bill.dueDate), "MMM dd, yyyy")}</p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    ₹{parseFloat(bill.amount).toLocaleString()}
                  </Badge>
                </div>
              ))}
              {upcomingBills.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{upcomingBills.length - 3} more bills due soon
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Bills Alert */}
      {overdueBills.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center">
              <AlertTriangle className="mr-2" size={18} />
              Overdue Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-sm text-gray-500">Due: {format(new Date(bill.dueDate), "MMM dd, yyyy")}</p>
                  </div>
                  <Badge variant="destructive">
                    ₹{parseFloat(bill.amount).toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bills Table */}
      <BillsTable />
    </div>
  );
}