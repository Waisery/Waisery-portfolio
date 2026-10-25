const base = (import.meta.env?.VITE_API_URL || '/api').trim().replace(/\/$/, '');
export async function api(path, { token, body, signal, timeoutMs = 65000, ...options } = {}) {
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  if (signal?.aborted) cancel();
  else signal?.addEventListener('abort', cancel, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetch(`${base}${path}`, {
      ...options, signal: controller.signal,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (response.status === 204) return null;
    let data;
    try { data = await response.json(); } catch {
      if (controller.signal.aborted) throw new DOMException('Request aborted.', 'AbortError');
      const error = new Error(response.ok ? 'The server returned an unexpected response. Please try again.' : 'The service is temporarily unavailable. Please try again shortly.');
      error.status = response.status; throw error;
    }
    if (!response.ok) {
      const error = new Error(data.error?.message || 'This request could not be completed.');
      error.fields = data.error?.fields; error.status = response.status;
      if (response.status === 401 && token && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('session-expired', { detail: { token } }));
      throw error;
    }
    return data;
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Request cancelled.', 'AbortError');
    if (timedOut) throw new Error('The service is taking longer than expected. Please try again shortly.');
    if (error instanceof TypeError) throw new Error('Unable to reach the service. Check your connection and try again.');
    throw error;
  } finally {
    clearTimeout(timer); signal?.removeEventListener('abort', cancel);
  }
}
