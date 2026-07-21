'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { DoctorLayout } from '@/components/DoctorLayout';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  User,
  Check,
  Eye,
  Search,
  Pill,
} from 'lucide-react';
import {
  fetchDoctorAppointments,
  confirmAppointmentApi,
  rejectAppointmentApi,
  completeAppointmentApi,
  DoctorAppointment,
} from '@/lib/doctorPortal';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<string>('ALL'); // 'ALL', 'TODAY', 'UPCOMING', 'PENDING', 'COMPLETED', 'CANCELLED'
  const [search, setSearch] = useState('');

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let statusArg: string | undefined = undefined;
      let filterArg: 'today' | 'upcoming' | 'all' = 'all';

      if (activeTab === 'TODAY') {
        filterArg = 'today';
      } else if (activeTab === 'UPCOMING') {
        filterArg = 'upcoming';
      } else if (activeTab !== 'ALL') {
        statusArg = activeTab;
      }

      const res = await fetchDoctorAppointments({
        status: statusArg,
        filter: filterArg,
        search,
      });

      if (res.success) {
        setAppointments(res.data.appointments);
      } else {
        addToast('error', res.message || 'Failed to fetch appointments');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleConfirm = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const res = await confirmAppointmentApi(id);
      if (res.success) {
        addToast('success', `Appointment with ${name} confirmed!`);
        loadAppointments();
      } else {
        addToast('error', res.message || 'Failed to confirm appointment');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error confirming appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const res = await rejectAppointmentApi(id);
      if (res.success) {
        addToast('success', `Appointment request for ${name} rejected/cancelled.`);
        loadAppointments();
      } else {
        addToast('error', res.message || 'Failed to reject appointment');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error rejecting appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const res = await completeAppointmentApi(id);
      if (res.success) {
        addToast('success', `Appointment with ${name} marked as completed!`);
        loadAppointments();
      } else {
        addToast('error', res.message || 'Failed to complete appointment');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error completing appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const getAge = (dobString?: string | null) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <DoctorLayout>
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

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Consultation Queue</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track daily slots, check scheduling reasons, confirm requests, or view patient medical details
          </p>
        </div>

        {/* Search & Tabs Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'TODAY', label: "Today's Queue" },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'PENDING', label: 'Pending Requests' },
              { id: 'COMPLETED', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Cards / Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-3" />
              <p className="text-sm">Loading Consultation Queue...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Queue Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No appointments matched your query or have been booked under this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-slate-950 border border-slate-850 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Patient Header */}
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {apt.patient.user.fullName}
                        </h4>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {apt.patient.gender ? apt.patient.gender.toLowerCase() : 'Gender: N/A'} •{' '}
                          {getAge(apt.patient.dateOfBirth)} yrs old
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : apt.status === 'PENDING'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : apt.status === 'COMPLETED'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                            : 'bg-red-950/80 text-red-300 border-red-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {/* Schedule Block */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-500">Date:</span>
                        <p className="font-semibold text-slate-200">
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Time Slot:</span>
                        <p className="font-semibold text-slate-200">{apt.appointmentTime}</p>
                      </div>
                    </div>

                    {/* Reason */}
                    {apt.reason && (
                      <div className="text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                        <span className="text-slate-500 font-medium block">Reason for Visit:</span>
                        <p className="text-slate-300 mt-0.5">{apt.reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="pt-5 border-t border-slate-800/60 mt-4 flex items-center justify-between gap-3 text-xs">
                    {/* Details Link */}
                    <Link
                      href={`/doctor/patients/${apt.patient.id}`}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      <Eye className="h-4 w-4" /> View Patient Chart
                    </Link>

                    {/* Decision Buttons */}
                    <div className="flex gap-2">
                      {apt.status === 'PENDING' && (
                        <>
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => handleReject(apt.id, apt.patient.user.fullName)}
                            className="p-2 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/70"
                            title="Reject Request"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => handleConfirm(apt.id, apt.patient.user.fullName)}
                            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-600/30"
                          >
                            <Check className="h-4 w-4" /> Confirm
                          </button>
                        </>
                      )}

                      {apt.status === 'CONFIRMED' && (
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleComplete(apt.id, apt.patient.user.fullName)}
                          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-white shadow-lg shadow-cyan-600/30"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Mark Completed
                        </button>
                      )}

                      {apt.status === 'COMPLETED' && (
                        <Link
                          href={`/doctor/prescriptions/create/${apt.id}`}
                          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-600/30"
                        >
                          <Pill className="h-4 w-4" /> Create Prescription
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
