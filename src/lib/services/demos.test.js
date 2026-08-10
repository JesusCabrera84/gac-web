import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiMock = vi.hoisted(() => vi.fn());
vi.mock('$lib/services/api', () => ({ api: (...args) => apiMock(...args) }));

const { DemosService, DEMO_SCENARIOS, DEMO_SCENARIO_DEFAULT, scenarioDescription } =
	await import('./demos.js');

describe('DemosService', () => {
	beforeEach(() => apiMock.mockReset());

	describe('list', () => {
		it('desenvuelve data y devuelve el array', async () => {
			apiMock.mockResolvedValueOnce({ message: 'ok', data: [{ demo_id: 'd1' }] });
			await expect(DemosService.list()).resolves.toEqual([{ demo_id: 'd1' }]);
			expect(apiMock).toHaveBeenCalledWith('/nexus-demos');
		});

		it('construye la query solo con lo que se pasa', async () => {
			apiMock.mockResolvedValueOnce({ data: [] });
			await DemosService.list({ skip: 20, limit: 50 });
			expect(apiMock).toHaveBeenCalledWith('/nexus-demos?skip=20&limit=50');
		});

		it('acepta skip=0 sin descartarlo', async () => {
			apiMock.mockResolvedValueOnce({ data: [] });
			await DemosService.list({ skip: 0 });
			expect(apiMock).toHaveBeenCalledWith('/nexus-demos?skip=0');
		});

		it('devuelve array vacio si la respuesta no es una lista', async () => {
			apiMock.mockResolvedValueOnce({ data: null });
			await expect(DemosService.list()).resolves.toEqual([]);
		});

		it('tolera una respuesta sin envoltorio', async () => {
			apiMock.mockResolvedValueOnce([{ demo_id: 'd9' }]);
			await expect(DemosService.list()).resolves.toEqual([{ demo_id: 'd9' }]);
		});
	});

	it('get pide el detalle por id', async () => {
		apiMock.mockResolvedValueOnce({ data: { demo_id: 'd1' } });
		await expect(DemosService.get('d1')).resolves.toEqual({ demo_id: 'd1' });
		expect(apiMock).toHaveBeenCalledWith('/nexus-demos/d1');
	});

	it('create envia el payload y devuelve el codigo', async () => {
		apiMock.mockResolvedValueOnce({ data: { otp: '482917', demo: { demo_id: 'd1' } } });
		const payload = { company_name: 'ACME', recipient_email: 'ops@acme.mx', ttl_hours: 168 };

		const creado = await DemosService.create(payload);

		expect(creado.otp).toBe('482917');
		const [endpoint, options] = apiMock.mock.calls[0];
		expect(endpoint).toBe('/nexus-demos');
		expect(options.method).toBe('POST');
		expect(JSON.parse(options.body)).toEqual(payload);
	});

	it('updateNotes usa PATCH', async () => {
		apiMock.mockResolvedValueOnce({ data: { demo_id: 'd1', notes: 'x' } });
		await DemosService.updateNotes('d1', { notes: 'x' });
		const [endpoint, options] = apiMock.mock.calls[0];
		expect(endpoint).toBe('/nexus-demos/d1');
		expect(options.method).toBe('PATCH');
		expect(JSON.parse(options.body)).toEqual({ notes: 'x' });
	});

	it('extend manda las horas', async () => {
		apiMock.mockResolvedValueOnce({ data: {} });
		await DemosService.extend('d1', 72);
		const [endpoint, options] = apiMock.mock.calls[0];
		expect(endpoint).toBe('/nexus-demos/d1/extend');
		expect(JSON.parse(options.body)).toEqual({ ttl_hours: 72 });
	});

	it('regenerate devuelve el codigo nuevo', async () => {
		apiMock.mockResolvedValueOnce({ data: { otp: '926314', demo: { demo_id: 'd1' } } });
		const out = await DemosService.regenerate('d1');
		expect(out.otp).toBe('926314');
		expect(apiMock.mock.calls[0][0]).toBe('/nexus-demos/d1/regenerate');
	});

	it.each([
		['reset', '/nexus-demos/d1/reset'],
		['revoke', '/nexus-demos/d1/revoke'],
		['regenerate', '/nexus-demos/d1/regenerate']
	])('%s hace POST sin cuerpo', async (metodo, endpointEsperado) => {
		apiMock.mockResolvedValueOnce({ data: {} });
		await DemosService[metodo]('d1');
		const [endpoint, options] = apiMock.mock.calls[0];
		expect(endpoint).toBe(endpointEsperado);
		expect(options.method).toBe('POST');
		expect(options.body).toBeUndefined();
	});

	it('propaga los errores en vez de tragarselos', async () => {
		apiMock.mockRejectedValueOnce(new Error('502'));
		await expect(DemosService.revoke('d1')).rejects.toThrow('502');
	});
});

describe('escenarios', () => {
	// Los ids los resuelve scenario.gleam del entorno de demo contra los ficheros
	// config/demo/scenario-*.yaml. Si alguien anade uno aqui sin que exista alli,
	// el aprovisionamiento falla DESPUES de que el vendedor entregue el codigo.
	const ACEPTADOS = ['normal', 'alerts', 'commercial'];

	it('solo ofrece escenarios que el entorno de demo acepta', () => {
		for (const escenario of DEMO_SCENARIOS) {
			expect(ACEPTADOS).toContain(escenario.id);
		}
	});

	it('los ofrece todos', () => {
		expect(DEMO_SCENARIOS.map((e) => e.id).sort()).toEqual([...ACEPTADOS].sort());
	});

	it('cada uno tiene etiqueta y descripcion', () => {
		for (const escenario of DEMO_SCENARIOS) {
			expect(escenario.label.length).toBeGreaterThan(0);
			expect(escenario.description.length).toBeGreaterThan(0);
		}
	});

	it('el escenario por defecto existe en la lista', () => {
		expect(DEMO_SCENARIOS.map((e) => e.id)).toContain(DEMO_SCENARIO_DEFAULT);
	});

	it('la lista es inmutable', () => {
		expect(Object.isFrozen(DEMO_SCENARIOS)).toBe(true);
	});

	it('scenarioDescription devuelve cadena vacia para uno desconocido', () => {
		expect(scenarioDescription('inventado')).toBe('');
		expect(scenarioDescription(DEMO_SCENARIO_DEFAULT)).not.toBe('');
	});
});
