import { api } from './api';

export const userService = {
	/**
	 * Get all users
	 * @param {number} skip
	 * @param {number} limit
	 */
	getUsers: async (skip = 0, limit = 100) => {
		return await api(`users?skip=${skip}&limit=${limit}`);
	},

	/**
	 * Create a new user
	 * @param {Object} userData
	 */
	createUser: async (userData) => {
		return await api('users', {
			method: 'POST',
			body: JSON.stringify(userData)
		});
	},

	/**
	 * Get a user by ID
	 * @param {string} userId
	 */
	getUser: async (userId) => {
		return await api(`users/${userId}`);
	},

	/**
	 * Update a user
	 * @param {string} userId
	 * @param {Object} userData
	 */
	updateUser: async (userId, userData) => {
		return await api(`users/${userId}`, {
			method: 'PATCH',
			body: JSON.stringify(userData)
		});
	},

	/**
	 * Delete a user (soft delete)
	 * @param {string} userId
	 */
	deleteUser: async (userId) => {
		return await api(`users/${userId}`, {
			method: 'DELETE'
		});
	},

	/**
	 * Get all roles
	 */
	getRoles: async () => {
		return await api('roles');
	},

	/**
	 * Create a new role
	 * @param {string} name
	 */
	createRole: async (name) => {
		return await api('roles', {
			method: 'POST',
			body: JSON.stringify({ name })
		});
	},

	/**
	 * Assign a role to a user
	 * @param {string} userId
	 * @param {string} roleId
	 */
	assignRole: async (userId, roleId) => {
		return await api(`users/${userId}/roles/${roleId}`, {
			method: 'POST'
		});
	},

	/**
	 * Revoke a role from a user
	 * @param {string} userId
	 * @param {string} roleId
	 */
	revokeRole: async (userId, roleId) => {
		return await api(`users/${userId}/roles/${roleId}`, {
			method: 'DELETE'
		});
	}
};
