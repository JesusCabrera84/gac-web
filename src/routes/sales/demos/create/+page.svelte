<script>
	import { goto } from '$app/navigation';
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import DemoAccessReveal from '$lib/components/nexus/DemoAccessReveal.svelte';
	import { DemosService } from '$lib/services/demos';
	import { formatApiErrorMessage } from '$lib/utils/apiErrors';
	import { formatUnix } from '$lib/utils/demoStatus';

	let companyName = $state('');
	let recipientEmail = $state('');
	let scenario = $state('normal');
	let ttlHours = $state(168);
	let notes = $state('');

	let saving = $state(false);
	let error = $state('');

	/** @type {import('$lib/services/demos').DemoCreated | null} */
	let creado = $state(null);
	let revealOpen = $state(false);

	// La fecha calculada se muestra en texto, no solo "7 días": el vendedor está
	// en una llamada y necesita decir una fecha en voz alta.
	let caducaEl = $derived(formatUnix(Math.floor(Date.now() / 1000) + ttlHours * 3600));

	let puedeEnviar = $derived(
		companyName.trim().length > 0 && /.+@.+\..+/.test(recipientEmail.trim()) && !saving
	);

	async function generar() {
		if (!puedeEnviar) return;
		saving = true;
		error = '';
		try {
			creado = await DemosService.create({
				company_name: companyName.trim(),
				recipient_email: recipientEmail.trim(),
				scenario,
				ttl_hours: Number(ttlHours),
				notes: notes.trim() || undefined
			});
			revealOpen = true;
		} catch (err) {
			error = formatApiErrorMessage(err);
		} finally {
			saving = false;
		}
	}

	// Al cerrar el diálogo se va al detalle: el registro ya existe y tiene URL
	// propia, así que el código no es lo único que sostenía la operación.
	function alCerrar() {
		const id = creado?.demo?.demo_id;
		goto(id ? `/sales/demos/${id}` : '/sales/demos');
	}
</script>

<svelte:head><title>Generar demo · GAC</title></svelte:head>

<Topbar title="Generar acceso de demo" backUrl="/sales/demos" />

<div class="p-6">
	<Card class="mx-auto max-w-2xl space-y-5 p-6">
		<div class="space-y-4">
			<h2 class="text-sm font-semibold uppercase tracking-wide text-app-muted">Destinatario</h2>

			<Input
				label="Empresa / cliente"
				placeholder="ACME Logística"
				bind:value={companyName}
				required
			/>

			<div>
				<Input
					label="Email de destino"
					type="email"
					placeholder="ops@acme.mx"
					bind:value={recipientEmail}
					required
				/>
				<p class="mt-1 text-xs text-app-muted">
					Identifica al destinatario y es con el que entrará a la demo. No se envía ningún correo
					automáticamente: el código se entrega en mano.
				</p>
			</div>
		</div>

		<hr style="border-color: var(--color-border)" />

		<div class="space-y-4">
			<h2 class="text-sm font-semibold uppercase tracking-wide text-app-muted">
				Configuración de la demo
			</h2>

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="demo-scenario" class="gac-label">Escenario</label>
					<select id="demo-scenario" class="gac-input" bind:value={scenario}>
						<option value="normal">Normal</option>
						<option value="alertas">Alertas</option>
					</select>
				</div>

				<div>
					<label for="demo-ttl" class="gac-label">Vigencia</label>
					<select id="demo-ttl" class="gac-input" bind:value={ttlHours}>
						<option value={72}>3 días</option>
						<option value={168}>7 días</option>
						<option value={336}>14 días</option>
					</select>
				</div>
			</div>

			<p class="text-xs text-app-muted">Caduca el {caducaEl}.</p>

			<div>
				<label for="demo-notes" class="gac-label">Notas comerciales</label>
				<textarea
					id="demo-notes"
					class="gac-input"
					rows="3"
					bind:value={notes}
					placeholder="Piloto de 40 unidades. Decisor: dirección de operaciones."
				></textarea>
				<p class="mt-1 text-xs text-app-muted">Visibles solo para el equipo interno.</p>
			</div>
		</div>

		<div
			class="rounded-md p-3 text-sm"
			style="background: var(--color-info-bg); color: var(--color-info); border: 1px solid color-mix(in srgb, var(--color-info) 30%, transparent)"
		>
			Al generar se creará un entorno aislado y un código de un solo uso. El código se mostrará
			<strong>una única vez</strong> en la pantalla siguiente.
			<br />
			Podrás extender la vigencia solo <strong>antes</strong> de que caduque: después, el entorno se destruye
			y hay que generar una demo nueva.
		</div>

		{#if error}
			<p class="text-sm text-danger">{error}</p>
		{/if}

		<div class="flex justify-end gap-3">
			<Button variant="outline" onclick={() => goto('/sales/demos')}>Cancelar</Button>
			<Button variant="primary" disabled={!puedeEnviar} onclick={generar}>
				{saving ? 'Generando…' : 'Generar acceso'}
			</Button>
		</div>
	</Card>
</div>

{#if creado}
	<DemoAccessReveal
		bind:isOpen={revealOpen}
		company={creado.demo?.company_name || companyName}
		email={creado.demo?.recipient_email || recipientEmail}
		otp={creado.otp}
		accessUrl={creado.access_url}
		expiresText={caducaEl}
		provisioning={creado.provisioning !== false}
		onClose={alCerrar}
	/>
{/if}
