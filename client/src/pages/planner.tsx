import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, ShoppingCart, Package, MapPin, Filter, FileText, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import CreatePlanDialog from "@/components/planner/create-plan-dialog";
import PlanDetailsDialog from "@/components/planner/plan-details-dialog";
import FilterDialog from "@/components/planner/filter-dialog";
import type { Plan } from "@shared/schema";

const categoryIcons = {
  grocery: ShoppingCart,
  shopping: Package,
  travel: MapPin,
  other: Calendar,
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Planner() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState("plans");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => apiRequest("DELETE", `/api/plans/${planId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast({
        title: "Success",
        description: "Plan deleted successfully!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete plan. Please try again.",
      });
    },
  });

  // Fetch plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      if (activeTab === "templates") params.append("isTemplate", "true");
      else params.append("isTemplate", "false");

      return await apiRequest("GET", `/plans?${params}`);
    },
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      return await apiRequest("GET", "/plans?isTemplate=true");
    },
  });

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setDetailsDialogOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCreateDialogOpen(true);
  };

  const handleDeletePlan = (plan: Plan) => {
    if (window.confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
      deletePlanMutation.mutate(plan.id);
    }
  };

  const handleCreateFromTemplate = async (templateId: string, name: string, plannedDate?: string) => {
    try {
      await apiRequest("POST", `/plans/${templateId}/create-from-template`, { name, plannedDate });

      toast({
        title: "Success",
        description: "Plan created from template successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["plans"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plan from template",
        variant: "destructive",
      });
    }
  };

  const PlanCard = ({ plan }: { plan: Plan }) => {
    const IconComponent = categoryIcons[plan.category as keyof typeof categoryIcons] || Calendar;
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handlePlanClick(plan)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <CardTitle className="text-lg">{plan.name}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={statusColors[plan.status as keyof typeof statusColors]}>
                {plan.status}
              </Badge>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPlan(plan);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlan(plan);
                  }}
                  disabled={deletePlanMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {plan.description && (
            <CardDescription className="text-sm">{plan.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Amount:</span>
              <span className="font-semibold text-lg">
                {formatCurrency(parseFloat(plan.totalAmount))}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Category:</span>
              <span className="capitalize text-gray-900 dark:text-gray-100">{plan.category}</span>
            </div>
            {plan.plannedDate && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Planned Date:</span>
                <span className="text-gray-900 dark:text-gray-100">{new Date(plan.plannedDate).toLocaleDateString()}</span>
              </div>
            )}
            {plan.isTemplate && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Template:</span>
                <Badge variant="outline" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {plan.templateName || "Template"}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planner</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan and estimate costs for your upcoming purchases
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterDialogOpen(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No plans yet
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Create your first plan to start organizing your purchases
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan: Plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No templates yet
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Save frequently used plans as templates for quick reuse
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template: Plan) => (
                <PlanCard key={template.id} plan={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreatePlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        templates={templates}
        onCreateFromTemplate={handleCreateFromTemplate}
      />

      {selectedPlan && (
        <PlanDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          plan={selectedPlan}
        />
      )}

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}