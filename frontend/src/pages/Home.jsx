import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Sales & Invoicing', desc: 'Quotations, invoices, payments, and receivables — tracked automatically.' },
  { title: 'Full Double-Entry Books', desc: 'Every transaction posts a balanced journal entry behind the scenes.' },
  { title: 'Inventory & Production', desc: 'Stock movements, production runs, and multi-store tracking.' },
  { title: 'Payroll & Fixed Assets', desc: 'Staff pay, depreciation, and asset disposal, all in one place.' },
  { title: 'Any Country, Any Currency', desc: 'Pick your country and base currency at signup — no assumptions baked in.' },
  { title: 'Role-Based Access', desc: 'Owner, management, accountant, and operations roles, with a full audit trail.' },
  { title: 'Bank Reconciliation', desc: 'Upload a statement and match it against your recorded transactions.' },
  { title: 'Audit-Ready Reports', desc: 'Hand your accountant a clean, traceable set of records — not a mess to rebuild.' },
];

export default function Home() {
  return (
    <div>
      <div className="marketing-hero">
        <div className="pill pill-blue" style={{ marginBottom: 16 }}>BALANCIO BY QUELRON</div>
        <h1>Run your books like a real business, in any country.</h1>
        <p>
          Sales, purchases, inventory, payroll, and full double-entry bookkeeping — one
          system, set up in minutes, built for businesses everywhere.
        </p>
        <div className="form-inline" style={{ justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-primary">Start free trial</Link>
          <Link to="/login" className="btn">Sign in</Link>
        </div>
      </div>

      <div className="marketing-feature-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="marketing-feature-card">
            <h3>{f.title}</h3>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '0 24px 64px' }}>
        <Link to="/signup" className="btn btn-primary">Get started — it's free to try</Link>
      </div>
    </div>
  );
}
