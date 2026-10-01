import { apiFetch } from './client';

export const superAdminLogin = (email, password) => apiFetch('/superadmin/login', { method: 'POST', body: { email, password } });
export const listTenants = () => apiFetch('/superadmin/tenants', { superAdmin: true });
export const getTenant = (id) => apiFetch(`/superadmin/tenants/${id}`, { superAdmin: true });
