import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { COUNTRIES, CURRENCIES } from '../data/countries';

function emptyForm() {
  return { companyName: '', country: '', baseCurrency: '', industry: '', fullName: '', email: '', password: '' };
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleCountryChange(code) {
    const country = COUNTRIES.find((c) => c.code === code);
    setForm((f) => ({ ...f, country: code, baseCurrency: country ? country.currency : f.baseCurrency }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <div className="card">
        <h1>Set up your company</h1>
        <p className="muted" style={{ marginTop: -8, marginBottom: 20, fontSize: 14 }}>
          Free 14-day trial. No card required to get started.
        </p>
        {error && <p className="error-banner">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Company name</label>
            <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          </div>
          <div className="field">
            <label>Country</label>
            <select value={form.country} onChange={(e) => handleCountryChange(e.target.value)} required>
              <option value="">Select your country...</option>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Base currency</label>
            <select value={form.baseCurrency} onChange={(e) => setForm({ ...form, baseCurrency: e.target.value })} required>
              <option value="">Select currency...</option>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="field-hint">Every amount in your books will be recorded in this currency.</div>
          </div>
          <div className="field">
            <label>Industry (optional)</label>
            <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Retail, Manufacturing, Services" />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
          <div className="field">
            <label>Your name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <div className="field-hint">At least 8 characters.</div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Setting up...' : 'Create my account'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
