import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (data: { email: string; password: string }) => {
  return api.post('/auth/login', data);
};

export const signup = (data: { name: string; email: string; password: string; role: 'user' | 'admin'; adminSecret?: string }) => {
  const { adminSecret, ...body } = data;
  const headers: Record<string, string> | undefined =
    data.role === 'admin' && adminSecret ? { 'admin-secret': adminSecret } : undefined;
  return api.post('/auth/signup', body, { headers });
};

// Events API
export const getEvents = () => {
  return api.get('/events');
};

export const getEvent = (eventId: string) => {
  return api.get(`/events/${eventId}`);
};

export const voteForEvent = (eventId: string, optionId: string) => {
  return api.post(`/events/${eventId}/vote`, { optionId });
};

// Admin API
export const createEvent = (data: {
  title: string;
  description: string;
  options: string[];
  startAt?: string;
  endAt?: string;
}) => {
  return api.post('/admin/events', data);
};

export const getEventResults = (eventId: string) => {
  return api.get(`/admin/events/${eventId}/results`);
};

export const getAdminEvents = () => {
  return api.get('/admin/events');
};

export const deleteAdminEvent = (eventId: string) => {
  return api.delete(`/admin/events/${eventId}`);
};

export default api;