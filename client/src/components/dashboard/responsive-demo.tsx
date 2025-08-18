import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Maximize, Minimize } from "lucide-react";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";

export default function ResponsiveDemo() {
  const {
    layoutMode,
    setLayoutMode,
    windowSize,
    isMobile,
    isVerySmallScreen,
    isShortScreen,
    isCompactLayout,
    effectiveLayout,
    gridConfig,
  } = useResponsiveDashboard();

  const [showDetails, setShowDetails] = useState(false);

  const getDeviceIcon = () => {
    if (isVerySmallScreen) return <Smartphone className="w-4 h-4" />;
    if (isMobile) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getDeviceType = () => {
    if (isVerySmallScreen) return "Very Small Screen";
    if (isMobile) return "Mobile/Tablet";
    return "Desktop";
  };

  const getLayoutBadgeColor = (layout: string) => {
    switch (layout) {
      case "compact": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "expanded": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "auto": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getDeviceIcon()}
            <CardTitle className="text-lg">Responsive Dashboard Info</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Device Type</p>
              <p className="font-semibold">{getDeviceType()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Screen Size</p>
              <p className="font-semibold">{windowSize.width} × {windowSize.height}</p>
            </div>
          </div>

          {/* Layout Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Layout Mode:</span>
              <Badge className={getLayoutBadgeColor(layoutMode)}>
                {layoutMode.charAt(0).toUpperCase() + layoutMode.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Effective Layout:</span>
              <Badge className={getLayoutBadgeColor(effectiveLayout)}>
                {effectiveLayout.charAt(0).toUpperCase() + effectiveLayout.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Layout Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Switch Layout:</span>
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={layoutMode === "compact" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLayoutMode("compact")}
                className="h-7 px-2 text-xs"
              >
                Compact
              </Button>
              <Button
                variant={layoutMode === "auto" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLayoutMode("auto")}
                className="h-7 px-2 text-xs"
              >
                Auto
              </Button>
              <Button
                variant={layoutMode === "expanded" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLayoutMode("expanded")}
                className="h-7 px-2 text-xs"
              >
                Expanded
              </Button>
            </div>
          </div>

          {/* Detailed Info */}
          {showDetails && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold text-sm">Responsive Flags</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={cn("p-2 rounded", isMobile ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800")}>
                  <span className="font-medium">isMobile:</span> {isMobile ? "✓" : "✗"}
                </div>
                <div className={cn("p-2 rounded", isVerySmallScreen ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800")}>
                  <span className="font-medium">isVerySmall:</span> {isVerySmallScreen ? "✓" : "✗"}
                </div>
                <div className={cn("p-2 rounded", isShortScreen ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800")}>
                  <span className="font-medium">isShortScreen:</span> {isShortScreen ? "✓" : "✗"}
                </div>
                <div className={cn("p-2 rounded", isCompactLayout ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800")}>
                  <span className="font-medium">isCompact:</span> {isCompactLayout ? "✓" : "✗"}
                </div>
              </div>

              <h4 className="font-semibold text-sm">Grid Configuration</h4>
              <div className="space-y-1 text-xs">
                <div><span className="font-medium">Summary Grid:</span> {gridConfig.summaryGrid}</div>
                <div><span className="font-medium">Main Grid:</span> {gridConfig.mainGrid}</div>
                <div><span className="font-medium">Card Padding:</span> {gridConfig.cardPadding}</div>
                <div><span className="font-medium">Spacing:</span> {gridConfig.spacing}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}