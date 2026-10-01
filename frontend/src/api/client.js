const TOKEN_KEY = 'quelron_token';
const SUPERADMIN_TOKEN_KEY = 'quelron_superadmin_token';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

export function getSuperAdminToken() { return localStorage.getItem(SUPERADMIN_TOKEN_KEY); }
export function setSuperAdminToken(token) { localStorage.setItem(SUPERADMIN_TOKEN_KEY, token); }
export function clearSuperAdminToken() { localStorage.removeItem(SUPERADMIN_TOKEN_KEY); }

// NOTE: JWT stored in localStorage, flagged as a known trade-off (see
// CLAUDE.md's "flagged, not yet changed" note) — an httpOnly-cookie pass is
// deliberately deferred to its own dedicated change, not a drive-by here.
export async function apiFetch(path, { method = 'GET', body, superAdmin = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = superAdmin ? getSuperAdminToken() : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
