import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../lib/api';
import { useAuth } from './AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { resolveWsOrigin } from '../lib/api-base';
import { IconX } from '../components/icons/Icons';

const NotificationContext = createContext(null);

// Map notification type → route
function resolveNotifRoute(notif) {
  const refId = notif.referenceId || notif.transactionId || notif.id;
  switch (notif.type) {
    case 'NEW_TRANSACTION_REQUEST':
    case 'TRANSACTION_STATUS_CHANGED':
    case 'TRANSACTION_OTP':
    case 'TRANSACTION_COMPLETED':
    case 'TRANSACTION_DISPUTED':
      return refId ? `/transactions/${refId}` : '/transactions';
    case 'PRODUCT_APPROVED':
    case 'PRODUCT_REJECTED':
      return refId ? `/products/${refId}` : '/products';
    default:
      return '/transactions';
  }
}

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Issue #1: popup toast list at bottom-right
  const [popups, setPopups] = useState([]);
  const stompClientRef = useRef(null);
  const popupTimersRef = useRef({});

  const dismissPopup = useCallback((pid) => {
    setPopups(p => p.filter(x => x.pid !== pid));
    if (popupTimersRef.current[pid]) {
      clearTimeout(popupTimersRef.current[pid]);
      delete popupTimersRef.current[pid];
    }
  }, []);

  const addPopup = useCallback((notif) => {
    const pid = `${Date.now()}-${Math.random()}`;
    setPopups(p => [...p.slice(-4), { pid, notif }]); // max 5 popups
    popupTimersRef.current[pid] = setTimeout(() => dismissPopup(pid), 6000);
  }, [dismissPopup]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      const n = Number(res?.data?.count);
      setUnreadCount(Number.isFinite(n) ? n : 0);
    } catch { /* silent */ }
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
    const popupTimers = popupTimersRef.current;
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setPopups([]);
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
                  setNotifications(prev => (Array.isArray(prev) ? [notif, ...prev] : [notif]));
                  setUnreadCount(c => c + 1);
                  // Issue #1: show popup for real-time notifications
                  addPopup(notif);
                }
              } catch { /* malformed */ }
            });
          },
        });
        client.activate();
        stompClientRef.current = client;
      } catch {
        stompClientRef.current = null;
      }
    }

    return () => {
      clearInterval(interval);
      stompClientRef.current?.deactivate();
      stompClientRef.current = null;
      Object.values(popupTimers).forEach(clearTimeout);
    };
  }, [isAuthenticated, user?.id, fetchUnreadCount, fetchRecent, addPopup]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => {
        const p = Array.isArray(prev) ? prev : [];
        return p.map(n => (n.id === id ? { ...n, read: true } : n));
      });
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, markAsRead, markAllAsRead, fetchRecent,
      popups, dismissPopup, resolveNotifRoute,
    }}>
      {children}
      <NotificationPopupContainer popups={popups} dismissPopup={dismissPopup} resolveRoute={resolveNotifRoute} markAsRead={markAsRead} />
    </NotificationContext.Provider>
  );
}

// Issue #1: Popup component renders at bottom-right, click → navigate to source
function NotificationPopupContainer({ popups, dismissPopup, resolveRoute, markAsRead }) {
  const navigate = useNavigate();

  if (popups.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
      maxWidth: 340, pointerEvents: 'none',
    }}>
      {popups.map(({ pid, notif }) => (
        <div
          key={pid}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            borderLeft: '4px solid var(--primary-500)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3) var(--space-4)',
            boxShadow: '0 4px 24px rgba(0,0,0,.15)',
            cursor: 'pointer',
            pointerEvents: 'all',
            animation: 'slideInRight .25s ease',
            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
          }}
          onClick={() => {
            const route = resolveRoute(notif);
            if (notif.id) markAsRead(notif.id);
            dismissPopup(pid);
            navigate(route);
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 2 }}>
              {notif.title || 'Thông báo mới'}
            </div>
            <div style={{
              fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {notif.message}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-600)', marginTop: 4 }}>
              Nhấn để xem
            </div>
          </div>
          <button
            type="button"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', flexShrink: 0,
              padding: 'var(--space-1)', lineHeight: 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={e => { e.stopPropagation(); dismissPopup(pid); }}
            aria-label="Đóng thông báo"
            title="Đóng"
          >
            <IconX size={18} />
          </button>
        </div>
      ))}

      {/* CSS animation — injected inline once */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications phải được dùng bên trong NotificationProvider');
  return ctx;
}
