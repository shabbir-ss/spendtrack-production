import React from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, LayoutGrid, Maximize2 } from "lucide-react";
import { useResponsiveDashboard, LayoutMode } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";

interface ResponsiveDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showLayoutControls?: boolean;
  className?: string;
}

export default function ResponsiveDashboardLayout({
  children,
  title,
  subtitle,
  actions,
  showLayoutControls = true,
  className,
}: ResponsiveDashboardLayoutProps) {
  const {
    layoutMode,
    setLayoutMode,
    isVerySmallScreen,
    isShortScreen,
    gridConfig,
  } = useResponsiveDashboard();

  const renderLayoutControls = () => {
    if (!showLayoutControls || isVerySmallScreen) return null;

    return (
      <div className="flex items-center gap-1 lg:gap-2">
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={layoutMode === "compact" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("compact")}
            className="h-7 w-7 p-0"
            title="Compact Layout"
          >
            <Grid3X3 className="h-3 w-3" />
          </Button>
          <Button
            variant={layoutMode === "auto" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("auto")}
            className="h-7 w-7 p-0"
            title="Auto Layout"
          >
            <LayoutGrid className="h-3 w-3" />
          </Button>
          <Button
            variant={layoutMode === "expanded" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("expanded")}
            className="h-7 w-7 p-0"
            title="Expanded Layout"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "min-h-0 flex flex-col dashboard-container dashboard-transition",
      gridConfig.spacing,
      isShortScreen ? "max-h-screen overflow-hidden" : "",
      className
    )}>
      {/* Header Section */}
      {(title || subtitle || actions || showLayoutControls) && (
        <div className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 lg:gap-4">
            {(title || subtitle) && (
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className={cn(
                    "font-bold text-gray-900 dark:text-gray-100 truncate",
                    isVerySmallScreen ? "text-lg" : "text-2xl lg:text-3xl"
                  )}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className={cn(
                    "text-gray-600 dark:text-gray-400 mt-1 truncate",
                    isVerySmallScreen ? "text-xs" : "text-sm lg:text-base"
                  )}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {(actions || showLayoutControls) && (
              <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                {renderLayoutControls()}
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "flex-1 min-h-0",
        isShortScreen ? "overflow-hidden" : ""
      )}>
        {children}
      </div>
    </div>
  );
}

// Utility components for common dashboard patterns
export function DashboardGrid({ 
  children, 
  columns = "auto",
  className 
}: { 
  children: React.ReactNode;
  columns?: "auto" | "1" | "2" | "3" | "4";
  className?: string;
}) {
  const { gridConfig } = useResponsiveDashboard();
  
  const getGridClass = () => {
    switch (columns) {
      case "1": return "grid-cols-1";
      case "2": return "grid-cols-1 lg:grid-cols-2";
      case "3": return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
      case "4": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      case "auto": return "dashboard-grid-auto";
      default: return gridConfig.mainGrid;
    }
  };

  return (
    <div className={cn(
      "grid h-full",
      getGridClass(),
      "gap-4 lg:gap-6",
      className
    )}>
      {children}
    </div>
  );
}

export function DashboardCard({ 
  children, 
  className,
  padding = "auto"
}: { 
  children: React.ReactNode;
  className?: string;
  padding?: "auto" | "compact" | "normal" | "large";
}) {
  const { gridConfig } = useResponsiveDashboard();
  
  const getPaddingClass = () => {
    switch (padding) {
      case "compact": return "p-3 sm:p-4";
      case "normal": return "p-4 lg:p-6";
      case "large": return "p-6 lg:p-8";
      case "auto": return gridConfig.cardPadding;
      default: return gridConfig.cardPadding;
    }
  };

  return (
    <div className={cn(
      "min-h-0 flex flex-col dashboard-transition",
      getPaddingClass(),
      className
    )}>
      {children}
    </div>
  );
}