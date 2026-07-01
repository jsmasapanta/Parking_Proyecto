import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenStore';

const BASE_URL = 'http://localhost:8000';

async function tryRefresh() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error('Sin refresh token');

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) throw new Error('Refresh fallido');

  const data = await res.json();
  saveTokens(data.access_token, data.refresh_token);
}

export async function apiFetch(path, options = {}, _retry = true) {
  const url = `${BASE_URL}${path}`;
  const token = getAccessToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (response.status === 401 && _retry) {
    try {
      await tryRefresh();
      return apiFetch(path, options, false);
    } catch {
      clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
      return null;
    }
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const mensaje = data?.message || `Error ${response.status} en ${path}`;
    throw new Error(Array.isArray(mensaje) ? mensaje.join(', ') : mensaje);
  }

  return data;
}
