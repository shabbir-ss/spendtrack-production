import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Save, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";

interface FormAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

interface ResponsiveFormProps {
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  actions?: FormAction[];
  onClose?: () => void;
  className?: string;
  isModal?: boolean;
  showPreview?: boolean;
  onTogglePreview?: () => void;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
}

export default function ResponsiveForm({
  title,
  subtitle,
  description,
  children,
  actions = [],
  onClose,
  className,
  isModal = false,
  showPreview = false,
  onTogglePreview,
  badge,
}: ResponsiveFormProps) {
  const { isMobile, isVerySmallScreen, isShortScreen } = useResponsiveDashboard();

  const defaultActions: FormAction[] = [
    {
      label: "Cancel",
      onClick: onClose || (() => {}),
      variant: "outline",
      icon: X,
    },
    {
      label: "Save",
      onClick: () => {},
      variant: "default",
      icon: Save,
      type: "submit",
    },
  ];

  const formActions = actions.length > 0 ? actions : defaultActions;
  const primaryActions = formActions.filter(action => 
    action.variant === "default" || action.type === "submit"
  );
  const secondaryActions = formActions.filter(action => 
    action.variant !== "default" && action.type !== "submit"
  );

  const renderActions = () => {
    if (isVerySmallScreen) {
      // Stack actions vertically on very small screens
      return (
        <div className="space-y-2">
          {primaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                type={action.type}
                className="w-full"
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
          {secondaryActions.length > 0 && (
            <div className="flex gap-2">
              {secondaryActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    type={action.type}
                    className="flex-1"
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Horizontal layout for larger screens
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        {secondaryActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant || "outline"}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              type={action.type}
              className={isMobile ? "w-full sm:w-auto" : ""}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          );
        })}
        {primaryActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant || "default"}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              type={action.type}
              className={isMobile ? "w-full sm:w-auto" : ""}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className={cn(
            "font-bold text-gray-900 dark:text-gray-100 truncate",
            isVerySmallScreen ? "text-lg" : "text-xl lg:text-2xl"
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
            isVerySmallScreen ? "text-sm" : "text-base"
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

      <div className="flex items-center gap-2 flex-shrink-0">
        {onTogglePreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePreview}
            className="whitespace-nowrap"
          >
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  // Modal layout for mobile
  if (isModal && isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* Modal Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          {renderHeader()}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Modal Actions */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {renderActions()}
        </div>
      </div>
    );
  }

  // Card layout for desktop or non-modal
  return (
    <Card className={cn(
      "w-full max-w-4xl mx-auto",
      isShortScreen && "max-h-screen flex flex-col",
      className
    )}>
      <CardHeader className={cn(
        "flex-shrink-0",
        isVerySmallScreen ? "p-4" : "p-6"
      )}>
        {renderHeader()}
      </CardHeader>

      <CardContent className={cn(
        "flex-1 min-h-0",
        isShortScreen && "overflow-y-auto",
        isVerySmallScreen ? "p-4 pt-0" : "p-6 pt-0"
      )}>
        {children}
      </CardContent>

      {formActions.length > 0 && (
        <>
          <Separator />
          <div className={cn(
            "flex-shrink-0 bg-gray-50 dark:bg-gray-800",
            isVerySmallScreen ? "p-4" : "p-6"
          )}>
            {renderActions()}
          </div>
        </>
      )}
    </Card>
  );
}

// Form field wrapper component
interface ResponsiveFormFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveFormField({
  label,
  description,
  required,
  error,
  children,
  className,
}: ResponsiveFormFieldProps) {
  const { isVerySmallScreen } = useResponsiveDashboard();

  return (
    <div className={cn("space-y-2", className)}>
      <label className={cn(
        "block font-medium text-gray-900 dark:text-gray-100",
        isVerySmallScreen ? "text-sm" : "text-sm lg:text-base"
      )}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className={cn(
          "text-gray-500 dark:text-gray-400",
          isVerySmallScreen ? "text-xs" : "text-sm"
        )}>
          {description}
        </p>
      )}
      
      {children}
      
      {error && (
        <p className={cn(
          "text-red-600 dark:text-red-400",
          isVerySmallScreen ? "text-xs" : "text-sm"
        )}>
          {error}
        </p>
      )}
    </div>
  );
}

// Form section wrapper
interface ResponsiveFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveFormSection({
  title,
  description,
  children,
  className,
}: ResponsiveFormSectionProps) {
  const { isVerySmallScreen } = useResponsiveDashboard();

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className={cn(
          "font-semibold text-gray-900 dark:text-gray-100",
          isVerySmallScreen ? "text-base" : "text-lg"
        )}>
          {title}
        </h3>
        {description && (
          <p className={cn(
            "text-gray-500 dark:text-gray-400 mt-1",
            isVerySmallScreen ? "text-xs" : "text-sm"
          )}>
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}