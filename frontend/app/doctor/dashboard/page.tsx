'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DoctorLayout } from '@/components/DoctorLayout';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  BarChart3,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { fetchDoctorDashboardAnalytics, DoctorAnalyticsData } from '@/lib/analytics';

export default function DoctorDashboardPage() {
  const [data, setData] = useState<DoctorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorDashboardAnalytics()
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {
    todayCount: 0,
    upcomingCount: 0,
    completedCount: 0,
    pendingCount: 0,
    totalPatientsTreated: 0,
  };

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Staff Medical Center</h1>
            <p className="text-sm text-slate-400 mt-1">
              Clinical operations queue, patient statistics, and consultation metrics dashboard
            </p>
          </div>
          <Link
            href="/doctor/appointments"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 transition-all"
          >
            <Calendar className="h-4 w-4" />
            View Consultation Queue
          </Link>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">Today's Queue</span>
            <p className="text-3xl font-extrabold text-white mt-2">{stats.todayCount}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Today's bookings</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">Upcoming</span>
            <p className="text-3xl font-extrabold text-white mt-2">{stats.upcomingCount}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Scheduled visits</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Completed</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.completedCount}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Visits finished</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">Pending Action</span>
            <p className="text-3xl font-extrabold text-amber-400 mt-2">{stats.pendingCount}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Awaiting confirmation</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1">Patients Treated</span>
            <p className="text-3xl font-extrabold text-purple-400 mt-2">{stats.totalPatientsTreated}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Unique patients</span>
          </div>
        </div>

        {/* Weekly Trend Chart & Recent Patients */}
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Consultation Bar Chart */}
            <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
              <div className="border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" /> Weekly Consultation Activity
                </h2>
                <p className="text-xs text-slate-400">Number of patient consultations handled over the last 7 days</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.weeklyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Bar dataKey="consultations" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Patients */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" /> Recent Patients
                </h2>
                <Link href="/doctor/appointments" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  Queue <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-800 text-xs">
                {data?.recentPatients?.map((apt) => (
                  <div key={apt.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{apt.patient?.user.fullName}</p>
                      <p className="text-slate-500 text-[11px]">{apt.patient?.user.email}</p>
                    </div>
                    <span className="font-mono text-slate-400">
                      {new Date(apt.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
