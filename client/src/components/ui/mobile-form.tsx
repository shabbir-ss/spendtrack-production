import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface MobileFormProps {
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  className?: string;
}

export default function MobileForm({
  title,
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = "Save",
  className,
}: MobileFormProps) {
  return (
    <div className="fixed inset-0 bg-background z-50 lg:relative lg:bg-transparent lg:z-auto">
      {/* Mobile: Full screen form */}
      <div className="lg:hidden h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : submitText}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: Card layout */}
      <Card className={cn("hidden lg:block", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : submitText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}