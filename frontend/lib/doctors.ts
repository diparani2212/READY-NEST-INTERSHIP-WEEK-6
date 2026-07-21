const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface DoctorUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  department: string;
  licenseNumber: string;
  availabilityStatus: boolean;
  createdAt: string;
  updatedAt: string;
  user: DoctorUser;
}

export interface FetchDoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  available?: string;
}

export interface CreateDoctorParams {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  department: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  licenseNumber: string;
  availabilityStatus?: boolean;
}

export interface UpdateDoctorParams {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  department?: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  licenseNumber?: string;
  availabilityStatus?: boolean;
  isActive?: boolean;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse server response' }));
  if (!res.ok) {
    throw new Error(data.message || `API request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchDoctors(params: FetchDoctorsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);
  if (params.department) query.append('department', params.department);
  if (params.available !== undefined && params.available !== '') query.append('available', params.available);

  const res = await fetch(`${API_BASE_URL}/admin/doctors?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorById(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function createDoctorApi(data: CreateDoctorParams) {
  const res = await fetch(`${API_BASE_URL}/admin/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function updateDoctorApi(id: string, data: UpdateDoctorParams) {
  const res = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function deleteDoctorApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
