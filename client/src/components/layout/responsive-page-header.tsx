import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ResponsiveBreadcrumb from "./responsive-breadcrumb";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";

interface PageAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  loading?: boolean;
}

interface ResponsivePageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  actions?: PageAction[];
  breadcrumbItems?: Array<{
    label: string;
    path: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
  children?: React.ReactNode;
}

export default function ResponsivePageHeader({
  title,
  subtitle,
  description,
  badge,
  actions = [],
  breadcrumbItems,
  className,
  children,
}: ResponsivePageHeaderProps) {
  const { isMobile, isVerySmallScreen } = useResponsiveDashboard();

  const primaryActions = actions.filter((_, index) => index < (isVerySmallScreen ? 1 : isMobile ? 2 : 3));
  const secondaryActions = actions.slice(isVerySmallScreen ? 1 : isMobile ? 2 : 3);

  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <div className="flex items-center gap-2">
        {/* Primary Actions */}
        {primaryActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant || "default"}
              size={isVerySmallScreen ? "sm" : "default"}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className={cn(
                isVerySmallScreen && "px-2",
                action.loading && "opacity-50"
              )}
            >
              {Icon && (
                <Icon className={cn(
                  isVerySmallScreen ? "h-3 w-3" : "h-4 w-4",
                  !isVerySmallScreen && "mr-2"
                )} />
              )}
              {!isVerySmallScreen && action.label}
            </Button>
          );
        })}

        {/* Secondary Actions Dropdown */}
        {secondaryActions.length > 0 && (
          <div className="relative">
            {/* This would need a dropdown menu implementation */}
            <Button variant="outline" size={isVerySmallScreen ? "sm" : "default"}>
              <span className="sr-only">More actions</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb */}
      <ResponsiveBreadcrumb items={breadcrumbItems} />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Title Section */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className={cn(
              "font-bold text-gray-900 dark:text-gray-100 truncate",
              isVerySmallScreen ? "text-xl" : "text-2xl lg:text-3xl"
            )}>
              {title}
            </h1>
            {badge && (
              <Badge variant={badge.variant || "default"} className="flex-shrink-0">
                {badge.label}
              </Badge>
            )}
          </div>

          {subtitle && (
            <p className={cn(
              "text-gray-600 dark:text-gray-400 mb-1",
              isVerySmallScreen ? "text-sm" : "text-base lg:text-lg"
            )}>
              {subtitle}
            </p>
          )}

          {description && (
            <p className={cn(
              "text-gray-500 dark:text-gray-400",
              isVerySmallScreen ? "text-xs" : "text-sm"
            )}>
              {description}
            </p>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex-shrink-0">
          {renderActions()}
        </div>
      </div>

      {/* Custom Content */}
      {children && (
        <>
          <Separator />
          <div>{children}</div>
        </>
      )}
    </div>
  );
}