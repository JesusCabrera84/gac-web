import { PUBLIC_SISCOM_ADMIN_API_URL } from '$env/static/public';
import { getInternalToken } from '$lib/services/api';

/**
 * Service to interact with the Commands API
 */
export const CommandsService = {
	/**
	 * Generic fetch wrapper for the Commands API
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
			console.error('Commands API Request Failed:', error);
			throw error;
		}
	},

	/**
	 * Create a new command
	 * @param {Object} data
	 * @param {string} data.device_id
	 * @param {string} data.command
	 * @param {string} data.media
	 * @returns {Promise<Object>}
	 */
	async create(data) {
		return this.api('/api/v1/commands', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	},

	/**
	 * Get commands for a specific device
	 * @param {string} deviceId
	 * @param {Object} params - Query parameters (limit, offset, status_filter)
	 * @returns {Promise<Object>} - { commands: [], total: number }
	 */
	async getByDevice(deviceId, params = {}) {
		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				searchParams.append(key, value);
			}
		});

		const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
		return this.api(`/api/v1/commands/device/${deviceId}${queryString}`);
	}
};
