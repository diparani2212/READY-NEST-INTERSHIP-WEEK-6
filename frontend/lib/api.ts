const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchHealthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch health status:', error);
    return { success: false, database: { connected: false, error: 'Cannot connect to backend server' } };
  }
}
