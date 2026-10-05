import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getMyTenant } from '../api/tenants';
import { listInvoices } from '../api/sales';
import DonutChart from '../charts/DonutChart';
import BarChart from '../charts/BarChart';
import { getChartTheme } from '../charts/palette';

const STATUS_ORDER = ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];

function monthKey(dateStr) {
  return dateStr.slice(0, 7); // 'YYYY-MM'
}
function monthLabel(key) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: 'short' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTenant().then(setTenant).catch((err) => setError(err.message));
    listInvoices().then(setInvoices).catch((err) => setError(err.message));
  }, []);

  const theme = getChartTheme();

  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total), 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'Cancelled')
    .reduce((sum, i) => sum + Number(i.balance), 0);

  const statusCounts = STATUS_ORDER.map((status) => ({
    label: status,
    value: invoices.filter((i) => i.display_status === status).length,
    color: theme.statusColor[status],
  }));

  // Last 6 calendar months, oldest first, invoiced total per month -- a
  // single series (magnitude over time), so one hue, no legend box needed.
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const monthlyTotals = months.map((key) => ({
    label: monthLabel(key),
    value: invoices.filter((i) => monthKey(i.date) === key).reduce((sum, i) => sum + Number(i.total), 0),
  }));

  return (
    <div className="page">
      <h1>Welcome back{user?.fullName ? `, ${user.fullName}` : ''}</h1>
      {error && <p className="error-banner">{error}</p>}

      {tenant && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Company</div>
            <div className="stat-value" style={{ fontSize: 16 }}>{tenant.name}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total invoiced</div>
            <div className="stat-value">{tenant.base_currency} {totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Outstanding receivables</div>
            <div className="stat-value">{tenant.base_currency} {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Plan</div>
            <div className="stat-value" style={{ fontSize: 16 }}>
              {tenant.plan_name} <span className="pill pill-gold" style={{ marginLeft: 6 }}>{tenant.subscription_status}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <div className="card">
          <h2>Invoices by status</h2>
          {invoices.length === 0 ? (
            <p className="empty-state">No invoices yet.</p>
          ) : (
            <DonutChart data={statusCounts} />
          )}
        </div>

        <div className="card">
          <h2>Invoiced per month</h2>
          {invoices.length === 0 ? (
            <p className="empty-state">No invoices yet.</p>
          ) : (
            <BarChart data={monthlyTotals} formatValue={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
          )}
        </div>
      </div>

      <div className="card">
        <h2>Phase 1: Sales &amp; Invoicing</h2>
        <p className="muted">
          Customers, Invoices, and Payments are live. The rest of the module set
          (Expenses, Purchases, Inventory, GL/Journals, Payroll, and everything else
          QRS and Xtreme Finance do) is built out module by module from here.
        </p>
      </div>
    </div>
  );
}
