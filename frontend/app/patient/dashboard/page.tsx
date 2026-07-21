'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PatientLayout } from '@/components/PatientLayout';
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarPlus,
  Stethoscope,
  User,
  ArrowRight,
  Loader2,
  DollarSign,
  Pill,
  Heart,
  Receipt,
} from 'lucide-react';
import { fetchPatientDashboardAnalytics, PatientAnalyticsData } from '@/lib/analytics';
import { downloadPrescriptionPDF, downloadMedicalRecordPDF } from '@/lib/pdfGenerator';

export default function PatientDashboardPage() {
  const [data, setData] = useState<PatientAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDashboardAnalytics()
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const aptStats = data?.appointmentStats || { upcomingCount: 0, completedCount: 0, cancelledCount: 0 };
  const billStats = data?.billStats || { totalBills: 0, paidBillsCount: 0, paidAmount: 0, pendingBillsCount: 0, pendingAmount: 0 };

  return (
    <PatientLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Patient Portal Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              View upcoming consultation schedules, active digital prescriptions, and health billing summaries
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

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
              Upcoming Bookings
            </span>
            <p className="text-4xl font-extrabold text-white mt-2">{aptStats.upcomingCount}</p>
            <span className="text-xs text-slate-400 mt-1 block">Confirmed consultations</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Completed Visits
            </span>
            <p className="text-4xl font-extrabold text-emerald-400 mt-2">{aptStats.completedCount}</p>
            <span className="text-xs text-slate-400 mt-1 block">Finished consultations</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Total Settled Payments
            </span>
            <p className="text-4xl font-extrabold text-cyan-400 mt-2">${billStats.paidAmount.toFixed(2)}</p>
            <span className="text-xs text-slate-400 mt-1 block">{billStats.paidBillsCount} paid invoices</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Pending Bills
            </span>
            <p className="text-4xl font-extrabold text-amber-400 mt-2">${billStats.pendingAmount.toFixed(2)}</p>
            <span className="text-xs text-slate-400 mt-1 block">{billStats.pendingBillsCount} pending invoices</span>
          </div>
        </div>

        {/* Highlights Section */}
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Next Upcoming Appointment Highlight */}
            <div className="lg:col-span-1 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" /> Next Appointment
                  </h3>
                  <Link href="/patient/appointments" className="text-xs text-blue-400 hover:text-blue-300">
                    View All
                  </Link>
                </div>

                {data?.nextAppointment ? (
                  <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Attending Physician:</span>
                      <strong className="text-white text-sm">Dr. {data.nextAppointment.doctor?.user.fullName}</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Date:</span>
                        <span className="text-slate-200 font-medium">
                          {new Date(data.nextAppointment.appointmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Slot:</span>
                        <span className="text-slate-200 font-medium">{data.nextAppointment.appointmentTime}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="py-8 text-center text-slate-500 text-xs">
                    No upcoming appointments scheduled.
                  </p>
                )}
              </div>

              <Link
                href="/patient/book-appointment"
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 text-xs shadow-lg shadow-blue-600/30 transition-all"
              >
                <CalendarPlus className="h-4 w-4" /> Book Consultation
              </Link>
            </div>

            {/* Latest Prescription */}
            <div className="lg:col-span-1 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Pill className="h-5 w-5 text-emerald-400" /> Latest Prescription
                  </h3>
                  <Link href="/patient/prescriptions" className="text-xs text-blue-400 hover:text-blue-300">
                    All Rx
                  </Link>
                </div>

                {data?.latestPrescription ? (
                  <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Diagnosis:</span>
                      <strong className="text-emerald-400 text-sm">{data.latestPrescription.diagnosis}</strong>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block">Prescribed By:</span>
                      <span className="text-slate-200">Dr. {data.latestPrescription.doctor?.user.fullName}</span>
                    </div>
                  </div>
                ) : (
                  <p className="py-8 text-center text-slate-500 text-xs">
                    No prescription history recorded.
                  </p>
                )}
              </div>

              {data?.latestPrescription && (
                <button
                  onClick={() => downloadPrescriptionPDF(data.latestPrescription)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/60 font-semibold text-xs transition-colors"
                >
                  Download Latest Rx PDF
                </button>
              )}
            </div>

            {/* Latest Medical Record */}
            <div className="lg:col-span-1 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Heart className="h-5 w-5 text-cyan-400" /> Latest Medical Chart
                  </h3>
                  <Link href="/patient/medical-records" className="text-xs text-blue-400 hover:text-blue-300">
                    All EHR
                  </Link>
                </div>

                {data?.latestMedicalRecord ? (
                  <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Chief Complaint:</span>
                      <strong className="text-cyan-400 text-sm">{data.latestMedicalRecord.chiefComplaint}</strong>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block">Visit Date:</span>
                      <span className="text-slate-200">
                        {new Date(data.latestMedicalRecord.visitDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="py-8 text-center text-slate-500 text-xs">
                    No electronic health records found.
                  </p>
                )}
              </div>

              {data?.latestMedicalRecord && (
                <button
                  onClick={() => downloadMedicalRecordPDF(data.latestMedicalRecord)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 font-semibold text-xs transition-colors"
                >
                  Download Latest EHR PDF
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
