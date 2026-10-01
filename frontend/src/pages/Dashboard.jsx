import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getMyTenant } from '../api/tenants';

export default function Dashboard() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTenant().then(setTenant).catch((err) => setError(err.message));
  }, []);

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
            <div className="stat-label">Base currency</div>
            <div className="stat-value">{tenant.base_currency}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Plan</div>
            <div className="stat-value" style={{ fontSize: 16 }}>
              {tenant.plan_name} <span className="pill pill-gold" style={{ marginLeft: 6 }}>{tenant.subscription_status}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Phase 0 foundation</h2>
        <p className="muted">
          Multi-tenant signup, sign-in, and company setup are live. The full module set
          (Sales, Purchases, Inventory, GL/Journals, Payroll, and everything else Quelron
          Ledger will eventually do) is built out phase by phase from here.
        </p>
      </div>
    </div>
  );
}
