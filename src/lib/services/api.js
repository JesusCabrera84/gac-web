import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { PUBLIC_GAC_API_URL, PUBLIC_SISCOM_ADMIN_API_URL } from '$env/static/public';

/**
 * @param {string} endpoint
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function api(endpoint, options = {}) {
	const $auth = get(auth);
	/** @type {any} */
	const headers = {
		'Content-Type': 'application/json',
		...options.headers
	};

	if (options.body instanceof FormData) {
		delete headers['Content-Type'];
	}

	if ($auth.token) {
		headers['Authorization'] = `Bearer ${$auth.token}`;
	}

	const config = {
		...options,
		headers
	};

	// Ensure endpoint starts with / and remove trailing slash
	const safeEndpoint = endpoint.replace(/\/$/, '');
	const path = safeEndpoint.startsWith('/') ? safeEndpoint : `/${safeEndpoint}`;

	// Remove trailing slash from base URL if present
	const baseUrl = PUBLIC_GAC_API_URL.replace(/\/$/, '');

	// Construct URL with /api/v1 prefix
	const url = `${baseUrl}/api/v1${path}`;

	try {
		const response = await fetch(url, config);

		if (!response.ok) {
			// Handle 401 Unauthorized - maybe logout?
			if (response.status === 401) {
				console.warn('Unauthorized access, logging out...');
				// auth.logout(); // Circular dependency if we import logout directly, handle in component or separate logic
			}
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || `API Error: ${response.statusText}`);
		}

		// Return null for 204 No Content
		if (response.status === 204) {
			return null;
		}

		return await response.json();
	} catch (error) {
		console.error('API Request Failed:', error);
		throw error;
	}
}

// Cache for internal tokens: serviceKey -> { token, expiration }
const internalTokenCache = new Map();

/**
 * Retrieves a valid internal token (PASETO) for a specific service/role context.
 *
 * For Nexus services, we use the 'gac' service identity with 'NEXUS_ADMIN' role.
 *
 * @param {string} [serviceContext='nexus'] - Context identifier to map to actual credentials
 * @returns {Promise<string>}
 */
export async function getInternalToken(serviceContext = 'nexus') {
	const now = Date.now();
	const cacheKey = serviceContext; // e.g., 'nexus'
	const cached = internalTokenCache.get(cacheKey);

	// Use cached token if valid (buffer of 30 seconds before expiration)
	if (cached && now < cached.expiration - 30 * 1000) {
		return cached.token;
	}

	try {
		console.log(`Fetching new internal token for context: ${serviceContext}...`);

		// Map context to API credentials
		// Currently only handling 'nexus' context as per requirements
		const $auth = get(auth);
		// Robustly try to find the email, handling potential unexpected nesting
		const userEmail = $auth.user?.email || $auth.user?.data?.email;

		if (!userEmail) {
			const errorMsg =
				'No es posible obtener el token interno: El usuario no tiene email registrado o no hay sesión activa.';
			console.error(errorMsg);
			throw new Error(errorMsg);
		}

		let payload = {
			email: userEmail,
			service: 'gac',
			role: 'NEXUS_ADMIN',
			expires_in_hours: 24
		};

		// If we ever need other contexts, we can switch/map here.
		// For now, regardless of input 'nexus', we use these creds.

		// Use PUBLIC_SISCOM_ADMIN_API_URL for internal auth
		const baseUrl = (PUBLIC_SISCOM_ADMIN_API_URL || '').replace(/\/$/, '');
		const url = `${baseUrl}/api/v1/auth/internal`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || `Auth API Error: ${response.statusText}`);
		}

		const data = await response.json();

		if (data && data.token) {
			const token = data.token;
			// user might return expires_at ISO string
			const expiresAt = data.expires_at
				? new Date(data.expires_at).getTime()
				: now + 24 * 60 * 60 * 1000;

			// Cache it
			internalTokenCache.set(cacheKey, {
				token,
				expiration: expiresAt
			});

			return token;
		} else {
			throw new Error(`Invalid response from internal auth endpoint`);
		}
	} catch (error) {
		console.error(`Failed to get internal token for ${serviceContext}:`, error);
		throw error;
	}
}
