const API_BASE = 'https://campusfind-vi6i.onrender.com/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('campusfind_token');
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to application/json
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export default {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  getMe: () => apiRequest('/auth/me'),
  forgotPassword: (data) => apiRequest('/auth/forgot-password', { method: 'POST', body: data }),
  resetPassword: (data) => apiRequest('/auth/reset-password', { method: 'POST', body: data }),

  // Lost
  createLost: (formData) => apiRequest('/lost', { method: 'POST', body: formData }),
  getLost: (params = '') => apiRequest(`/lost${params ? '?' + params : ''}`),
  getLostById: (id) => apiRequest(`/lost/${id}`),
  deleteLost: (id) => apiRequest(`/lost/${id}`, { method: 'DELETE' }),

  // Found
  createFound: (formData) => apiRequest('/found', { method: 'POST', body: formData }),
  getFound: (params = '') => apiRequest(`/found${params ? '?' + params : ''}`),
  getFoundById: (id) => apiRequest(`/found/${id}`),
  deleteFound: (id) => apiRequest(`/found/${id}`, { method: 'DELETE' }),

  // Search
  search: (params = '') => apiRequest(`/search${params ? '?' + params : ''}`),

  // Matches
  getMatches: (params = '') => apiRequest(`/matches${params ? '?' + params : ''}`),
  getMatchById: (id) => apiRequest(`/matches/${id}`),

  // Claims
  createClaim: (formData) => apiRequest('/claims', { method: 'POST', body: formData }),
  getClaims: (params = '') => apiRequest(`/claims${params ? '?' + params : ''}`),
  getClaimById: (id) => apiRequest(`/claims/${id}`),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),

  // Locations
  getLocations: () => apiRequest('/locations'),

  // Admin
  getAdminDashboard: () => apiRequest('/admin/dashboard'),
  getAdminReports: (params = '') => apiRequest(`/admin/reports${params ? '?' + params : ''}`),
  approveReport: (id, type) => apiRequest(`/admin/reports/${id}/approve`, { method: 'PUT', body: { type } }),
  rejectReport: (id, type, reason) => apiRequest(`/admin/reports/${id}/reject`, { method: 'PUT', body: { type, reason } }),
  approveClaim: (id, notes) => apiRequest(`/admin/claims/${id}/approve`, { method: 'PUT', body: { notes } }),
  rejectClaim: (id, reason) => apiRequest(`/admin/claims/${id}/reject`, { method: 'PUT', body: { reason } }),
  recordHandover: (itemId, data) => apiRequest(`/admin/items/${itemId}/returned`, { method: 'PUT', body: data }),
  getAdminUsers: () => apiRequest('/admin/users')
};
