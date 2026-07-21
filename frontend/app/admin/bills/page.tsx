'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import {
  DollarSign,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { fetchAdminBills, deleteBillApi, Bill } from '@/lib/billing';
import { downloadInvoicePDF } from '@/lib/pdfGenerator';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Delete modal state
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
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

  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminBills({
        search,
        status: statusFilter,
        date: dateFilter,
      });

      if (res.success) {
        setBills(res.data.bills);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error loading bills');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFilter]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handleDeleteBill = async () => {
    if (!selectedBill) return;
    setDeleting(true);

    try {
      const res = await deleteBillApi(selectedBill.id);
      if (res.success) {
        addToast('success', `Invoice #${selectedBill.invoiceNumber} deleted successfully.`);
        setIsDeleteModalOpen(false);
        loadBills();
      } else {
        addToast('error', res.message || 'Failed to delete invoice');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error deleting invoice');
    } finally {
      setDeleting(false);
    }
  };

  const totalBilled = bills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = bills.filter((b) => b.paymentStatus === 'PAID').reduce((acc, b) => acc + b.amount, 0);
  const pendingReceivables = bills.filter((b) => b.paymentStatus === 'PENDING').reduce((acc, b) => acc + b.amount, 0);

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
            <h1 className="text-3xl font-extrabold text-white">Billing & Invoice Management</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage hospital financial statements, generate itemized patient invoices, and audit revenue
            </p>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
              Total Invoiced Revenue
            </span>
            <p className="text-3xl font-extrabold text-white">${totalBilled.toFixed(2)}</p>
            <span className="text-xs text-slate-500 mt-1 block">Cumulative billing entries</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Total Collected (Paid)
            </span>
            <p className="text-3xl font-extrabold text-emerald-400">${totalPaid.toFixed(2)}</p>
            <span className="text-xs text-slate-500 mt-1 block">Settled invoices</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Pending Receivables
            </span>
            <p className="text-3xl font-extrabold text-amber-400">${pendingReceivables.toFixed(2)}</p>
            <span className="text-xs text-slate-500 mt-1 block">Awaiting patient payment</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice # or patient..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Payment Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Filter by Date */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Billing Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
              <p className="text-sm">Loading Financial Invoices...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
                <DollarSign className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Invoices Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No billing statements matched the selected filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Physician</th>
                    <th className="px-6 py-4">Billing Date</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white whitespace-nowrap">
                        #{bill.invoiceNumber}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{bill.patient?.user.fullName}</div>
                        <div className="text-[11px] text-slate-500">{bill.patient?.user.email}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">
                          Dr. {bill.appointment?.doctor?.user.fullName || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {bill.appointment?.doctor?.department || 'Staff'}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(bill.generatedAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 font-bold text-emerald-400 text-sm whitespace-nowrap">
                        ${bill.amount.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            bill.paymentStatus === 'PAID'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : bill.paymentStatus === 'PENDING'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : bill.paymentStatus === 'PARTIAL'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : 'bg-purple-950 text-purple-300 border-purple-800'
                          }`}
                        >
                          {bill.paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        <Link
                          href={`/admin/bills/${bill.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium"
                        >
                          <Eye className="h-3.5 w-3.5" /> View / Edit
                        </Link>

                        <button
                          onClick={() => downloadInvoicePDF(bill)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/60 text-[11px] font-medium"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/70"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/80 text-red-400 border border-red-800 mb-4">
              <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Invoice Record?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to permanently delete Invoice{' '}
              <strong className="text-white">#{selectedBill.invoiceNumber}</strong> for amount ${selectedBill.amount.toFixed(2)}? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3 text-xs">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBill}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 disabled:opacity-50 shadow-lg shadow-red-600/30"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
