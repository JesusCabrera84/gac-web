import { get } from 'svelte/store';
import { PUBLIC_SISCOM_ADMIN_API_URL } from '$env/static/public';
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
        } catch (error) {
            // Propagate error
            throw new Error('No se pudo autenticar con el servicio Nexus');
        }

        /** @type {any} */
        const headers = {
            'Authorization': `Bearer ${token}`,
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

        // Ensure endpoint starts with /
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

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
    }
};
