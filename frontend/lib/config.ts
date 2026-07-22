const isProduction =
  process.env.NODE_ENV === 'production' ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost');

let rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// Bulletproof client-side override: if we are in the browser on a production domain, 
// force use of the production Render backend regardless of build-time env variables.
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  if (!rawBackendUrl || rawBackendUrl.includes('localhost') || rawBackendUrl.includes('127.0.0.1')) {
    rawBackendUrl = 'https://ready-nest-intership-week-6.onrender.com';
  }
}

if (!rawBackendUrl) {
  rawBackendUrl = isProduction
    ? 'https://ready-nest-intership-week-6.onrender.com'
    : 'http://localhost:5000';
}

rawBackendUrl = rawBackendUrl.replace(/\/+$/, '').replace(/\/api$/, '');

let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  if (!rawApiUrl || rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1')) {
    rawApiUrl = `${rawBackendUrl}/api`;
  }
}

if (!rawApiUrl) {
  rawApiUrl = `${rawBackendUrl}/api`;
} else {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '');
  if (!rawApiUrl.endsWith('/api')) {
    rawApiUrl = `${rawApiUrl}/api`;
  }
}

export const BACKEND_URL = rawBackendUrl;
export const API_BASE_URL = rawApiUrl;
