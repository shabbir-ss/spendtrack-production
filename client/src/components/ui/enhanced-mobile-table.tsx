import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Download,
  Share,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";

interface EnhancedMobileTableItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  amount: string;
  category?: string;
  date: string;
  type?: "income" | "expense" | "asset" | "bill" | "transfer";
  status?: string;
  priority?: "high" | "medium" | "low";
  tags?: string[];
  metadata?: Record<string, any>;
  actions?: {
    view?: boolean;
    edit?: boolean;
    delete?: boolean;
    download?: boolean;
    share?: boolean;
    custom?: Array<{
      label: string;
      icon?: React.ComponentType<any>;
      onClick: (id: string) => void;
      variant?: "default" | "destructive" | "secondary";
    }>;
  };
}

interface EnhancedMobileTableProps {
  items: EnhancedMobileTableItem[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
  itemClassName?: string;
  showItemNumbers?: boolean;
  groupBy?: keyof EnhancedMobileTableItem;
  virtualScrolling?: boolean;
  itemsPerPage?: number;
}

const typeColors = {
  income: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  expense: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  asset: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  bill: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  transfer: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
};

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export default function EnhancedMobileTable({
  items,
  loading = false,
  searchable = true,
  filterable = false,
  sortable = false,
  selectable = false,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  onSelectionChange,
  emptyMessage = "No items found",
  emptyDescription = "Try adjusting your search or filters",
  className,
  itemClassName,
  showItemNumbers = false,
  groupBy,
  virtualScrolling = false,
  itemsPerPage = 20,
}: EnhancedMobileTableProps) {
  const { config, isMobile, isVerySmall, isSmallPhone } = useEnhancedMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof EnhancedMobileTableItem>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort items
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  // Group items if needed
  const groupedItems = groupBy ? 
    paginatedItems.reduce((groups, item) => {
      const key = String(item[groupBy]);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, EnhancedMobileTableItem[]>) : 
    { all: paginatedItems };

  const handleSelection = (id: string, selected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (selected) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedItems(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderItemActions = (item: EnhancedMobileTableItem) => {
    const actions = item.actions || {};
    const hasActions = actions.view || actions.edit || actions.delete || 
                     actions.download || actions.share || actions.custom?.length;

    if (!hasActions) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "flex-shrink-0 ml-2",
              config.minTouchTarget
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {actions.view && onView && (
            <DropdownMenuItem onClick={() => onView(item.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          {actions.edit && onEdit && (
            <DropdownMenuItem onClick={() => onEdit(item.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {actions.download && onDownload && (
            <DropdownMenuItem onClick={() => onDownload(item.id)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
          )}
          {actions.share && onShare && (
            <DropdownMenuItem onClick={() => onShare(item.id)}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
          )}
          {actions.custom?.map((action, index) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick(item.id)}
                className={action.variant === "destructive" ? "text-red-600 dark:text-red-400" : ""}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
          {actions.delete && onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderItem = (item: EnhancedMobileTableItem, index: number) => {
    const isExpanded = expandedItems.has(item.id);
    const isSelected = selectedItems.has(item.id);
    const hasExpandableContent = item.description || item.metadata || item.tags?.length;

    return (
      <Card 
        key={item.id} 
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-blue-500 ring-offset-2",
          config.cardPadding,
          itemClassName
        )}
      >
        <CardContent className={cn("p-0", config.cardPadding)}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header Row */}
              <div className="flex items-center space-x-2 mb-1">
                {selectable && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelection(item.id, e.target.checked)}
                    className={cn("rounded", config.minTouchTarget)}
                  />
                )}
                {showItemNumbers && (
                  <span className="text-xs text-muted-foreground font-mono">
                    #{startIndex + index + 1}
                  </span>
                )}
                <h3 className={cn(
                  "font-medium text-foreground truncate flex-1",
                  config.fontSize.base
                )}>
                  {item.title}
                </h3>
                {item.type && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs flex-shrink-0",
                      typeColors[item.type]
                    )}
                  >
                    {item.type}
                  </Badge>
                )}
              </div>
              
              {/* Subtitle */}
              {item.subtitle && (
                <p className={cn(
                  "text-muted-foreground mb-2 truncate",
                  config.fontSize.sm
                )}>
                  {item.subtitle}
                </p>
              )}
              
              {/* Main Content Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col space-y-1">
                  <span className={cn(
                    "font-semibold text-foreground",
                    isVerySmall ? "text-base" : "text-lg"
                  )}>
                    {item.amount}
                  </span>
                  <div className={cn(
                    "flex items-center space-x-2 text-muted-foreground",
                    config.fontSize.xs
                  )}>
                    <span>{item.date}</span>
                    {item.category && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-20">{item.category}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.priority && (
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", priorityColors[item.priority])}
                    >
                      {item.priority}
                    </Badge>
                  )}
                  {item.status && (
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.slice(0, isVerySmall ? 2 : 3).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > (isVerySmall ? 2 : 3) && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.tags.length - (isVerySmall ? 2 : 3)}
                    </Badge>
                  )}
                </div>
              )}

              {/* Expandable Content */}
              {hasExpandableContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(item.id)}
                  className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show More
                    </>
                  )}
                </Button>
              )}

              {/* Expanded Content */}
              {isExpanded && hasExpandableContent && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  {item.description && (
                    <p className={cn("text-muted-foreground", config.fontSize.sm)}>
                      {item.description}
                    </p>
                  )}
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="space-y-1">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Actions */}
            {renderItemActions(item)}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderToolbar = () => (
    <div className={cn("flex flex-col space-y-3 mb-4", config.spacing)}>
      {/* Search and Filters Row */}
      <div className="flex items-center space-x-2">
        {searchable && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        {filterable && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className={config.minTouchTarget}>
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              {/* Add filter controls here */}
            </SheetContent>
          </Sheet>
        )}
        
        {sortable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className={config.minTouchTarget}>
                {sortDirection === "asc" ? 
                  <SortAsc className="h-4 w-4" /> : 
                  <SortDesc className="h-4 w-4" />
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSortField("date");
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              }}>
                Sort by Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSortField("amount");
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              }}>
                Sort by Amount
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSortField("title");
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              }}>
                Sort by Title
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {selectedItems.size > 0 && (
          <span>{selectedItems.size} selected</span>
        )}
      </div>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {renderToolbar()}
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className={config.cardPadding}>
            <CardContent className="p-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {renderToolbar()}
        <div className="text-center py-12">
          <div className="text-muted-foreground space-y-2">
            <p className={config.fontSize.lg}>{emptyMessage}</p>
            <p className={config.fontSize.sm}>{emptyDescription}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {renderToolbar()}
      
      <div className={cn("space-y-3", config.spacing)}>
        {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
          <div key={groupKey}>
            {groupBy && groupKey !== 'all' && (
              <h3 className={cn(
                "font-medium text-foreground mb-3 px-1",
                config.fontSize.base
              )}>
                {groupKey}
              </h3>
            )}
            {groupItems.map((item, index) => renderItem(item, index))}
          </div>
        ))}
      </div>

      {renderPagination()}
    </div>
  );
}