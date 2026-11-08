import { http } from './http.js';

const unwrap = (res) => res.data.data;

export const teamApi = {
  getMyTeam: () => http.get('/team/me').then(unwrap),
  updateMyTeam: (body) => http.patch('/team/me', body).then(unwrap),
  submitPayment: (formData) => http.post('/team/payment', formData).then(unwrap),
};
