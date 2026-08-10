<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import { DemosService } from '$lib/services/demos';
	import { demoStatusBadge, vigencia, isTerminal, formatUnix } from '$lib/utils/demoStatus';
	import { canDestroyDemo, canGenerateDemos } from '$lib/utils/roles';
	import { formatApiErrorMessage } from '$lib/utils/apiErrors';
	import { toast } from '$lib/stores/toast';

	let demoId = $derived($page.params.id);

	/** @type {import('$lib/services/demos').Demo | null} */
	let demo = $state(null);
	let loading = $state(true);
	let error = $state('');
	let working = $state(false);

	let editandoNotas = $state(false);
	let notasBorrador = $state('');

	let extendHours = $state(72);
	let showReset = $state(false);
	let showRevoke = $state(false);

	onMount(load);

	async function load() {
		loading = true;
		error = '';
		try {
			demo = await DemosService.get(demoId);
			notasBorrador = demo?.notes || '';
		} catch (err) {
			error = formatApiErrorMessage(err);
		} finally {
			loading = false;
		}
	}

	let badge = $derived(demoStatusBadge(demo?.state));
	let v = $derived(vigencia(demo?.state));
	let terminal = $derived(isTerminal(demo?.state));
	let puedeDestruir = $derived(canDestroyDemo($auth.user, demo));

	/** @param {() => Promise<any>} accion @param {string} exito */
	async function ejecutar(accion, exito) {
		working = true;
		try {
			await accion();
			toast.success(exito);
			await load();
		} catch (err) {
			toast.error(formatApiErrorMessage(err));
		} finally {
			working = false;
		}
	}

	async function guardarNotas() {
		await ejecutar(
			() => DemosService.updateNotes(demoId, { notes: notasBorrador.trim() || null }),
			'Notas actualizadas'
		);
		editandoNotas = false;
	}
</script>

<svelte:head><title>{demo?.company_name || 'Demo'} · GAC</title></svelte:head>

<Topbar
	title={demo?.company_name || 'Acceso de demo'}
	subtitle={demo?.recipient_email}
	backUrl="/sales/demos"
/>

<div class="space-y-6 p-6">
	{#if loading}
		<Card class="p-8"><p class="text-center text-app-muted">Cargando…</p></Card>
	{:else if error}
		<Card
			class="p-4"
			style="border-color: color-mix(in srgb, var(--color-danger) 45%, transparent)"
		>
			<p class="text-sm text-danger">{error}</p>
		</Card>
	{:else if demo}
		<Card
			class="p-6"
			style={terminal
				? 'border-color: color-mix(in srgb, var(--color-danger) 40%, transparent)'
				: v.urgent
					? 'border-color: color-mix(in srgb, var(--color-warning) 45%, transparent)'
					: ''}
		>
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<span class={badge.badgeClass}>{badge.label}</span>
					{#if badge.srHint}<span class="sr-only">{badge.srHint}</span>{/if}
					<p class="mt-3 font-mono text-2xl font-bold {v.urgent ? 'text-warning' : 'text-app'}">
						{v.relative}
					</p>
					<p class="text-sm text-app-muted">{v.absolute}</p>
				</div>

				{#if !terminal}
					<p class="max-w-sm text-sm text-app-secondary">
						Al expirar, el entorno se destruye y no se puede recuperar. Extiende la vigencia antes
						si el cliente sigue interesado.
					</p>
				{/if}
			</div>
		</Card>

		{#if terminal}
			<!-- Lapida. El boton de extender no esta deshabilitado: no existe. Uno en
			     gris dice "podrias, pero ahora no"; hay que decir que esa operacion
			     ya no forma parte de este mundo. -->
			<Card class="space-y-4 p-6">
				<p class="text-sm text-app-secondary">
					Esta demo ya no puede reactivarse ni extenderse: su entorno y sus datos se eliminaron. Si
					el cliente sigue interesado, hay que generar una demo nueva desde cero.
				</p>
				{#if canGenerateDemos($auth.user)}
					<Button variant="primary" onclick={() => goto('/sales/demos/create')}>
						Generar demo nueva para {demo.company_name}
					</Button>
				{/if}
			</Card>
		{/if}

		<div class="grid gap-6 lg:grid-cols-2">
			<Card class="space-y-4 p-6">
				<h2 class="text-lg font-semibold text-app">Información</h2>
				<dl class="grid gap-3 text-sm sm:grid-cols-2">
					<div>
						<dt class="text-app-muted">Empresa</dt>
						<dd class="text-app">{demo.company_name}</dd>
					</div>
					<div>
						<dt class="text-app-muted">Email destino</dt>
						<dd class="text-app">{demo.recipient_email}</dd>
					</div>
					<div>
						<dt class="text-app-muted">Escenario</dt>
						<dd class="font-mono text-app">{demo.scenario}</dd>
					</div>
					<div>
						<dt class="text-app-muted">Vendedor</dt>
						<dd class="text-app">{demo.created_by_name || '—'}</dd>
					</div>
					<div>
						<dt class="text-app-muted">Generada</dt>
						<dd class="text-app">
							{demo.created_at ? new Date(demo.created_at).toLocaleString('es-MX') : '—'}
						</dd>
					</div>
					<div>
						<dt class="text-app-muted">Canjeada</dt>
						<dd class="text-app">{formatUnix(demo.state?.redeemed_at_unix)}</dd>
					</div>
				</dl>

				<hr style="border-color: var(--color-border)" />

				<div>
					<div class="flex items-center justify-between">
						<h3 class="gac-label mb-0">Notas comerciales</h3>
						{#if !editandoNotas}
							<Button variant="ghost" size="sm" onclick={() => (editandoNotas = true)}>
								Editar
							</Button>
						{/if}
					</div>
					{#if editandoNotas}
						<textarea class="gac-input mt-2" rows="3" bind:value={notasBorrador}></textarea>
						<div class="mt-2 flex justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									notasBorrador = demo?.notes || '';
									editandoNotas = false;
								}}
							>
								Cancelar
							</Button>
							<Button variant="primary" size="sm" disabled={working} onclick={guardarNotas}>
								Guardar
							</Button>
						</div>
					{:else}
						<p class="mt-2 whitespace-pre-wrap text-sm text-app-secondary">
							{demo.notes || 'Sin notas.'}
						</p>
					{/if}
				</div>
			</Card>

			{#if !terminal}
				<Card
					class="space-y-5 p-6"
					style="border-color: color-mix(in srgb, var(--color-danger) 40%, transparent)"
				>
					<h2 class="text-lg font-semibold text-app">Ciclo de vida</h2>

					<div>
						<p class="font-medium text-app">Extender vigencia</p>
						<p class="mt-1 text-sm text-app-muted">Solo es posible mientras la demo siga viva.</p>
						<div class="mt-2 flex flex-wrap items-end gap-3">
							<div>
								<label for="extend-hours" class="sr-only">Horas a extender</label>
								<select id="extend-hours" class="gac-input" bind:value={extendHours}>
									<option value={72}>+3 días</option>
									<option value={168}>+7 días</option>
									<option value={336}>+14 días</option>
								</select>
							</div>
							<Button
								variant="primary"
								size="sm"
								disabled={working}
								onclick={() =>
									ejecutar(
										() => DemosService.extend(demoId, Number(extendHours)),
										'Vigencia extendida'
									)}
							>
								Extender
							</Button>
						</div>
					</div>

					<hr style="border-color: var(--color-border)" />

					<div class="flex items-start justify-between gap-6">
						<div>
							<p class="font-medium text-app">Resetear datos</p>
							<p class="mt-1 text-sm text-app-muted">
								Devuelve la flota simulada a su estado inicial. El acceso sigue siendo válido y el
								cliente conserva su código.
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							disabled={working || !puedeDestruir}
							onclick={() => (showReset = true)}
						>
							Resetear
						</Button>
					</div>

					<hr style="border-color: var(--color-border)" />

					<div class="flex items-start justify-between gap-6">
						<div>
							<p class="font-medium text-app">Dar de baja</p>
							<p class="mt-1 text-sm text-app-muted">
								Destruye el entorno de inmediato y el código deja de funcionar. No se puede
								deshacer.
							</p>
						</div>
						<Button
							variant="danger"
							size="sm"
							disabled={working || !puedeDestruir}
							onclick={() => (showRevoke = true)}
						>
							Dar de baja
						</Button>
					</div>

					{#if !puedeDestruir}
						<p class="text-xs text-app-muted">
							Solo el vendedor que generó la demo, o un admin, puede resetearla o darla de baja.
						</p>
					{/if}
				</Card>
			{/if}
		</div>
	{/if}
</div>

<ConfirmDialog
	bind:isOpen={showReset}
	variant="danger"
	title="Resetear los datos de la demo"
	message="Se borran viajes, alertas y posiciones simuladas, y la flota vuelve a su estado inicial. El código del cliente sigue siendo válido."
	confirmLabel="Resetear"
	onConfirm={() => ejecutar(() => DemosService.reset(demoId), 'Datos de la demo reseteados')}
/>

<ConfirmDialog
	bind:isOpen={showRevoke}
	variant="danger"
	title="Dar de baja el acceso"
	message="Destruye el entorno de inmediato. El código deja de funcionar y no se puede deshacer: si el cliente vuelve a necesitarla, habrá que generar una demo nueva."
	confirmLabel="Dar de baja"
	confirmPhrase={demo?.company_name}
	onConfirm={() => ejecutar(() => DemosService.revoke(demoId), 'Demo dada de baja')}
/>
