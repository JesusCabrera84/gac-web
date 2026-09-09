import { describe, it, expect, vi } from 'vitest';
import { filterForwardHeaders, publicBackendUrl, proxyPublicApi } from './publicApiProxy.js';

describe('publicApiProxy', () => {
	it('builds the backend URL under /api/v1', () => {
		expect(publicBackendUrl('http://10.8.0.1:8000', 'devices/1/communications/latest')).toBe(
			'http://10.8.0.1:8000/api/v1/devices/1/communications/latest'
		);
	});

	it('preserves the query string', () => {
		expect(
			publicBackendUrl(
				'http://10.8.0.1:8000/',
				'/devices/1/communications',
				'?received_at=2026-01-01'
			)
		).toBe('http://10.8.0.1:8000/api/v1/devices/1/communications?received_at=2026-01-01');
	});

	it('rejects an empty backend origin', () => {
		expect(() => publicBackendUrl('', 'devices/1')).toThrow('PUBLIC_SISCOM_API_URL');
	});

	it('drops hop-by-hop headers and keeps Authorization', () => {
		const filtered = filterForwardHeaders(
			new Headers({
				Authorization: 'Bearer tok',
				Host: '10.8.0.1:5160',
				Connection: 'keep-alive',
				Accept: 'application/json'
			})
		);
		expect(filtered.get('Authorization')).toBe('Bearer tok');
		expect(filtered.get('Accept')).toBe('application/json');
		expect(filtered.get('Host')).toBeNull();
		expect(filtered.get('Connection')).toBeNull();
	});

	it('forwards GET to the backend and returns its status', async () => {
		const fetchFn = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json', Connection: 'close' }
			})
		);
		const response = await proxyPublicApi(
			new Request('http://gac.local/api/public/devices/1/communications/latest', {
				headers: { Authorization: 'Bearer tok' }
			}),
			'devices/1/communications/latest',
			'',
			'http://10.8.0.1:8000',
			fetchFn
		);
		expect(fetchFn).toHaveBeenCalledWith(
			'http://10.8.0.1:8000/api/v1/devices/1/communications/latest',
			expect.objectContaining({ method: 'GET' })
		);
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toContain('application/json');
		expect(response.headers.get('Connection')).toBeNull();
		await expect(response.json()).resolves.toEqual({ ok: true });
	});

	it('forwards a body on non-GET requests', async () => {
		const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
		const response = await proxyPublicApi(
			new Request('http://gac.local/api/public/unused', {
				method: 'POST',
				body: JSON.stringify({ ping: true }),
				headers: { 'Content-Type': 'application/json' }
			}),
			'unused',
			'',
			'http://10.8.0.1:8000',
			fetchFn
		);
		expect(fetchFn).toHaveBeenCalledWith(
			'http://10.8.0.1:8000/api/v1/unused',
			expect.objectContaining({ method: 'POST' })
		);
		expect(fetchFn.mock.calls[0][1].body).toBeInstanceOf(ArrayBuffer);
		expect(response.status).toBe(204);
	});
});
