import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIncomeSchema, type InsertIncome } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { INCOME_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt } from "lucide-react";

interface Props {
  id: string;
  initial: { 
    amount: string | number; 
    description: string; 
    category: string; 
    date: string;
    invoiceNumber?: string | null;
    invoiceDate?: string | null;
    invoiceAmount?: string | number | null;
  };
  children: React.ReactNode;
}

export default function EditIncomeModal({ id, initial, children }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertIncome & { invoiceNumber?: string | null; invoiceDate?: string | null; invoiceAmount?: string | null }>({
    resolver: zodResolver(insertIncomeSchema),
    defaultValues: {
      amount: String(initial.amount ?? ""),
      description: initial.description ?? "",
      category: initial.category ?? "",
      date: initial.date ?? new Date().toISOString().split("T")[0],
      invoiceNumber: initial.invoiceNumber ?? "",
      invoiceDate: initial.invoiceDate ?? "",
      invoiceAmount: initial.invoiceAmount ? String(initial.invoiceAmount) : "",
    } as any,
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: String(initial.amount ?? ""),
        description: initial.description ?? "",
        category: initial.category ?? "",
        date: initial.date ?? new Date().toISOString().split("T")[0],
        invoiceNumber: initial.invoiceNumber ?? "",
        invoiceDate: initial.invoiceDate ?? "",
        invoiceAmount: initial.invoiceAmount ? String(initial.invoiceAmount) : "",
      } as any);
    }
  }, [open, initial]);

  const mutate = useMutation({
    mutationFn: (data: InsertIncome & { invoiceNumber?: string | null; invoiceDate?: string | null; invoiceAmount?: string | null }) => api.put(`/income/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({ title: "Updated", description: "Income updated" });
      setOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to update income';
      toast({ variant: "destructive", title: "Error", description: msg });
    }
  });

  const onSubmit = (data: InsertIncome & { invoiceNumber?: string | null; invoiceDate?: string | null; invoiceAmount?: string | null }) => mutate.mutate(data);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Income</DialogTitle>
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
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                      <Input type="number" step="0.01" placeholder="0.00" className="pl-8" {...field} />
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
                    <Textarea placeholder="Enter description" className="resize-none" {...field} />
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
                        <SelectValue placeholder="Select income category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INCOME_CATEGORIES.map((category) => (
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

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-income hover:bg-income/90" disabled={mutate.isPending}>
                {mutate.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}