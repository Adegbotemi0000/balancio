import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listInvoices } from '../api/sales';

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

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listInvoices().then(setInvoices).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Invoices</h1>
        <Link to="/sales/invoices/new" className="btn btn-primary">+ New invoice</Link>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="table-wrap">
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : invoices.length === 0 ? (
          <p className="empty-state">No invoices yet. Create your first one above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th className="num">Total</th>
                <th className="num">Balance</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} onClick={() => navigate(`/sales/invoices/${inv.id}`)} style={{ cursor: 'pointer' }}>
                  <td><Link to={`/sales/invoices/${inv.id}`} onClick={(e) => e.stopPropagation()}>{inv.invoice_number}</Link></td>
                  <td>{inv.customer_name}</td>
                  <td>{new Date(inv.date).toLocaleDateString()}</td>
                  <td><span className={`pill ${STATUS_PILL[inv.display_status] || 'pill-gray'}`}>{inv.display_status}</span></td>
                  <td className="num">{money(inv.total)}</td>
                  <td className="num">{money(inv.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
