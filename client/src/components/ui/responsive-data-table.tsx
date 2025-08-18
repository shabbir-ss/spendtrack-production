import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  Tag,
  DollarSign,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useResponsiveDashboard } from "@/hooks/use-responsive-dashboard";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: string;
  minWidth?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
  mobileRender?: (value: any, row: T) => React.ReactNode;
  hideOnMobile?: boolean;
  priority?: number; // Lower number = higher priority (shown first on mobile)
}

export interface DataTableAction<T = any> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface DataTableFilter {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}

export interface ResponsiveDataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  filters?: DataTableFilter[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
  pageSize?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  title?: string;
  subtitle?: string;
}

export default function ResponsiveDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  filters = [],
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  emptyDescription = "Try adjusting your search or filters",
  loading = false,
  onRefresh,
  onExport,
  className,
  pageSize = 50,
  showSearch = true,
  showFilters = true,
  showActions = true,
  title,
  subtitle,
}: ResponsiveDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const { isMobile, isVerySmallScreen } = useResponsiveDashboard();

  // Get searchable columns
  const searchableColumns = columns.filter(col => col.searchable !== false);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        searchableColumns.some(col => {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter(row => row[key] === value);
      }
    });

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, filterValues, sortColumn, sortDirection, searchableColumns]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterValues({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  // Get visible columns for mobile (prioritized)
  const mobileColumns = columns
    .filter(col => !col.hideOnMobile)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .slice(0, isVerySmallScreen ? 2 : 3);

  const renderTableHeader = () => (
    <div className="flex flex-col gap-4 mb-6">
      {/* Title Section */}
      {(title || subtitle) && (
        <div>
          {title && (
            <h2 className="text-responsive-lg font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        {showSearch && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        )}

        {/* Filters */}
        {showFilters && filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filterValues[filter.key] || filter.defaultValue || "all"}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className={cn(
                  "w-auto min-w-32",
                  isVerySmallScreen && "text-sm"
                )}>
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {(searchTerm || Object.values(filterValues).some(v => v && v !== "all")) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              {!isVerySmallScreen && <span className="ml-2">Refresh</span>}
            </Button>
          )}
          
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
              {!isVerySmallScreen && <span className="ml-2">Export</span>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderDesktopTable = () => (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.sortable && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                  column.width && `w-[${column.width}]`,
                  column.minWidth && `min-w-[${column.minWidth}]`
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      {sortColumn === column.key ? (
                        sortDirection === "asc" ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        )
                      ) : (
                        <div className="h-3 w-3 opacity-30">
                          <SortAsc className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
            {showActions && actions.length > 0 && (
              <TableHead className="text-right w-20">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">{emptyMessage}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">{emptyDescription}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, index) => (
              <TableRow key={row.id || index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center"
                    )}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
                {showActions && actions.length > 0 && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {actions
                        .filter(action => !action.hidden?.(row))
                        .slice(0, 2)
                        .map((action, actionIndex) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={actionIndex}
                              variant={action.variant || "ghost"}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              disabled={action.disabled?.(row)}
                              className="h-8 w-8 p-0"
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                            </Button>
                          );
                        })}
                      
                      {actions.filter(action => !action.hidden?.(row)).length > 2 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions
                              .filter(action => !action.hidden?.(row))
                              .slice(2)
                              .map((action, actionIndex) => {
                                const Icon = action.icon;
                                return (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={() => action.onClick(row)}
                                    disabled={action.disabled?.(row)}
                                    className={cn(
                                      action.variant === "destructive" && "text-red-600 dark:text-red-400"
                                    )}
                                  >
                                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                                    {action.label}
                                  </DropdownMenuItem>
                                );
                              })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderMobileCards = () => (
    <div className="space-y-3">
      {paginatedData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{emptyMessage}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{emptyDescription}</p>
        </div>
      ) : (
        paginatedData.map((row, index) => {
          const rowId = row.id || index.toString();
          const isExpanded = expandedRows.has(rowId);
          const visibleColumns = isExpanded ? columns : mobileColumns;

          return (
            <Card key={rowId} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Primary Information */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      {visibleColumns.map((column) => {
                        const value = row[column.key];
                        const renderedValue = column.mobileRender 
                          ? column.mobileRender(value, row)
                          : column.render 
                          ? column.render(value, row) 
                          : value;

                        return (
                          <div key={column.key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {column.label}:
                            </span>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {renderedValue}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions Menu */}
                    {showActions && actions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions
                            .filter(action => !action.hidden?.(row))
                            .map((action, actionIndex) => {
                              const Icon = action.icon;
                              return (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={() => action.onClick(row)}
                                  disabled={action.disabled?.(row)}
                                  className={cn(
                                    action.variant === "destructive" && "text-red-600 dark:text-red-400"
                                  )}
                                >
                                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  {columns.length > mobileColumns.length && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(rowId)}
                      className="w-full justify-center text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="mr-1 h-3 w-3" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-3 w-3" />
                          Show More
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {renderTableHeader()}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {renderTableHeader()}
      {isMobile ? renderMobileCards() : renderDesktopTable()}
      {renderPagination()}
    </div>
  );
}