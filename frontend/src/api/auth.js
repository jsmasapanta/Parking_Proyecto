import { saveTokens, clearTokens, isAuthenticated } from './tokenStore';

const BASE_URL = 'http://localhost:8000';

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.message || 'Credenciales incorrectas';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }

  saveTokens(data.access_token, data.refresh_token);
  return data;
}

export function logout() {
  clearTokens();
}

export { isAuthenticated };
