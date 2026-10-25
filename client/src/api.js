const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export async function api(path, { token, body, ...options } = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 204) return null;
  let data;
  try { data = await response.json(); } catch { throw new Error('The server returned an unexpected response. Please try again.'); }
  if (!response.ok) {
    const error = new Error(data.error?.message || 'This request could not be completed.');
    error.fields = data.error?.fields; error.status = response.status;
    if (response.status === 401 && token) window.dispatchEvent(new Event('session-expired'));
    throw error;
  }
  return data;
}
