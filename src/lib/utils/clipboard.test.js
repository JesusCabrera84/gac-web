import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const toastMock = vi.hoisted(() => ({
	success: vi.fn(),
	error: vi.fn()
}));

vi.mock('$lib/stores/toast', () => ({ toast: toastMock }));

const { copyToClipboard, buildAccessMessage, buildMailtoLink } = await import('./clipboard.js');

describe('copyToClipboard', () => {
	const clipboardOriginal = navigator.clipboard;

	beforeEach(() => {
		toastMock.success.mockReset();
		toastMock.error.mockReset();
	});

	afterEach(() => {
		Object.defineProperty(navigator, 'clipboard', {
			value: clipboardOriginal,
			configurable: true,
			writable: true
		});
	});

	function stubClipboard(impl) {
		Object.defineProperty(navigator, 'clipboard', {
			value: impl,
			configurable: true,
			writable: true
		});
	}

	it('copia y anuncia el exito', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		stubClipboard({ writeText });

		const ok = await copyToClipboard('482917', 'Código');

		expect(ok).toBe(true);
		expect(writeText).toHaveBeenCalledWith('482917');
		expect(toastMock.success).toHaveBeenCalledWith('Código copiado al portapapeles');
	});

	// Sin HTTPS, navigator.clipboard NO existe. Es el caso real de esta consola,
	// que se sirve por HTTP en la red interna.
	it('sin API moderna cae al mecanismo antiguo y copia igual', async () => {
		stubClipboard(undefined);
		const exec = vi.fn().mockReturnValue(true);
		document.execCommand = exec;

		const ok = await copyToClipboard('482917', 'Código');

		expect(ok).toBe(true);
		expect(exec).toHaveBeenCalledWith('copy');
		expect(toastMock.success).toHaveBeenCalled();
	});

	it('si el navegador rechaza el API moderna, reintenta con la antigua', async () => {
		stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denegado')) });
		document.execCommand = vi.fn().mockReturnValue(true);

		const ok = await copyToClipboard('482917');

		expect(ok).toBe(true);
		expect(toastMock.success).toHaveBeenCalled();
	});

	it('si tampoco hay mecanismo antiguo, avisa en vez de fallar en silencio', async () => {
		stubClipboard(undefined);
		document.execCommand = vi.fn().mockReturnValue(false);

		const ok = await copyToClipboard('482917', 'Código');

		expect(ok).toBe(false);
		expect(toastMock.error.mock.calls[0][0]).toMatch(/a mano/i);
	});

	it('no deja el textarea temporal en el DOM', async () => {
		stubClipboard(undefined);
		document.execCommand = vi.fn().mockReturnValue(true);
		const antes = document.querySelectorAll('textarea').length;

		await copyToClipboard('482917');

		expect(document.querySelectorAll('textarea').length).toBe(antes);
	});

	it('usa una etiqueta por defecto', async () => {
		stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
		await copyToClipboard('x');
		expect(toastMock.success).toHaveBeenCalledWith('Contenido copiado al portapapeles');
	});
});

describe('buildAccessMessage', () => {
	const base = {
		company: 'ACME Logística',
		url: 'https://nexus-demo.geminislabs.com/access',
		otp: '482917',
		expiresText: '16 de agosto'
	};

	it('incluye url, codigo y vigencia', () => {
		const msg = buildAccessMessage(base);
		expect(msg).toContain(base.url);
		expect(msg).toContain('482917');
		expect(msg).toContain('16 de agosto');
		expect(msg).toContain('ACME Logística');
	});

	it('funciona sin empresa', () => {
		const msg = buildAccessMessage({ ...base, company: undefined });
		expect(msg.startsWith('Hola,')).toBe(true);
	});

	it('omite la vigencia si no se conoce', () => {
		const msg = buildAccessMessage({ ...base, expiresText: undefined });
		expect(msg).not.toMatch(/Válido hasta/);
	});
});

describe('buildMailtoLink', () => {
	it('prellena destinatario, asunto y cuerpo', () => {
		const link = buildMailtoLink({
			to: 'ops@acme.mx',
			company: 'ACME',
			url: 'https://demo.example.com/access',
			otp: '482917',
			expiresText: '16 de agosto'
		});

		expect(link.startsWith('mailto:')).toBe(true);
		expect(link).toContain(encodeURIComponent('ops@acme.mx'));
		expect(decodeURIComponent(link)).toContain('482917');
		expect(decodeURIComponent(link)).toContain('ACME');
	});

	it('escapa el contenido para no romper la URL', () => {
		const link = buildMailtoLink({
			to: 'a+b@acme.mx',
			url: 'https://demo.example.com/access?x=1&y=2',
			otp: '000000'
		});
		expect(link).not.toContain(' ');
		expect(link).toContain('%26');
	});
});
