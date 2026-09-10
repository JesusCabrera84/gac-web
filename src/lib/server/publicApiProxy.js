/**
 * Proxy same-origin hacia siscom-api (plano de datos).
 *
 * El bundle no debe llamar a PUBLIC_SISCOM_API_URL desde el navegador: ese
 * origen no está en ALLOWED_ORIGINS y el preflight se rechaza. Vite ya cubre
 * `/api/public` en desarrollo; en producción lo cubre la ruta SvelteKit que
 * usa estas funciones.
 *
 * POR QUÉ ESTO ES UNA LISTA BLANCA Y NO UN PASO DE TODO
 * =====================================================
 * Esta ruta es el **primer endpoint de servidor de gac-web**, y no tiene
 * autenticación: la sesión de GAC vive entera en el cliente
 * (`+layout.svelte`), así que cualquiera que alcance el dominio puede pedir lo
 * que esta función deje pasar. Al otro lado está siscom-api, que hoy sirve el
 * histórico de posiciones **sin autenticar** — el bloqueador conocido del
 * plano de datos.
 *
 * Ponerle autenticación al proxy no es un parche sino un proyecto (no hay
 * sesión de servidor en gac-web), y esa puerta se decide cuando se resuelva el
 * bloqueador de siscom-api, que es donde vive el problema de verdad. Mientras
 * tanto la superficie se acota a lo que el panel necesita:
 *
 *   - **Rutas**: solo las dos de comunicaciones. Nada más entra.
 *   - **Métodos**: solo lectura. Un POST no cruza aunque alguien exporte el
 *     handler en la ruta.
 *   - **Cabeceras hacia el backend**: lista blanca. En particular **no viaja
 *     `Authorization`**: `internalApi` adjunta el PASETO interno de GAC a
 *     todas sus llamadas, y ese token es del plano de control. Que llegue al
 *     plano de datos contradice la separación de claves de la Fase 1
 *     (ADR-004 y ADR-005 de siscom-admin-api). Antes lo frenaba CORS; ahora lo
 *     frena esto.
 *   - **Cabeceras hacia el navegador**: lista blanca, y `Set-Cookie` se cae.
 *     Al ser same-origin, una cookie del backend se instalaría **en el dominio
 *     de GAC**.
 *
 * Cuando siscom-api empiece a exigir el data token, la cabecera que lo lleve
 * se añade aquí explícitamente. Una a una, nunca reenviando todo.
 */

/** Lo único que el panel pide por aquí (`src/lib/services/devices.js`). */
const RUTAS_PERMITIDAS = [
	/^devices\/[A-Za-z0-9._-]{1,128}\/communications$/,
	/^devices\/[A-Za-z0-9._-]{1,128}\/communications\/latest$/
];

const METODOS_PERMITIDOS = new Set(['GET', 'HEAD']);

const CABECERAS_AL_BACKEND = new Set(['accept', 'accept-language', 'content-type']);

const CABECERAS_AL_NAVEGADOR = new Set([
	'content-type',
	'content-language',
	'cache-control',
	'etag',
	'last-modified',
	'vary'
]);

/**
 * @param {string} restPath
 * @returns {boolean}
 */
export function rutaPermitida(restPath) {
	const path = String(restPath || '').replace(/^\/+/, '');
	return RUTAS_PERMITIDAS.some((re) => re.test(path));
}

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

	const base = `${origin}/api/v1/`;
	// `new URL` resuelve los `..` igual que los resolvería `fetch`, y el
	// prefijo se comprueba DESPUÉS de resolverlos: es lo que impide que un
	// `%2e%2e` se salga de `/api/v1/` y alcance cualquier otra ruta del mismo
	// host. Concatenar y confiar deja pasar `devices/../../algo`, que fetch
	// normaliza sin decir nada.
	const url = new URL(`${path}${query}`, base);
	if (!url.href.startsWith(base)) {
		throw new Error(`Ruta fuera de /api/v1: ${path}`);
	}
	return url.href;
}

/**
 * @param {Headers} incoming
 * @param {Set<string>} permitidas
 * @returns {Headers}
 */
export function filtrarCabeceras(incoming, permitidas) {
	const headers = new Headers();
	for (const [key, value] of incoming) {
		if (permitidas.has(key.toLowerCase())) {
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
	if (!METODOS_PERMITIDOS.has(request.method)) {
		return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
	}
	if (!rutaPermitida(restPath)) {
		return new Response(null, { status: 404 });
	}

	const target = publicBackendUrl(backendOrigin, restPath, search);
	const upstream = await fetchFn(target, {
		method: request.method,
		headers: filtrarCabeceras(request.headers, CABECERAS_AL_BACKEND)
	});

	return new Response(upstream.body, {
		status: upstream.status,
		headers: filtrarCabeceras(upstream.headers, CABECERAS_AL_NAVEGADOR)
	});
}
