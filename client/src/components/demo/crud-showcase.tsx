import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from "lucide-react";
import { useEnhancedMobile } from "@/hooks/use-enhanced-mobile";
import { cn } from "@/lib/utils";

interface CRUDFeature {
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  features: string[];
  demo: React.ReactNode;
}

export default function CRUDShowcase() {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [demoState, setDemoState] = useState({
    isCreating: false,
    isEditing: false,
    isDeleting: false,
    searchQuery: '',
    selectedFilter: 'all'
  });

  const { config, isMobile, isVerySmall } = useEnhancedMobile();

  const crudFeatures: CRUDFeature[] = [
    {
      operation: 'CREATE',
      title: 'Create New Entries',
      description: 'Add income and expense entries with comprehensive forms',
      icon: Plus,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      features: [
        'Multi-section collapsible forms',
        'Real-time validation',
        'File upload support',
        'Auto-completion',
        'Mobile-optimized inputs'
      ],
      demo: (
        <div className="space-y-3">
          <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">New Income Entry</span>
              <Badge variant="secondary">Form</Badge>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>✓ Description: Freelance Project</div>
              <div>✓ Amount: ₹25,000</div>
              <div>✓ Category: Freelance</div>
              <div>✓ Invoice: Attached</div>
            </div>
          </div>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => setDemoState(prev => ({ ...prev, isCreating: !prev.isCreating }))}
          >
            {demoState.isCreating ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-3 w-3" />
                Create Entry
              </>
            )}
          </Button>
        </div>
      )
    },
    {
      operation: 'READ',
      title: 'View & Browse Entries',
      description: 'Advanced search, filtering, and detailed view capabilities',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      features: [
        'Multi-field search',
        'Advanced filtering',
        'Flexible sorting',
        'Detailed view modals',
        'Mobile card layout'
      ],
      demo: (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={demoState.searchQuery}
                onChange={(e) => setDemoState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-7 pr-3 py-1 text-xs border rounded"
              />
            </div>
            <Button size="sm" variant="outline">
              <Filter className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {['Salary Payment', 'Grocery Shopping', 'Freelance Work'].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded text-xs">
                <div>
                  <div className="font-medium">{item}</div>
                  <div className="text-muted-foreground">
                    {index === 0 ? '₹85,000' : index === 1 ? '₹2,450' : '₹15,000'}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      operation: 'UPDATE',
      title: 'Edit Existing Entries',
      description: 'Modify entries with pre-filled forms and validation',
      icon: Edit,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      features: [
        'Pre-filled forms',
        'Partial updates',
        'Optimistic updates',
        'Validation on edit',
        'Change tracking'
      ],
      demo: (
        <div className="space-y-3">
          <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Edit Expense</span>
              <Badge variant="outline">Modified</Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="line-through text-red-500">₹1,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Amount:</span>
                <span className="text-green-600 font-medium">₹1,350</span>
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            className="w-full"
            onClick={() => setDemoState(prev => ({ ...prev, isEditing: !prev.isEditing }))}
          >
            {demoState.isEditing ? (
              <>
                <Check className="mr-2 h-3 w-3" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="mr-2 h-3 w-3" />
                Edit Entry
              </>
            )}
          </Button>
        </div>
      )
    },
    {
      operation: 'DELETE',
      title: 'Remove Entries',
      description: 'Safe deletion with confirmation and undo options',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      features: [
        'Confirmation dialogs',
        'Entry preview',
        'Bulk delete',
        'Soft delete option',
        'Undo functionality'
      ],
      demo: (
        <div className="space-y-3">
          <div className="border border-red-200 rounded-lg p-3 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-red-800 dark:text-red-200">
                Delete Confirmation
              </span>
              <Badge variant="destructive">Warning</Badge>
            </div>
            <div className="text-xs text-red-700 dark:text-red-300">
              <div className="font-medium">Electricity Bill</div>
              <div>₹1,200 • Bills & Utilities</div>
              <div className="mt-1">This action cannot be undone.</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => setDemoState(prev => ({ ...prev, isDeleting: false }))}
            >
              <X className="mr-2 h-3 w-3" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              className="flex-1"
              onClick={() => setDemoState(prev => ({ ...prev, isDeleting: !prev.isDeleting }))}
            >
              {demoState.isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      )
    }
  ];

  const additionalFeatures = [
    {
      title: 'Advanced Search',
      description: 'Multi-field search across all entry data',
      icon: Search,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Smart Filtering',
      description: 'Category, payment method, and date filters',
      icon: Filter,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
    },
    {
      title: 'File Management',
      description: 'Upload and download receipts/invoices',
      icon: Upload,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100 dark:bg-teal-900/20'
    },
    {
      title: 'Real-time Sync',
      description: 'Automatic data synchronization',
      icon: RefreshCw,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20'
    }
  ];

  const mockStats = {
    totalEntries: 247,
    thisMonth: 23,
    totalIncome: 125000,
    totalExpenses: 87500
  };

  return (
    <div className={cn("space-y-6", config.spacing)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className={cn("font-bold text-foreground", config.fontSize.xl)}>
          🚀 Enhanced CRUD Features
        </h1>
        <p className={cn("text-muted-foreground", config.fontSize.sm)}>
          Complete Create, Read, Update, Delete functionality for Income & Expenses
        </p>
      </div>

      {/* Stats Overview */}
      <div className={cn("grid gap-3", config.gridCols.summary)}>
        <Card className={config.cardPadding}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                  Total Entries
                </p>
                <p className={cn("font-bold text-blue-600 truncate", config.fontSize.lg)}>
                  {mockStats.totalEntries}
                </p>
              </div>
              <div className={cn(
                "bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
                isVerySmall ? "w-8 h-8" : "w-10 h-10"
              )}>
                <DollarSign className="text-blue-600" size={isVerySmall ? 14 : 16} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={config.cardPadding}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                  This Month
                </p>
                <p className={cn("font-bold text-green-600 truncate", config.fontSize.lg)}>
                  {mockStats.thisMonth}
                </p>
              </div>
              <div className={cn(
                "bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
                isVerySmall ? "w-8 h-8" : "w-10 h-10"
              )}>
                <Calendar className="text-green-600" size={isVerySmall ? 14 : 16} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={config.cardPadding}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                  Total Income
                </p>
                <p className={cn("font-bold text-green-600 truncate", config.fontSize.lg)}>
                  ₹{(mockStats.totalIncome / 1000).toFixed(0)}K
                </p>
              </div>
              <div className={cn(
                "bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
                isVerySmall ? "w-8 h-8" : "w-10 h-10"
              )}>
                <TrendingUp className="text-green-600" size={isVerySmall ? 14 : 16} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={config.cardPadding}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={cn("text-muted-foreground", config.fontSize.xs)}>
                  Total Expenses
                </p>
                <p className={cn("font-bold text-red-600 truncate", config.fontSize.lg)}>
                  ₹{(mockStats.totalExpenses / 1000).toFixed(0)}K
                </p>
              </div>
              <div className={cn(
                "bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0",
                isVerySmall ? "w-8 h-8" : "w-10 h-10"
              )}>
                <TrendingDown className="text-red-600" size={isVerySmall ? 14 : 16} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CRUD Operations */}
      <div className={cn("grid gap-4", config.gridCols.main)}>
        {crudFeatures.map((feature, index) => {
          const Icon = feature.icon;
          const isActive = activeOperation === feature.operation;
          
          return (
            <Card 
              key={index}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                config.cardPadding,
                isActive && "ring-2 ring-blue-500 ring-offset-2"
              )}
              onClick={() => setActiveOperation(isActive ? null : feature.operation)}
            >
              <CardHeader className="p-0 pb-3">
                <CardTitle className={cn("flex items-center space-x-2", config.fontSize.base)}>
                  <div className={cn(
                    "rounded-lg p-2 flex-shrink-0",
                    feature.bgColor
                  )}>
                    <Icon className={cn(feature.color)} size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>{feature.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {feature.operation}
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <p className={cn("text-muted-foreground", config.fontSize.sm)}>
                  {feature.description}
                </p>
                
                {!isActive && (
                  <div className="space-y-1">
                    {feature.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className={cn("flex items-center space-x-2", config.fontSize.xs)}>
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span className="text-muted-foreground">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {isActive && (
                  <div className="border-t pt-3 space-y-3">
                    <div>
                      <h4 className={cn("font-medium mb-2", config.fontSize.sm)}>
                        Features:
                      </h4>
                      <div className="space-y-1">
                        {feature.features.map((feat, idx) => (
                          <div key={idx} className={cn("flex items-center space-x-2", config.fontSize.xs)}>
                            <Check className="w-3 h-3 text-green-600" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={cn("font-medium mb-2", config.fontSize.sm)}>
                        Live Demo:
                      </h4>
                      {feature.demo}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Features */}
      <Card className={config.cardPadding}>
        <CardHeader className="p-0 pb-3">
          <CardTitle className={config.fontSize.base}>
            Additional Features
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn("grid gap-3", isVerySmall ? "grid-cols-1" : "grid-cols-2")}>
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className={cn(
                    "rounded-lg p-2 flex-shrink-0",
                    feature.bgColor
                  )}>
                    <Icon className={cn(feature.color)} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium", config.fontSize.sm)}>
                      {feature.title}
                    </p>
                    <p className={cn("text-muted-foreground truncate", config.fontSize.xs)}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
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
{`// Enhanced Income Page with Full CRUD
import EnhancedIncomeFullPage from '@/pages/enhanced-income-full';

// All CRUD operations are handled internally:
// ✅ CREATE: Add new income entries with validation
// ✅ READ: Search, filter, sort, and view entries  
// ✅ UPDATE: Edit existing entries with pre-filled forms
// ✅ DELETE: Safe deletion with confirmation dialogs

function App() {
  return (
    <Routes>
      <Route path="/income" component={EnhancedIncomeFullPage} />
      <Route path="/expenses" component={EnhancedExpensesFullPage} />
    </Routes>
  );
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Performance Info */}
      <Card className={cn(config.cardPadding, "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800")}>
        <CardContent className="p-0">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={cn("font-semibold text-blue-900 dark:text-blue-100", config.fontSize.base)}>
                Performance Features
              </h3>
              <ul className={cn("mt-2 space-y-1 text-blue-800 dark:text-blue-200", config.fontSize.sm)}>
                <li>• Optimistic updates for instant UI feedback</li>
                <li>• React Query for intelligent caching and sync</li>
                <li>• Virtual scrolling for large datasets</li>
                <li>• Debounced search and filter operations</li>
                <li>• Mobile-optimized with 60fps animations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}