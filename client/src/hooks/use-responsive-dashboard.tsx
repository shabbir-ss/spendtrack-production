import { useState, useEffect } from "react";
import { useIsMobile } from "./use-mobile";

export type LayoutMode = "auto" | "compact" | "expanded";
export type ViewMode = "overview" | "detailed";

interface WindowSize {
  width: number;
  height: number;
}

interface ResponsiveDashboardConfig {
  layoutMode: LayoutMode;
  viewMode: ViewMode;
  windowSize: WindowSize;
  isMobile: boolean;
  isVerySmallScreen: boolean;
  isShortScreen: boolean;
  isCompactLayout: boolean;
  effectiveLayout: LayoutMode;
  gridConfig: {
    summaryGrid: string;
    mainGrid: string;
    cardPadding: string;
    spacing: string;
  };
  setLayoutMode: (mode: LayoutMode) => void;
  setViewMode: (mode: ViewMode) => void;
}

export function useResponsiveDashboard(): ResponsiveDashboardConfig {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("auto");
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [windowSize, setWindowSize] = useState<WindowSize>({ width: 0, height: 0 });
  const isMobile = useIsMobile();

  // Track window size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize(); // Initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine effective layout based on window size and user preference
  const getEffectiveLayout = (): LayoutMode => {
    if (layoutMode !== "auto") return layoutMode;
    
    if (windowSize.width < 640) return "compact"; // Mobile
    if (windowSize.width < 1024) return "compact"; // Tablet
    if (windowSize.height < 600) return "compact"; // Short screens
    return "expanded";
  };

  const effectiveLayout = getEffectiveLayout();
  const isCompactLayout = effectiveLayout === "compact";
  const isVerySmallScreen = windowSize.width < 480;
  const isShortScreen = windowSize.height < 700;

  // Responsive grid configurations
  const getGridConfig = () => {
    if (isVerySmallScreen) {
      return {
        summaryGrid: "grid-cols-1 gap-2",
        mainGrid: "grid-cols-1 gap-3",
        cardPadding: "p-3",
        spacing: "space-y-3"
      };
    }
    
    if (isMobile) {
      return {
        summaryGrid: "grid-cols-2 gap-3",
        mainGrid: "grid-cols-1 gap-4",
        cardPadding: "p-4",
        spacing: "space-y-4"
      };
    }
    
    if (isCompactLayout) {
      return {
        summaryGrid: "grid-cols-2 md:grid-cols-4 gap-4",
        mainGrid: "grid-cols-1 xl:grid-cols-2 gap-4",
        cardPadding: "p-4 lg:p-6",
        spacing: "space-y-4"
      };
    }
    
    return {
      summaryGrid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6",
      mainGrid: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6",
      cardPadding: "p-6",
      spacing: "space-y-6"
    };
  };

  const gridConfig = getGridConfig();

  return {
    layoutMode,
    viewMode,
    windowSize,
    isMobile,
    isVerySmallScreen,
    isShortScreen,
    isCompactLayout,
    effectiveLayout,
    gridConfig,
    setLayoutMode,
    setViewMode,
  };
}