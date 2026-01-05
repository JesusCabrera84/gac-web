import { internalApi } from '$lib/services/api';

/**
 * Service to interact with the Commands API
 */
export const CommandsService = {
	/*
	 * Create a new command
	 */

	/**
	 * Create a new command
	 * @param {Object} data
	 * @param {string} data.device_id
	 * @param {string} data.command
	 * @param {string} data.media
	 * @returns {Promise<Object>}
	 */
	async create(data) {
		return internalApi('/commands', {
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
		return internalApi(`/commands/device/${deviceId}${queryString}`);
	},

	/**
	 * Sync command status with KORE
	 * @param {string} commandId
	 * @returns {Promise<Object>}
	 */
	async sync(commandId) {
		return internalApi(`/commands/${commandId}/sync`, {
			method: 'POST'
		});
	}
};
