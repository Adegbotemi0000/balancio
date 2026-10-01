import { apiFetch } from './client';

export const getMyTenant = () => apiFetch('/tenants/me');
export const updateMyTenant = (payload) => apiFetch('/tenants/me', { method: 'PATCH', body: payload });
export const listUsers = () => apiFetch('/tenants/users');
