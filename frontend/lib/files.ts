const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface UploadedFileItem {
  id: string;
  patientId?: string | null;
  doctorId?: string | null;
  medicalRecordId?: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  patient?: {
    user: {
      fullName: string;
      email: string;
    };
  };
  doctor?: {
    user: {
      fullName: string;
    };
  };
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse response' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function uploadProfileImageApi(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/profile/upload-image`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function removeProfileImageApi(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/profile/remove-image`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function uploadMedicalReportApi(patientId: string, file: File, fileName?: string, medicalRecordId?: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patientId', patientId);
  if (fileName) formData.append('fileName', fileName);
  if (medicalRecordId) formData.append('medicalRecordId', medicalRecordId);

  const res = await fetch(`${API_BASE_URL}/medical-records/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function fetchAdminFiles(params: {
  search?: string;
  fileType?: string;
  patientId?: string;
  doctorId?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.fileType) query.append('fileType', params.fileType);
  if (params.patientId) query.append('patientId', params.patientId);
  if (params.doctorId) query.append('doctorId', params.doctorId);

  const res = await fetch(`${API_BASE_URL}/admin/files?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function deleteAdminFileApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/files/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
