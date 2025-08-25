import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Briefcase, TrendingUp, TrendingDown, Diamond } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import AddAssetModal from "@/components/modals/add-asset-modal";
import { Asset as AssetType } from "@shared/schema";
import { format } from "date-fns";

const ASSET_CATEGORIES = [
  { value: "real-estate", label: "Real Estate" },
  { value: "vehicle", label: "Vehicle" },
  { value: "electronics", label: "Electronics" },
  { value: "jewelry", label: "Jewelry" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: assets = [], isLoading } = useQuery<AssetType[]>({
    queryKey: ["assets"],
    queryFn: () => apiRequest("GET", "/assets"),
  });

  // Filter assets based on search and filters
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const totalAssetValue = filteredAssets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
  const totalPurchasePrice = filteredAssets.reduce((sum, asset) => sum + parseFloat(asset.purchasePrice), 0);
  const totalDepreciation = totalPurchasePrice - totalAssetValue;
  const depreciationPercentage = totalPurchasePrice > 0 ? (totalDepreciation / totalPurchasePrice) * 100 : 0;

  return (
    <div className="h-full flex flex-col space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Assets</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Manage your asset portfolio and track depreciation</p>
          </div>
          <AddAssetModal>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus size={16} className="mr-2" />
              Add Asset
            </Button>
          </AddAssetModal>
        </div>

        {/* Summary Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value</p>
                  <p className="text-xl lg:text-2xl font-bold text-purple-600">{formatCurrency(totalAssetValue)}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchase Price</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalPurchasePrice)}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Depreciation</p>
                  <p className={`text-xl lg:text-2xl font-bold ${totalDepreciation >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(totalDepreciation))}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {depreciationPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                  totalDepreciation >= 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'
                }`}>
                  {totalDepreciation >= 0 ? (
                    <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Category" />
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
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Asset Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <div className="h-full overflow-auto">
              {isLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="p-6 text-center">
                  <Diamond size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No assets found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || categoryFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Add your first asset to get started"
                    }
                  </p>
                </div>
              ) : (
                <div className="min-w-full">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Asset
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Purchase Date
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Purchase Price
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Current Value
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Depreciation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredAssets.map((asset) => {
                        const purchasePrice = parseFloat(asset.purchasePrice);
                        const currentValue = parseFloat(asset.currentValue);
                        const depreciation = purchasePrice - currentValue;
                        const depreciationPercent = purchasePrice > 0 ? (depreciation / purchasePrice) * 100 : 0;
                        
                        return (
                          <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              <div>
                                <div className="font-medium">{asset.name}</div>
                                {asset.description && (
                                  <div className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-xs">
                                    {asset.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary" className="capitalize">
                                {ASSET_CATEGORIES.find(cat => cat.value === asset.category)?.label || asset.category}
                              </Badge>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              <div className="flex items-center">
                                <Calendar size={14} className="mr-2 text-gray-400" />
                                {format(new Date(asset.purchaseDate), "MMM dd, yyyy")}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                              {formatCurrency(purchasePrice)}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600 text-right">
                              {formatCurrency(currentValue)}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-right">
                              <div className={`font-medium ${depreciation >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {depreciation >= 0 ? '-' : '+'}{formatCurrency(Math.abs(depreciation))}
                              </div>
                              <div className={`text-xs ${depreciation >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {depreciation >= 0 ? '-' : '+'}{Math.abs(depreciationPercent).toFixed(1)}%
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
