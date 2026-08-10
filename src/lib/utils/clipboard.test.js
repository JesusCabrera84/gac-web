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

	it('sin API de portapapeles avisa en vez de fallar en silencio', async () => {
		stubClipboard(undefined);

		const ok = await copyToClipboard('482917', 'Código');

		expect(ok).toBe(false);
		expect(toastMock.error).toHaveBeenCalled();
		expect(toastMock.error.mock.calls[0][0]).toMatch(/a mano/i);
	});

	it('si el navegador rechaza, tambien avisa', async () => {
		stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denegado')) });

		const ok = await copyToClipboard('482917');

		expect(ok).toBe(false);
		expect(toastMock.error).toHaveBeenCalled();
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
