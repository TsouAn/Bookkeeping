import { afterEach, describe, expect, test, vi } from 'vitest';
import { api } from '../src/api.js';

function mockFetch(status, body) {
  const fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new Error('no body')) : Promise.resolve(body)),
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

afterEach(() => vi.unstubAllGlobals());

describe('api.js', () => {
  test('成功時回傳後端資料', async () => {
    mockFetch(200, [{ id: 1 }]);
    await expect(api.list('2026-10')).resolves.toEqual([{ id: 1 }]);
  });

  test('失敗時丟出含後端 error 訊息的錯誤', async () => {
    mockFetch(400, { error: '金額必須是大於 0 的整數' });
    await expect(api.create({ amount: 0 })).rejects.toThrow('金額必須是大於 0 的整數');
  });

  test('後端沒回 JSON 時仍有可讀的錯誤訊息', async () => {
    mockFetch(502, undefined);
    await expect(api.summary('2026-10')).rejects.toThrow('伺服器錯誤（502）');
  });

  test('刪除成功（204）回傳 null', async () => {
    const fetch = mockFetch(204, undefined);
    await expect(api.remove(5)).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/transactions/5', expect.objectContaining({ method: 'DELETE' }));
  });

  test('新增時送出 JSON', async () => {
    const fetch = mockFetch(201, { id: 1 });
    await api.create({ amount: 120 });
    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ amount: 120 });
  });

  test('compare 組出正確的查詢網址', async () => {
    const fetch = mockFetch(200, {});
    await api.compare('week', '2026-10-05', '2026-10-12');
    expect(fetch.mock.calls[0][0]).toBe('/api/compare?unit=week&a=2026-10-05&b=2026-10-12');
  });
});
