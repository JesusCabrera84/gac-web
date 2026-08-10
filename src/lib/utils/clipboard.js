import { toast } from '$lib/stores/toast';

/**
 * Copia al portapapeles y lo anuncia.
 *
 * El anuncio va por el store de toast a propósito: `Toast.svelte` ya es una
 * región `aria-live="polite"` con cada aviso en `role="status"`, así que un
 * lector de pantalla lo lee sin trabajo adicional. `CommandPanel.svelte` se
 * montó su propio sistema de avisos local sin `aria-live`, y por eso hoy no
 * anuncia nada — no repetir ese camino.
 *
 * @param {string} text
 * @param {string} [label] Qué se copió, p. ej. 'Código'
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text, label = 'Contenido') {
	try {
		if (!navigator?.clipboard?.writeText) {
			throw new Error('clipboard no disponible');
		}
		await navigator.clipboard.writeText(text);
		toast.success(`${label} copiado al portapapeles`);
		return true;
	} catch {
		// El navegador bloquea el portapapeles fuera de un gesto del usuario y en
		// contextos no seguros. Se avisa en vez de fallar en silencio: el vendedor
		// tiene que saber que no lo tiene copiado antes de colgar el teléfono.
		toast.error(`No se pudo copiar ${label.toLowerCase()}. Cópialo a mano.`);
		return false;
	}
}

/**
 * Mensaje listo para pegar en WhatsApp o en un correo.
 *
 * Es la acción que el vendedor usa el 90% de las veces: diseñar solo para
 * correo sería diseñar para el canal equivocado, porque la entrega real ocurre
 * en la conversación que ya tiene abierta con el cliente.
 *
 * @param {{ company?: string, url: string, otp: string, expiresText?: string }} datos
 * @returns {string}
 */
export function buildAccessMessage({ company, url, otp, expiresText }) {
	const saludo = company ? `Hola ${company},` : 'Hola,';
	const lineas = [`${saludo} aquí tienes tu acceso de demo a Nexus:`, '', url, `Código: ${otp}`];
	if (expiresText) {
		lineas.push(`Válido hasta el ${expiresText}.`);
	}
	return lineas.join('\n');
}

/**
 * Enlace `mailto:` prellenado. Cero backend: el correo lo envía el cliente de
 * correo del vendedor, con su remitente y su firma.
 *
 * @param {{ to: string, company?: string, url: string, otp: string, expiresText?: string }} datos
 * @returns {string}
 */
export function buildMailtoLink({ to, company, url, otp, expiresText }) {
	const asunto = company ? `Tu acceso de demo a Nexus — ${company}` : 'Tu acceso de demo a Nexus';
	const cuerpo = buildAccessMessage({ company, url, otp, expiresText });
	return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}
