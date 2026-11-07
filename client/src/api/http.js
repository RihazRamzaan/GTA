import axios from 'axios';

// No default Content-Type: axios picks JSON for objects and multipart for FormData (slip uploads).
export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', withCredentials: true });

// Turns a failed request into { code, message, fields } for forms.
export function getApiError(error) {
  const apiError = error.response?.data?.error;
  return { code: apiError?.code, message: error.userMessage || apiError?.message || 'Could not reach the server. Please try again.', fields: apiError?.fields || {} };
}
