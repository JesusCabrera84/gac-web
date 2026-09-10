import { PUBLIC_SISCOM_API_URL } from '$env/static/public';
import { proxyPublicApi } from '$lib/server/publicApiProxy';
import { error } from '@sveltejs/kit';

/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @returns {Promise<Response>}
 */
async function handle({ params, request, url }) {
	if (!PUBLIC_SISCOM_API_URL) {
		error(500, 'PUBLIC_SISCOM_API_URL no está configurada');
	}
	return proxyPublicApi(request, params.path, url.search, PUBLIC_SISCOM_API_URL);
}

export const GET = handle;
export const HEAD = handle;
