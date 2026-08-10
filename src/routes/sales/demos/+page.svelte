<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { DemosService } from '$lib/services/demos';
	import { demoStatusBadge, vigencia, isTerminal, hoursLeft } from '$lib/utils/demoStatus';
	import { canGenerateDemos } from '$lib/utils/roles';
	import { formatApiErrorMessage } from '$lib/utils/apiErrors';

	/** @type {import('$lib/services/demos').Demo[]} */
	let demos = $state([]);
	let loading = $state(true);
	let error = $state('');

	let searchTerm = $state('');
	let statusFilter = $state('');
	let soloPorExpirar = $state(false);

	const PAGE_SIZE = 20;
	let page = $state(1);

	onMount(load);

	async function load() {
		loading = true;
		error = '';
		try {
			demos = await DemosService.list({ limit: 200 });
		} catch (err) {
			error = formatApiErrorMessage(err);
		} finally {
			loading = false;
		}
	}

	/** @param {import('$lib/services/demos').Demo} demo */
	function estadoDe(demo) {
		const state = demo.state;
		if (!state) return 'unknown';
		if (state.status === 'expired') return 'expired';
		if (state.status === 'torn_down') return 'revoked';
		return state.redeemed_at_unix ? 'active' : 'pending';
	}

	let filtradas = $derived(
		demos.filter((demo) => {
			const texto = searchTerm.trim().toLowerCase();
			if (texto && !`${demo.company_name} ${demo.recipient_email}`.toLowerCase().includes(texto)) {
				return false;
			}
			if (statusFilter && estadoDe(demo) !== statusFilter) return false;
			if (soloPorExpirar) {
				const restantes = hoursLeft(demo.state);
				if (restantes === null || restantes > 24) return false;
			}
			return true;
		})
	);

	// Lo urgente arriba: vivas primero por vencimiento ascendente, muertas
	// despues. Vale mas que cualquier filtro, porque no hay que pedirlo.
	let ordenadas = $derived(
		[...filtradas].sort((a, b) => {
			const aTerminal = isTerminal(a.state);
			const bTerminal = isTerminal(b.state);
			if (aTerminal !== bTerminal) return aTerminal ? 1 : -1;
			if (!aTerminal) {
				const ha = hoursLeft(a.state) ?? Infinity;
				const hb = hoursLeft(b.state) ?? Infinity;
				return ha - hb;
			}
			return String(b.created_at || '').localeCompare(String(a.created_at || ''));
		})
	);

	let paginadas = $derived(ordenadas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
	let totalPages = $derived(Math.max(1, Math.ceil(ordenadas.length / PAGE_SIZE)));

	let metricas = $derived({
		pendientes: demos.filter((d) => estadoDe(d) === 'pending').length,
		activas: demos.filter((d) => estadoDe(d) === 'active').length,
		porExpirar: demos.filter((d) => {
			const restantes = hoursLeft(d.state);
			return restantes !== null && restantes <= 24 && restantes > 0;
		}).length,
		terminadas: demos.filter((d) => isTerminal(d.state)).length
	});

	function aplicarFiltroUrgente() {
		soloPorExpirar = true;
		page = 1;
	}
</script>

<svelte:head><title>Accesos de demo · GAC</title></svelte:head>

<Topbar title="Accesos de demo" subtitle="Demostraciones de Nexus para prospectos">
	{#if canGenerateDemos($auth.user)}
		<Button variant="primary" onclick={() => goto('/sales/demos/create')}>Generar demo</Button>
	{/if}
</Topbar>

<div class="space-y-6 p-6">
	{#if metricas.porExpirar > 0}
		<Card
			class="p-4"
			style="border-color: color-mix(in srgb, var(--color-warning) 45%, transparent)"
		>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<p class="text-sm text-app">
					<strong>{metricas.porExpirar}</strong>
					{metricas.porExpirar === 1 ? 'demo expira' : 'demos expiran'} en menos de 24 h. Al expirar,
					el entorno se destruye y hay que generar una nueva.
				</p>
				<Button variant="outline" size="sm" onclick={aplicarFiltroUrgente}>Ver cuáles</Button>
			</div>
		</Card>
	{/if}

	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		{#each [['Sin canjear', metricas.pendientes], ['Activas', metricas.activas], ['Por expirar', metricas.porExpirar], ['Terminadas', metricas.terminadas]] as [etiqueta, valor] (etiqueta)}
			<Card class="p-4">
				<p class="text-xs uppercase tracking-wide text-app-muted">{etiqueta}</p>
				<p class="mt-1 text-2xl font-semibold text-app">{valor}</p>
			</Card>
		{/each}
	</div>

	<Card class="p-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="min-w-[220px] flex-1">
				<Input label="Buscar" placeholder="Empresa o email…" bind:value={searchTerm} />
			</div>
			<div>
				<label for="demo-status" class="gac-label">Estado</label>
				<select id="demo-status" class="gac-input min-w-[180px]" bind:value={statusFilter}>
					<option value="">Todos</option>
					<option value="pending">Sin canjear</option>
					<option value="active">Activa</option>
					<option value="expired">Expirada</option>
					<option value="revoked">Dada de baja</option>
				</select>
			</div>
			<Button variant="outline" onclick={load}>Actualizar</Button>
		</div>

		<label class="gac-toggle mt-4 gap-2">
			<input type="checkbox" class="sr-only" bind:checked={soloPorExpirar} />
			<span class="gac-toggle-track"><span class="gac-toggle-thumb"></span></span>
			<span class="text-sm text-app-secondary">Solo las que expiran en menos de 24 h</span>
		</label>
	</Card>

	{#if error}
		<Card
			class="p-4"
			style="border-color: color-mix(in srgb, var(--color-danger) 45%, transparent)"
		>
			<p class="text-sm text-danger">{error}</p>
		</Card>
	{/if}

	<Card class="p-0">
		<div class="overflow-x-auto">
			<table class="gac-table">
				<caption class="sr-only">Accesos de demo de Nexus</caption>
				<thead>
					<tr>
						<th scope="col">Cliente</th>
						<th scope="col">Estado</th>
						<th scope="col">Vigencia</th>
						<th scope="col">Escenario</th>
						<th scope="col">Vendedor</th>
						<th scope="col"><span class="sr-only">Acciones</span></th>
					</tr>
				</thead>
				<tbody>
					{#if loading}
						<tr><td colspan="6" class="py-8 text-center text-app-muted">Cargando…</td></tr>
					{:else if paginadas.length === 0}
						<tr>
							<td colspan="6" class="py-8 text-center text-app-muted">
								{demos.length === 0
									? 'Todavía no se ha generado ninguna demo.'
									: 'Ninguna demo coincide con el filtro.'}
							</td>
						</tr>
					{:else}
						{#each paginadas as demo (demo.demo_id)}
							{@const badge = demoStatusBadge(demo.state)}
							{@const v = vigencia(demo.state)}
							<tr>
								<td>
									<p class="font-medium text-app">{demo.company_name}</p>
									<p class="text-xs text-app-muted">{demo.recipient_email}</p>
								</td>
								<td>
									<span class={badge.badgeClass}>{badge.label}</span>
									{#if badge.srHint}<span class="sr-only">{badge.srHint}</span>{/if}
								</td>
								<td>
									<p class={v.urgent ? 'font-medium text-warning' : 'text-app'}>{v.relative}</p>
									<p class="text-xs text-app-muted">{v.absolute}</p>
								</td>
								<td><span class="font-mono text-xs text-app-secondary">{demo.scenario}</span></td>
								<td class="text-app-secondary">{demo.created_by_name || '—'}</td>
								<td class="text-right">
									<a href="/sales/demos/{demo.demo_id}" class="text-accent hover:underline">Ver</a>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		{#if totalPages > 1}
			<div class="flex items-center justify-between border-t border-app p-4 text-sm">
				<span class="text-app-muted">
					Página {page} de {totalPages} · {ordenadas.length} accesos
				</span>
				<div class="flex gap-2">
					<Button variant="outline" size="sm" disabled={page === 1} onclick={() => (page -= 1)}>
						Anterior
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={page === totalPages}
						onclick={() => (page += 1)}
					>
						Siguiente
					</Button>
				</div>
			</div>
		{/if}
	</Card>
</div>
