const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse response' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchNotifications() {
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function markNotificationAsReadApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function markAllNotificationsAsReadApi() {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function deleteNotificationApi(id: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}
