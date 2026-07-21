'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Pill,
  Receipt,
  UserCheck,
  Lock,
  X,
  Filter,
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
  NotificationItem,
} from '@/lib/notifications';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await markNotificationAsReadApi(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        addToast('success', 'Notification marked as read');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error updating notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsAsReadApi();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        addToast('success', 'All notifications marked as read');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error updating notifications');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteNotificationApi(id);
      if (res.success) {
        const target = notifications.find((n) => n.id === id);
        if (target && !target.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        addToast('success', 'Notification deleted');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error deleting notification');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_BOOKED':
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT_REJECTED':
      case 'APPOINTMENT_COMPLETED':
        return <Calendar className="h-5 w-5 text-blue-400" />;
      case 'PRESCRIPTION_CREATED':
        return <Pill className="h-5 w-5 text-emerald-400" />;
      case 'BILL_GENERATED':
        return <Receipt className="h-5 w-5 text-amber-400" />;
      case 'ACCOUNT_CREATED':
        return <UserCheck className="h-5 w-5 text-cyan-400" />;
      case 'PASSWORD_RESET':
        return <Lock className="h-5 w-5 text-purple-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-xl shadow-2xl border text-sm transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                : 'bg-red-950/90 border-red-800 text-red-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto space-y-6 text-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white">Notifications Inbox</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-800 text-xs font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Stay informed about appointment schedules, digital prescriptions, invoices, and account security
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-blue-400 rounded-xl font-semibold text-xs transition-all"
            >
              <CheckCheck className="h-4 w-4" /> Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              filter === 'UNREAD'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 py-16 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
              <Bell className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Notifications</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your inbox is clear! No notifications match the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border backdrop-blur-md transition-all flex items-start justify-between gap-4 ${
                  !n.isRead
                    ? 'bg-slate-900/90 border-blue-500/40 shadow-lg shadow-blue-950/20'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-sm ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 inline-block"></span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono block pt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/70"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
