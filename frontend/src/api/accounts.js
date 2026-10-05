import { apiFetch } from './client';

export const listAccounts = () => apiFetch('/accounts');
export const createAccount = (payload) => apiFetch('/accounts', { method: 'POST', body: payload });
