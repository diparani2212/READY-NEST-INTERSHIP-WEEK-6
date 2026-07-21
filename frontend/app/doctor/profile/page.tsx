'use client';

import React, { useEffect, useState } from 'react';
import { DoctorLayout } from '@/components/DoctorLayout';
import {
  User,
  Phone,
  Award,
  Briefcase,
  DollarSign,
  MapPin,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Stethoscope,
} from 'lucide-react';
import { fetchDoctorProfile, updateDoctorProfileApi, DoctorProfile } from '@/lib/doctorPortal';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    qualification: '',
    experience: 0,
    consultationFee: 0,
    department: '',
    specialization: '',
    availabilityStatus: true,
    address: '',
    bio: '',
    consultationDuration: 30,
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchDoctorProfile()
      .then((res) => {
        if (res.success && res.data.profile) {
          const p = res.data.profile;
          setProfile(p);
          setFormData({
            phoneNumber: p.phoneNumber || '',
            qualification: p.qualification || '',
            experience: p.experience || 0,
            consultationFee: p.consultationFee || 0,
            department: p.department || '',
            specialization: p.specialization || '',
            availabilityStatus: p.availabilityStatus,
            address: p.address || '',
            bio: p.bio || '',
            consultationDuration: p.consultationDuration || 30,
          });
        }
      })
      .catch((err) => addToast('error', err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateDoctorProfileApi(formData);
      if (res.success) {
        addToast('success', 'Practice parameters updated successfully!');
      } else {
        addToast('error', res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

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

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Doctor Profile Settings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Update your medical qualifications, department specialization, consultation fee, and clinical schedules
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            {/* Identity & Practice Info */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Stethoscope className="h-5 w-5 text-cyan-400" /> Practice Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Full Name <span className="text-xs text-slate-500">(Read only - contact Admin to change)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.fullName || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Email Address <span className="text-xs text-slate-500">(Read only)</span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Medical License Number */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    License Number <span className="text-xs text-slate-500">(Read only)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.licenseNumber || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Professional Qualifications</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="MD, MBBS, PhD..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Medical Specialization</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Consultation Billing & Schedule Config */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <DollarSign className="h-5 w-5 text-emerald-400" /> Appointment Configurations
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Consultation Fee */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-emerald-400"
                  />
                </div>

                {/* Consultation Duration */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Slot Duration</label>
                  <select
                    value={formData.consultationDuration}
                    onChange={(e) => setFormData({ ...formData, consultationDuration: parseInt(e.target.value) || 30 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>

                {/* Availability Checklist */}
                <div className="flex flex-col justify-end pb-3 sm:pl-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="availabilityStatus"
                      type="checkbox"
                      checked={formData.availabilityStatus}
                      onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.checked })}
                      className="h-4 w-4 text-cyan-600 bg-slate-950 border-slate-700 rounded cursor-pointer"
                    />
                    <label htmlFor="availabilityStatus" className="text-slate-300 font-medium cursor-pointer">
                      Available for bookings
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Bio details */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <MapPin className="h-5 w-5 text-purple-400" /> Address & Professional Biography
              </h2>

              <div className="space-y-4">
                {/* Clinical Address */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Clinic Address / Office Room</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Building A, Room 402 - Main St..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Professional Biography */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Biography / About</label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Provide professional details, research interests, or patient guidelines..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DoctorLayout>
  );
}
