import { api } from './api';

/**
 * Accesos de demo de Nexus. Habla con gac-api, que es quien guarda la ficha
 * comercial y quien conoce el secreto del entorno de demo — el navegador no lo
 * ve nunca.
 */

/**
 * @typedef {Object} DemoState
 * @property {string} status  pending | active | expired | torn_down
 * @property {string} [scenario]
 * @property {string} [invite_email]
 * @property {number} [invites_issued]
 * @property {number|null} [invite_expires_at_unix]
 * @property {number|null} [redeemed_at_unix]
 * @property {number|null} [expires_at_unix]
 * @property {number|null} [ended_at_unix]
 */

/**
 * @typedef {Object} Demo
 * @property {string} demo_id
 * @property {string} tenant_id
 * @property {string} company_name
 * @property {string} recipient_email
 * @property {string} [notes]
 * @property {string} scenario
 * @property {number} ttl_hours
 * @property {string} created_by
 * @property {string} [created_by_name]
 * @property {string} [created_at]
 * @property {DemoState|null} [state]
 */

/**
 * @typedef {Object} DemoCreatePayload
 * @property {string} company_name
 * @property {string} recipient_email
 * @property {string} [scenario]
 * @property {string} [notes]
 * @property {number} [ttl_hours]
 */

/**
 * @typedef {Object} DemoCreated
 * @property {Demo} demo
 * @property {string} access_url
 * @property {string} otp
 * @property {number} [otp_expires_in_seconds]
 * @property {boolean} [provisioning]
 */

/** gac-api envuelve todo en { message, data }. */
function unwrap(response) {
	return response?.data ?? response;
}

export const DemosService = {
	/**
	 * @param {{ skip?: number, limit?: number }} [filters]
	 * @returns {Promise<Demo[]>}
	 */
	async list(filters = {}) {
		const params = new URLSearchParams();
		if (filters.skip != null) params.set('skip', String(filters.skip));
		if (filters.limit != null) params.set('limit', String(filters.limit));
		const qs = params.toString();
		const data = unwrap(await api(`/nexus-demos${qs ? `?${qs}` : ''}`));
		return Array.isArray(data) ? data : [];
	},

	/**
	 * @param {string} demoId
	 * @returns {Promise<Demo>}
	 */
	async get(demoId) {
		return unwrap(await api(`/nexus-demos/${demoId}`));
	},

	/**
	 * Genera el acceso. La respuesta trae el código **una sola vez**: no se puede
	 * volver a consultar, porque el entorno de demo solo guarda su hash.
	 *
	 * @param {DemoCreatePayload} payload
	 * @returns {Promise<DemoCreated>}
	 */
	async create(payload) {
		return unwrap(
			await api('/nexus-demos', {
				method: 'POST',
				body: JSON.stringify(payload)
			})
		);
	},

	/**
	 * @param {string} demoId
	 * @param {{ notes?: string|null }} payload
	 * @returns {Promise<Demo>}
	 */
	async updateNotes(demoId, payload) {
		return unwrap(
			await api(`/nexus-demos/${demoId}`, {
				method: 'PATCH',
				body: JSON.stringify(payload)
			})
		);
	},

	/**
	 * Solo funciona mientras la demo siga viva: una vez expirada no hay a quién
	 * enviarle la señal y hay que generar una demo nueva.
	 *
	 * @param {string} demoId
	 * @param {number} ttlHours
	 * @returns {Promise<Demo>}
	 */
	async extend(demoId, ttlHours) {
		return unwrap(
			await api(`/nexus-demos/${demoId}/extend`, {
				method: 'POST',
				body: JSON.stringify({ ttl_hours: ttlHours })
			})
		);
	},

	/**
	 * Devuelve la flota simulada a su estado inicial. El acceso sigue siendo
	 * válido y el cliente conserva su código.
	 *
	 * @param {string} demoId
	 * @returns {Promise<Demo>}
	 */
	async reset(demoId) {
		return unwrap(await api(`/nexus-demos/${demoId}/reset`, { method: 'POST' }));
	},

	/**
	 * Destruye el entorno. No se puede deshacer.
	 *
	 * @param {string} demoId
	 * @returns {Promise<Demo>}
	 */
	async revoke(demoId) {
		return unwrap(await api(`/nexus-demos/${demoId}/revoke`, { method: 'POST' }));
	}
};
