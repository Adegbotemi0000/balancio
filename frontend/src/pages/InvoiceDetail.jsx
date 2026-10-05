import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoice, issueInvoice, cancelInvoice, recordPayment } from '../api/sales';
import { listAccounts } from '../api/accounts';

const STATUS_PILL = {
  Draft: 'pill-gray',
  Issued: 'pill-blue',
  'Partially Paid': 'pill-gold',
  Paid: 'pill-emerald',
  Overdue: 'pill-red',
  Cancelled: 'pill-red',
};

function money(n) {
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', accountId: '', date: new Date().toISOString().slice(0, 10), method: '', reference: '' });
  const [payDuplicate, setPayDuplicate] = useState(false);

  function load() {
    getInvoice(id).then(setInvoice).catch((err) => setError(err.message));
  }

  useEffect(load, [id]);
  useEffect(() => {
    listAccounts().then(setAccounts).catch(() => {});
  }, []);

  async function handleIssue() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await issueInvoice(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    const reason = window.prompt('Reason for cancelling this invoice:');
    if (!reason) return;
    setBusy(true);
    setError('');
    try {
      await cancelInvoice(id, reason);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitPayment(confirmDuplicate = false) {
    if (busy) return;
    setError('');
    setPayDuplicate(false);
    if (!payForm.amount || Number(payForm.amount) <= 0) return setError('Enter a positive amount.');
    if (!payForm.accountId) return setError('Select an account.');

    setBusy(true);
    try {
      await recordPayment(id, {
        amount: Number(payForm.amount),
        accountId: Number(payForm.accountId),
        date: payForm.date,
        method: payForm.method || undefined,
        reference: payForm.reference || undefined,
        confirmDuplicate,
      });
      setShowPayForm(false);
      setPayForm({ amount: '', accountId: '', date: new Date().toISOString().slice(0, 10), method: '', reference: '' });
      load();
    } catch (err) {
      if (err.status === 409) setPayDuplicate(true);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !invoice) return <div className="page"><p className="error-banner">{error}</p></div>;
  if (!invoice) return <div className="page"><p className="empty-state">Loading...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/sales/invoices" className="muted">&larr; Invoices</Link>
          <h1 style={{ marginTop: 4 }}>{invoice.invoice_number}</h1>
        </div>
        <div className="form-inline">
          {invoice.status === 'Draft' && <button className="btn btn-primary" onClick={handleIssue} disabled={busy}>Issue invoice</button>}
          {['Issued', 'Partially Paid'].includes(invoice.status) && (
            <button className="btn btn-success" onClick={() => setShowPayForm((v) => !v)} disabled={busy}>Record payment</button>
          )}
          {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
            <button className="btn btn-danger" onClick={handleCancel} disabled={busy}>Cancel</button>
          )}
        </div>
      </div>

      {error && <p className="error-banner">{error}{payDuplicate && (
        <div style={{ marginTop: 8 }}>
          <button type="button" className="btn btn-warning" onClick={() => submitPayment(true)} disabled={busy}>Record anyway</button>
        </div>
      )}</p>}

      <div className="detail-grid">
        <div><div className="label">Customer</div><div className="value">{invoice.customer_name}</div></div>
        <div><div className="label">Status</div><div className="value"><span className={`pill ${STATUS_PILL[invoice.status] || 'pill-gray'}`}>{invoice.status}</span></div></div>
        <div><div className="label">Date</div><div className="value">{new Date(invoice.date).toLocaleDateString()}</div></div>
        <div><div className="label">Due date</div><div className="value">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}</div></div>
        <div><div className="label">Total</div><div className="value">{money(invoice.total)}</div></div>
        <div><div className="label">Balance</div><div className="value">{money(invoice.balance)}</div></div>
      </div>

      {invoice.cancel_reason && (
        <div className="error-banner">Cancelled: {invoice.cancel_reason}</div>
      )}

      {showPayForm && (
        <div className="card" style={{ maxWidth: 480, marginBottom: 'var(--space-5)' }}>
          <h3>Record payment</h3>
          <div className="field">
            <label>Amount</label>
            <input type="number" min="0" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
          </div>
          <div className="field">
            <label>Account</label>
            <select value={payForm.accountId} onChange={(e) => setPayForm({ ...payForm, accountId: e.target.value })}>
              <option value="">Select an account...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Method</label>
            <input value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} placeholder="Bank transfer, cash, card..." />
          </div>
          <div className="field">
            <label>Reference</label>
            <input value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={() => submitPayment(false)} disabled={busy}>Record payment</button>
        </div>
      )}

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <h3>Line items</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="num">Qty</th>
              <th className="num">Unit price</th>
              <th className="num">Tax</th>
              <th className="num">Line total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr key={it.id}>
                <td>{it.description}</td>
                <td className="num">{Number(it.quantity)}</td>
                <td className="num">{money(it.unit_price)}</td>
                <td className="num">{money(it.line_tax)}</td>
                <td className="num">{money(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Payments</h3>
        {invoice.payments.length === 0 ? (
          <p className="empty-state">No payments recorded yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Method</th>
                <th>Reference</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map((p) => (
                <tr key={p.id} style={p.is_reversed ? { opacity: 0.5, textDecoration: 'line-through' } : undefined}>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td>{p.account_name}</td>
                  <td>{p.method || '—'}</td>
                  <td>{p.reference || '—'}</td>
                  <td className="num">{money(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
