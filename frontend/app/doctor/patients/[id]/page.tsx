'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { DoctorLayout } from '@/components/DoctorLayout';
import {
  ArrowLeft,
  User,
  Heart,
  Calendar,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Ruler,
  Weight as WeightIcon,
  ShieldCheck,
} from 'lucide-react';
import { fetchDoctorPatientDetails, PatientDetails } from '@/lib/doctorPortal';

export default function DoctorPatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;

  const [data, setData] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctorPatientDetails(patientId)
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to fetch patient chart.');
        }
      })
      .catch((err) => setError(err.message || 'Error connecting to server'))
      .finally(() => setLoading(false));
  }, [patientId]);

  const getAge = (dobString?: string | null) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-6 text-sm">
        {/* Back Link */}
        <div>
          <Link
            href="/doctor/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Queue
          </Link>
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
        ) : data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Demographics & Medical Profile */}
            <div className="lg:col-span-1 space-y-6">
              {/* Demographics Card */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-white text-3xl mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                  {data.patient.fullName.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-white">Dr. {data.patient.fullName} Patient Profile</h2>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-400">
                  Patient ID: {data.patient.id.substring(0, 8)}...
                </span>

                <div className="mt-6 border-t border-slate-800 pt-4 text-left space-y-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="truncate">{data.patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>{data.patient.phoneNumber || 'No phone recorded'}</span>
                  </div>
                  {data.patient.address && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                      <span>{data.patient.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-4">
                <h3 className="font-bold text-white text-sm border-b border-slate-855 pb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-400" /> Health Vitals
                </h3>
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl">
                    <span className="text-slate-500">Gender</span>
                    <p className="font-bold text-white mt-0.5">
                      {data.patient.gender ? data.patient.gender : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl">
                    <span className="text-slate-500">Age</span>
                    <p className="font-bold text-white mt-0.5">
                      {getAge(data.patient.dateOfBirth)} yrs
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl">
                    <span className="text-slate-500">Blood Group</span>
                    <p className="font-bold text-red-400 mt-0.5">
                      {data.patient.bloodGroup || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl">
                    <span className="text-slate-500">Height</span>
                    <p className="font-bold text-white mt-0.5">
                      {data.patient.height ? `${data.patient.height} cm` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl col-span-2">
                    <span className="text-slate-500">Weight</span>
                    <p className="font-bold text-white mt-0.5">
                      {data.patient.weight ? `${data.patient.weight} kg` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-2">
                <h3 className="font-bold text-white text-sm border-b border-slate-855 pb-2">
                  Emergency Contact
                </h3>
                <p className="text-slate-300 font-medium">
                  {data.patient.emergencyContact || 'No emergency contact registered'}
                </p>
              </div>
            </div>

            {/* Right Column: Appointment History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
                <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cyan-400" /> Patient Appointment History
                </h3>

                {data.appointmentHistory.length === 0 ? (
                  <p className="py-8 text-center text-slate-500 text-xs">
                    This patient has no past consultation history with you.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800 text-xs mt-4">
                    {data.appointmentHistory.map((history) => (
                      <div key={history.id} className="py-4 flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-100">
                            {new Date(history.appointmentDate).toLocaleDateString()} at {history.appointmentTime}
                          </div>
                          {history.reason && (
                            <p className="text-slate-400 mt-1">Reason: {history.reason}</p>
                          )}
                          {history.notes && (
                            <p className="text-slate-300 mt-1 bg-slate-950 p-2 rounded border border-slate-800">
                              Notes: {history.notes}
                            </p>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            history.status === 'COMPLETED'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : history.status === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {history.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
