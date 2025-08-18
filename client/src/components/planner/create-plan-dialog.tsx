import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShoppingCart, Package, MapPin, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import type { Plan } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  plannedDate: z.string().optional(),
  isTemplate: z.boolean().default(false),
  templateName: z.string().optional(),
});

const categories = [
  { value: "grocery", label: "Grocery", icon: ShoppingCart },
  { value: "shopping", label: "Shopping", icon: Package },
  { value: "travel", label: "Travel", icon: MapPin },
  { value: "other", label: "Other", icon: Calendar },
];

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Plan[];
  onCreateFromTemplate: (templateId: string, name: string, plannedDate?: string) => void;
}

export default function CreatePlanDialog({
  open,
  onOpenChange,
  templates,
  onCreateFromTemplate,
}: CreatePlanDialogProps) {
  const [activeTab, setActiveTab] = useState("new");
  const [selectedTemplate, setSelectedTemplate] = useState<Plan | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", plannedDate: "" });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      plannedDate: "",
      isTemplate: false,
      templateName: "",
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/plans", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createPlanMutation.mutate(data);
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;
    
    onCreateFromTemplate(
      selectedTemplate.id,
      templateForm.name || `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
      templateForm.plannedDate || undefined
    );
    
    setSelectedTemplate(null);
    setTemplateForm({ name: "", plannedDate: "" });
    onOpenChange(false);
  };

  const categoryIcons = {
    grocery: ShoppingCart,
    shopping: Package,
    travel: MapPin,
    other: Calendar,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
          <DialogDescription>
            Create a new plan from scratch or use an existing template
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Plan</TabsTrigger>
            <TabsTrigger value="template">From Template</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Weekly Grocery Shopping" {...field} />
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of your plan..."
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
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{category.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plannedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isTemplate"
                    {...form.register("isTemplate")}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isTemplate" className="text-sm font-medium">
                    Save as template for future use
                  </label>
                </div>

                {form.watch("isTemplate") && (
                  <FormField
                    control={form.control}
                    name="templateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Weekly Grocery Template" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPlanMutation.isPending}>
                    {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    No templates available. Create a plan and save it as a template first.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {templates.map((template) => {
                    const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons] || Calendar;
                    const isSelected = selectedTemplate?.id === template.id;
                    
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4 text-gray-500" />
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(parseFloat(template.totalAmount))}
                            </Badge>
                          </div>
                          {template.description && (
                            <CardDescription className="text-xs">
                              {template.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>

                {selectedTemplate && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Customize Plan</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Plan Name</label>
                        <Input
                          placeholder={`${selectedTemplate.name} - ${new Date().toLocaleDateString()}`}
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Planned Date (Optional)</label>
                        <Input
                          type="date"
                          value={templateForm.plannedDate}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, plannedDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFromTemplate}
                    disabled={!selectedTemplate}
                  >
                    Create from Template
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}