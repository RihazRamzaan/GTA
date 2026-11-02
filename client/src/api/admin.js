import { http } from './http.js';

/**
 * Admin API methods (Rihaz)
 */
export const getAdminSettings = () => http.get('/admin/settings');
export const updateAdminSettings = (data) => http.patch('/admin/settings', data);

export const adminApi = {
  getSettings: getAdminSettings,
  updateSettings: updateAdminSettings,
};
