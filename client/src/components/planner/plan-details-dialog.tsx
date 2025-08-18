import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Calendar,
  ShoppingCart,
  Package,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import type { Plan, PlanItem } from "@shared/schema";

const itemFormSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  rate: z.string().min(1, "Rate is required"),
  notes: z.string().optional(),
});

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface PlanDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
}

export default function PlanDetailsDialog({
  open,
  onOpenChange,
  plan,
}: PlanDetailsDialogProps) {
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch plan details with items
  const { data: planDetails, isLoading } = useQuery({
    queryKey: ["plan", plan.id],
    queryFn: async () => {
      return await apiRequest("GET", `/plans/${plan.id}`);
    },
    enabled: open,
  });

  const itemForm = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      quantity: "",
      unit: "",
      rate: "",
      notes: "",
    },
  });

  // Reset form when editing item changes
  useEffect(() => {
    if (editingItem) {
      itemForm.reset({
        name: editingItem.name,
        quantity: editingItem.quantity.toString(),
        unit: editingItem.unit,
        rate: editingItem.rate.toString(),
        notes: editingItem.notes || "",
      });
    } else {
      itemForm.reset({
        name: "",
        quantity: "",
        unit: "",
        rate: "",
        notes: "",
      });
    }
  }, [editingItem, itemForm]);

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof itemFormSchema>) => {
      return await apiRequest("POST", `/plans/${plan.id}/items`, {
        ...data,
        quantity: parseFloat(data.quantity),
        rate: parseFloat(data.rate),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Item added successfully" });
      queryClient.invalidateQueries({ queryKey: ["plan", plan.id] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      setShowAddItem(false);
      itemForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof itemFormSchema>) => {
      if (!editingItem) throw new Error("No item selected for editing");
      
      return await apiRequest("PUT", `/plans/${plan.id}/items/${editingItem.id}`, {
        ...data,
        quantity: parseFloat(data.quantity),
        rate: parseFloat(data.rate),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Item updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["plan", plan.id] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      setEditingItem(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/plans/${plan.id}/items/${itemId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Item deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["plan", plan.id] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  // Update plan status mutation
  const updatePlanMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest("PUT", `/plans/${plan.id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Plan updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["plan", plan.id] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive",
      });
    },
  });

  const onSubmitItem = (data: z.infer<typeof itemFormSchema>) => {
    if (editingItem) {
      updateItemMutation.mutate(data);
    } else {
      addItemMutation.mutate(data);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId);
  };

  const categoryIcons = {
    grocery: ShoppingCart,
    shopping: Package,
    travel: MapPin,
    other: Calendar,
  };

  const IconComponent = categoryIcons[plan.category as keyof typeof categoryIcons] || Calendar;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-gray-500" />
              <DialogTitle>{planDetails?.name}</DialogTitle>
            </div>
            <Select
              value={planDetails?.status}
              onValueChange={(value) => updatePlanMutation.mutate(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {planDetails?.description && (
            <DialogDescription>{planDetails.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(parseFloat(planDetails?.totalAmount || "0"))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="text-2xl font-bold">{planDetails?.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-lg font-medium capitalize">{planDetails?.category}</p>
                </div>
                {planDetails?.plannedDate && (
                  <div>
                    <p className="text-sm text-gray-500">Planned Date</p>
                    <p className="text-lg font-medium">
                      {new Date(planDetails.plannedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Items</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddItem(true)}
                  disabled={showAddItem || editingItem !== null}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Item Form */}
              {showAddItem && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <Form {...itemForm}>
                      <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <FormField
                            control={itemForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Sugar" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={itemForm.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={itemForm.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                  <Input placeholder="kg, pieces, liters" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={itemForm.control}
                            name="rate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rate (per unit)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={itemForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any additional notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddItem(false)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addItemMutation.isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            {addItemMutation.isPending ? "Adding..." : "Add Item"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* Items List */}
              {planDetails?.items?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No items added yet. Click "Add Item" to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {planDetails?.items?.map((item: PlanItem) => (
                    <div key={item.id}>
                      {editingItem?.id === item.id ? (
                        <Card className="border-blue-200">
                          <CardContent className="pt-6">
                            <Form {...itemForm}>
                              <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <FormField
                                    control={itemForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Item Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={itemForm.control}
                                    name="quantity"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                          <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={itemForm.control}
                                    name="unit"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={itemForm.control}
                                    name="rate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Rate</FormLabel>
                                        <FormControl>
                                          <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={itemForm.control}
                                  name="notes"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Notes</FormLabel>
                                      <FormControl>
                                        <Textarea {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingItem(null)}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={updateItemMutation.isPending}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {updateItemMutation.isPending ? "Saving..." : "Save"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {formatCurrency(parseFloat(item.totalAmount))}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} {item.unit} × {formatCurrency(parseFloat(item.rate))}
                                </p>
                              </div>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(item)}
                              disabled={editingItem !== null || showAddItem}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={editingItem !== null || showAddItem}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}