import { apiFetch } from './client';

export const listInvoices = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/sales/invoices${qs ? `?${qs}` : ''}`);
};
export const getInvoice = (id) => apiFetch(`/sales/invoices/${id}`);
export const createInvoice = (payload) => apiFetch('/sales/invoices', { method: 'POST', body: payload });
export const issueInvoice = (id) => apiFetch(`/sales/invoices/${id}/issue`, { method: 'PATCH' });
export const cancelInvoice = (id, reason) => apiFetch(`/sales/invoices/${id}/cancel`, { method: 'PATCH', body: { reason } });
export const recordPayment = (id, payload) => apiFetch(`/sales/invoices/${id}/payments`, { method: 'POST', body: payload });
export const listReceivables = () => apiFetch('/sales/receivables');
