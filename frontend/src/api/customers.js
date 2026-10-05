import { apiFetch } from './client';

export const listCustomers = () => apiFetch('/customers');
export const createCustomer = (payload) => apiFetch('/customers', { method: 'POST', body: payload });
