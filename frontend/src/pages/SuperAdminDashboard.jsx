import { useEffect, useState } from 'react';
import { listTenants } from '../api/superadmin';

const STATUS_PILL = { trialing: 'pill-gold', active: 'pill-emerald', past_due: 'pill-orange', canceled: 'pill-red' };

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listTenants().then(setTenants).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <h1>All Tenants</h1>
      {error && <p className="error-banner">{error}</p>}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 0' }}>Company</th>
              <th>Country</th>
              <th>Currency</th>
              <th>Users</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Signed up</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 0' }}>{t.name}</td>
                <td>{t.country}</td>
                <td>{t.base_currency}</td>
                <td>{t.user_count}</td>
                <td>{t.plan_name}</td>
                <td><span className={`pill ${STATUS_PILL[t.subscription_status] || 'pill-gray'}`}>{t.subscription_status}</span></td>
                <td className="muted">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr><td colSpan={7} className="empty-state">No tenants yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
