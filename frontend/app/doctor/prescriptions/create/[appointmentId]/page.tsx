'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DoctorLayout } from '@/components/DoctorLayout';
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Pill,
  Heart,
  Stethoscope,
  X,
} from 'lucide-react';
import { fetchDoctorAppointmentById } from '@/lib/doctorPortal';
import { createPrescriptionApi, createMedicalRecordApi, MedicineEntry } from '@/lib/clinical';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function CreatePrescriptionPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.appointmentId;
  const router = useRouter();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [dosageSummary, setDosageSummary] = useState('Take as directed on prescription list');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Medicines List State
  const [medicines, setMedicines] = useState<MedicineEntry[]>([
    { name: '', dosage: '1 tablet', frequency: 'Twice daily after meals', duration: '5 days' },
  ]);

  // Medical Record Form State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [allergies, setAllergies] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80 mmHg');
  const [pulseRate, setPulseRate] = useState('72 bpm');
  const [bodyTemperature, setBodyTemperature] = useState('98.6 °F');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchDoctorAppointmentById(appointmentId)
      .then((res) => {
        if (res.success && res.data.appointment) {
          const apt = res.data.appointment;
          setAppointment(apt);
          if (apt.reason) {
            setChiefComplaint(apt.reason);
          }
        } else {
          setError(res.message || 'Appointment not found');
        }
      })
      .catch((err) => setError(err.message || 'Error loading appointment details'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const handleMedicineChange = (index: number, field: keyof MedicineEntry, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!diagnosis.trim()) {
      setError('Please provide a clinical diagnosis.');
      return;
    }

    if (medicines.some((m) => !m.name.trim())) {
      setError('Please fill out the name for all prescribed medicines.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create Prescription
      const prescriptionRes = await createPrescriptionApi({
        appointmentId,
        patientId: appointment.patientId,
        diagnosis,
        medicines: JSON.stringify(medicines),
        dosage: dosageSummary,
        instructions,
        followUpDate: followUpDate || undefined,
      });

      if (!prescriptionRes.success) {
        throw new Error(prescriptionRes.message || 'Failed to create prescription');
      }

      // 2. Create Medical Record
      await createMedicalRecordApi({
        patientId: appointment.patientId,
        appointmentId,
        chiefComplaint: chiefComplaint || 'Routine Medical Visit',
        diagnosis,
        allergies: allergies || undefined,
        treatment: treatment || undefined,
        notes: notes || undefined,
        bloodPressure: bloodPressure || undefined,
        pulseRate: pulseRate || undefined,
        bodyTemperature: bodyTemperature || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
      }).catch((err) => console.warn('Medical record creation warning:', err));

      addToast('success', 'Prescription and Medical Record charted successfully!');
      setTimeout(() => {
        router.push('/doctor/prescriptions');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DoctorLayout>
      {/* Toasts */}
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
            href="/doctor/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Appointments
          </Link>
        </div>

        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Create Clinical Prescription</h1>
          <p className="text-sm text-slate-400 mt-1">
            Issue electronic Rx medications and record clinical vitals for completed patient visits
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-950/80 border border-red-800 p-4 text-red-200">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Header Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Completed Visit Info
                </span>
                <h3 className="font-bold text-white text-lg">{appointment?.patient.user.fullName}</h3>
                <p className="text-xs text-slate-400">{appointment?.patient.user.email}</p>
              </div>
              <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>Date: <strong>{new Date(appointment?.appointmentDate).toLocaleDateString()}</strong></div>
                <div>Slot: <strong>{appointment?.appointmentTime}</strong></div>
              </div>
            </div>

            {/* Diagnosis & Rx Info Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Stethoscope className="h-5 w-5 text-cyan-400" /> Diagnosis & Clinical Guidance
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Bronchitis, Essential Hypertension..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Instructions & Guidance</label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Dietary instructions, rest recommendations, warning signs..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">General Dosage Summary</label>
                    <input
                      type="text"
                      value={dosageSummary}
                      onChange={(e) => setDosageSummary(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Follow-up Date (Optional)</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Medicines List Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Pill className="h-5 w-5 text-emerald-400" /> Prescribed Medications
                </h2>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 rounded-xl text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" /> Add Medicine
                </button>
              </div>

              <div className="space-y-3">
                {medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] text-slate-500 mb-0.5">Medicine Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amoxicillin 500mg"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-500 mb-0.5">Dosage</label>
                      <input
                        type="text"
                        placeholder="1 cap"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-slate-500 mb-0.5">Frequency</label>
                      <input
                        type="text"
                        placeholder="Twice daily"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-500 mb-0.5">Duration</label>
                      <input
                        type="text"
                        placeholder="5 days"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        disabled={medicines.length === 1}
                        className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Record Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Heart className="h-5 w-5 text-red-400" /> Patient Medical Chart Vitals
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Chief Complaint</label>
                  <input
                    type="text"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pulse Rate</label>
                  <input
                    type="text"
                    value={pulseRate}
                    onChange={(e) => setPulseRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Body Temperature</label>
                  <input
                    type="text"
                    value={bodyTemperature}
                    onChange={(e) => setBodyTemperature(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Pollen..."
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Treatment Plan</label>
                  <input
                    type="text"
                    placeholder="e.g. Nebulization, Rest..."
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 disabled:opacity-50 transition-all text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Saving Rx Record...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Issue Prescription & Save Chart
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
