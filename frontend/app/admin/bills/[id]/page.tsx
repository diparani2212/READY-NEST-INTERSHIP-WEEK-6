'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import {
  ArrowLeft,
  DollarSign,
  Download,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Receipt,
  CreditCard,
  X,
} from 'lucide-react';
import { fetchAdminBillById, updateBillApi, Bill } from '@/lib/billing';
import { downloadInvoicePDF } from '@/lib/pdfGenerator';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function AdminBillDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const billId = resolvedParams.id;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form editable state
  const [consultationFee, setConsultationFee] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED'>('PAID');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchAdminBillById(billId)
      .then((res) => {
        if (res.success && res.data.bill) {
          const b = res.data.bill;
          setBill(b);
          setConsultationFee(b.consultationFee);
          setAdditionalCharges(b.additionalCharges);
          setDiscount(b.discount);
          setTax(b.tax);
          setPaymentStatus(b.paymentStatus);
          setPaymentMethod(b.paymentMethod || 'Card');
        } else {
          setError(res.message || 'Bill not found');
        }
      })
      .catch((err) => setError(err.message || 'Error loading bill'))
      .finally(() => setLoading(false));
  }, [billId]);

  const calculatedTotal = Math.max(0, consultationFee + additionalCharges - discount + tax);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateBillApi(billId, {
        consultationFee,
        additionalCharges,
        discount,
        tax,
        paymentStatus,
        paymentMethod,
      });

      if (res.success) {
        setBill(res.data.bill);
        addToast('success', 'Invoice updated successfully!');
      } else {
        addToast('error', res.message || 'Failed to update bill');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error updating bill');
    } finally {
      setSaving(false);
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

      <div className="max-w-4xl mx-auto space-y-6 text-sm">
        <div>
          <Link
            href="/admin/bills"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-950/80 border border-red-800 p-4 text-red-200">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : bill && (
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                  Invoice Summary
                </span>
                <h1 className="text-2xl font-bold text-white">#{bill.invoiceNumber}</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Billed To: <strong className="text-slate-200">{bill.patient?.user.fullName}</strong> ({bill.patient?.user.email})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => downloadInvoicePDF(bill)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 transition-all text-xs"
                >
                  <Download className="h-4 w-4" /> Print PDF Invoice
                </button>
              </div>
            </div>

            {/* Editable Fee Breakdown Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <DollarSign className="h-5 w-5 text-emerald-400" /> Financial Breakdown
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Additional Charges ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tax ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Total recalculated */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-medium text-xs">Recalculated Total Amount:</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  ${calculatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Status Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <CreditCard className="h-5 w-5 text-blue-400" /> Payment & Settlement Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="PARTIAL">Partially Paid</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all text-xs"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Invoice Adjustments
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
