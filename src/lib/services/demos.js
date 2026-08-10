import { api } from './api';

/**
 * Escenarios que acepta el entorno de demo.
 *
 * Los identificadores NO son libres: los resuelve
 * `services/account-simulator/src/scenario.gleam` contra los ficheros de
 * `config/demo/scenario-*.yaml`. Inventarse uno hace que el aprovisionamiento
 * falle con "unknown scenario" **después** de que el vendedor ya haya
 * entregado el código al cliente.
 *
 * @type {ReadonlyArray<{ id: string, label: string, description: string }>}
 */
export const DEMO_SCENARIOS = Object.freeze([
	{
		id: 'commercial',
		label: 'Presentación comercial',
		description:
			'Recorrido pensado para enseñar el producto: flota circulando en Querétaro con actividad variada.'
	},
	{
		id: 'normal',
		label: 'Operación normal',
		description: 'Operación sin incidencias. Útil para mostrar el día a día de una flota.'
	},
	{
		id: 'alerts',
		label: 'Generación de alertas',
		description: 'Provoca alertas de ignición y geocerca. Para enseñar el módulo de alertas.'
	}
]);

/** Escenario por defecto: esta pantalla es una herramienta comercial. */
export const DEMO_SCENARIO_DEFAULT = 'commercial';

/**
 * @param {string} id
 * @returns {string}
 */
export function scenarioDescription(id) {
	return DEMO_SCENARIOS.find((s) => s.id === id)?.description ?? '';
}

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
	 * Libera una cuenta que quedó a medias y emite un código nuevo.
	 *
	 * Devuelve el código en claro, igual que `create`, y con la misma regla:
	 * se ve una sola vez. Invalida el anterior.
	 *
	 * @param {string} demoId
	 * @returns {Promise<DemoCreated>}
	 */
	async regenerate(demoId) {
		return unwrap(await api(`/nexus-demos/${demoId}/regenerate`, { method: 'POST' }));
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
