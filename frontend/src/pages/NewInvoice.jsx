import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../api/sales';
import { listCustomers } from '../api/customers';

function emptyItem() {
  return { description: '', quantity: 1, unitPrice: '' };
}

function lineTotal(item) {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  return qty * price;
}

export default function NewInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [error, setError] = useState('');
  const [duplicateOf, setDuplicateOf] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCustomers().then(setCustomers).catch((err) => setError(err.message));
  }, []);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, it) => sum + lineTotal(it), 0);

  async function submit(confirmDuplicate = false) {
    if (submitting) return;
    setError('');
    setDuplicateOf(null);

    if (!customerId) return setError('Pick a customer.');
    const cleanItems = items.filter((it) => it.description.trim() && Number(it.quantity) > 0 && it.unitPrice !== '');
    if (cleanItems.length === 0) return setError('Add at least one line item with a description, quantity, and unit price.');

    setSubmitting(true);
    try {
      const invoice = await createInvoice({
        customerId: Number(customerId),
        date,
        dueDate: dueDate || undefined,
        items: cleanItems.map((it) => ({ description: it.description, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })),
        confirmDuplicate,
      });
      navigate(`/sales/invoices/${invoice.id}`);
    } catch (err) {
      if (err.status === 409) {
        setDuplicateOf(err.response?.duplicateOf || null);
        setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    submit(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>New Invoice</h1>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          {duplicateOf && (
            <div style={{ marginTop: 8 }}>
              <button type="button" className="btn btn-warning" onClick={() => submit(true)} disabled={submitting}>
                Create anyway
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="detail-grid" style={{ marginBottom: 0 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {customers.length === 0 && (
                <div className="field-hint">No customers yet — <a href="/sales/customers">add one first</a>.</div>
              )}
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <h3>Line items</h3>
          <table className="data-table line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ width: 100 }}>Qty</th>
                <th style={{ width: 140 }}>Unit price</th>
                <th className="num" style={{ width: 120 }}>Line total</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td><input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Consulting services" /></td>
                  <td><input type="number" min="0" step="0.001" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} /></td>
                  <td><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} /></td>
                  <td className="num">{lineTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{items.length > 1 && <button type="button" className="icon-btn" onClick={() => removeItem(i)}>Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn" onClick={addItem} style={{ marginTop: 12 }}>+ Add line</button>

          <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18, fontWeight: 700 }}>
            Subtotal: {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create draft invoice'}
        </button>
      </form>
    </div>
  );
}
