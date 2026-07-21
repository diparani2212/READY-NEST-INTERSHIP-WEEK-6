'use client';

import React, { useEffect, useState } from 'react';
import { PatientLayout } from '@/components/PatientLayout';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Ruler,
  Weight as WeightIcon,
  MapPin,
  AlertTriangle,
  Save,
  Loader2,
  Upload,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { fetchPatientProfile, updatePatientProfileApi, PatientProfile } from '@/lib/patient';
import { uploadProfileImageApi, removeProfileImageApi } from '@/lib/files';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '' as 'MALE' | 'FEMALE' | 'OTHER' | '',
    bloodGroup: '',
    height: '',
    weight: '',
    address: '',
    emergencyContact: '',
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleImageFile = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'File size exceeds 10MB limit');
      return;
    }
    setUploadingImage(true);
    try {
      const res = await uploadProfileImageApi(file);
      if (res.success && res.data.profileImage) {
        setProfileImage(res.data.profileImage);
        addToast('success', 'Profile avatar updated!');
      } else {
        addToast('error', res.message || 'Failed to upload avatar');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error uploading profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setUploadingImage(true);
    try {
      const res = await removeProfileImageApi();
      if (res.success) {
        setProfileImage(null);
        addToast('success', 'Profile photo removed');
      } else {
        addToast('error', res.message || 'Failed to remove photo');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error removing photo');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    fetchPatientProfile()
      .then((res) => {
        if (res.success && res.data.profile) {
          const p = res.data.profile;
          setProfile(p);
          if (p.profileImage) setProfileImage(p.profileImage);
          setFormData({
            fullName: p.fullName || '',
            phoneNumber: p.phoneNumber || '',
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
            gender: p.gender || '',
            bloodGroup: p.bloodGroup || '',
            height: p.height !== null && p.height !== undefined ? String(p.height) : '',
            weight: p.weight !== null && p.weight !== undefined ? String(p.weight) : '',
            address: p.address || '',
            emergencyContact: p.emergencyContact || '',
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
      const payload: any = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        bloodGroup: formData.bloodGroup,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
      };

      const res = await updatePatientProfileApi(payload);
      if (res.success) {
        addToast('success', 'Profile updated successfully!');
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

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Patient Health Profile</h1>
          <p className="text-sm text-slate-400 mt-1">
            Keep your personal contact info, medical details, and emergency contacts up to date
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            {/* Personal Information Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="h-5 w-5 text-blue-400" /> Personal Details & Profile Avatar
              </h2>

              {/* Profile Avatar & Drag & Drop Uploader */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="relative group shrink-0">
                  <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-blue-500/60 flex items-center justify-center overflow-hidden shadow-xl">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      className="absolute -top-1 -right-1 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-md transition-all"
                      title="Remove Avatar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      dragActive ? 'border-blue-500 bg-blue-950/20' : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center gap-1">
                      {uploadingImage ? (
                        <div className="flex items-center gap-2 text-blue-400 text-xs">
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading image (Max 10MB)...
                        </div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-blue-400" />
                          <p className="text-xs font-semibold text-white">
                            Drag & drop profile picture or <span className="text-blue-400 underline">browse</span>
                          </p>
                          <span className="text-[10px] text-slate-400">JPG, PNG, WEBP up to 10 MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email (Read Only) */}
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
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vitals & Medical Information Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Heart className="h-5 w-5 text-red-400" /> Vitals & Health Metrics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Blood Group */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    placeholder="e.g. O+, A+, AB-"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="e.g. 175"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g. 70"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Address & Emergency Contacts Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <MapPin className="h-5 w-5 text-emerald-400" /> Address & Emergency Contacts
              </h2>

              <div className="space-y-4">
                {/* Address */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Residential Address</label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street Address, City, State, ZIP..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Emergency Contact Info</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Name & Relationship - Phone (e.g., Mary Doe (Spouse) +1 555-0192)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Save Health Profile
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </PatientLayout>
  );
}
