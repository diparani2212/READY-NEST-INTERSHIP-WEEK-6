'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  PieChart as PieIcon,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { fetchAdminDashboardAnalytics, AdminAnalyticsData } from '@/lib/analytics';

const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#10b981',
  PENDING: '#f59e0b',
  COMPLETED: '#2563eb',
  CANCELLED: '#ef4444',
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardAnalytics()
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  };

  const statusPieData = data?.appointmentStatusSummary
    ? Object.entries(data.appointmentStatusSummary).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Hospital Control Center</h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time executive metrics, financial revenue analytics, and clinical operations dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              <FileText className="h-4 w-4" /> View Full System Reports
            </Link>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Total Registered Patients</span>
              <div className="p-2.5 bg-blue-950/80 rounded-xl text-blue-400 border border-blue-800/60">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mt-3">{stats.totalPatients}</p>
            <span className="text-xs text-slate-400 mt-1 block">Registered patient profiles</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Active Medical Doctors</span>
              <div className="p-2.5 bg-cyan-950/80 rounded-xl text-cyan-400 border border-cyan-800/60">
                <Stethoscope className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mt-3">{stats.totalDoctors}</p>
            <span className="text-xs text-slate-400 mt-1 block">Active clinical specialists</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Hospital Revenue</span>
              <div className="p-2.5 bg-emerald-950/80 rounded-xl text-emerald-400 border border-emerald-800/60">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-emerald-400 mt-3">${stats.totalRevenue.toFixed(2)}</p>
            <span className="text-xs text-slate-400 mt-1 block">Settled paid bills</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Receivables</span>
              <div className="p-2.5 bg-amber-950/80 rounded-xl text-amber-400 border border-amber-800/60">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-amber-400 mt-3">${stats.pendingPayments.toFixed(2)}</p>
            <span className="text-xs text-slate-400 mt-1 block">Unsettled patient invoices</span>
          </div>
        </div>

        {/* Interactive Charts Section */}
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Revenue Area Chart */}
            <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" /> Monthly Revenue Trend ($)
                  </h2>
                  <p className="text-xs text-slate-400">Revenue collected over the past 6 calendar months</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyRevenue || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointment Status Pie Chart */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
              <div className="border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-blue-400" /> Appointment Status Summary
                </h2>
                <p className="text-xs text-slate-400">Distribution by booking status</p>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Doctors Distribution Bar Chart */}
            <div className="lg:col-span-3 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
              <div className="border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" /> Department Specialists Distribution
                </h2>
                <p className="text-xs text-slate-400">Active medical staff count per department</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.departmentDoctors || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Latest Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-white text-base">Latest Appointments</h3>
              <Link href="/admin/reports" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Audit Log <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              {data?.latestAppointments?.map((apt) => (
                <div key={apt.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">{apt.patient.user.fullName}</span>
                    <p className="text-slate-400 text-[11px]">Dr. {apt.doctor.user.fullName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-300">{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                    <span className="block text-[10px] font-bold text-blue-400">{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bills */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-white text-base">Recent Bills</h3>
              <Link href="/admin/bills" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Manage Bills <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              {data?.recentBills?.map((bill) => (
                <div key={bill.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-semibold text-white">#{bill.invoiceNumber}</span>
                    <p className="text-slate-400 text-[11px]">{bill.patient.user.fullName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">${bill.amount.toFixed(2)}</span>
                    <span className="block text-[10px] font-bold text-slate-400">{bill.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
