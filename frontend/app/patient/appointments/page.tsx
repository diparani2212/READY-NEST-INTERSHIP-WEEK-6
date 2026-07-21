'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PatientLayout } from '@/components/PatientLayout';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  CalendarPlus,
  X,
  Stethoscope,
  Trash2,
  FileText,
} from 'lucide-react';
import { fetchMyAppointments, cancelAppointmentApi, Appointment } from '@/lib/patient';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Cancel modal state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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
      const statusArg = activeTab === 'ALL' ? undefined : activeTab;
      const res = await fetchMyAppointments(statusArg);

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
  }, [activeTab]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const openCancelModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;
    setCancelling(true);

    try {
      const res = await cancelAppointmentApi(selectedAppointment.id);
      if (res.success) {
        addToast('success', 'Appointment cancelled successfully.');
        setIsCancelModalOpen(false);
        loadAppointments();
      } else {
        addToast('error', res.message || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error cancelling appointment');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PatientLayout>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Appointments</h1>
            <p className="text-sm text-slate-400 mt-1">
              Track upcoming consultations, pending requests, and appointment history
            </p>
          </div>

          <Link
            href="/patient/book-appointment"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
          >
            <CalendarPlus className="h-4 w-4" />
            Book New Appointment
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {[
            { id: 'ALL', label: 'All Appointments' },
            { id: 'CONFIRMED', label: 'Confirmed / Upcoming' },
            { id: 'PENDING', label: 'Pending Approval' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Appointments List / Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm">Loading Appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 py-16 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Appointments Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              You do not have any appointments under this category.
            </p>
            <Link
              href="/patient/book-appointment"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <CalendarPlus className="h-4 w-4" /> Book Appointment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  {/* Doctor & Status Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg">
                        {apt.doctor.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">
                          Dr. {apt.doctor.user.fullName}
                        </h3>
                        <p className="text-xs text-blue-400 font-medium">
                          {apt.doctor.department} • {apt.doctor.specialization}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
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

                  {/* Schedule & Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-3">
                    <div>
                      <span className="text-slate-500">Date:</span>
                      <p className="font-semibold text-white">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500">Time Slot:</span>
                      <p className="font-semibold text-white">{apt.appointmentTime}</p>
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  {apt.reason && (
                    <div className="text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      <span className="text-slate-500 font-medium block mb-0.5">Reason for Visit:</span>
                      <p className="text-slate-300">{apt.reason}</p>
                    </div>
                  )}
                </div>

                {/* Cancel Button for PENDING status */}
                {apt.status === 'PENDING' && (
                  <div className="pt-2">
                    <button
                      onClick={() => openCancelModal(apt)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Cancel Appointment Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {isCancelModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/80 text-red-400 border border-red-800 mb-4">
              <XCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cancel Appointment?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to cancel your appointment with{' '}
              <strong className="text-white">Dr. {selectedAppointment.doctor.user.fullName}</strong> on{' '}
              {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {selectedAppointment.appointmentTime}?
            </p>

            <div className="flex justify-center gap-3 text-xs">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 disabled:opacity-50 shadow-lg shadow-red-600/30"
              >
                {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
