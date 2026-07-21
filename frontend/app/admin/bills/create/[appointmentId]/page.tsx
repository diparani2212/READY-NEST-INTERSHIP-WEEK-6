'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import {
  ArrowLeft,
  DollarSign,
  Calculator,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Receipt,
  CreditCard,
  X,
} from 'lucide-react';
import { createBillApi } from '@/lib/billing';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function AdminCreateBillPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.appointmentId;
  const router = useRouter();

  const [consultationFee, setConsultationFee] = useState<number>(100);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(10);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED'>('PAID');
  const [paymentMethod, setPaymentMethod] = useState('Card');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const calculatedTotal = Math.max(0, consultationFee + additionalCharges - discount + tax);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await createBillApi({
        appointmentId,
        consultationFee,
        additionalCharges,
        discount,
        tax,
        paymentStatus,
        paymentMethod,
      });

      if (res.success) {
        addToast('success', 'Hospital Bill generated successfully!');
        setTimeout(() => {
          router.push('/admin/bills');
        }, 1500);
      } else {
        setError(res.message || 'Failed to generate bill');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating invoice');
    } finally {
      setSubmitting(false);
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

      <div className="max-w-3xl mx-auto space-y-6 text-sm">
        <div>
          <Link
            href="/admin/bills"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Link>
        </div>

        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Generate Patient Invoice</h1>
          <p className="text-sm text-slate-400 mt-1">
            Calculate itemized consultation fee, discounts, and taxes for completed medical visits
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-950/80 border border-red-800 p-4 text-red-200">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fee Components Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="h-5 w-5 text-emerald-400" /> Itemized Charges
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
                  placeholder="Lab, Diagnostics..."
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
                  placeholder="Insurance deduction..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tax / GST ($)</label>
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

            {/* Total Display Banner */}
            <div className="mt-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold block">
                  Total Calculated Amount
                </span>
                <span className="text-xs text-slate-400">
                  (${consultationFee} + ${additionalCharges} - ${discount} + ${tax})
                </span>
              </div>
              <span className="text-3xl font-extrabold text-emerald-400">
                ${calculatedTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Status & Method Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="h-5 w-5 text-blue-400" /> Payment & Settlement
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
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Generating Invoice...
                </>
              ) : (
                <>
                  <Receipt className="h-5 w-5" /> Generate & Save Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
