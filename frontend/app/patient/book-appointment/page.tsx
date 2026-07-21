'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PatientLayout } from '@/components/PatientLayout';
import {
  CalendarPlus,
  Stethoscope,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import {
  fetchPublicDoctors,
  createAppointmentApi,
  PublicDoctor,
} from '@/lib/patient';

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

function BookAppointmentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default minimum date = today
  const minDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchPublicDoctors()
      .then((res) => {
        if (res.success) {
          // Filter doctors that are available
          const availableDocs = res.data.doctors.filter((d: PublicDoctor) => d.availabilityStatus);
          setDoctors(availableDocs);

          if (!selectedDoctorId && availableDocs.length > 0) {
            setSelectedDoctorId(availableDocs[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingDoctors(false));
  }, [selectedDoctorId]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDoctorId) {
      setError('Please select a doctor for your appointment.');
      return;
    }

    if (!appointmentDate) {
      setError('Please select an appointment date.');
      return;
    }

    if (!appointmentTime) {
      setError('Please select a time slot.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await createAppointmentApi({
        doctorId: selectedDoctorId,
        appointmentDate,
        appointmentTime,
        reason,
      });

      if (res.success) {
        router.push('/patient/appointments');
      } else {
        setError(res.message || 'Failed to book appointment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating appointment. Slot may be conflicted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-3xl font-extrabold text-white">Book Doctor Appointment</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select your physician, pick a suitable date and time slot, and confirm your booking
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-950/80 border border-red-800 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingDoctors ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {/* Select Doctor Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
            <label className="block font-bold text-white text-base">Select Doctor</label>

            {doctors.length === 0 ? (
              <p className="text-xs text-amber-400">
                No available doctors are currently accepting appointments. Please check back later.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      selectedDoctorId === doc.id
                        ? 'bg-blue-950/80 border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shrink-0">
                      {doc.user.fullName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-white truncate">Dr. {doc.user.fullName}</p>
                      <p className="text-xs text-blue-400 truncate">{doc.department} • ${doc.consultationFee}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Doctor Info Banner */}
          {selectedDoctor && (
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Selected Specialist:</span>
                <p className="font-bold text-white text-sm">Dr. {selectedDoctor.user.fullName}</p>
                <p className="text-slate-400">{selectedDoctor.specialization} ({selectedDoctor.experience} yrs exp)</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Consultation Fee:</span>
                <p className="font-extrabold text-emerald-400 text-base">${selectedDoctor.consultationFee}</p>
              </div>
            </div>
          )}

          {/* Select Date & Time Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4">
            <h2 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              Appointment Date & Time
            </h2>

            <div className="space-y-4">
              {/* Date Input */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Appointment Date *</label>
                <input
                  type="date"
                  min={minDate}
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Select Available Time Slot *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setAppointmentTime(slot)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                        appointmentTime === slot
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-3">
            <label className="block font-bold text-white text-base">Reason for Visit (Optional)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe symptoms, medical concerns, or consultation reason..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || doctors.length === 0}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition-all text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Confirming Booking...
                </>
              ) : (
                'Confirm Appointment Booking'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function PatientBookAppointmentPage() {
  return (
    <PatientLayout>
      <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading booking portal...</div>}>
        <BookAppointmentForm />
      </Suspense>
    </PatientLayout>
  );
}
