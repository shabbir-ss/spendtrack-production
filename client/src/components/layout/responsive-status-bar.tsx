import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Monitor, 
  Smartphone, 
  Tablet,
  Battery,
  Signal,
  Eye,
  EyeOff
} from "lucide-react";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";

interface ResponsiveStatusBarProps {
  className?: string;
  showDebugInfo?: boolean;
}

export default function ResponsiveStatusBar({ 
  className,
  showDebugInfo = false 
}: ResponsiveStatusBarProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    windowSize,
    isMobile,
    isVerySmallScreen,
    isShortScreen,
    isCompactLayout,
    effectiveLayout,
    layoutMode,
  } = useResponsiveDashboard();

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getDeviceIcon = () => {
    if (isVerySmallScreen) return Smartphone;
    if (isMobile) return Tablet;
    return Monitor;
  };

  const getDeviceType = () => {
    if (isVerySmallScreen) return "Phone";
    if (isMobile) return "Tablet";
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (isVerySmallScreen && !showDebugInfo) {
    return null; // Hide on very small screens unless debug mode
  }

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs",
      className
    )}>
      {/* Left Section - Connection & Time */}
      <div className="flex items-center space-x-3">
        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-500" />
          )}
          <span className={cn(
            "hidden sm:inline",
            isOnline ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Current Time */}
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Center Section - Device & Layout Info */}
      {!isMobile && (
        <div className="flex items-center space-x-3">
          {/* Device Type */}
          <div className="flex items-center space-x-1">
            {(() => {
              const DeviceIcon = getDeviceIcon();
              return <DeviceIcon className="h-3 w-3 text-gray-500" />;
            })()}
            <span className="text-gray-600 dark:text-gray-400">
              {getDeviceType()}
            </span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Layout Mode */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Layout:</span>
            <Badge 
              variant="outline" 
              className={cn("text-xs px-1 py-0", getLayoutBadgeColor(effectiveLayout))}
            >
              {effectiveLayout.charAt(0).toUpperCase() + effectiveLayout.slice(1)}
            </Badge>
          </div>
        </div>
      )}

      {/* Right Section - Debug Toggle & Screen Size */}
      <div className="flex items-center space-x-3">
        {/* Screen Size */}
        <span className="text-gray-500 hidden md:inline">
          {windowSize.width} × {windowSize.height}
        </span>

        {/* Debug Toggle */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-6 px-2 text-xs"
            >
              {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              <span className="ml-1 hidden sm:inline">Debug</span>
            </Button>
          </>
        )}
      </div>

      {/* Debug Details Panel */}
      {showDetails && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-full left-0 right-0 bg-gray-900 text-gray-100 p-3 text-xs border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Screen</h4>
              <div>Width: {windowSize.width}px</div>
              <div>Height: {windowSize.height}px</div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Device</h4>
              <div>Mobile: {isMobile ? "Yes" : "No"}</div>
              <div>Very Small: {isVerySmallScreen ? "Yes" : "No"}</div>
              <div>Short: {isShortScreen ? "Yes" : "No"}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Layout</h4>
              <div>Mode: {layoutMode}</div>
              <div>Effective: {effectiveLayout}</div>
              <div>Compact: {isCompactLayout ? "Yes" : "No"}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">System</h4>
              <div>Online: {isOnline ? "Yes" : "No"}</div>
              <div>Time: {formatTime(currentTime)}</div>
              <div>UA: {navigator.userAgent.split(' ')[0]}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}