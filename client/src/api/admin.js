import { http } from './http.js';

/**
 * Admin API methods (Rihaz)
 * All endpoints require an active admin session cookie.
 */

// Day 02 / Day 03: Event Settings & Gate Controls
export const getAdminSettings = () => http.get('/admin/settings');
export const updateAdminSettings = (data) => http.patch('/admin/settings', data);

// Day 04: Registrations list and Dashboard Summary
export const getAdminSummary = () => http.get('/admin/summary');
export const getSummary = getAdminSummary;

export const getAdminRegistrations = (params) => http.get('/admin/registrations', { params });
export const getRegistrations = getAdminRegistrations;

// Day 05: Payment reviews and Slip retrieval
export const reviewRegistration = (id, data) => http.patch(`/admin/registrations/${id}/review`, data);
export const getRegistrationSlip = (id) => http.get(`/admin/registrations/${id}/slip`);
export const getRegistrationSlipUrl = (id) => `${http.defaults.baseURL || '/api'}/admin/registrations/${id}/slip`;

// Day 06: Game Submissions gallery and review
/**
 * Retrieves game submissions for the admin gallery.
 * @param {Object|string} [params] - Optional query parameters object or search string.
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getAdminSubmissions = (params) => {
  const queryParams = typeof params === 'string' ? { q: params } : params;
  return http.get('/admin/submissions', { params: queryParams });
};
export const getSubmissions = getAdminSubmissions;

export const adminApi = {
  getSettings: getAdminSettings,
  updateSettings: updateAdminSettings,
  getSummary: getAdminSummary,
  getRegistrations: getAdminRegistrations,
  reviewRegistration,
  getRegistrationSlip,
  getRegistrationSlipUrl,
  getSubmissions: getAdminSubmissions,
};

export default adminApi;
