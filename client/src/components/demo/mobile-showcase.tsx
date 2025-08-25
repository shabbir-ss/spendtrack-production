import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Eye, 
  Zap, 
  Accessibility,
  Palette,
  Layers,
  Settings,
  Info
} from "lucide-react";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";
import { cn } from "@/lib/utils";

interface FeatureDemo {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  demo: React.ReactNode;
}

export default function MobileShowcase() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const { 
    config, 
    isMobile, 
    isVerySmall, 
    isSmallPhone,
    width, 
    height, 
    breakpoint,
    isLandscape,
    hasNotch,
    safeAreaTop,
    safeAreaBottom,
    devicePixelRatio,
    isTouchDevice,
    isIOS,
    isAndroid,
    supportsHover
  } = useEnhancedMobile();

  const features: FeatureDemo[] = [
    {
      title: "Adaptive Layouts",
      description: "Components automatically adjust to screen size and device capabilities",
      icon: Layers,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      demo: (
        <div className="space-y-2">
          <div className={cn("grid gap-2", config.gridCols.summary)}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center text-xs">
                Card {i + 1}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Grid adapts: {config.gridCols.summary}
          </p>
        </div>
      )
    },
    {
      title: "Touch Optimization",
      description: "All interactive elements meet accessibility guidelines for touch targets",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      demo: (
        <div className="space-y-2">
          <Button className={cn("mobile-button", config.minTouchTarget)}>
            Touch Target: {config.minTouchTarget}
          </Button>
          <p className="text-xs text-muted-foreground">
            Minimum 44px touch targets with visual feedback
          </p>
        </div>
      )
    },
    {
      title: "Performance First",
      description: "Optimized rendering and smooth 60fps animations",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      demo: (
        <div className="space-y-2">
          <div className="mobile-card bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium">Smooth Animations</p>
            <p className="text-xs text-muted-foreground">Hardware accelerated</p>
          </div>
        </div>
      )
    },
    {
      title: "Accessibility",
      description: "WCAG 2.1 AA compliant with screen reader support",
      icon: Accessibility,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      demo: (
        <div className="space-y-2">
          <div className="mobile-accessible mobile-focus p-2 border rounded" tabIndex={0}>
            <p className="text-sm">Focusable Element</p>
            <p className="text-xs text-muted-foreground">Try tabbing to this element</p>
          </div>
        </div>
      )
    },
    {
      title: "Responsive Typography",
      description: "Fluid typography that scales with screen size",
      icon: Palette,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      demo: (
        <div className="space-y-1">
          <p className={config.fontSize.xl}>Extra Large</p>
          <p className={config.fontSize.lg}>Large</p>
          <p className={config.fontSize.base}>Base</p>
          <p className={config.fontSize.sm}>Small</p>
          <p className={config.fontSize.xs}>Extra Small</p>
        </div>
      )
    },
    {
      title: "Smart Spacing",
      description: "Consistent spacing system that adapts to device size",
      icon: Settings,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      demo: (
        <div className={cn("space-y-2", config.spacing)}>
          <div className={cn("bg-gray-100 dark:bg-gray-800 rounded", config.cardPadding)}>
            <p className="text-sm">Card Padding: {config.cardPadding}</p>
          </div>
          <div className={cn("bg-gray-100 dark:bg-gray-800 rounded", config.containerPadding)}>
            <p className="text-sm">Container: {config.containerPadding}</p>
          </div>
        </div>
      )
    }
  ];

  const deviceInfo = [
    { label: "Screen Size", value: `${width} × ${height}px` },
    { label: "Breakpoint", value: breakpoint.toUpperCase() },
    { label: "Device Type", value: isVerySmall ? "Very Small" : isSmallPhone ? "Small Phone" : isMobile ? "Mobile" : "Desktop" },
    { label: "Orientation", value: isLandscape ? "Landscape" : "Portrait" },
    { label: "Pixel Ratio", value: `${devicePixelRatio}x` },
    { label: "Touch Device", value: isTouchDevice ? "Yes" : "No" },
    { label: "Hover Support", value: supportsHover ? "Yes" : "No" },
    { label: "Platform", value: isIOS ? "iOS" : isAndroid ? "Android" : "Other" },
    ...(hasNotch ? [
      { label: "Safe Area Top", value: `${safeAreaTop}px` },
      { label: "Safe Area Bottom", value: `${safeAreaBottom}px` }
    ] : [])
  ];

  return (
    <div className={cn("space-y-6", config.spacing)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className={cn("font-bold text-foreground", config.fontSize.xl)}>
          📱 Enhanced Mobile Features
        </h1>
        <p className={cn("text-muted-foreground", config.fontSize.sm)}>
          Showcasing the comprehensive mobile responsiveness system
        </p>
      </div>

      {/* Device Detection */}
      <Card className={config.cardPadding}>
        <CardHeader className="p-0 pb-3">
          <CardTitle className={cn("flex items-center space-x-2", config.fontSize.base)}>
            {isMobile ? (
              isVerySmall || isSmallPhone ? <Smartphone className="h-5 w-5" /> : <Tablet className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
            <span>Device Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn("grid gap-2", isVerySmall ? "grid-cols-1" : "grid-cols-2")}>
            {deviceInfo.map((info, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className={cn("text-muted-foreground", config.fontSize.sm)}>
                  {info.label}:
                </span>
                <Badge variant="secondary" className="text-xs">
                  {info.value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Demos */}
      <div className={cn("grid gap-4", config.gridCols.main)}>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isActive = activeDemo === feature.title;
          
          return (
            <Card 
              key={index}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                config.cardPadding,
                isActive && "ring-2 ring-blue-500 ring-offset-2"
              )}
              onClick={() => setActiveDemo(isActive ? null : feature.title)}
            >
              <CardHeader className="p-0 pb-3">
                <CardTitle className={cn("flex items-center space-x-2", config.fontSize.base)}>
                  <div className={cn(
                    "rounded-lg p-2 flex-shrink-0",
                    feature.bgColor
                  )}>
                    <Icon className={cn(feature.color)} size={16} />
                  </div>
                  <span className="flex-1">{feature.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Info className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <p className={cn("text-muted-foreground", config.fontSize.sm)}>
                  {feature.description}
                </p>
                
                {isActive && (
                  <div className="border-t pt-3">
                    <h4 className={cn("font-medium mb-2", config.fontSize.sm)}>
                      Live Demo:
                    </h4>
                    {feature.demo}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Display */}
      <Card className={config.cardPadding}>
        <CardHeader className="p-0 pb-3">
          <CardTitle className={config.fontSize.base}>
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Container Padding:</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {config.containerPadding}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Card Padding:</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {config.cardPadding}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Summary Grid:</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {config.gridCols.summary}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Main Grid:</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {config.gridCols.main}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card className={config.cardPadding}>
        <CardHeader className="p-0 pb-3">
          <CardTitle className={config.fontSize.base}>
            Usage Example
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <pre className={cn(
            "bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-x-auto text-xs",
            "mobile-scroll"
          )}>
{`import { useEnhancedMobile } from '@/hooks/use-enhanced-mobile';

function MyComponent() {
  const { 
    isMobile, 
    isVerySmall, 
    config 
  } = useEnhancedMobile();

  return (
    <div className={config.containerPadding}>
      <h1 className={config.fontSize.xl}>
        {isVerySmall ? 'Short' : 'Full Title'}
      </h1>
      <div className={config.gridCols.summary}>
        {/* Responsive grid content */}
      </div>
    </div>
  );
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card className={cn(config.cardPadding, "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800")}>
        <CardContent className="p-0">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={cn("font-semibold text-blue-900 dark:text-blue-100", config.fontSize.base)}>
                Performance Tips
              </h3>
              <ul className={cn("mt-2 space-y-1 text-blue-800 dark:text-blue-200", config.fontSize.sm)}>
                <li>• Use the configuration object for consistent spacing</li>
                <li>• Leverage the responsive breakpoint utilities</li>
                <li>• Apply mobile-optimized CSS classes for better performance</li>
                <li>• Test on real devices for the best experience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}