import { internalApi } from '$lib/services/api';

/**
 * Service to interact with the Products API
 */
export const ProductsService = {
	/**
	 * Get all products
	 * @param {Object} filters - Filter options
	 * @param {string} [filters.search] - Search by code or name
	 * @param {boolean} [filters.is_active] - Filter by active status
	 * @param {number} [filters.limit] - Maximum results
	 * @param {number} [filters.offset] - Pagination offset
	 * @returns {Promise<Object>}
	 */
	async getAll(filters = {}) {
		const params = new URLSearchParams();

		// Default limit if not specified
		if (!filters.limit) {
			params.append('limit', '50');
		}

		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				params.append(key, value.toString());
			}
		});

		const queryString = params.toString() ? `?${params.toString()}` : '';
		return internalApi(`/internal/products${queryString}`);
	},

	/**
	 * Get a specific product by ID
	 * @param {string} id - Product ID
	 * @returns {Promise<Object>}
	 */
	async getById(id) {
		return internalApi(`/internal/products/${id}`);
	},

	/**
	 * Create a new product
	 * @param {Object} data - Product data
	 * @param {string} data.code - Unique product code
	 * @param {string} data.name - Product name
	 * @param {string} [data.description] - Product description
	 * @param {boolean} [data.is_active] - Active status
	 * @returns {Promise<Object>}
	 */
	async create(data) {
		return internalApi('/internal/products', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	},

	/**
	 * Update a product
	 * @param {string} id - Product ID
	 * @param {Object} data - Updated product data
	 * @param {string} [data.name] - Product name
	 * @param {string} [data.description] - Product description
	 * @param {boolean} [data.is_active] - Active status
	 * @returns {Promise<Object>}
	 */
	async update(id, data) {
		return internalApi(`/internal/products/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	},

	/**
	 * Soft delete a product (sets is_active = false)
	 * @param {string} id - Product ID
	 * @returns {Promise<void>}
	 */
	async delete(id) {
		return internalApi(`/internal/products/${id}`, {
			method: 'DELETE'
		});
	}
};
