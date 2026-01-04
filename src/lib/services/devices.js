import { PUBLIC_SISCOM_API_URL } from '$env/static/public';
import { internalApi } from '$lib/services/api';

/**
 * Service to interact with the Devices API
 */
export const DevicesService = {
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
		return internalApi(`/devices/${queryString}`);
	},

	/**
	 * Get a specific device by ID
	 * @param {string} id
	 * @returns {Promise<Object>}
	 */
	async getById(id) {
		return internalApi(`/devices/${id}`);
	},

	/**
	 * Create a new device
	 * @param {Object} data
	 * @returns {Promise<Object>}
	 */
	async create(data) {
		return internalApi('/devices/', {
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
		return internalApi(`/devices/${id}`, {
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
		return internalApi(`/devices/${id}/status`, {
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
		return internalApi(`/devices/${id}/events`);
	},

	/**
	 * Assign device to organization
	 * @param {string} id
	 * @param {string} organizationId
	 * @param {string} [status]
	 * @returns {Promise<Object>}
	 */
	async assignOrganization(id, organizationId, status = 'preparado') {
		/** @type {any} */
		const payload = { organization_id: organizationId };
		if (status) payload.status = status;

		return internalApi(`/devices/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(payload)
		});
	},

	/**
	 * Get latest communication for a specific device
	 * Uses the PUBLIC_SISCOM_API_URL instead of admin
	 * @param {string} id
	 * @returns {Promise<Object>}
	 */
	async getLatestCommunication(id) {
		return internalApi(`/devices/${id}/communications/latest`, {
			service: 'public'
		});
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

		return `${wsUrl}/devices/stream?device_ids=${ids}`;
	},

	/**
	 * Get communications history for a device
	 * @param {string} deviceId
	 * @param {string} date - YYYY-MM-DD
	 * @param {string} [tz] - Timezone
	 * @returns {Promise<Array<any>>}
	 */
	async getCommunications(deviceId, date, tz) {
		const params = new URLSearchParams();
		if (date) params.append('received_at', date);
		if (tz) params.append('tz', tz);
		const queryString = params.toString() ? `?${params.toString()}` : '';

		return internalApi(`/devices/${deviceId}/communications${queryString}`, {
			service: 'public'
		});
	}
};
