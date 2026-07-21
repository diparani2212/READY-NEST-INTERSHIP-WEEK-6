'use client';

import React, { useEffect, useState } from 'react';
import { PatientLayout } from '@/components/PatientLayout';
import {
  DollarSign,
  Download,
  Loader2,
  Search,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { fetchPatientBills, Bill } from '@/lib/billing';
import { downloadInvoicePDF } from '@/lib/pdfGenerator';

export default function PatientBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatientBills()
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
      b.appointment?.doctor?.user.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PatientLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">My Invoices & Receipts</h1>
          <p className="text-sm text-slate-400 mt-1">
            View medical consultation billing statements, payment statuses, and download official PDF tax invoices
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
              placeholder="Search invoice # or doctor..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Invoices Grid */}
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 py-16 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
              <Receipt className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Invoices Available</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You currently have no hospital invoices matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((bill) => (
              <div
                key={bill.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  {/* Invoice Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 font-bold block">
                        #{bill.invoiceNumber}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Generated: {new Date(bill.generatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        bill.paymentStatus === 'PAID'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : bill.paymentStatus === 'PENDING'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : bill.paymentStatus === 'PARTIAL'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                          : 'bg-purple-950/80 text-purple-300 border-purple-800'
                      }`}
                    >
                      {bill.paymentStatus}
                    </span>
                  </div>

                  {/* Doctor & Amount Details */}
                  <div className="space-y-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Attending Doctor:</span>
                      <span className="font-semibold text-white">
                        Dr. {bill.appointment?.doctor?.user.fullName || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Consultation Fee:</span>
                      <span className="text-slate-300">${bill.consultationFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-slate-400 font-bold">Total Amount Payable:</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        ${bill.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PDF Download */}
                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => downloadInvoicePDF(bill)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
                  >
                    <Download className="h-4 w-4" /> Download PDF Invoice
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
