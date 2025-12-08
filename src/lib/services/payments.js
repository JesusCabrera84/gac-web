import { api } from './api';

export const paymentService = {
	/**
	 * Create a new payment
	 * @param {Object} paymentData
	 */
	createPayment: async (paymentData) => {
		return await api('payments', {
			method: 'POST',
			body: JSON.stringify(paymentData)
		});
	},

	/**
	 * Get a payment by ID
	 * @param {string} paymentId
	 */
	getPayment: async (paymentId) => {
		return await api(`payments/${paymentId}`);
	},

	/**
	 * Get all payments for a client
	 * @param {string} clientId
	 */
	getClientPayments: async (clientId) => {
		return await api(`clients/${clientId}/payments`);
	}
};
