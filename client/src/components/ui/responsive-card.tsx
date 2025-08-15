import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ResponsiveCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  compact?: boolean;
}

export default function ResponsiveCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-500",
  trend,
  className,
  compact = false,
}: ResponsiveCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardContent className={cn("p-4", compact ? "sm:p-6" : "p-6")}>
        <div className="flex items-center justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className={cn(
              "text-sm font-medium text-muted-foreground truncate",
              compact && "text-xs sm:text-sm"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-2xl font-bold text-foreground",
              compact && "text-xl sm:text-2xl"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className={cn(
                "text-xs text-muted-foreground",
                compact && "hidden sm:block"
              )}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center text-xs",
                trend.isPositive ? "text-green-600" : "text-red-600",
                compact && "hidden sm:flex"
              )}>
                <span>{trend.isPositive ? "↗" : "↘"}</span>
                <span className="ml-1">{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800",
              compact && "w-10 h-10 sm:w-12 sm:h-12"
            )}>
              <Icon className={cn(iconColor, compact ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6")} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}