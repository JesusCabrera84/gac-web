import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { PUBLIC_GAC_API_URL } from '$env/static/public';

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

    // Ensure endpoint starts with /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

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

// Cache for internal tokens: serviceName -> { token, expiration }
const internalTokenCache = new Map();

/**
 * Retrieves a valid internal token for a specific service, refreshing if necessary.
 * @param {string} service - The service identifier (e.g., 'nexus')
 * @returns {Promise<string>}
 */
export async function getInternalToken(service) {
    const now = Date.now();
    const cacheKey = service;
    const cached = internalTokenCache.get(cacheKey);

    // Use cached token if valid (buffer of 30 seconds before expiration)
    // Token expires in 5 minutes, we cache for 4.5 minutes.
    if (cached && now < cached.expiration) {
        return cached.token;
    }

    try {
        console.log(`Fetching new internal token for ${service}...`);

        // Use the existing api wrapper to make the request. 
        // This automatically adds the current user's Bearer token.
        const response = await api(`/internal/tokens/${service}`, {
            method: 'POST'
        });

        if (response && response.data) {
            const token = response.data;
            // Token expires in 5 minutes (300 seconds). Set expiration to 4.5 minutes (270 seconds) from now.
            const expiration = now + (4.5 * 60 * 1000);

            internalTokenCache.set(cacheKey, { token, expiration });
            return token;
        } else {
            throw new Error(`Invalid response from token endpoint for ${service}`);
        }
    } catch (error) {
        console.error(`Failed to get internal token for ${service}:`, error);
        throw error;
    }
}

