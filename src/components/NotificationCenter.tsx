import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Notification } from '@/data/mockData';
import { Bell, ShoppingCart, UtensilsCrossed, Heart, ChefHat, Settings, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Завантажити нотифікації при відкритті або зміні користувача
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getNotifications(user.id);
        setNotifications(data);
      } catch (error) {
        console.error('Помилка завантаження нотифікацій:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open || user?.id) {
      loadNotifications();
    }
  }, [open, user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    // Оптимістичне оновлення UI
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));

    // Оновити в базі даних
    if (user?.id) {
      await markNotificationAsRead(user.id, id);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Оптимістичне оновлення UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Оновити в базі даних
    if (user?.id) {
      await markAllNotificationsAsRead(user.id);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'shopping': return <ShoppingCart className="w-4 h-4 text-chart-4" />;
      case 'meal': return <UtensilsCrossed className="w-4 h-4 text-primary" />;
      case 'health': return <Heart className="w-4 h-4 text-destructive" />;
      case 'recipe': return <ChefHat className="w-4 h-4 text-secondary" />;
      default: return <Settings className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
