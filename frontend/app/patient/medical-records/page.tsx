'use client';

import React, { useEffect, useState } from 'react';
import { PatientLayout } from '@/components/PatientLayout';
import {
  Heart,
  Download,
  Loader2,
  Search,
  Calendar,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { fetchPatientMedicalRecords, MedicalRecord } from '@/lib/clinical';
import { downloadMedicalRecordPDF } from '@/lib/pdfGenerator';

export default function PatientMedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatientMedicalRecords()
      .then((res) => {
        if (res.success) {
          setRecords(res.data.records);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter(
    (rec) =>
      rec.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      rec.chiefComplaint.toLowerCase().includes(search.toLowerCase()) ||
      rec.doctor?.user.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PatientLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">My Medical Records</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your Electronic Health Records (EHR), physician observations, treatment plans, and download PDF summaries
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
              placeholder="Search diagnosis or physician..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 py-16 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
              <Heart className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Medical Records Available</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You do not have any electronic health records matching your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-cyan-500/20">
                        EHR
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">
                          Dr. {rec.doctor?.user.fullName}
                        </h4>
                        <p className="text-xs text-cyan-400 font-medium">
                          {rec.doctor?.department || 'Attending Physician'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                      {new Date(rec.visitDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Vitals Summary */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4">
                    <div>
                      <span className="text-slate-500 block text-[11px]">BP</span>
                      <strong className="text-blue-400">{rec.bloodPressure || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Pulse</span>
                      <strong className="text-blue-400">{rec.pulseRate || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Temp</span>
                      <strong className="text-blue-400">{rec.bodyTemperature || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Complaints & Diagnosis */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Chief Complaint:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{rec.chiefComplaint}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium">Diagnosis:</span>
                      <p className="font-bold text-blue-400 mt-0.5">{rec.diagnosis}</p>
                    </div>

                    {rec.treatment && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Treatment Plan:</span>
                        <p className="text-slate-300">{rec.treatment}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download PDF button */}
                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => downloadMedicalRecordPDF(rec)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
                  >
                    <Download className="h-4 w-4" /> Download EHR Summary (PDF)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
