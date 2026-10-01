import { apiFetch } from './client';

export const signup = (payload) => apiFetch('/auth/signup', { method: 'POST', body: payload });
export const login = (email, password) => apiFetch('/auth/login', { method: 'POST', body: { email, password } });
export const getMe = () => apiFetch('/auth/me');
