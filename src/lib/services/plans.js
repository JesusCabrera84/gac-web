import { internalApi } from '$lib/services/api';

/**
 * @typedef {Object} PlanCapability
 * @property {string} [id]
 * @property {string} [capability_id]
 * @property {string} capability_code
 * @property {any} [value]
 * @property {number} [value_int]
 * @property {boolean} [value_bool]
 * @property {string} [value_type]
 */

/**
 * @typedef {Object} PlanProduct
 * @property {string} product_id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} Plan
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} [description]
 * @property {string} price_monthly
 * @property {string} price_yearly
 * @property {boolean} is_active
 * @property {PlanCapability[]} [capabilities]
 * @property {PlanProduct[]} [products]
 * @property {string[]} [product_codes] - Used for creation/updates
 * @property {number} [subscriptions_count]
 * @property {string} created_at
 * @property {string} [updated_at]
 */

export const PlansService = {
    /**
     * Lists all available service plans (internal).
     * @param {boolean} [includeInactive=true]
     * @returns {Promise<Plan[]>}
     */
    getAll: async (includeInactive = true) => {
        return await internalApi(`/internal/plans?include_inactive=${includeInactive}`);
    },

    /**
     * Gets detailed information for a specific plan (internal).
     * @param {string} id - Plan UUID.
     * @returns {Promise<Plan>}
     */
    getById: async (id) => {
        return await internalApi(`/internal/plans/${id}`);
    },

    /**
     * Creates a new service plan (composite operation).
     * @param {Partial<Plan>} data
     * @returns {Promise<Plan>}
     */
    create: async (data) => {
        return await internalApi('/internal/plans', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * Updates an existing service plan (composite operation).
     * @param {string} id
     * @param {Partial<Plan>} data
     * @returns {Promise<Plan>}
     */
    update: async (id, data) => {
        return await internalApi(`/internal/plans/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    /**
     * Deletes a plan.
     * @param {string} id
     */
    delete: async (id) => {
        return await internalApi(`/internal/plans/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * Lists available products for selection.
     */
    getAvailableProducts: async () => {
        return await internalApi('/internal/plans/products');
    },

    /**
     * Lists available capability definitions.
     */
    getAvailableCapabilities: async () => {
        return await internalApi('/internal/plans/capabilities');
    }
};
