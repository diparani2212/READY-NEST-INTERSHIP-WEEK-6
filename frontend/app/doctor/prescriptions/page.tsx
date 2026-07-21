'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DoctorLayout } from '@/components/DoctorLayout';
import {
  FileText,
  Search,
  Download,
  Loader2,
  AlertCircle,
  Pill,
  User,
  Calendar,
} from 'lucide-react';
import { fetchDoctorPrescriptions, Prescription } from '@/lib/clinical';
import { downloadPrescriptionPDF } from '@/lib/pdfGenerator';

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDoctorPrescriptions()
      .then((res) => {
        if (res.success) {
          setPrescriptions(res.data.prescriptions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = prescriptions.filter((rx) =>
    rx.patient?.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    rx.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Issued Prescriptions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse electronic Rx records written for your consultation patients and download PDF copies
          </p>
        </div>

        {/* Search */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or diagnosis..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 py-16 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
              <Pill className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Prescriptions Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have not issued any prescriptions matching your search criteria yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((rx) => (
              <div
                key={rx.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs">
                        Rx
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {rx.patient?.user.fullName}
                        </h4>
                        <p className="text-xs text-slate-400">{rx.patient?.user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Diagnosis:</span>
                      <p className="font-semibold text-cyan-400 mt-0.5">{rx.diagnosis}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1">Dosage Summary:</span>
                      <p className="text-slate-300 font-medium">{rx.dosage}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => downloadPrescriptionPDF(rx)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all"
                  >
                    <Download className="h-4 w-4" /> Download PDF Rx
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
