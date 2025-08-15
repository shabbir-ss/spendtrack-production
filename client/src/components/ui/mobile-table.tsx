import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileTableItem {
  id: string;
  title: string;
  subtitle?: string;
  amount: string;
  category?: string;
  date: string;
  type?: "income" | "expense" | "asset" | "bill";
  status?: string;
}

interface MobileTableProps {
  items: MobileTableItem[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

const typeColors = {
  income: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  expense: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  asset: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  bill: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
};

export default function MobileTable({
  items,
  onEdit,
  onDelete,
  emptyMessage = "No items found",
}: MobileTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">
                    {item.title}
                  </h3>
                  {item.type && (
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", typeColors[item.type])}
                    >
                      {item.type}
                    </Badge>
                  )}
                </div>
                
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {item.subtitle}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <span className="text-lg font-semibold text-foreground">
                      {item.amount}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{item.date}</span>
                      {item.category && (
                        <>
                          <span>•</span>
                          <span>{item.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {item.status && (
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  )}
                </div>
              </div>
              
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}