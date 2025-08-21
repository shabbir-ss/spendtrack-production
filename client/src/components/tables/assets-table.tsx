import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Asset } from "@shared/schema";
import { ASSET_CATEGORIES } from "@/lib/constants";
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
import { Edit, Trash2, Search, Eye } from "lucide-react";
import { format } from "date-fns";
import EditAssetModal from "@/components/modals/edit-asset-modal";

export default function AssetsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({
        title: "Success",
        description: "Asset deleted successfully!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete asset.",
      });
    },
  });

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    return ASSET_CATEGORIES.find((cat) => cat.value === category)?.label || category;
  };

  const calculateDepreciation = (purchasePrice: number, currentValue: number) => {
    const depreciation = ((purchasePrice - currentValue) / purchasePrice) * 100;
    return Math.max(0, depreciation);
  };

  const handleEdit = (asset: Asset) => {
    // Edit functionality is now handled by the EditAssetModal
  };

  const handleDelete = (asset: Asset) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      deleteAssetMutation.mutate(asset.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
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
            placeholder="Search assets..."
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
            {ASSET_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead className="text-right">Purchase Price</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
              <TableHead className="text-right">Depreciation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No assets found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {searchTerm || categoryFilter
                      ? "Try adjusting your filters"
                      : "Start by adding some assets to track"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => {
                const purchasePrice = parseFloat(asset.purchasePrice);
                const currentValue = parseFloat(asset.currentValue);
                const depreciation = calculateDepreciation(purchasePrice, currentValue);

                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {asset.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="asset-color border-asset/20">
                        {getCategoryLabel(asset.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(asset.purchaseDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{purchasePrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold asset-color">
                        ₹{currentValue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="depreciation-color font-medium">
                        -{depreciation.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditAssetModal
                          id={asset.id}
                          initial={{
                            name: asset.name,
                            category: asset.category,
                            purchasePrice: asset.purchasePrice,
                            currentValue: asset.currentValue,
                            purchaseDate: asset.purchaseDate,
                            description: asset.description,
                          }}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit size={14} />
                          </Button>
                        </EditAssetModal>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(asset)}
                          disabled={deleteAssetMutation.isPending}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
