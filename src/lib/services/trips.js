import { internalApi } from '$lib/services/api';

/**
 * Service to interact with the Trips API
 */
export const TripsService = {
	/*
	 * Get trips list
	 */
	async getTrips(filters = {}) {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				params.append(key, value.toString());
			}
		});

		const queryString = params.toString() ? `?${params.toString()}` : '';
		return internalApi(`/api/v1/trips${queryString}`);
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
		return internalApi(`/api/v1/trips/${tripId}${queryString}`);
	}
};
