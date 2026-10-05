import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Nav grows one module at a time as each is actually built (Sales is the
// first, see CLAUDE.md's porting plan) -- not a full placeholder list for
// modules that don't exist yet.
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
          <NavLink to="/sales/invoices" className={({ isActive }) => (isActive ? 'active' : '')}>Invoices</NavLink>
          <NavLink to="/sales/customers" className={({ isActive }) => (isActive ? 'active' : '')}>Customers</NavLink>
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
