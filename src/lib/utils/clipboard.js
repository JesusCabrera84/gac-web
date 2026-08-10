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
		if (navigator?.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
		} else if (!copyFallback(text)) {
			throw new Error('sin portapapeles');
		}
		toast.success(`${label} copiado al portapapeles`);
		return true;
	} catch {
		// El API moderno puede fallar aunque exista: el navegador lo bloquea sin
		// gesto del usuario o si se deniega el permiso. Se reintenta con el
		// mecanismo antiguo antes de rendirse.
		if (copyFallback(text)) {
			toast.success(`${label} copiado al portapapeles`);
			return true;
		}
		toast.error(`No se pudo copiar ${label.toLowerCase()}. Cópialo a mano.`);
		return false;
	}
}

/**
 * Copiado por el mecanismo antiguo, para contextos no seguros.
 *
 * `navigator.clipboard` **solo existe en contextos seguros** (HTTPS o
 * localhost). Esta consola se sirve por HTTP en la red interna, así que ahí es
 * `undefined` y el copiado fallaba entero — que es justo donde más duele,
 * porque el vendedor tiene el código delante y no puede llevárselo.
 *
 * `document.execCommand('copy')` está obsoleto pero sigue funcionando en ese
 * escenario, y es el único que lo hace.
 *
 * @param {string} text
 * @returns {boolean}
 */
function copyFallback(text) {
	try {
		if (typeof document === 'undefined') return false;
		const area = document.createElement('textarea');
		area.value = text;
		area.setAttribute('readonly', '');
		// Fuera de la vista pero enfocable: display:none no permite seleccionar.
		area.style.position = 'fixed';
		area.style.top = '-1000px';
		area.style.opacity = '0';
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand?.('copy') ?? false;
		document.body.removeChild(area);
		return ok;
	} catch {
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
