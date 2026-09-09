/**
 * Proxy same-origin hacia siscom-api (plano de datos).
 *
 * El bundle no debe llamar a PUBLIC_SISCOM_API_URL desde el navegador: ese
 * origen no está en ALLOWED_ORIGINS y el preflight se rechaza. Vite ya cubre
 * `/api/public` en desarrollo; en producción lo cubre la ruta SvelteKit que
 * usa estas funciones.
 */

const HOP_BY_HOP = new Set([
	'connection',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailers',
	'transfer-encoding',
	'upgrade',
	'host',
	'content-length'
]);

/**
 * @param {string} backendOrigin
 * @param {string} restPath
 * @param {string} [search]
 * @returns {string}
 */
export function publicBackendUrl(backendOrigin, restPath, search = '') {
	if (!backendOrigin) {
		throw new Error('PUBLIC_SISCOM_API_URL no está configurada');
	}
	const origin = backendOrigin.replace(/\/$/, '');
	const path = String(restPath || '').replace(/^\/+/, '');
	const query = !search || search.startsWith('?') ? search : `?${search}`;
	return `${origin}/api/v1/${path}${query}`;
}

/**
 * @param {Headers} incoming
 * @returns {Headers}
 */
export function filterForwardHeaders(incoming) {
	const headers = new Headers();
	for (const [key, value] of incoming) {
		if (!HOP_BY_HOP.has(key.toLowerCase())) {
			headers.set(key, value);
		}
	}
	return headers;
}

/**
 * @param {Request} request
 * @param {string} restPath
 * @param {string} search
 * @param {string} backendOrigin
 * @param {(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>} [fetchFn]
 * @returns {Promise<Response>}
 */
export async function proxyPublicApi(request, restPath, search, backendOrigin, fetchFn = fetch) {
	const target = publicBackendUrl(backendOrigin, restPath, search);
	/** @type {RequestInit} */
	const init = {
		method: request.method,
		headers: filterForwardHeaders(request.headers)
	};
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		init.body = await request.arrayBuffer();
	}

	const upstream = await fetchFn(target, init);
	return new Response(upstream.body, {
		status: upstream.status,
		headers: filterForwardHeaders(upstream.headers)
	});
}
