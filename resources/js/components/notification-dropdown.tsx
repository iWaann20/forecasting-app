import { usePage, router } from '@inertiajs/react';
import { Archive, Bell, Check, Package, ChartLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { SharedData } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

type NotifikasiItem = {
  notif_id: string;
  jenis_notif: 'stok_minimum' | 'penjualan_baru' | 'restock_baru';
  pesan: string;
  status_baca: boolean;
  created_at: string;
};

export function NotificationDropdown() {
  const { auth } = usePage<SharedData>().props;
  const [notifications, setNotifications] = useState<NotifikasiItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.user) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifikasi');
        if (response.ok) {
          const responseData = await response.json();
          if (isMounted) {
            setNotifications(responseData.items || []);
            setUnreadCount(responseData.unreadCount || 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [auth.user]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifikasi/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.notif_id === id ? { ...n, status_baca: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifikasi/read-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status_baca: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getIcon = (tipe: string) => {
    switch (tipe) {
      case 'penjualan_baru':
        return <ChartLine className="h-4 w-4 text-sky-500" />;
      case 'stok_minimum':
        return <Package className="h-4 w-4 text-rose-500" />;
      case 'restock_baru':
        return <Archive className="h-4 w-4 text-emerald-500" />;
      default:
        return <Bell className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="font-semibold text-neutral-900 dark:text-neutral-100">
            Notifikasi
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
              onClick={markAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center space-y-2 px-4 text-center">
              <Bell className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Belum ada notifikasi
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.notif_id}
                className={`flex cursor-pointer items-start gap-3 p-4 ${
                  notif.status_baca ? 'opacity-70' : 'bg-sky-50/50 dark:bg-sky-900/10'
                }`}
                onClick={() => {
                  if (!notif.status_baca) markAsRead(notif.notif_id);
                  if (notif.jenis_notif === 'stok_minimum') {
                    router.visit('/dataproduk');
                  } else if (notif.jenis_notif === 'penjualan_baru') {
                    router.visit('/datapenjualan');
                  } else if (notif.jenis_notif === 'restock_baru') {
                    router.visit('/datastok');
                  }
                }}
              >
                <div className="mt-0.5 rounded-full bg-white p-1.5 shadow-xs dark:bg-neutral-800">
                  {getIcon(notif.jenis_notif)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${notif.status_baca ? 'text-neutral-600 dark:text-neutral-300' : 'font-medium text-neutral-900 dark:text-neutral-100'}`}>
                    {notif.pesan}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {formatTime(notif.created_at)}
                  </p>
                </div>
                {!notif.status_baca && (
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
