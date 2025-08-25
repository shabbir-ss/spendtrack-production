import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Smartphone, Car, Laptop, Briefcase, Wrench, Home, Diamond } from "lucide-react";
import { Asset } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/api";

export default function AssetPortfolio() {
  const [, setLocation] = useLocation();
  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: () => apiRequest("GET", "/assets"),
  });

  const getAssetIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "electronics":
        return <Smartphone className="text-purple-500" size={20} />;
      case "vehicles":
        return <Car className="text-purple-500" size={20} />;
      case "furniture":
        return <Home className="text-purple-500" size={20} />;
      case "tools":
        return <Wrench className="text-purple-500" size={20} />;
      default:
        return <Diamond className="text-purple-500" size={20} />;
    }
  };

  const calculateDepreciation = (purchasePrice: number, currentValue: number) => {
    const depreciation = ((purchasePrice - currentValue) / purchasePrice) * 100;
    return Math.max(0, depreciation);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Asset Portfolio</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-500 hover:text-purple-600"
              onClick={() => setLocation('/assets')}
            >
              Manage Assets
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No assets found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Start tracking your valuable assets
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topAssets = assets.slice(0, 6);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Asset Portfolio</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-purple-500 hover:text-purple-600 text-xs sm:text-sm"
            onClick={() => setLocation('/assets')}
          >
            <span className="hidden sm:inline">Manage Assets</span>
            <span className="sm:hidden">Manage</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 h-full overflow-y-auto dashboard-scroll">
          {topAssets.map((asset) => {
            const purchasePrice = parseFloat(asset.purchasePrice);
            const currentValue = parseFloat(asset.currentValue);
            const depreciation = calculateDepreciation(purchasePrice, currentValue);

            return (
              <div key={asset.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getAssetIcon(asset.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {asset.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                      {asset.category}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Purchase:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      ₹{purchasePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Current:</span>
                    <span className="asset-color font-medium">
                      ₹{currentValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Depreciation:</span>
                    <span className="depreciation-color font-medium">
                      -{depreciation.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
