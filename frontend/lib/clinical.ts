const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  appointmentId?: string | null;
  doctorId: string;
  patientId: string;
  diagnosis: string;
  medicines: string; // Serialized JSON string of MedicineEntry[]
  dosage: string;
  instructions?: string | null;
  followUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    user: {
      fullName: string;
      email: string;
      phoneNumber?: string | null;
    };
    specialization?: string;
    department?: string;
    licenseNumber?: string;
  };
  patient?: {
    user: {
      fullName: string;
      email: string;
      phoneNumber?: string | null;
    };
    dateOfBirth?: string | null;
    gender?: string | null;
  };
}

export interface CreatePrescriptionParams {
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  medicines: string;
  dosage: string;
  instructions?: string;
  followUpDate?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string | null;
  chiefComplaint: string;
  diagnosis: string;
  allergies?: string | null;
  treatment?: string | null;
  notes?: string | null;
  bloodPressure?: string | null;
  pulseRate?: string | null;
  bodyTemperature?: string | null;
  height?: number | null;
  weight?: number | null;
  reportFile?: string | null;
  visitDate: string;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    user: {
      fullName: string;
      email: string;
    };
    department?: string;
  };
  patient?: {
    user: {
      fullName: string;
      email: string;
    };
  };
}

export interface CreateMedicalRecordParams {
  patientId: string;
  appointmentId?: string;
  chiefComplaint: string;
  diagnosis: string;
  allergies?: string;
  treatment?: string;
  notes?: string;
  bloodPressure?: string;
  pulseRate?: string;
  bodyTemperature?: string;
  height?: number;
  weight?: number;
  reportFile?: string;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse response' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

// Prescription APIs
export async function createPrescriptionApi(data: CreatePrescriptionParams) {
  const res = await fetch(`${API_BASE_URL}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchPrescriptionById(id: string) {
  const res = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchPatientPrescriptions() {
  const res = await fetch(`${API_BASE_URL}/prescriptions/patient`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorPrescriptions() {
  const res = await fetch(`${API_BASE_URL}/prescriptions/doctor`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function updatePrescriptionApi(id: string, data: Partial<CreatePrescriptionParams>) {
  const res = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

// Medical Record APIs
export async function createMedicalRecordApi(data: CreateMedicalRecordParams) {
  const res = await fetch(`${API_BASE_URL}/medical-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchMedicalRecordById(id: string) {
  const res = await fetch(`${API_BASE_URL}/medical-records/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchPatientMedicalRecords() {
  const res = await fetch(`${API_BASE_URL}/medical-records/patient`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorMedicalRecords() {
  const res = await fetch(`${API_BASE_URL}/medical-records/doctor`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function updateMedicalRecordApi(id: string, data: Partial<CreateMedicalRecordParams>) {
  const res = await fetch(`${API_BASE_URL}/medical-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

// Admin APIs
export async function fetchAdminMedicalRecords(params: {
  search?: string;
  doctor?: string;
  date?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.doctor) query.append('doctor', params.doctor);
  if (params.date) query.append('date', params.date);

  const res = await fetch(`${API_BASE_URL}/admin/medical-records?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
