const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface DoctorProfile {
  id: string;
  doctorId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  department: string;
  licenseNumber: string;
  availabilityStatus: boolean;
  address?: string | null;
  bio?: string | null;
  consultationDuration: number;
  createdAt: string;
}

export interface UpdateDoctorProfileParams {
  phoneNumber?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  department?: string;
  specialization?: string;
  availabilityStatus?: boolean;
  address?: string;
  bio?: string;
  consultationDuration?: number;
}

export interface DoctorAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  patient: {
    id: string;
    userId: string;
    dateOfBirth?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    user: {
      fullName: string;
      email: string;
      phoneNumber?: string | null;
    };
  };
}

export interface DoctorDashboardData {
  stats: {
    todayCount: number;
    upcomingCount: number;
    completedCount: number;
    pendingCount: number;
  };
  recentAppointments: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    patient: {
      user: {
        fullName: string;
        email: string;
      };
    };
  }[];
}

export interface PatientDetails {
  patient: {
    id: string;
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
  };
  appointmentHistory: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string | null;
    status: string;
    notes?: string | null;
  }[];
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse response' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchDoctorProfile() {
  const res = await fetch(`${API_BASE_URL}/doctor/profile`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function updateDoctorProfileApi(data: UpdateDoctorProfileParams) {
  const res = await fetch(`${API_BASE_URL}/doctor/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorDashboard() {
  const res = await fetch(`${API_BASE_URL}/doctor/dashboard`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorAppointments(params: {
  status?: string;
  filter?: 'today' | 'upcoming' | 'all';
  search?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.filter) query.append('filter', params.filter);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE_URL}/doctor/appointments?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorAppointmentById(id: string) {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function confirmAppointmentApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/confirm`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function rejectAppointmentApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function completeAppointmentApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/complete`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorPatientDetails(id: string) {
  const res = await fetch(`${API_BASE_URL}/doctor/patients/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
