'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PatientLayout } from '@/components/PatientLayout';
import {
  Stethoscope,
  Search,
  Filter,
  ArrowUpDown,
  CalendarPlus,
  Loader2,
  DollarSign,
  Briefcase,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { fetchPublicDoctors, PublicDoctor } from '@/lib/patient';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function PatientDoctorsPage() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPublicDoctors({
        search,
        department,
        specialization,
        sortBy,
      });

      if (res.success) {
        setDoctors(res.data.doctors);
        if (res.data.metadata) {
          setAvailableDepartments(res.data.metadata.departments || []);
          setAvailableSpecializations(res.data.metadata.specializations || []);
        }
      } else {
        addToast('error', res.message || 'Failed to fetch doctor directory');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  }, [search, department, specialization, sortBy]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  return (
    <PatientLayout>
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
        {/* Title */}
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Find Hospital Doctors</h1>
          <p className="text-sm text-slate-400 mt-1">
            Search specialist physicians, compare consultation fees and experience, and book consultations
          </p>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctor, department..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filter by Department */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Departments</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Filter by Specialization */}
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Specializations</option>
              {availableSpecializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="createdAt">Newest First</option>
              <option value="experience_desc">Most Experienced</option>
              <option value="fee_asc">Consultation Fee: Low to High</option>
              <option value="fee_desc">Consultation Fee: High to Low</option>
            </select>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm">Fetching Medical Specialists...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 py-16 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-slate-700">
              <Stethoscope className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Doctors Available</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No medical specialists matched your selected filters or search terms. Try clearing filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-6 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
              >
                <div>
                  {/* Doctor Header & Avatar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-blue-500/20">
                        {doctor.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                          Dr. {doctor.user.fullName}
                        </h3>
                        <p className="text-xs text-blue-400 font-medium">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        doctor.availabilityStatus
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {doctor.availabilityStatus ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Badges & Details */}
                  <div className="space-y-2.5 text-xs text-slate-300 mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-blue-400" /> Department:
                      </span>
                      <span className="font-semibold text-white">{doctor.department}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-purple-400" /> Qualification:
                      </span>
                      <span className="font-medium text-slate-200">{doctor.qualification}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5 text-cyan-400" /> Experience:
                      </span>
                      <span className="font-semibold text-white">{doctor.experience} Years</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Consultation Fee:
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        ${doctor.consultationFee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Book Action */}
                <div>
                  <Link
                    href={`/patient/book-appointment?doctorId=${doctor.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                      doctor.availabilityStatus
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    {doctor.availabilityStatus ? 'Book Appointment' : 'Doctor Unavailable'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
