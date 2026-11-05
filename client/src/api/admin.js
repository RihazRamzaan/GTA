import { http } from './http.js';

/**
 * Admin API methods (Rihaz)
 * All endpoints require an active admin session cookie.
 */

// Day 02 / Day 03: Event Settings & Gate Controls
export const getAdminSettings = () => http.get('/admin/settings');
export const updateAdminSettings = (data) => http.patch('/admin/settings', data);

// Stubs for Days 04-05 (Admin Summary, Payments, Submissions)
export const getAdminSummary = () => http.get('/admin/summary');
export const getRegistrations = (params) => http.get('/admin/registrations', { params });
export const reviewRegistration = (id, data) => http.patch(`/admin/registrations/${id}/review`, data);
export const getRegistrationSlip = (id) => http.get(`/admin/registrations/${id}/slip`);
export const getAdminSubmissions = (params) => http.get('/admin/submissions', { params });

export const adminApi = {
  getSettings: getAdminSettings,
  updateSettings: updateAdminSettings,
  getSummary: getAdminSummary,
  getRegistrations,
  reviewRegistration,
  getRegistrationSlip,
  getSubmissions: getAdminSubmissions,
};

export default adminApi;
