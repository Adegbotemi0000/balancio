import { createContext, useContext, useState } from 'react';
import { getToken, setToken, clearToken } from './api/client';
import { login as apiLogin, signup as apiSignup } from './api/auth';

const AuthContext = createContext(null);

// Phase 0 keeps this simple: the signup/login response already carries
// user + tenant, cached in memory for the session. A dedicated "restore
// session from token on page reload" fetch can be added once /auth/me
// returns full profile data, not just ids -- until then, a hard refresh
// clears the in-memory user/tenant (the token itself still persists in
// localStorage, so an API call still authenticates; only the displayed
// name/tenant info would need re-fetching).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);

  async function login(email, password) {
    const res = await apiLogin(email, password);
    setToken(res.token);
    setUser(res.user);
    setTenant(res.tenant);
    return res;
  }

  async function signup(payload) {
    const res = await apiSignup(payload);
    setToken(res.token);
    setUser(res.user);
    setTenant(res.tenant);
    return res;
  }

  function logout() {
    clearToken();
    setUser(null);
    setTenant(null);
  }

  return (
    <AuthContext.Provider value={{ user, tenant, login, signup, logout, isAuthenticated: !!getToken() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
