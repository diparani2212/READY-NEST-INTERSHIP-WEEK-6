'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  Calendar,
  User,
  Pill,
  Heart,
  Receipt,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { getMeApi, logoutApi } from '@/lib/auth';
import { NotificationBell } from '@/components/NotificationBell';
import { SocketProvider } from '@/components/SocketProvider';

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getMeApi()
      .then((res) => {
        if (res.success && res.data.user.role === 'DOCTOR') {
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
          <span className="text-sm font-medium">Verifying Medical Staff Access...</span>
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
          You must be authenticated as a Doctor to access this workspace. Patients and Administrators cannot access doctor schedules.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
        >
          Sign In as Doctor
        </Link>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
    { name: 'Medical Records', href: '/doctor/medical-records', icon: Heart },
    { name: 'Billing Log', href: '/doctor/bills', icon: Receipt },
    { name: 'My Profile', href: '/doctor/profile', icon: User },
  ];

  return (
    <SocketProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
        {/* Mobile Top Navbar */}
        <div className="md:hidden flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="font-bold text-white text-base">CityCare Doctor</span>
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
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/30 text-white">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">CityCare Portal</h2>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Doctor Staff
                </span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="p-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-950/60 mb-3 border border-slate-800">
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Dr. {user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">
                Doctor
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

        {/* Main Content */}
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
