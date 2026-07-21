'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import {
  FileText,
  Search,
  Download,
  Trash2,
  Loader2,
  Filter,
  Eye,
  FileCheck,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  HardDrive,
} from 'lucide-react';
import { fetchAdminFiles, deleteAdminFileApi, UploadedFileItem } from '@/lib/files';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');

  // Delete modal state
  const [selectedFile, setSelectedFile] = useState<UploadedFileItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminFiles({
        search,
        fileType: fileTypeFilter,
      });

      if (res.success) {
        setFiles(res.data.files);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load uploaded files');
    } finally {
      setLoading(false);
    }
  }, [search, fileTypeFilter]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    setDeleting(true);

    try {
      const res = await deleteAdminFileApi(selectedFile.id);
      if (res.success) {
        addToast('success', `File "${selectedFile.fileName}" deleted permanently.`);
        setIsDeleteModalOpen(false);
        loadFiles();
      } else {
        addToast('error', res.message || 'Failed to delete file');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error deleting file');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
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
            <h1 className="text-3xl font-extrabold text-white">Uploaded File Storage Audit</h1>
            <p className="text-sm text-slate-400 mt-1">
              Audit patient diagnostic reports, lab test scans, and system documents uploaded to Cloudinary & local storage
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search file name or patient..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Document Formats</option>
              <option value="pdf">PDF Documents</option>
              <option value="image">Image Files (JPG, PNG, WEBP)</option>
            </select>
          </div>
        </div>

        {/* Files Grid Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm">Loading System Storage Files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
                <HardDrive className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Files Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No uploaded files matched your selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Document / File Name</th>
                    <th className="px-6 py-4">MIME Type</th>
                    <th className="px-6 py-4">File Size</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Uploaded At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {files.map((file) => {
                    const isPDF = file.fileType.includes('pdf');
                    return (
                      <tr key={file.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {isPDF ? (
                              <FileCheck className="h-5 w-5 text-red-400 shrink-0" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-blue-400 shrink-0" />
                            )}
                            <span>{file.fileName}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                          {file.fileType}
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">
                          {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-white">{file.patient?.user.fullName || 'N/A'}</div>
                          <div className="text-[11px] text-slate-500">{file.patient?.user.email}</div>
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-950 border border-blue-800 text-blue-300 hover:bg-blue-900/60 text-[11px] font-medium"
                          >
                            <Eye className="h-3.5 w-3.5" /> View File
                          </a>

                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/70"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/80 text-red-400 border border-red-800 mb-4">
              <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete File Record?</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to permanently delete file <strong className="text-white">"{selectedFile.fileName}"</strong>? This will remove the file from system storage.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFile}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 disabled:opacity-50 shadow-lg shadow-red-600/30"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
