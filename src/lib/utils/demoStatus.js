/**
 * Estado de un acceso de demo, derivado de lo que reporta el entorno de demo.
 *
 * Una sola función para el listado y el detalle: si cada pantalla calculara por
 * su cuenta si una demo "está por expirar", acabarían discrepando.
 *
 * "Por expirar" no es un estado almacenado, se deriva del reloj en cada render.
 * Así nunca hay deriva entre lo que dice el badge y lo que hará la infraestructura.
 */

/** Horas por debajo de las cuales una demo viva se marca como urgente. */
export const UMBRAL_URGENCIA_HORAS = 24;

/**
 * @typedef {Object} DemoState
 * @property {string} status
 * @property {number|null} [expires_at_unix]
 * @property {number|null} [redeemed_at_unix]
 * @property {number|null} [ended_at_unix]
 * @property {number|null} [invite_expires_at_unix]
 * @property {number} [invites_issued]
 */

/**
 * Horas que faltan para expirar. null si no hay fecha o la demo ya terminó.
 * @param {DemoState | null | undefined} state
 * @param {number} [nowMs]
 * @returns {number|null}
 */
export function hoursLeft(state, nowMs = Date.now()) {
	if (!state) return null;
	const deadline = state.expires_at_unix || state.invite_expires_at_unix;
	if (!deadline) return null;
	if (state.status === 'expired' || state.status === 'torn_down') return null;
	return (deadline * 1000 - nowMs) / 3_600_000;
}

/**
 * ¿Es terminal? Una demo terminal no admite extender ni resetear: su entorno
 * ya no existe y hay que generar una demo nueva.
 * @param {DemoState | null | undefined} state
 * @returns {boolean}
 */
export function isTerminal(state) {
	return state?.status === 'expired' || state?.status === 'torn_down';
}

/**
 * Badge del estado, con texto e icono además del color.
 *
 * El color nunca es el único canal: quien no lo distinga sigue leyendo la
 * etiqueta y el icono.
 *
 * @param {DemoState | null | undefined} state
 * @param {number} [nowMs]
 * @returns {{ label: string, badgeClass: string, icon: string, srHint: string }}
 */
export function demoStatusBadge(state, nowMs = Date.now()) {
	if (!state) {
		return {
			label: 'Sin datos',
			badgeClass: 'gac-badge gac-badge-neutral',
			icon: 'unknown',
			srHint: 'No se pudo consultar el entorno de demo'
		};
	}

	if (state.status === 'expired') {
		return {
			label: 'Expirada',
			badgeClass: 'gac-badge gac-badge-danger',
			icon: 'blocked',
			srHint: 'El entorno fue destruido. No admite acciones'
		};
	}

	if (state.status === 'torn_down') {
		return {
			label: 'Dada de baja',
			badgeClass: 'gac-badge gac-badge-neutral',
			icon: 'archive',
			srHint: 'El entorno fue destruido a petición'
		};
	}

	const restantes = hoursLeft(state, nowMs);
	const urgente = restantes !== null && restantes <= UMBRAL_URGENCIA_HORAS;

	// Pendiente de canje: el código se emitió y el cliente aún no ha entrado.
	// Es la señal comercial más útil del listado — una demo de hace cuatro días
	// que nadie abrió es una llamada de seguimiento pendiente.
	if (!state.redeemed_at_unix) {
		return {
			label: urgente ? 'Sin canjear · caduca pronto' : 'Sin canjear',
			badgeClass: urgente ? 'gac-badge gac-badge-warning' : 'gac-badge gac-badge-info',
			icon: urgente ? 'alert' : 'clock',
			srHint: urgente
				? `El código caduca en menos de ${Math.max(1, Math.ceil(restantes))} horas`
				: 'El cliente aún no ha usado el acceso'
		};
	}

	if (urgente) {
		return {
			label: 'Activa · por expirar',
			badgeClass: 'gac-badge gac-badge-warning',
			icon: 'alert',
			srHint: `Expira en menos de ${Math.max(1, Math.ceil(restantes))} horas`
		};
	}

	return {
		label: 'Activa',
		badgeClass: 'gac-badge gac-badge-success',
		icon: 'check',
		srHint: ''
	};
}

/**
 * Vigencia en texto: primero lo accionable (cuánto queda), luego lo verificable
 * (la fecha). El vendedor está al teléfono y necesita decir una fecha en voz alta.
 *
 * @param {DemoState | null | undefined} state
 * @param {number} [nowMs]
 * @returns {{ relative: string, absolute: string, urgent: boolean }}
 */
export function vigencia(state, nowMs = Date.now()) {
	if (isTerminal(state)) {
		const ended = state?.ended_at_unix;
		return {
			relative: state?.status === 'expired' ? 'Expiró' : 'Dada de baja',
			absolute: ended ? formatUnix(ended) : '',
			urgent: false
		};
	}

	const restantes = hoursLeft(state, nowMs);
	if (restantes === null) {
		return { relative: 'Sin vigencia', absolute: '', urgent: false };
	}

	const deadline = state?.expires_at_unix || state?.invite_expires_at_unix || 0;
	if (restantes <= 0) {
		return { relative: 'Caducada', absolute: formatUnix(deadline), urgent: true };
	}

	return {
		relative: humanizeHours(restantes),
		absolute: formatUnix(deadline),
		urgent: restantes <= UMBRAL_URGENCIA_HORAS
	};
}

/**
 * @param {number} horas
 * @returns {string}
 */
export function humanizeHours(horas) {
	if (horas < 1) {
		const minutos = Math.max(1, Math.round(horas * 60));
		return `Quedan ${minutos} min`;
	}
	if (horas < 48) {
		return `Quedan ${Math.floor(horas)} h`;
	}
	return `Quedan ${Math.floor(horas / 24)} días`;
}

/**
 * Formato unico de fecha para todo lo relacionado con demos. Sin esto, una misma
 * tarjeta acaba mostrando "28/7/2026, 9:56:41 p.m." junto a "01 ago 2026,
 * 01:56 p.m." segun de donde venga el dato.
 *
 * @param {string|null|undefined} iso
 * @returns {string}
 */
export function formatISO(iso) {
	if (!iso) return '—';
	const ms = Date.parse(iso);
	if (Number.isNaN(ms)) return '—';
	return formatUnix(Math.floor(ms / 1000));
}

/**
 * @param {number|null|undefined} unix
 * @returns {string}
 */
export function formatUnix(unix) {
	if (!unix) return '—';
	return new Date(unix * 1000).toLocaleString('es-MX', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}
