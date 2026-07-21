'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  Stethoscope,
  FileText,
  Receipt,
  BarChart3,
  HardDrive,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { getMeApi, logoutApi } from '@/lib/auth';
import { NotificationBell } from '@/components/NotificationBell';
import { SocketProvider } from '@/components/SocketProvider';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getMeApi()
      .then((res) => {
        if (res.success && res.data.user.role === 'ADMIN') {
          setUser(res.data.user);
        } else {
          setUnauthorized(true);
        }
      })
      .catch(() => {
        setUnauthorized(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logoutApi();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
          <span className="text-sm font-medium">Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/80 text-red-400 border border-red-800/80 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 max-w-md mb-6 text-sm">
          You do not have Administrator permissions to view this module. Only registered hospital administrators can access Doctor Management.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Doctors',
      href: '/admin/doctors',
      icon: Stethoscope,
    },
    {
      name: 'Medical Records',
      href: '/admin/medical-records',
      icon: FileText,
    },
    {
      name: 'Bills & Invoices',
      href: '/admin/bills',
      icon: Receipt,
    },
    {
      name: 'System Reports',
      href: '/admin/reports',
      icon: BarChart3,
    },
    {
      name: 'File Storage',
      href: '/admin/files',
      icon: HardDrive,
    },
  ];

  return (
    <SocketProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
        {/* Mobile Top Navbar */}
        <div className="md:hidden flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-bold text-white text-base">CityCare Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4">
            {/* Logo */}
            <div className="hidden md:flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-base leading-none">CityCare</h1>
                <span className="text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
                  Admin Portal
                </span>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-950/60 mb-3 border border-slate-800">
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Backdrop for Mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="hidden md:flex items-center justify-end px-8 py-4 bg-slate-950 border-b border-slate-900">
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </SocketProvider>
  );
};
