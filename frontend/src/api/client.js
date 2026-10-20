// ---------------------------------------------------------------------------
// API address
//  - npm run dev   -> '/api' (Vite proxy forwards it to your local backend on port 5000)
//  - production    -> the hosted Render backend
//  - override      -> set VITE_API_URL in frontend/.env (e.g. http://localhost:5000/api)
// ---------------------------------------------------------------------------
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'https://campusfind-vi6i.onrender.com/api')
).replace(/\/+$/, '');
 
// Server address without the trailing /api (empty in development: the proxy handles it).
export const API_ORIGIN = API_BASE.replace(/\/api$/, '');
 
// Photos are saved as /uploads/<file> (or a full https URL when using Cloudinary).
// A bare /uploads path would be requested from the FRONTEND address on the hosted
// site and fail, so this turns either form into an address the browser can load.
export function resolveImageUrl(src, fallback = '') {
  if (!src || typeof src !== 'string') return fallback;
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
}
 
// ---------------------------------------------------------------------------
// Reliability settings
// Render's free tier sleeps when idle, so the first request can take a while.
// ---------------------------------------------------------------------------
const DEFAULT_TIMEOUT_MS = 60000;   // normal requests
const UPLOAD_TIMEOUT_MS = 120000;   // photo uploads
const GET_RETRIES = 2;              // extra attempts for GET requests only
const RETRY_DELAY_MS = 1500;
const RETRY_STATUSES = [502, 503, 504]; // what a waking/restarting server returns
 
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
 
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('campusfind_token');
 
  const headers = {
    ...(options.headers || {}),
  };
 
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
 
  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;
 
  let body = options.body;
 
  // Convert plain JavaScript objects to JSON.
  // Keep FormData unchanged for image/file uploads.
  if (
    body &&
    typeof body === 'object' &&
    !isFormData &&
    !(body instanceof Blob)
  ) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
 
  // Only GET requests are retried. Retrying a POST/PUT could create things twice.
  const method = (options.method || 'GET').toUpperCase();
  const maxAttempts = method === 'GET' ? GET_RETRIES + 1 : 1;
  const timeoutMs = isFormData ? UPLOAD_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
 
  let lastError;
 
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
 
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        body,
        headers,
        signal: controller.signal,
      });
 
      // Server is waking up or restarting: try again (GET only)
      if (RETRY_STATUSES.includes(response.status) && attempt < maxAttempts) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
 
      // Retries used up and the server is still starting up / unavailable
      if (RETRY_STATUSES.includes(response.status)) {
        const unavailable = new Error(
          'The server is starting up or temporarily unavailable. Please wait a few seconds and try again.'
        );
        unavailable.status = response.status;
        throw unavailable;
      }
 
      const contentType = response.headers.get('content-type') || '';
 
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
 
      if (!response.ok) {
        // Never show a raw HTML error page to the user
        const isHtml = typeof data === 'string' && /^\s*</.test(data);
        const message =
          typeof data === 'object' && data !== null
            ? data.message || data.error
            : isHtml
              ? ''
              : data;
 
        const error = new Error(
          message || `Request failed with status ${response.status}`
        );
 
        error.status = response.status;
        error.data = data;
        throw error;
      }
 
      return data;
    } catch (err) {
      const isTimeout = err && err.name === 'AbortError';
      const isNetwork = err instanceof TypeError;
 
      // Network problem or timeout: try again (GET only)
      if ((isTimeout || isNetwork) && attempt < maxAttempts) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
 
      if (isTimeout) {
        lastError = new Error(
          'The server is taking too long to respond. It may be waking up - please wait a few seconds and try again.'
        );
      } else if (isNetwork) {
        console.error('CampusFind network/CORS error:', err);
        lastError = new Error(
          `Cannot reach the CampusFind server (${API_ORIGIN || 'local backend'}) from ${window.location.origin}. ` +
          'The server may be asleep or down, or it is blocking this website address (CORS). ' +
          'Check that the backend is running and shows "Connected successfully".'
        );
      } else {
        lastError = err;
      }
 
      throw lastError;
    } finally {
      clearTimeout(timer);
    }
  }
 
  // Only reached if every attempt got a 502/503/504
  throw new Error('The server is not available right now. Please try again in a moment.');
}
 
export default {
  // Authentication
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    }),
 
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    }),
 
  getMe: () => apiRequest('/auth/me'),
 
  forgotPassword: (data) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: data,
    }),
 
  resetPassword: (data) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: data,
    }),
 
  // Lost items
  createLost: (formData) =>
    apiRequest('/lost', { method: 'POST', body: formData }),
 
  getLost: (params = '') =>
    apiRequest(`/lost${params ? '?' + params : ''}`),
 
  getLostById: (id) => apiRequest(`/lost/${id}`),
 
  deleteLost: (id) =>
    apiRequest(`/lost/${id}`, { method: 'DELETE' }),
 
  // Found items
  createFound: (formData) =>
    apiRequest('/found', { method: 'POST', body: formData }),
 
  getFound: (params = '') =>
    apiRequest(`/found${params ? '?' + params : ''}`),
 
  getFoundById: (id) => apiRequest(`/found/${id}`),
 
  deleteFound: (id) =>
    apiRequest(`/found/${id}`, { method: 'DELETE' }),
 
  // Search
  search: (params = '') =>
    apiRequest(`/search${params ? '?' + params : ''}`),
 
  // Matches
  getMatches: (params = '') =>
    apiRequest(`/matches${params ? '?' + params : ''}`),
 
  getMatchById: (id) => apiRequest(`/matches/${id}`),
 
  // Claims
  createClaim: (formData) =>
    apiRequest('/claims', { method: 'POST', body: formData }),
 
  getClaims: (params = '') =>
    apiRequest(`/claims${params ? '?' + params : ''}`),
 
  getClaimById: (id) => apiRequest(`/claims/${id}`),
 
  // Notifications
  getNotifications: () => apiRequest('/notifications'),
 
  markNotificationRead: (id) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
 
  markAllNotificationsRead: () =>
    apiRequest('/notifications/read-all', { method: 'PUT' }),
 
  // Locations
  getLocations: () => apiRequest('/locations'),
 
  // Admin
  getAdminDashboard: () => apiRequest('/admin/dashboard'),
 
  getAdminReports: (params = '') =>
    apiRequest(`/admin/reports${params ? '?' + params : ''}`),
 
  approveReport: (id, type) =>
    apiRequest(`/admin/reports/${id}/approve`, {
      method: 'PUT',
      body: { type },
    }),
 
  rejectReport: (id, type, reason) =>
    apiRequest(`/admin/reports/${id}/reject`, {
      method: 'PUT',
      body: { type, reason },
    }),
 
  approveClaim: (id, notes) =>
    apiRequest(`/admin/claims/${id}/approve`, {
      method: 'PUT',
      body: { notes },
    }),
 
  rejectClaim: (id, reason) =>
    apiRequest(`/admin/claims/${id}/reject`, {
      method: 'PUT',
      body: { reason },
    }),
 
  recordHandover: (itemId, data) =>
    apiRequest(`/admin/items/${itemId}/returned`, {
      method: 'PUT',
      body: data,
    }),
 
  getAdminUsers: () => apiRequest('/admin/users'),
};
 