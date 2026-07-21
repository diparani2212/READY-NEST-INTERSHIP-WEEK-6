'use client';

import React, { useEffect, useState } from 'react';
import { PatientLayout } from '@/components/PatientLayout';
import {
  Pill,
  Download,
  Loader2,
  Search,
  Calendar,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { fetchPatientPrescriptions, Prescription, MedicineEntry } from '@/lib/clinical';
import { downloadPrescriptionPDF } from '@/lib/pdfGenerator';

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatientPrescriptions()
      .then((res) => {
        if (res.success) {
          setPrescriptions(res.data.prescriptions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = prescriptions.filter(
    (rx) =>
      rx.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      rx.doctor?.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      rx.doctor?.department?.toLowerCase().includes(search.toLowerCase())
  );

  const parseMedicines = (jsonString: string): MedicineEntry[] => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  return (
    <PatientLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">My Prescriptions</h1>
          <p className="text-sm text-slate-400 mt-1">
            View active Electronic Prescriptions issued by your attending physicians and download printable PDF documents
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
              placeholder="Search diagnosis or doctor..."
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
              <Pill className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Prescriptions Available</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You do not have any digital prescriptions issued under this search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((rx) => {
              const meds = parseMedicines(rx.medicines);

              return (
                <div
                  key={rx.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-blue-500/20">
                          Rx
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">
                            Dr. {rx.doctor?.user.fullName}
                          </h4>
                          <p className="text-xs text-blue-400 font-medium">
                            {rx.doctor?.department || 'Attending Physician'}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-4">
                      <span className="text-xs text-slate-500 font-medium block mb-1">Diagnosis:</span>
                      <p className="text-sm font-bold text-white bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        {rx.diagnosis}
                      </p>
                    </div>

                    {/* Prescribed Items summary */}
                    {meds.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <span className="text-xs text-slate-500 font-medium block">Prescribed Medicines:</span>
                        <div className="divide-y divide-slate-800 bg-slate-950/60 rounded-xl border border-slate-800 text-xs p-3">
                          {meds.map((m, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between">
                              <span className="font-semibold text-slate-200">{m.name}</span>
                              <span className="text-slate-400 text-[11px]">{m.dosage} • {m.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => downloadPrescriptionPDF(rx)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
                    >
                      <Download className="h-4 w-4" /> Download Official Rx (PDF)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
