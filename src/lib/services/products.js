import { api } from './api';

export const productService = {
	/**
	 * Get all products
	 */
	getProducts: async () => {
		return await api('products');
	},

	/**
	 * Create a new product
	 * @param {Object} productData
	 */
	createProduct: async (productData) => {
		return await api('products', {
			method: 'POST',
			body: JSON.stringify(productData)
		});
	}
};
