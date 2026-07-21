'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Loader2, ArrowRight } from 'lucide-react';
import {
  fetchNotifications,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  NotificationItem,
} from '@/lib/notifications';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    fetchNotifications()
      .then((res) => {
        if (res.success && res.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await markNotificationAsReadApi(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsAsReadApi();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden backdrop-blur-md">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-blue-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800 text-xs">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                No notifications right now.
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`p-4 transition-colors flex items-start justify-between gap-3 ${
                    !n.isRead ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <strong className={`font-bold ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="text-blue-400 hover:text-blue-300 shrink-0 p-1"
                      title="Mark as read"
                    >
                      <span className="h-2 w-2 rounded-full bg-blue-500 block"></span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              View All Notifications <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
