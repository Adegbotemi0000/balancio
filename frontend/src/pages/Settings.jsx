import { useEffect, useState } from 'react';
import { getMyTenant, updateMyTenant } from '../api/tenants';

export default function Settings() {
  const [tenant, setTenant] = useState(null);
  const [form, setForm] = useState({ name: '', industry: '', businessRegNumber: '' });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyTenant().then((t) => {
      setTenant(t);
      setForm({ name: t.name, industry: t.industry || '', businessRegNumber: t.business_reg_number || '' });
    }).catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSaved(false);
    setSubmitting(true);
    try {
      const updated = await updateMyTenant(form);
      setTenant(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Company Settings</h1>
      {error && <p className="error-banner">{error}</p>}
      {saved && <p className="pill pill-emerald" style={{ marginBottom: 16 }}>Saved</p>}

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Company name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Industry</label>
            <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div className="field">
            <label>Business registration number</label>
            <input value={form.businessRegNumber} onChange={(e) => setForm({ ...form, businessRegNumber: e.target.value })} />
          </div>
          <div className="field">
            <label>Country</label>
            <input value={tenant?.country || ''} disabled />
            <div className="field-hint">Country and base currency can't be changed after signup — contact support if this genuinely needs to change.</div>
          </div>
          <div className="field">
            <label>Base currency</label>
            <input value={tenant?.base_currency || ''} disabled />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
