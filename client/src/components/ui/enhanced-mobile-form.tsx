import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";
import { 
  X, 
  Check, 
  ChevronDown, 
  Calendar, 
  Upload, 
  Camera, 
  FileText,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Plus,
  Minus
} from "lucide-react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea" | "select" | "date" | "file" | "currency" | "toggle" | "multi-select";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: any;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  description?: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ComponentType<any>;
  multiple?: boolean;
  accept?: string;
  rows?: number;
  step?: number;
  currency?: string;
  showPassword?: boolean;
}

interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface EnhancedMobileFormProps {
  title: string;
  description?: string;
  sections: FormSection[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  showProgress?: boolean;
  stickyActions?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  validationMode?: "onChange" | "onBlur" | "onSubmit";
  showRequiredIndicator?: boolean;
  compactMode?: boolean;
}

export default function EnhancedMobileForm({
  title,
  description,
  sections,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  disabled = false,
  className,
  showProgress = false,
  stickyActions = true,
  autoSave = false,
  autoSaveDelay = 2000,
  validationMode = "onBlur",
  showRequiredIndicator = true,
  compactMode = false,
}: EnhancedMobileFormProps) {
  const { config, isMobile, isVerySmall, isSmallPhone } = useEnhancedMobile();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize form data and expanded sections
  useEffect(() => {
    const initialData: Record<string, any> = {};
    const initialExpanded = new Set<string>();
    
    sections.forEach((section, sectionIndex) => {
      if (section.defaultExpanded !== false) {
        initialExpanded.add(section.title);
      }
      
      section.fields.forEach(field => {
        if (field.value !== undefined) {
          initialData[field.name] = field.value;
        } else if (field.type === "multi-select") {
          initialData[field.name] = [];
        } else if (field.type === "toggle") {
          initialData[field.name] = false;
        }
      });
    });
    
    setFormData(initialData);
    setExpandedSections(initialExpanded);
  }, [sections]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Implement auto-save logic here
      console.log("Auto-saving form data:", formData);
    }, autoSaveDelay);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, autoSave, autoSaveDelay]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }
    
    if (field.validation) {
      const { min, max, pattern, message } = field.validation;
      
      if (min !== undefined && value && value.length < min) {
        return message || `${field.label} must be at least ${min} characters`;
      }
      
      if (max !== undefined && value && value.length > max) {
        return message || `${field.label} must be no more than ${max} characters`;
      }
      
      if (pattern && value && !pattern.test(value)) {
        return message || `${field.label} format is invalid`;
      }
    }
    
    return null;
  };

  const handleFieldChange = (fieldName: string, value: any, field: FormField) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (validationMode === "onChange") {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [fieldName]: error || "" }));
    }
  };

  const handleFieldBlur = (fieldName: string, field: FormField) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    if (validationMode === "onBlur" || validationMode === "onChange") {
      const error = validateField(field, formData[fieldName]);
      setErrors(prev => ({ ...prev, [fieldName]: error || "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    sections.forEach(section => {
      section.fields.forEach(field => {
        const error = validateField(field, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
          hasErrors = true;
        }
      });
    });
    
    setErrors(newErrors);
    
    if (hasErrors) {
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };

  const togglePassword = (fieldName: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const renderField = (field: FormField, sectionIndex: number, fieldIndex: number) => {
    const fieldValue = formData[field.name] || "";
    const fieldError = errors[field.name];
    const isFieldTouched = touched[field.name];
    const showError = fieldError && (isFieldTouched || validationMode === "onChange");
    
    const fieldId = `${field.name}-${sectionIndex}-${fieldIndex}`;
    const Icon = field.icon;

    const baseInputClasses = cn(
      "transition-all duration-200",
      config.minTouchTarget,
      showError && "border-red-500 focus:border-red-500 focus:ring-red-500",
      field.disabled && "opacity-50 cursor-not-allowed"
    );

    const renderInput = () => {
      switch (field.type) {
        case "textarea":
          return (
            <Textarea
              id={fieldId}
              name={field.name}
              placeholder={field.placeholder}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
              onBlur={() => handleFieldBlur(field.name, field)}
              disabled={field.disabled || disabled}
              required={field.required}
              rows={field.rows || (isVerySmall ? 3 : 4)}
              className={baseInputClasses}
            />
          );

        case "select":
          return (
            <Select
              value={fieldValue}
              onValueChange={(value) => handleFieldChange(field.name, value, field)}
              disabled={field.disabled || disabled}
            >
              <SelectTrigger className={baseInputClasses}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case "multi-select":
          return (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(baseInputClasses, "justify-between")}
                  disabled={field.disabled || disabled}
                >
                  <span>
                    {fieldValue.length > 0 
                      ? `${fieldValue.length} selected`
                      : field.placeholder || "Select options"
                    }
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh]">
                <SheetHeader>
                  <SheetTitle>{field.label}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${fieldId}-${option.value}`}
                        checked={fieldValue.includes(option.value)}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...fieldValue, option.value]
                            : fieldValue.filter((v: string) => v !== option.value);
                          handleFieldChange(field.name, newValue, field);
                        }}
                        disabled={option.disabled}
                        className="rounded"
                      />
                      <Label htmlFor={`${fieldId}-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          );

        case "date":
          return (
            <div className="relative">
              <Input
                id={fieldId}
                name={field.name}
                type="date"
                value={fieldValue}
                onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
                onBlur={() => handleFieldBlur(field.name, field)}
                disabled={field.disabled || disabled}
                required={field.required}
                className={baseInputClasses}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          );

        case "file":
          return (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(fieldId)?.click()}
                  disabled={field.disabled || disabled}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                {navigator.mediaDevices && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Implement camera capture
                      console.log("Camera capture");
                    }}
                    disabled={field.disabled || disabled}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                id={fieldId}
                name={field.name}
                type="file"
                onChange={(e) => handleFieldChange(field.name, e.target.files, field)}
                onBlur={() => handleFieldBlur(field.name, field)}
                disabled={field.disabled || disabled}
                required={field.required}
                multiple={field.multiple}
                accept={field.accept}
                className="hidden"
              />
              {fieldValue && (
                <div className="text-sm text-gray-600">
                  {field.multiple 
                    ? `${fieldValue.length} file(s) selected`
                    : fieldValue[0]?.name || "File selected"
                  }
                </div>
              )}
            </div>
          );

        case "currency":
          return (
            <div className="relative">
              {field.prefix && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {field.prefix}
                </span>
              )}
              <Input
                id={fieldId}
                name={field.name}
                type="number"
                step={field.step || "0.01"}
                placeholder={field.placeholder}
                value={fieldValue}
                onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
                onBlur={() => handleFieldBlur(field.name, field)}
                disabled={field.disabled || disabled}
                required={field.required}
                className={cn(
                  baseInputClasses,
                  field.prefix && "pl-8",
                  field.suffix && "pr-8"
                )}
              />
              {field.suffix && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {field.suffix}
                </span>
              )}
            </div>
          );

        case "password":
          return (
            <div className="relative">
              <Input
                id={fieldId}
                name={field.name}
                type={showPasswords[field.name] ? "text" : "password"}
                placeholder={field.placeholder}
                value={fieldValue}
                onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
                onBlur={() => handleFieldBlur(field.name, field)}
                disabled={field.disabled || disabled}
                required={field.required}
                className={cn(baseInputClasses, "pr-10")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => togglePassword(field.name)}
                className="absolute right-0 top-0 h-full px-3"
              >
                {showPasswords[field.name] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          );

        case "toggle":
          return (
            <div className="flex items-center space-x-2">
              <input
                id={fieldId}
                name={field.name}
                type="checkbox"
                checked={fieldValue}
                onChange={(e) => handleFieldChange(field.name, e.target.checked, field)}
                onBlur={() => handleFieldBlur(field.name, field)}
                disabled={field.disabled || disabled}
                className="rounded"
              />
              <Label htmlFor={fieldId} className="text-sm">
                {field.placeholder || "Enable"}
              </Label>
            </div>
          );

        default:
          return (
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <Input
                id={fieldId}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={fieldValue}
                onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
                onBlur={() => handleFieldBlur(field.name, field)}
                disabled={field.disabled || disabled}
                required={field.required}
                min={field.validation?.min}
                max={field.validation?.max}
                step={field.step}
                className={cn(baseInputClasses, Icon && "pl-10")}
              />
            </div>
          );
      }
    };

    return (
      <div key={field.name} className={cn("space-y-2", compactMode && "space-y-1")}>
        {field.type !== "toggle" && (
          <Label htmlFor={fieldId} className="flex items-center space-x-1">
            <span>{field.label}</span>
            {field.required && showRequiredIndicator && (
              <span className="text-red-500">*</span>
            )}
            {field.description && (
              <div className="group relative">
                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {field.description}
                </div>
              </div>
            )}
          </Label>
        )}
        
        {renderInput()}
        
        {showError && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="h-3 w-3" />
            <span>{fieldError}</span>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: FormSection, sectionIndex: number) => {
    const isExpanded = expandedSections.has(section.title);
    
    return (
      <Card key={section.title} className={cn(compactMode && "shadow-sm")}>
        <CardHeader 
          className={cn(
            "cursor-pointer",
            compactMode ? "p-3" : config.cardPadding,
            section.collapsible && "hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
          onClick={() => section.collapsible && toggleSection(section.title)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={cn(
                compactMode ? "text-base" : config.fontSize.lg
              )}>
                {section.title}
              </CardTitle>
              {section.description && (
                <p className={cn(
                  "text-muted-foreground mt-1",
                  compactMode ? "text-xs" : config.fontSize.sm
                )}>
                  {section.description}
                </p>
              )}
            </div>
            {section.collapsible && (
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </div>
        </CardHeader>
        
        {(!section.collapsible || isExpanded) && (
          <CardContent className={cn(
            "space-y-4",
            compactMode ? "p-3 pt-0 space-y-3" : config.cardPadding + " pt-0"
          )}>
            {section.fields.map((field, fieldIndex) => 
              renderField(field, sectionIndex, fieldIndex)
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderActions = () => (
    <div className={cn(
      "flex space-x-3",
      config.spacing,
      stickyActions && "sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 -mx-4 -mb-4"
    )}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || disabled}
          className="flex-1"
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || disabled}
        className="flex-1"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className={cn("font-semibold", config.fontSize.xl)}>
          {title}
        </h1>
        {description && (
          <p className={cn("text-muted-foreground", config.fontSize.sm)}>
            {description}
          </p>
        )}
      </div>

      {/* Progress Indicator */}
      {showProgress && sections.length > 1 && (
        <div className="flex items-center space-x-2">
          {sections.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 flex-1 rounded-full",
                index <= currentStep ? "bg-blue-500" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      )}

      {/* Form Sections */}
      <div className={cn("space-y-4", config.spacing)}>
        {sections.map((section, index) => renderSection(section, index))}
      </div>

      {/* Actions */}
      {renderActions()}
    </form>
  );
}