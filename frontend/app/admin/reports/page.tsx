'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import {
  FileText,
  Search,
  Download,
  Calendar,
  Filter,
  Loader2,
  DollarSign,
  Users,
  Stethoscope,
  ArrowUpDown,
} from 'lucide-react';
import {
  fetchAppointmentReports,
  fetchRevenueReports,
  fetchPatientReports,
  fetchDoctorReports,
} from '@/lib/analytics';
import { exportToCSV } from '@/lib/csvExporter';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'APPOINTMENTS' | 'REVENUE' | 'PATIENTS' | 'DOCTORS'>('APPOINTMENTS');
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Datasets
  const [data, setData] = useState<any[]>([]);

  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'APPOINTMENTS') {
        const res = await fetchAppointmentReports({
          search,
          status: statusFilter,
          doctor: doctorFilter,
          department: departmentFilter,
          startDate,
          endDate,
        });
        if (res.success) setData(res.data.appointments);
      } else if (activeTab === 'REVENUE') {
        const res = await fetchRevenueReports({
          search,
          status: statusFilter,
          startDate,
          endDate,
        });
        if (res.success) setData(res.data.bills);
      } else if (activeTab === 'PATIENTS') {
        const res = await fetchPatientReports({ search });
        if (res.success) setData(res.data.patients);
      } else if (activeTab === 'DOCTORS') {
        const res = await fetchDoctorReports({ search, department: departmentFilter });
        if (res.success) setData(res.data.doctors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, statusFilter, doctorFilter, departmentFilter, startDate, endDate]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const handleExportCSV = () => {
    if (data.length === 0) return;

    if (activeTab === 'APPOINTMENTS') {
      const headers = ['Appointment ID', 'Patient Name', 'Patient Email', 'Doctor Name', 'Date', 'Time Slot', 'Status'];
      const rows = data.map((apt) => [
        apt.id,
        apt.patient?.user.fullName || '',
        apt.patient?.user.email || '',
        apt.doctor?.user.fullName || '',
        new Date(apt.appointmentDate).toLocaleDateString(),
        apt.appointmentTime,
        apt.status,
      ]);
      exportToCSV('Appointments_Report', headers, rows);
    } else if (activeTab === 'REVENUE') {
      const headers = ['Invoice Number', 'Patient Name', 'Doctor Name', 'Billing Date', 'Amount ($)', 'Payment Status', 'Payment Method'];
      const rows = data.map((bill) => [
        bill.invoiceNumber,
        bill.patient?.user.fullName || '',
        bill.appointment?.doctor?.user.fullName || '',
        new Date(bill.generatedAt).toLocaleDateString(),
        bill.amount,
        bill.paymentStatus,
        bill.paymentMethod || 'N/A',
      ]);
      exportToCSV('Revenue_Report', headers, rows);
    } else if (activeTab === 'PATIENTS') {
      const headers = ['Patient ID', 'Full Name', 'Email', 'Phone', 'Total Appointments', 'Medical Records', 'Bills'];
      const rows = data.map((p) => [
        p.id,
        p.user.fullName,
        p.user.email,
        p.user.phoneNumber || 'N/A',
        p._count?.appointments || 0,
        p._count?.medicalRecords || 0,
        p._count?.bills || 0,
      ]);
      exportToCSV('Patients_Report', headers, rows);
    } else if (activeTab === 'DOCTORS') {
      const headers = ['Doctor ID', 'Full Name', 'Department', 'Email', 'Phone', 'Consultations Handled', 'Prescriptions Issued'];
      const rows = data.map((d) => [
        d.id,
        d.user.fullName,
        d.department,
        d.user.email,
        d.user.phoneNumber || 'N/A',
        d._count?.appointments || 0,
        d._count?.prescriptions || 0,
      ]);
      exportToCSV('Doctors_Report', headers, rows);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white">System Reports Hub</h1>
            <p className="text-sm text-slate-400 mt-1">
              Generate, filter, and export system audit reports to CSV format for financial and clinical operations
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={data.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
          >
            <Download className="h-4 w-4" /> Export Report (CSV)
          </button>
        </div>

        {/* Report Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {[
            { id: 'APPOINTMENTS', label: 'Appointments Report', icon: Calendar },
            { id: 'REVENUE', label: 'Revenue Statement Report', icon: DollarSign },
            { id: 'PATIENTS', label: 'Patient Registry Report', icon: Users },
            { id: 'DOCTORS', label: 'Medical Staff Report', icon: Stethoscope },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearch('');
                  setStatusFilter('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(activeTab === 'APPOINTMENTS' || activeTab === 'REVENUE') && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {activeTab === 'APPOINTMENTS' ? (
                <>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </>
              ) : (
                <>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partially Paid</option>
                  <option value="REFUNDED">Refunded</option>
                </>
              )}
            </select>
          )}

          {(activeTab === 'APPOINTMENTS' || activeTab === 'REVENUE') && (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Report Data Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm">Fetching System Report Data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Report Entries</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No entries matched your specified report filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  {activeTab === 'APPOINTMENTS' && (
                    <tr>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Physician</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  )}
                  {activeTab === 'REVENUE' && (
                    <tr>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Patient Name</th>
                      <th className="px-6 py-4">Billing Date</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Payment Method</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  )}
                  {activeTab === 'PATIENTS' && (
                    <tr>
                      <th className="px-6 py-4">Patient Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Total Appointments</th>
                      <th className="px-6 py-4">EHR Records</th>
                    </tr>
                  )}
                  {activeTab === 'DOCTORS' && (
                    <tr>
                      <th className="px-6 py-4">Physician Name</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Consultations</th>
                      <th className="px-6 py-4">Prescriptions Written</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {activeTab === 'APPOINTMENTS' &&
                    data.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono">
                          {new Date(apt.appointmentDate).toLocaleDateString()} {apt.appointmentTime}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">{apt.patient?.user.fullName}</td>
                        <td className="px-6 py-4">Dr. {apt.doctor?.user.fullName}</td>
                        <td className="px-6 py-4 text-slate-400">{apt.doctor?.department || 'Staff'}</td>
                        <td className="px-6 py-4 font-bold">{apt.status}</td>
                      </tr>
                    ))}

                  {activeTab === 'REVENUE' &&
                    data.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white">#{bill.invoiceNumber}</td>
                        <td className="px-6 py-4 font-semibold text-white">{bill.patient?.user.fullName}</td>
                        <td className="px-6 py-4 font-mono">{new Date(bill.generatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-emerald-400">${bill.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">{bill.paymentMethod || 'N/A'}</td>
                        <td className="px-6 py-4 font-bold">{bill.paymentStatus}</td>
                      </tr>
                    ))}

                  {activeTab === 'PATIENTS' &&
                    data.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">{p.user.fullName}</td>
                        <td className="px-6 py-4">{p.user.email}</td>
                        <td className="px-6 py-4 text-slate-400">{p.user.phoneNumber || 'N/A'}</td>
                        <td className="px-6 py-4 font-bold text-blue-400">{p._count?.appointments || 0}</td>
                        <td className="px-6 py-4 font-bold text-cyan-400">{p._count?.medicalRecords || 0}</td>
                      </tr>
                    ))}

                  {activeTab === 'DOCTORS' &&
                    data.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">Dr. {d.user.fullName}</td>
                        <td className="px-6 py-4 text-cyan-400 font-medium">{d.department}</td>
                        <td className="px-6 py-4">{d.user.email}</td>
                        <td className="px-6 py-4 font-bold text-blue-400">{d._count?.appointments || 0}</td>
                        <td className="px-6 py-4 font-bold text-emerald-400">{d._count?.prescriptions || 0}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
