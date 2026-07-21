const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface LoginParams {
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export interface SignupParams {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  userId: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Server response parsing failed' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function loginApi(params: LoginParams) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function signupApi(params: SignupParams) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function logoutApi() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function forgotPasswordApi(params: ForgotPasswordParams) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function resetPasswordApi(params: ResetPasswordParams) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getMeApi() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
