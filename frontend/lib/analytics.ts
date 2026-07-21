const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdminAnalyticsData {
  stats: {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    todayAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalRevenue: number;
    pendingPayments: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
  departmentDoctors: { department: string; count: number }[];
  appointmentStatusSummary: Record<string, number>;
  latestAppointments: any[];
  recentBills: any[];
}

export interface DoctorAnalyticsData {
  stats: {
    todayCount: number;
    upcomingCount: number;
    completedCount: number;
    pendingCount: number;
    totalPatientsTreated: number;
  };
  weeklyTrend: { day: string; consultations: number }[];
  recentPatients: any[];
}

export interface PatientAnalyticsData {
  appointmentStats: {
    upcomingCount: number;
    completedCount: number;
    cancelledCount: number;
  };
  billStats: {
    totalBills: number;
    paidBillsCount: number;
    paidAmount: number;
    pendingBillsCount: number;
    pendingAmount: number;
  };
  latestPrescription?: any;
  latestMedicalRecord?: any;
  nextAppointment?: any;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse response' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchAdminDashboardAnalytics() {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchAppointmentReports(params: {
  search?: string;
  status?: string;
  doctor?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.doctor) query.append('doctor', params.doctor);
  if (params.department) query.append('department', params.department);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);

  const res = await fetch(`${API_BASE_URL}/admin/reports/appointments?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchRevenueReports(params: {
  search?: string;
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.paymentMethod) query.append('paymentMethod', params.paymentMethod);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);

  const res = await fetch(`${API_BASE_URL}/admin/reports/revenue?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchPatientReports(params: { search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE_URL}/admin/reports/patients?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorReports(params: { search?: string; department?: string } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.department) query.append('department', params.department);

  const res = await fetch(`${API_BASE_URL}/admin/reports/doctors?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchDoctorDashboardAnalytics() {
  const res = await fetch(`${API_BASE_URL}/doctor/dashboard/analytics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchPatientDashboardAnalytics() {
  const res = await fetch(`${API_BASE_URL}/patient/dashboard/analytics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
