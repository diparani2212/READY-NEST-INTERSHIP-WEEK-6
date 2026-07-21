const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Bill {
  id: string;
  patientId: string;
  appointmentId?: string | null;
  consultationFee: number;
  additionalCharges: number;
  discount: number;
  tax: number;
  amount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED';
  paymentMethod?: string | null;
  invoiceNumber: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    user: {
      fullName: string;
      email: string;
      phoneNumber?: string | null;
    };
  };
  appointment?: {
    appointmentDate: string;
    appointmentTime: string;
    reason?: string | null;
    doctor?: {
      department?: string;
      user: {
        fullName: string;
        email: string;
        phoneNumber?: string | null;
      };
    };
  };
}

export interface CreateBillParams {
  appointmentId: string;
  consultationFee: number;
  additionalCharges?: number;
  discount?: number;
  tax?: number;
  paymentStatus?: 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED';
  paymentMethod?: string;
}

export interface UpdateBillParams {
  consultationFee?: number;
  additionalCharges?: number;
  discount?: number;
  tax?: number;
  paymentStatus?: 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED';
  paymentMethod?: string;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse response' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

// Admin Billing APIs
export async function createBillApi(data: CreateBillParams) {
  const res = await fetch(`${API_BASE_URL}/admin/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchAdminBills(params: {
  search?: string;
  status?: string;
  date?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.date) query.append('date', params.date);

  const res = await fetch(`${API_BASE_URL}/admin/bills?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchAdminBillById(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/bills/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function updateBillApi(id: string, data: UpdateBillParams) {
  const res = await fetch(`${API_BASE_URL}/admin/bills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function deleteBillApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/bills/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

// Patient Billing APIs
export async function fetchPatientBills() {
  const res = await fetch(`${API_BASE_URL}/patient/bills`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchPatientBillById(id: string) {
  const res = await fetch(`${API_BASE_URL}/patient/bills/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

// Doctor Billing APIs
export async function fetchDoctorBills() {
  const res = await fetch(`${API_BASE_URL}/doctor/bills`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
