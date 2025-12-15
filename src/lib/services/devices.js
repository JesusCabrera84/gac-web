import { PUBLIC_SISCOM_ADMIN_API_URL, PUBLIC_SISCOM_API_URL } from '$env/static/public';
import { getInternalToken } from '$lib/services/api';

/**
 * Service to interact with the Devices API
 */
export const DevicesService = {
	/**
	 * Generic fetch wrapper for the Devices API
	 * @param {string} endpoint
	 * @param {RequestInit} options
	 */
	async api(endpoint, options = {}) {
		let token;
		try {
			token = await getInternalToken('nexus');
		} catch {
			// Propagate error
			throw new Error('No se pudo autenticar con el servicio Nexus');
		}

		/** @type {any} */
		const headers = {
			Authorization: `Bearer ${token}`,
			...options.headers
		};

		// If body is FormData, remove Content-Type to let browser set it with boundary
		if (options.body instanceof FormData) {
			delete headers['Content-Type'];
		} else if (!headers['Content-Type']) {
			headers['Content-Type'] = 'application/json';
		}

		const config = {
			...options,
			headers
		};

		// Ensure endpoint starts with / and remove trailing slash
		const safeEndpoint = endpoint.replace(/\/$/, '');
		const path = safeEndpoint.startsWith('/') ? safeEndpoint : `/${safeEndpoint}`;

		// Remove trailing slash from base URL if present
		// Provide a fallback just in case the env var isn't set yet (though it should be)
		const baseUrl = (PUBLIC_SISCOM_ADMIN_API_URL || '').replace(/\/$/, '');

		// Construct URL
		const url = `${baseUrl}${path}`;

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				if (response.status === 401) {
					console.warn('Unauthorized access to Devices API (Nexus token might be invalid)');
					// Potentially invalidate cache and retry once?
					// internal cache invalidation should be handled via api service ideally if we had a method for it,
					// for now just warn.
				}
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `API Error: ${response.statusText}`);
			}

			if (response.status === 204) {
				return null;
			}

			return await response.json();
		} catch (error) {
			console.error('Devices API Request Failed:', error);
			throw error;
		}
	},

	/**
	 * Get all devices with optional filters
	 * @param {Object} filters
	 * @returns {Promise<Array<Object>>}
	 */
	async getAll(filters = {}) {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				params.append(key, value);
			}
		});

		const queryString = params.toString() ? `?${params.toString()}` : '';
		return this.api(`/api/v1/devices/${queryString}`);
	},

	/**
	 * Get a specific device by ID
	 * @param {string} id
	 * @returns {Promise<Object>}
	 */
	async getById(id) {
		return this.api(`/api/v1/devices/${id}`);
	},

	/**
	 * Create a new device
	 * @param {Object} data
	 * @returns {Promise<Object>}
	 */
	async create(data) {
		return this.api('/api/v1/devices/', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	},

	/**
	 * Update a device
	 * @param {string} id
	 * @param {Object} data
	 * @returns {Promise<Object>}
	 */
	async update(id, data) {
		return this.api(`/api/v1/devices/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	},

	/**
	 * Update device status
	 * @param {string} id
	 * @param {Object} data - { new_status, client_id?, unit_id?, notes? }
	 * @returns {Promise<Object>}
	 */
	async updateStatus(id, data) {
		return this.api(`/api/v1/devices/${id}/status`, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	},

	/**
	 * Get device events history
	 * @param {string} id
	 * @returns {Promise<Array<Object>>}
	 */
	async getEvents(id) {
		return this.api(`/api/v1/devices/${id}/events`);
	},

	/**
	 * Get latest communication for a specific device
	 * Uses the PUBLIC_SISCOM_API_URL instead of admin
	 * @param {string} id
	 * @returns {Promise<Object>}
	 */
	async getLatestCommunication(id) {
		// We need to use valid token from internal auth, so we reuse this.api logic
		// BUT we need to target a different base URL.
		// Since this.api uses PUBLIC_SISCOM_ADMIN_API_URL by default logic (via existing code),
		// we might need to override it or make a separate call.
		// Lets reuse existing logic but we need to handle the different base URL.
		// The current this.api implementation hardcodes base URL logic.
		// We will implement a specific fetch here to avoid breaking changes in this.api or complex refactors.

		let token;
		try {
			token = await getInternalToken('nexus');
		} catch {
			throw new Error('No se pudo autenticar con el servicio Nexus');
		}

		const baseUrl = (PUBLIC_SISCOM_API_URL || '').replace(/\/$/, '');
		const url = `${baseUrl}/api/v1/devices/${id}/communications/latest`;

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || `API Error: ${response.statusText}`);
		}

		return await response.json();
	},

	/**
	 * Get the WebSocket URL for device stream
	 * @param {string|string[]} deviceIds - Single ID or array of IDs
	 * @returns {string}
	 */
	getStreamUrl(deviceIds) {
		const baseUrl = (PUBLIC_SISCOM_API_URL || '').replace(/\/$/, '');
		// Replace http/https with ws/wss
		const wsUrl = baseUrl.replace(/^http/, 'ws');
		const ids = Array.isArray(deviceIds) ? deviceIds.join(',') : deviceIds;

		return `${wsUrl}/api/v1/stream?device_ids=${ids}`;
	},

	/**
	 * Get communications history for a device
	 * @param {string} deviceId
	 * @param {string} [date] - YYYY-MM-DD
	 * @returns {Promise<Array>}
	 */
	async getCommunications(deviceId, date) {
		const endpoint = `/api/v1/devices/${deviceId}/communications`;
		const params = new URLSearchParams();
		if (date) {
			params.append('received_at', date);
		}
		const queryString = params.toString() ? `?${params.toString()}` : '';

		let token;
		try {
			token = await getInternalToken('nexus');
		} catch {
			throw new Error('No se pudo autenticar con el servicio Nexus');
		}

		const baseUrl = (PUBLIC_SISCOM_API_URL || '').replace(/\/$/, '');
		const url = `${baseUrl}${endpoint}${queryString}`;

		try {
			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `API Error: ${response.statusText}`);
			}

			if (response.status === 204) {
				return [];
			}

			return await response.json();
		} catch (error) {
			console.error('Communications History API Request Failed:', error);
			throw error;
		}
	}
};
