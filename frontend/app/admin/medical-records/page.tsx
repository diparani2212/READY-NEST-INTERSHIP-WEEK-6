'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import {
  FileText,
  Search,
  Calendar,
  Loader2,
  Lock,
  User,
  Stethoscope,
  Heart,
  Eye,
  Filter,
} from 'lucide-react';
import { fetchAdminMedicalRecords, MedicalRecord } from '@/lib/clinical';
import { downloadMedicalRecordPDF } from '@/lib/pdfGenerator';

export default function AdminMedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminMedicalRecords({
        search,
        doctor: doctorSearch,
        date: dateFilter,
      });

      if (res.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, doctorSearch, dateFilter]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white">Hospital Medical Records Audit</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Read Only
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Read-only system audit log of all charted patient EHR records across medical departments
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {/* Search Patient */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient name..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Search Doctor */}
            <div className="relative">
              <Stethoscope className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search physician name..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-3" />
              <p className="text-sm">Loading System Audit Logs...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Medical Records Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No charted patient medical records matched the specified search filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Visit Date</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Physician</th>
                    <th className="px-6 py-4">Chief Complaint</th>
                    <th className="px-6 py-4">Diagnosis</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(rec.visitDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{rec.patient?.user.fullName}</div>
                        <div className="text-[11px] text-slate-500">{rec.patient?.user.email}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-purple-300">Dr. {rec.doctor?.user.fullName}</div>
                        <div className="text-[11px] text-slate-500">{rec.doctor?.department || 'Staff'}</div>
                      </td>

                      <td className="px-6 py-4 max-w-xs truncate">{rec.chiefComplaint}</td>

                      <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{rec.diagnosis}</td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => downloadMedicalRecordPDF(rec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-medium text-[11px]"
                        >
                          <Eye className="h-3.5 w-3.5" /> View PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
