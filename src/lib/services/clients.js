import { internalApi } from '$lib/services/api';

/**
 * Service to interact with the Clients API
 */
export const ClientsService = {
	/*
	 * Get all clients
	 */
	async getAll(filters = {}) {
		const params = new URLSearchParams();
		// Default limit if not specified
		if (!filters.limit) {
			params.append('limit', '50');
		}

		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				params.append(key, value);
			}
		});

		const queryString = params.toString() ? `?${params.toString()}` : '';
		return internalApi(`/internal/accounts${queryString}`);
	},

	/**
	 * Get client statistics
	 * @returns {Promise<Object>}
	 */
	async getStats() {
		return internalApi('/internal/accounts/stats');
	},

	/**
	 * Get a specific client by ID
	 * @param {string} id
	 * @returns {Promise<Object>}
	 */
	async getById(id) {
		return internalApi(`/internal/accounts/${id}`);
	},

	/**
	 * Get organizations for a specific client
	 * @param {string} id
	 * @returns {Promise<Array<Object>>}
	 */
	async getOrganizations(id) {
		const response = await internalApi(`/internal/accounts/${id}/organizations`);
		// @ts-ignore
		return Array.isArray(response) ? response : response.organizations || [];
	}

	/**
	 * Create a new client (Note: Creating typically still uses the public endpoint or might be internal too?
	 * The docs show GET /internal endpoints but for creation it was unrelated in the new doc.
	 * The user said "te comparto la documentación de siscom-admin-api para los clientes" implies this replaces previous doc.
	 * But the previous doc had POST /api/v1/clients (public registration).
	 * Usually "internal" APIs are for management.
	 * I will leave create as is pointing to Public Registration unless I see a POST /internal/clients in the docs.
	 * Scanning user request... "Endpoints internos para gestión administrativa"
	 * Docs list: Listar (GET), Stats (GET), Obtener (GET), Listar usuarios (GET), Actualizar status (PATCH).
	 * NO POST /internal/clients listed. So creation likely remains public or is different.
	 * I will comment out create or leave it pointing to public if still needed, or remove it if not used.
	 * The dashboard has "Nuevo Dispositivo" but not "Nuevo Cliente".
	 * I'll leave 'create' pointing to public /clients/ manually if I keep it, but I'll remove it if unused to be safe.
	 * Implementation plan didn't use create. I'll remove it to avoid confusion or keep it pointing to standard registration.
	 * Let's keep it but comment that it might be public. Actually, the dashboard doesn't use it.
	 */
	/*async create(data) {
		return this.api('/api/v1/clients/', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}*/
};
