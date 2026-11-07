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

// Day 05: Submissions review
export const getAdminSubmissions = (params) => http.get('/admin/submissions', { params });
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
