// 所有呼叫後端的程式集中在這裡（見 design.md 決策 1）
async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  if (res.status === 204) return null;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? `伺服器錯誤（${res.status}）`);
  }
  return body;
}

export const api = {
  list: (month) => request(`/api/transactions?month=${encodeURIComponent(month)}`),
  create: (data) => request('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
  summary: (month) => request(`/api/summary?month=${encodeURIComponent(month)}`),
  compare: (unit, a, b) => request(`/api/compare?${new URLSearchParams({ unit, a, b })}`),
};
