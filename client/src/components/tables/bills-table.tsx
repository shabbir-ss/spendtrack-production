import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bill } from "@shared/schema";
import { BILL_CATEGORIES } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Search, Check, Clock, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";

export default function BillsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  const deleteBillMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/bills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Success",
        description: "Bill reminder deleted successfully!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete bill reminder.",
      });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/bills/${id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Success",
        description: "Bill marked as paid!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark bill as paid.",
      });
    },
  });

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || bill.category === categoryFilter;
    const matchesStatus = !statusFilter || statusFilter === "all" || bill.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryLabel = (category: string) => {
    return BILL_CATEGORIES.find((cat) => cat.value === category)?.label || category;
  };

  const getStatusBadge = (bill: Bill) => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();

    if (bill.status === "paid") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <Check size={12} className="mr-1" />
          Paid
        </Badge>
      );
    } else if (isBefore(dueDate, today)) {
      return (
        <Badge variant="destructive">
          <AlertTriangle size={12} className="mr-1" />
          Overdue
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-orange-300 text-orange-600">
          <Clock size={12} className="mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const handleEdit = (bill: Bill) => {
    // TODO: Implement edit functionality
    toast({
      title: "Edit Feature",
      description: "Edit functionality will be available soon!",
    });
  };

  const handleDelete = (bill: Bill) => {
    if (window.confirm("Are you sure you want to delete this bill reminder?")) {
      deleteBillMutation.mutate(bill.id);
    }
  };

  const handleMarkPaid = (bill: Bill) => {
    markPaidMutation.mutate(bill.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {/* Table skeleton */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BILL_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bills Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No bills found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Add a bill reminder to get started
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{bill.name}</p>
                      {bill.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {bill.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      {getCategoryLabel(bill.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{parseFloat(bill.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(bill.dueDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {bill.recurringType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(bill)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {bill.status === "pending" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkPaid(bill)}
                          disabled={markPaidMutation.isPending}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check size={14} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(bill)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(bill)}
                        disabled={deleteBillMutation.isPending}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}