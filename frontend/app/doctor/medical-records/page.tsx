'use client';

import React, { useEffect, useState } from 'react';
import { DoctorLayout } from '@/components/DoctorLayout';
import {
  FileText,
  Search,
  Download,
  Loader2,
  Heart,
  User,
  Calendar,
  Upload,
  X,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { fetchDoctorMedicalRecords, MedicalRecord } from '@/lib/clinical';
import { downloadMedicalRecordPDF } from '@/lib/pdfGenerator';
import { uploadMedicalReportApi } from '@/lib/files';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function DoctorMedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reportFileName, setReportFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const loadRecords = () => {
    setLoading(true);
    fetchDoctorMedicalRecords()
      .then((res) => {
        if (res.success) {
          setRecords(res.data.records);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedFile) {
      addToast('error', 'Please select a patient and a file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      addToast('error', 'File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadMedicalReportApi(
        selectedPatientId,
        selectedFile,
        reportFileName || selectedFile.name
      );

      if (res.success) {
        addToast('success', 'Medical report file uploaded successfully!');
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setReportFileName('');
        setSelectedPatientId('');
        loadRecords();
      } else {
        addToast('error', res.message || 'Failed to upload report file');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error uploading report file');
    } finally {
      setUploading(false);
    }
  };

  const filtered = records.filter(
    (rec) =>
      rec.patient?.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      rec.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      rec.chiefComplaint.toLowerCase().includes(search.toLowerCase())
  );

  // Extract distinct patient list for select dropdown
  const uniquePatients = Array.from(
    new Map(
      records.map((r) => [r.patientId, { id: r.patientId, name: r.patient?.user.fullName || 'Patient' }])
    ).values()
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Patient Clinical Records</h1>
            <p className="text-sm text-slate-400 mt-1">
              Access charted medical records, chief complaints, vitals, and upload lab/diagnostic scan reports
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 transition-all"
          >
            <Upload className="h-4 w-4" /> Upload Clinical Report
          </button>
        </div>

        {/* Search */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, complaint, diagnosis..."
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
              <Heart className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Medical Records Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No charted medical records matched your search query.
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
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs">
                        EHR
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {rec.patient?.user.fullName}
                        </h4>
                        <p className="text-xs text-slate-400">{rec.patient?.user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(rec.visitDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Vitals summary bar */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center mb-3">
                    <div>
                      <span className="text-slate-500 block">BP</span>
                      <strong className="text-cyan-400">{rec.bloodPressure || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pulse</span>
                      <strong className="text-cyan-400">{rec.pulseRate || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Temp</span>
                      <strong className="text-cyan-400">{rec.bodyTemperature || 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Chief Complaint:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{rec.chiefComplaint}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium">Diagnosis:</span>
                      <p className="font-bold text-cyan-400 mt-0.5">{rec.diagnosis}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  {rec.reportFile ? (
                    <a
                      href={rec.reportFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-medium"
                    >
                      <Paperclip className="h-3.5 w-3.5" /> View Uploaded Report
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500">No report file attached</span>
                  )}

                  <button
                    onClick={() => downloadMedicalRecordPDF(rec)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all"
                  >
                    <Download className="h-4 w-4" /> Download EHR Chart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Report Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-cyan-400" /> Upload Patient Clinical Report
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Patient</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="">Select Patient...</option>
                  {uniquePatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Report Title / Document Name</label>
                <input
                  type="text"
                  placeholder="e.g., Blood Test Report / Chest X-Ray Scan"
                  value={reportFileName}
                  onChange={(e) => setReportFileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Drag & Drop File Upload Box */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Document File (PDF / Images)</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setSelectedFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragActive ? 'border-cyan-500 bg-cyan-950/20' : 'border-slate-700 hover:border-slate-500 bg-slate-950'
                  }`}
                >
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    {selectedFile ? (
                      <div className="flex items-center gap-2 text-cyan-400">
                        <FileCheck className="h-6 w-6 shrink-0" />
                        <div className="text-left">
                          <p className="font-bold text-white text-xs">{selectedFile.name}</p>
                          <span className="text-[10px] text-slate-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-cyan-400" />
                        <p className="font-semibold text-white">
                          Drag & drop report file or <span className="text-cyan-400 underline">browse</span>
                        </p>
                        <span className="text-[10px] text-slate-500">PDF, JPG, PNG, WEBP up to 10 MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !selectedPatientId}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 disabled:opacity-50 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading File...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" /> Save Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}
