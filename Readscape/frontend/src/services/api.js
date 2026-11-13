const base = import.meta.env.VITE_API_URL || '/api';
export async function api(path, options = {}) {
  const token = sessionStorage.getItem('readscapeToken');
  const response = await fetch(`${base}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/login')) {
      sessionStorage.removeItem('readscapeToken');
      window.location.assign('/login');
    }
    throw new Error(data?.error || 'Request failed. Please try again.');
  }
  return data;
}
export function saveLogin(data) { sessionStorage.setItem('readscapeToken', data.token); }
