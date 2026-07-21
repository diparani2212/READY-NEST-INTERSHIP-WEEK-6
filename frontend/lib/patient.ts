const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PatientProfile {
  id: string;
  patientId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  dateOfBirth?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  bloodGroup?: string | null;
  height?: number | null;
  weight?: number | null;
  address?: string | null;
  emergencyContact?: string | null;
  createdAt?: string;
}

export interface UpdatePatientProfileParams {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  height?: number;
  weight?: number;
  address?: string;
  emergencyContact?: string;
}

export interface PublicDoctor {
  id: string;
  userId: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  department: string;
  licenseNumber: string;
  availabilityStatus: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
  };
}

export interface CreateAppointmentParams {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  doctor: PublicDoctor;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse response' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchPatientProfile() {
  const res = await fetch(`${API_BASE_URL}/patient/profile`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function updatePatientProfileApi(data: UpdatePatientProfileParams) {
  const res = await fetch(`${API_BASE_URL}/patient/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchPublicDoctors(params: {
  search?: string;
  department?: string;
  specialization?: string;
  sortBy?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.department) query.append('department', params.department);
  if (params.specialization) query.append('specialization', params.specialization);
  if (params.sortBy) query.append('sortBy', params.sortBy);

  const res = await fetch(`${API_BASE_URL}/doctors?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchPublicDoctorById(id: string) {
  const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function createAppointmentApi(data: CreateAppointmentParams) {
  const res = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchMyAppointments(status?: string) {
  const query = status ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE_URL}/appointments/my${query}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function cancelAppointmentApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
