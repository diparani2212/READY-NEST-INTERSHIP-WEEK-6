'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { CheckCircle2, AlertCircle, Bell, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  message: string;
}

interface SocketContextType {
  isConnected: boolean;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  subscribe: () => () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'info' | 'success' | 'warning', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  useEffect(() => {
    const socket = getSocket();

    connectSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Event Handlers for Toast Notifications
    socket.on('notification:new', (data: any) => {
      addToast('info', data.title || 'New Notification', data.message);
    });

    socket.on('appointment:booked', (data: any) => {
      addToast('info', 'New Appointment Request', `Appointment booked for ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.appointmentTime}`);
    });

    socket.on('appointment:confirmed', (data: any) => {
      addToast('success', 'Appointment Confirmed', `Your appointment at ${data.appointmentTime} is confirmed!`);
    });

    socket.on('appointment:rejected', (data: any) => {
      addToast('warning', 'Appointment Update', `An appointment request was updated.`);
    });

    socket.on('appointment:completed', (data: any) => {
      addToast('success', 'Consultation Completed', `Consultation marked as COMPLETED.`);
    });

    socket.on('prescription:created', (data: any) => {
      addToast('success', 'Prescription Available', `Dr. issued a digital prescription for diagnosis: ${data.diagnosis || 'Consultation'}`);
    });

    socket.on('bill:generated', (data: any) => {
      addToast('info', 'Invoice Generated', `Invoice #${data.invoiceNumber} for $${data.amount} has been generated.`);
    });

    socket.on('bill:updated', (data: any) => {
      addToast('info', 'Invoice Updated', `Billing status updated for invoice #${data.invoiceNumber}`);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification:new');
      socket.off('appointment:booked');
      socket.off('appointment:confirmed');
      socket.off('appointment:rejected');
      socket.off('appointment:completed');
      socket.off('prescription:created');
      socket.off('bill:generated');
      socket.off('bill:updated');
      disconnectSocket();
    };
  }, []);

  const subscribe = (event: string, callback: (data: any) => void) => {
    const socket = getSocket();
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  };

  return (
    <SocketContext.Provider value={{ isConnected, subscribe }}>
      {/* Real-time Floating Toast Bar */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-2xl shadow-2xl border text-xs backdrop-blur-xl transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700/80 text-emerald-100 shadow-emerald-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-700/80 text-amber-100 shadow-amber-950/50'
                : 'bg-blue-950/90 border-blue-700/80 text-blue-100 shadow-blue-950/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-white/10 shrink-0 mt-0.5">
                <Bell className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <strong className="font-bold block text-white text-xs">{toast.title}</strong>
                <p className="text-[11px] opacity-90 leading-relaxed">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-white/60 hover:text-white shrink-0 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {children}
    </SocketContext.Provider>
  );
}
