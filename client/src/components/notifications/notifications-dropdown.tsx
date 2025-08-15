import { useState } from "react";
import { Bell, Clock, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export default function NotificationsDropdown() {
  const { notifications, unreadCount, hasNotifications } = useNotifications();
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set([...Array.from(prev), notificationId]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };

  const isRead = (notification: Notification) => {
    return readNotifications.has(notification.id);
  };

  const currentUnreadCount = notifications.filter(n => !isRead(n)).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'bill_due_tomorrow':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'bill_overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'bill_due_tomorrow':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'bill_overdue':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Bell size={18} />
          {currentUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {currentUnreadCount > 9 ? '9+' : currentUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {currentUnreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-96">
          {!hasNotifications ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No notifications
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-3 mb-2 rounded-lg border-l-4 cursor-pointer transition-colors",
                    getNotificationColor(notification.type),
                    isRead(notification) ? "opacity-60" : ""
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        {!isRead(notification) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(notification.bill.dueDate).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {notification.bill.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {hasNotifications && (
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}