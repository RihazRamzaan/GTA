import { http } from './http.js';

const unwrap = (res) => res.data.data; // API shape: { success: true, data: {...} }

export const authApi = {
  register: (body) => http.post('/auth/register', body).then(unwrap),
  login: (body) => http.post('/auth/login', body).then(unwrap),
  logout: () => http.post('/auth/logout').then(unwrap),
  me: () => http.get('/auth/me').then(unwrap),
};
