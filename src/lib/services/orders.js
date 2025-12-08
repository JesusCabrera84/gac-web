import { api } from './api';

export const orderService = {
	/**
	 * Create a new order
	 * @param {Object} orderData
	 */
	createOrder: async (orderData) => {
		return await api('orders', {
			method: 'POST',
			body: JSON.stringify(orderData)
		});
	},

	/**
	 * Get an order by ID
	 * @param {string} orderId
	 */
	getOrder: async (orderId) => {
		return await api(`orders/${orderId}`);
	},

	/**
	 * Get all orders for a client
	 * @param {string} clientId
	 */
	getClientOrders: async (clientId) => {
		return await api(`clients/${clientId}/orders`);
	}
};
