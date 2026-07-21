'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  DollarSign,
  Briefcase,
  Award,
  FileText,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import {
  fetchDoctors,
  createDoctorApi,
  updateDoctorApi,
  deleteDoctorApi,
  Doctor,
  CreateDoctorParams,
  UpdateDoctorParams,
} from '@/lib/doctors';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const [search, setSearch] = useState('');
  const [availableFilter, setAvailableFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    department: '',
    specialization: '',
    qualification: '',
    experience: 0,
    consultationFee: 0,
    licenseNumber: '',
    availabilityStatus: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch Doctors List
  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDoctors({
        page,
        limit,
        search,
        available: availableFilter,
        department: departmentFilter,
      });

      if (res.success) {
        setDoctors(res.data.doctors);
        setTotalPages(res.data.pagination.totalPages);
        setTotalDoctors(res.data.pagination.total);
      } else {
        addToast('error', res.message || 'Failed to load doctors');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, availableFilter, departmentFilter]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Open Create Modal
  const openAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      department: '',
      specialization: '',
      qualification: '',
      experience: 1,
      consultationFee: 50,
      licenseNumber: '',
      availabilityStatus: true,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      fullName: doctor.user.fullName,
      email: doctor.user.email,
      phoneNumber: doctor.user.phoneNumber || '',
      password: '', // blank unless updating
      department: doctor.department,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      licenseNumber: doctor.licenseNumber,
      availabilityStatus: doctor.availabilityStatus,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const openViewModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsViewModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteModalOpen(true);
  };

  // Submit Create Doctor
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const res = await createDoctorApi(formData as CreateDoctorParams);
      if (res.success) {
        addToast('success', `Dr. ${formData.fullName} onboarded successfully!`);
        setIsAddModalOpen(false);
        loadDoctors();
      } else {
        addToast('error', res.message || 'Failed to create doctor');
        if (res.errors) setFormErrors(res.errors);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error creating doctor');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Update Doctor
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setFormErrors({});
    setSubmitting(true);

    try {
      const updatePayload: UpdateDoctorParams = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: formData.experience,
        consultationFee: formData.consultationFee,
        licenseNumber: formData.licenseNumber,
        availabilityStatus: formData.availabilityStatus,
      };

      if (formData.password && formData.password.trim() !== '') {
        updatePayload.password = formData.password;
      }

      const res = await updateDoctorApi(selectedDoctor.id, updatePayload);
      if (res.success) {
        addToast('success', `Dr. ${formData.fullName} updated successfully!`);
        setIsEditModalOpen(false);
        loadDoctors();
      } else {
        addToast('error', res.message || 'Failed to update doctor');
        if (res.errors) setFormErrors(res.errors);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error updating doctor');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Doctor
  const handleDeleteConfirm = async () => {
    if (!selectedDoctor) return;
    setSubmitting(true);

    try {
      const res = await deleteDoctorApi(selectedDoctor.id);
      if (res.success) {
        addToast('success', `Doctor account deleted successfully.`);
        setIsDeleteModalOpen(false);
        loadDoctors();
      } else {
        addToast('error', res.message || 'Failed to delete doctor');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error deleting doctor');
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

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Doctor Management</h1>
            <p className="text-sm text-slate-400 mt-1">
              Onboard medical practitioners, manage departments, and update availability ({totalDoctors} Total Doctors)
            </p>
          </div>

          <button
            onClick={openAddModal}
            id="add-doctor-button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New Doctor
          </button>
        </div>

        {/* Filters & Search Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, department, license..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Availability Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
            <select
              value={availableFilter}
              onChange={(e) => {
                setAvailableFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Availability</option>
              <option value="true">Available Only</option>
              <option value="false">Unavailable Only</option>
            </select>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm">Loading Doctor Records...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4 border border-slate-700">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Doctors Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                No medical doctors match your search or filter criteria. Onboard new doctors to get started.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Doctor
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Exp. & Fee</th>
                    <th className="px-6 py-4">License No.</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {doctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Doctor Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm">
                            {doctor.user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              Dr. {doctor.user.fullName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {doctor.user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60">
                          {doctor.department}
                        </span>
                      </td>

                      {/* Specialization */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                        {doctor.specialization}
                      </td>

                      {/* Experience & Fee */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="font-semibold text-white">
                          ${doctor.consultationFee} / consult
                        </div>
                        <div className="text-slate-400">
                          {doctor.experience} yrs experience
                        </div>
                      </td>

                      {/* License */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                        {doctor.licenseNumber}
                      </td>

                      {/* Availability Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            doctor.availabilityStatus
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                              : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              doctor.availabilityStatus
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          {doctor.availabilityStatus ? 'Available' : 'Unavailable'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openViewModal(doctor)}
                            title="View Details"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(doctor)}
                            title="Edit Doctor"
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-950/60 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(doctor)}
                            title="Delete Doctor"
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && totalDoctors > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Showing page <span className="font-bold text-white">{page}</span> of{' '}
                <span className="font-bold text-white">{totalPages}</span> ({totalDoctors} Doctors)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE DOCTOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add New Doctor</h2>
                  <p className="text-xs text-slate-400">Onboard a new medical practitioner profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.fullName && <p className="text-red-400 mt-1">{formErrors.fullName[0]}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@hospital.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.email && <p className="text-red-400 mt-1">{formErrors.email[0]}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.password && <p className="text-red-400 mt-1">{formErrors.password[0]}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Cardiology, Pediatrics, Neurology..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.department && <p className="text-red-400 mt-1">{formErrors.department[0]}</p>}
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Interventional Cardiologist"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.specialization && <p className="text-red-400 mt-1">{formErrors.specialization[0]}</p>}
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Qualification *</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="MD, MBBS, FACC"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.qualification && <p className="text-red-400 mt-1">{formErrors.qualification[0]}</p>}
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Medical License Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="MED-89102-CA"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  {formErrors.licenseNumber && <p className="text-red-400 mt-1">{formErrors.licenseNumber[0]}</p>}
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Years of Experience *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Consultation Fee ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="availabilityStatus"
                  type="checkbox"
                  checked={formData.availabilityStatus}
                  onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.checked })}
                  className="h-4 w-4 text-blue-600 bg-slate-950 border-slate-700 rounded cursor-pointer"
                />
                <label htmlFor="availabilityStatus" className="text-slate-300 cursor-pointer">
                  Doctor is currently Available for consultations
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DOCTOR MODAL */}
      {isEditModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Dr. {selectedDoctor.user.fullName}</h2>
                  <p className="text-xs text-slate-400">Update medical qualifications and practice parameters</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Password (Optional) */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Qualification</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">License Number</label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Fee */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="editAvailabilityStatus"
                  type="checkbox"
                  checked={formData.availabilityStatus}
                  onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.checked })}
                  className="h-4 w-4 text-blue-600 bg-slate-950 border-slate-700 rounded cursor-pointer"
                />
                <label htmlFor="editAvailabilityStatus" className="text-slate-300 cursor-pointer">
                  Doctor is currently Available for consultations
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DOCTOR DETAILS MODAL */}
      {isViewModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg">
                  {selectedDoctor.user.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Dr. {selectedDoctor.user.fullName}</h3>
                  <p className="text-xs text-blue-400">{selectedDoctor.specialization}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Department:</span>
                  <p className="font-semibold text-white">{selectedDoctor.department}</p>
                </div>
                <div>
                  <span className="text-slate-500">Qualification:</span>
                  <p className="font-semibold text-white">{selectedDoctor.qualification}</p>
                </div>
                <div>
                  <span className="text-slate-500">Experience:</span>
                  <p className="font-semibold text-white">{selectedDoctor.experience} Years</p>
                </div>
                <div>
                  <span className="text-slate-500">Consultation Fee:</span>
                  <p className="font-semibold text-emerald-400">${selectedDoctor.consultationFee}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div>
                  <span className="text-slate-500">Medical License:</span>
                  <p className="font-mono text-white">{selectedDoctor.licenseNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">Email Address:</span>
                  <p className="text-white">{selectedDoctor.user.email}</p>
                </div>
                <div>
                  <span className="text-slate-500">Phone Number:</span>
                  <p className="text-white">{selectedDoctor.user.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Current Status:</span>
                  <p className="font-semibold text-white">
                    {selectedDoctor.availabilityStatus ? 'Available for Consultations' : 'Currently Unavailable'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/80 text-red-400 border border-red-800 mb-4">
              <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Doctor Account?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to permanently delete <strong className="text-white">Dr. {selectedDoctor.user.fullName}</strong>? This will remove their doctor profile and user credentials.
            </p>

            <div className="flex justify-center gap-3 text-xs">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 disabled:opacity-50 shadow-lg shadow-red-600/30"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
