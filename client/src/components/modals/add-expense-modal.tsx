import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Receipt } from "lucide-react";

interface AddExpenseModalProps {
  children?: React.ReactNode;
}

export default function AddExpenseModal({ children }: AddExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // fetch accounts for selector
  const [accounts, setAccounts] = useState<{ id: string; name: string; type: string }[]>([]);

  useEffect(() => {
    api.get<{ id: string; name: string; type: string }[]>("/accounts").then(setAccounts).catch(() => setAccounts([]));
  }, []);

  const createExpenseMutation = useMutation({
    mutationFn: (data: InsertExpense & { accountId?: string; invoiceFileName?: string; invoiceFilePath?: string; invoiceFileType?: string; invoiceFileSize?: number }) => api.post("/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "Success",
        description: "Expense entry added successfully!",
      });
      setOpen(false);
      form.reset();
      setUploadedFile(null);
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to add expense entry. Please try again.';
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
    },
  });

  const onSubmit = (data: InsertExpense) => {
    const submitData = {
      ...data,
      ...(uploadedFile && {
        invoiceFileName: uploadedFile.fileName,
        invoiceFilePath: uploadedFile.filePath,
        invoiceFileType: uploadedFile.fileType,
        invoiceFileSize: uploadedFile.fileSize,
      })
    };
    createExpenseMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-expense hover:bg-expense/90 text-white">
            <Plus size={16} className="mr-2" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        ₹
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice/Receipt Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Receipt size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Invoice/Receipt Details (Optional)
                </span>
              </div>
              <Separator />
              
              <FormField
                control={form.control}
                name={"invoiceNumber" as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice/Receipt Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., INV-001, RCP-123"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={"invoiceDate" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"invoiceAmount" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            ₹
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Account selector (optional) */}
            <FormField
              control={form.control}
              name={"accountId" as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid From Account (optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value as any}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Receipt size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload Invoice/Receipt (Optional)
                </span>
              </div>
              <Separator />
              
              <FileUpload
                onFileUploaded={setUploadedFile}
                transactionId="temp"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-expense hover:bg-expense/90"
                disabled={createExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
