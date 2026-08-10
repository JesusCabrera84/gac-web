import { describe, it, expect } from 'vitest';
import {
	demoStatusBadge,
	hoursLeft,
	humanizeHours,
	isTerminal,
	formatUnix,
	formatISO,
	vigencia,
	UMBRAL_URGENCIA_HORAS
} from './demoStatus.js';

const AHORA = Date.UTC(2026, 7, 10, 12, 0, 0);
const unix = (ms) => Math.floor(ms / 1000);
const enHoras = (h) => unix(AHORA + h * 3_600_000);

describe('hoursLeft', () => {
	it('devuelve null sin estado', () => {
		expect(hoursLeft(null, AHORA)).toBeNull();
	});

	it('devuelve null si no hay ninguna fecha', () => {
		expect(hoursLeft({ status: 'active' }, AHORA)).toBeNull();
	});

	it('usa expires_at cuando la demo esta viva', () => {
		expect(hoursLeft({ status: 'active', expires_at_unix: enHoras(10) }, AHORA)).toBeCloseTo(10);
	});

	it('cae en la caducidad del codigo si aun no hay tenant', () => {
		expect(hoursLeft({ status: 'pending', invite_expires_at_unix: enHoras(5) }, AHORA)).toBeCloseTo(
			5
		);
	});

	it('devuelve null en estados terminales aunque haya fecha', () => {
		expect(hoursLeft({ status: 'expired', expires_at_unix: enHoras(10) }, AHORA)).toBeNull();
		expect(hoursLeft({ status: 'torn_down', expires_at_unix: enHoras(10) }, AHORA)).toBeNull();
	});

	it('es negativo si ya paso la fecha', () => {
		expect(hoursLeft({ status: 'active', expires_at_unix: enHoras(-3) }, AHORA)).toBeCloseTo(-3);
	});
});

describe('isTerminal', () => {
	it.each([
		['expired', true],
		['torn_down', true],
		['active', false],
		['pending', false]
	])('%s → %s', (status, esperado) => {
		expect(isTerminal({ status })).toBe(esperado);
	});

	it('sin estado no es terminal', () => {
		expect(isTerminal(null)).toBe(false);
	});
});

describe('demoStatusBadge', () => {
	it('sin estado avisa de que no se pudo consultar, no de que este muerta', () => {
		const badge = demoStatusBadge(null, AHORA);
		expect(badge.label).toBe('Sin datos');
		expect(badge.badgeClass).toContain('neutral');
		expect(badge.srHint).toMatch(/no se pudo consultar/i);
	});

	it('expirada usa danger', () => {
		const badge = demoStatusBadge({ status: 'expired' }, AHORA);
		expect(badge.label).toBe('Expirada');
		expect(badge.badgeClass).toContain('danger');
	});

	it('dada de baja se distingue de expirada', () => {
		const baja = demoStatusBadge({ status: 'torn_down' }, AHORA);
		const expirada = demoStatusBadge({ status: 'expired' }, AHORA);
		expect(baja.label).not.toBe(expirada.label);
		expect(baja.badgeClass).not.toBe(expirada.badgeClass);
	});

	it('sin canjear con holgura usa info, no warning', () => {
		const badge = demoStatusBadge(
			{ status: 'pending', invite_expires_at_unix: enHoras(48) },
			AHORA
		);
		expect(badge.label).toBe('Sin canjear');
		expect(badge.badgeClass).toContain('info');
	});

	it('sin canjear y a punto de caducar pasa a warning', () => {
		const badge = demoStatusBadge({ status: 'pending', invite_expires_at_unix: enHoras(3) }, AHORA);
		expect(badge.badgeClass).toContain('warning');
		expect(badge.srHint).toMatch(/3 horas/);
	});

	it('activa y con margen usa success', () => {
		const badge = demoStatusBadge(
			{ status: 'active', redeemed_at_unix: enHoras(-10), expires_at_unix: enHoras(72) },
			AHORA
		);
		expect(badge.label).toBe('Activa');
		expect(badge.badgeClass).toContain('success');
	});

	it('activa por expirar usa warning y dice cuanto queda', () => {
		const badge = demoStatusBadge(
			{ status: 'active', redeemed_at_unix: enHoras(-10), expires_at_unix: enHoras(6) },
			AHORA
		);
		expect(badge.label).toBe('Activa · por expirar');
		expect(badge.badgeClass).toContain('warning');
		expect(badge.srHint).toMatch(/6 horas/);
	});

	it('el umbral es exactamente 24 h', () => {
		const justo = demoStatusBadge(
			{
				status: 'active',
				redeemed_at_unix: enHoras(-1),
				expires_at_unix: enHoras(UMBRAL_URGENCIA_HORAS)
			},
			AHORA
		);
		const fuera = demoStatusBadge(
			{
				status: 'active',
				redeemed_at_unix: enHoras(-1),
				expires_at_unix: enHoras(UMBRAL_URGENCIA_HORAS + 0.5)
			},
			AHORA
		);
		expect(justo.badgeClass).toContain('warning');
		expect(fuera.badgeClass).toContain('success');
	});

	it('ningun estado depende solo del color: todos traen etiqueta e icono', () => {
		const estados = [
			null,
			{ status: 'pending', invite_expires_at_unix: enHoras(48) },
			{ status: 'active', redeemed_at_unix: enHoras(-1), expires_at_unix: enHoras(72) },
			{ status: 'active', redeemed_at_unix: enHoras(-1), expires_at_unix: enHoras(2) },
			{ status: 'expired' },
			{ status: 'torn_down' }
		];
		const iconos = new Set();
		for (const estado of estados) {
			const badge = demoStatusBadge(estado, AHORA);
			expect(badge.label.length).toBeGreaterThan(0);
			expect(badge.icon.length).toBeGreaterThan(0);
			iconos.add(badge.icon);
		}
		// Un icono distinto por estado: con daltonismo el icono es lo que los
		// separa, asi que dos estados no pueden compartirlo.
		expect(iconos.size).toBe(estados.length);
	});
});

describe('vigencia', () => {
	it('terminal muestra la fecha en pasado, sin cuenta atras', () => {
		const v = vigencia({ status: 'expired', ended_at_unix: enHoras(-30) }, AHORA);
		expect(v.relative).toBe('Expiró');
		expect(v.urgent).toBe(false);
		expect(v.absolute).not.toBe('');
	});

	it('baja se etiqueta distinto que expirada', () => {
		expect(vigencia({ status: 'torn_down', ended_at_unix: enHoras(-5) }, AHORA).relative).toBe(
			'Dada de baja'
		);
	});

	it('sin fecha lo dice en vez de inventar', () => {
		expect(vigencia({ status: 'active' }, AHORA).relative).toBe('Sin vigencia');
	});

	it('viva y con margen no es urgente', () => {
		const v = vigencia({ status: 'active', expires_at_unix: enHoras(120) }, AHORA);
		expect(v.urgent).toBe(false);
		expect(v.relative).toMatch(/días/);
	});

	it('viva y a punto es urgente', () => {
		const v = vigencia({ status: 'active', expires_at_unix: enHoras(3) }, AHORA);
		expect(v.urgent).toBe(true);
	});

	it('pasada de fecha pero sin marcar todavia', () => {
		const v = vigencia({ status: 'active', expires_at_unix: enHoras(-1) }, AHORA);
		expect(v.relative).toBe('Caducada');
		expect(v.urgent).toBe(true);
	});
});

describe('humanizeHours', () => {
	it.each([
		[0.25, /min/],
		[5, /5 h/],
		[47, /47 h/],
		[72, /3 días/]
	])('%s h → %s', (horas, patron) => {
		expect(humanizeHours(horas)).toMatch(patron);
	});

	it('nunca dice 0 min', () => {
		expect(humanizeHours(0.001)).toMatch(/1 min/);
	});
});

describe('formatUnix', () => {
	it('sin valor devuelve un guion', () => {
		expect(formatUnix(null)).toBe('—');
		expect(formatUnix(0)).toBe('—');
	});

	it('formatea una fecha real', () => {
		expect(formatUnix(unix(AHORA))).toMatch(/2026/);
	});
});

describe('formatISO', () => {
	it('sin valor devuelve un guion', () => {
		expect(formatISO(null)).toBe('—');
		expect(formatISO(undefined)).toBe('—');
		expect(formatISO('')).toBe('—');
	});

	it('una fecha invalida no revienta', () => {
		expect(formatISO('no-es-una-fecha')).toBe('—');
	});

	it('coincide con formatUnix para el mismo instante', () => {
		const iso = '2026-08-10T12:00:00.000Z';
		expect(formatISO(iso)).toBe(formatUnix(Math.floor(Date.parse(iso) / 1000)));
	});
});
