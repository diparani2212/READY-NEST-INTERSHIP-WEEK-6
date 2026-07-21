'use client';

import React, { useEffect, useState } from 'react';
import { DoctorLayout } from '@/components/DoctorLayout';
import {
  DollarSign,
  Download,
  Loader2,
  Search,
  Lock,
  Receipt,
} from 'lucide-react';
import { fetchDoctorBills, Bill } from '@/lib/billing';
import { downloadInvoicePDF } from '@/lib/pdfGenerator';

export default function DoctorBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDoctorBills()
      .then((res) => {
        if (res.success) {
          setBills(res.data.bills);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bills.filter(
    (b) =>
      b.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.patient?.user.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white">Consultation Billing Log</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Read Only
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Read-only view of patient consultation fee statements and invoice statuses
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice # or patient..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-3" />
              <p className="text-sm">Loading Billing Records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
                <Receipt className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Invoices Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No patient invoices found matching your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Billing Date</th>
                    <th className="px-6 py-4">Consultation Fee</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filtered.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white whitespace-nowrap">
                        #{bill.invoiceNumber}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{bill.patient?.user.fullName}</div>
                        <div className="text-[11px] text-slate-500">{bill.patient?.user.email}</div>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(bill.generatedAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-slate-200 whitespace-nowrap">
                        ${bill.consultationFee.toFixed(2)}
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

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => downloadInvoicePDF(bill)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 font-medium text-[11px]"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
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
    </DoctorLayout>
  );
}
