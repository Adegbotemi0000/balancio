import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Phase 0 nav is minimal on purpose -- Dashboard + Settings only exist so
// far; the full module list (Sales, Purchases, Inventory, GL, Payroll, ...)
// gets its own nav sections as each is actually built in Phase 1/2.
export default function Layout({ children }) {
  const { user, tenant, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          Balancio
          <small>{tenant?.name || 'Loading...'}</small>
        </div>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>Settings</NavLink>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: '#d4d4d6', marginBottom: 8 }}>{user?.fullName}</div>
          <button className="btn" onClick={logout} style={{ width: '100%' }}>Log out</button>
        </div>
      </aside>
      <div className="main-area">{children}</div>
    </div>
  );
}
