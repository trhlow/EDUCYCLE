import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { notificationsApi } from '../api/endpoints';
import { useAuth } from './AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { resolveWsOrigin } from '../utils/apiBase';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      const n = Number(res?.data?.count);
      setUnreadCount(Number.isFinite(n) ? n : 0);
    } catch {
      // silent — fallback polling, network may be down
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await notificationsApi.getRecent();
      const list = res?.data;
      setNotifications(Array.isArray(list) ? list : []);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when logged out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();
    fetchRecent();

    const interval = setInterval(fetchUnreadCount, 30_000);

    const token = localStorage.getItem('token');
    const userId = user?.id != null ? String(user.id) : '';
    if (userId && token && !token.startsWith('mock-')) {
      try {
        const client = new Client({
          webSocketFactory: () => new SockJS(`${resolveWsOrigin()}/ws`),
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 5000,
          onConnect: () => {
            client.subscribe(`/user/${userId}/queue/notifications`, (frame) => {
              try {
                const notif = JSON.parse(frame.body);
                if (notif && typeof notif === 'object') {
                  setNotifications((prev) => (Array.isArray(prev) ? [notif, ...prev] : [notif]));
                  setUnreadCount((c) => c + 1);
                }
              } catch {
                // malformed frame
              }
            });
          },
        });
        client.activate();
        stompClientRef.current = client;
      } catch {
        // SockJS / STOMP init không được phép làm crash cả app
        stompClientRef.current = null;
      }
    }

    return () => {
      clearInterval(interval);
      stompClientRef.current?.deactivate();
      stompClientRef.current = null;
    };
  }, [isAuthenticated, user?.id, fetchUnreadCount, fetchRecent]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => {
        const p = Array.isArray(prev) ? prev : [];
        return p.map((n) => (n.id === id ? { ...n, read: true } : n));
      });
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => {
        const p = Array.isArray(prev) ? prev : [];
        return p.map((n) => ({ ...n, read: true }));
      });
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchRecent }}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
