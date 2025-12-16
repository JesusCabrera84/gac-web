import { PUBLIC_SISCOM_ADMIN_API_URL } from '$env/static/public';
import { getInternalToken } from '$lib/services/api';

/**
 * Service to interact with the Trips API
 */
export const TripsService = {
	/**
	 * Generic fetch wrapper for the Trips API
	 * @param {string} endpoint
	 * @param {RequestInit} options
	 */
	async api(endpoint, options = {}) {
		let token;
		try {
			token = await getInternalToken('nexus');
		} catch {
			throw new Error('No se pudo autenticar con el servicio Nexus');
		}

		/** @type {any} */
		const headers = {
			Authorization: `Bearer ${token}`,
			...options.headers
		};

		if (!headers['Content-Type']) {
			headers['Content-Type'] = 'application/json';
		}

		const config = {
			...options,
			headers
		};

		// Ensure endpoint starts with / and remove trailing slash
		const safeEndpoint = endpoint.replace(/\/$/, '');
		const path = safeEndpoint.startsWith('/') ? safeEndpoint : `/${safeEndpoint}`;

		const baseUrl = (PUBLIC_SISCOM_ADMIN_API_URL || '').replace(/\/$/, '');
		const url = `${baseUrl}${path}`;

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `API Error: ${response.statusText}`);
			}

			if (response.status === 204) {
				return null;
			}

			return await response.json();
		} catch (error) {
			console.error('Trips API Request Failed:', error);
			throw error;
		}
	},

	/**
	 * Get trips list
	 * @param {Object} filters
	 * @param {string} [filters.device_id]
	 * @param {string} [filters.day] - YYYY-MM-DD
	 * @param {string} [filters.tz]
	 * @param {number} [filters.limit]
	 * @returns {Promise<Object>} { trips: [], total: number, ... }
	 */
	async getTrips(filters = {}) {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				params.append(key, value.toString());
			}
		});

		const queryString = params.toString() ? `?${params.toString()}` : '';
		return this.api(`/api/v1/trips${queryString}`);
	},

	/**
	 * Get trip details by ID
	 * @param {string} tripId
	 * @param {Object} options
	 * @param {boolean} [options.include_alerts]
	 * @param {boolean} [options.include_points]
	 * @param {boolean} [options.include_events]
	 * @returns {Promise<Object>}
	 */
	async getTripById(tripId, options = {}) {
		const params = new URLSearchParams();
		if (options.include_alerts) params.append('include_alerts', 'true');
		if (options.include_points) params.append('include_points', 'true');
		if (options.include_events) params.append('include_events', 'true');

		const queryString = params.toString() ? `?${params.toString()}` : '';
		return this.api(`/api/v1/trips/${tripId}${queryString}`);
	}
};
