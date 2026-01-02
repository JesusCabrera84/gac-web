<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { DevicesService } from '$lib/services/devices';
	import { onMount } from 'svelte';

	let deviceId = $state('');
	let brand = $state('');
	let model = $state('');
	let firmwareVersion = $state('');
	let notes = $state('');
	let iccid = $state('');
	let carrier = $state('KORE');
	let koreSimId = $state('');
	let koreAccountId = $state('');
	let status = $state('');
	let clientId = $state('');

	let isLoading = $state(true);
	let isSaving = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	onMount(async () => {
		/** @type {{id: string}} */
		const params = /** @type {any} */ ($page.params);
		const id = params.id;
		if (id) {
			await loadDevice(id);
		}
	});

	/** @param {string} id */
	async function loadDevice(id) {
		isLoading = true;
		errorMessage = '';
		try {
			/** @type {any} */
			const device = await DevicesService.getById(id);
			deviceId = device.device_id;
			brand = device.brand || '';
			model = device.model || '';
			firmwareVersion = device.firmware_version || '';
			notes = device.notes || '';
			iccid = device.iccid || '';
			carrier = device.carrier || 'KORE';
			if (carrier === 'KORE' && device.sim_profile) {
				koreSimId = device.sim_profile.kore_sim_id || '';
				koreAccountId = device.sim_profile.kore_account_id || '';
			} else {
				koreSimId = '';
				koreAccountId = '';
			}
			status = device.status || '';
			clientId = device.client_id || '';
		} catch (error) {
			console.error('Error loading device:', error);
			errorMessage = 'Error al cargar la información del dispositivo.';
		} finally {
			isLoading = false;
		}
	}

	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();
		isSaving = true;
		errorMessage = '';
		successMessage = '';

		const payload = {
			brand,
			model,
			firmware_version: firmwareVersion,
			notes,
			status,
			iccid: iccid || undefined,
			carrier,
			sim_profile:
				carrier === 'KORE'
					? {
							kore_sim_id: koreSimId,
							kore_account_id: koreAccountId
						}
					: undefined
		};

		try {
			await DevicesService.update(deviceId, payload);
			successMessage = 'Dispositivo actualizado correctamente.';
		} catch (error) {
			console.error('Error updating device:', error);
			errorMessage = /** @type {any} */ (error).message || 'Error al actualizar el dispositivo';
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title={`Nexus / Dispositivo ${deviceId || '...'}`} backUrl="/products/nexus/devices" />

	<div class="p-8 max-w-2xl mx-auto w-full">
		<Card class="p-8">
			<h2 class="text-xl font-bold text-slate-900 mb-6">Editar Dispositivo</h2>

			{#if isLoading}
				<div class="p-8 text-center text-slate-500">Cargando información...</div>
			{:else}
				{#if errorMessage}
					<div class="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">
						{errorMessage}
					</div>
				{/if}

				{#if successMessage}
					<div class="bg-green-50 text-green-600 p-4 rounded-md mb-6 text-sm">
						{successMessage}
					</div>
				{/if}

				<form onsubmit={handleSubmit} class="space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="col-span-2">
							<p class="block text-sm font-medium text-slate-700 mb-1">Device ID</p>
							<div class="p-2 bg-slate-100 rounded text-slate-900 font-mono">
								{deviceId}
							</div>
						</div>

						<!-- Status display moved to editable select below -->

						<div class="col-span-2 md:col-span-1">
							<p class="block text-sm font-medium text-slate-700 mb-1">Estatus</p>
							<select
								id="status"
								bind:value={status}
								class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200"
							>
								<option value="nuevo">Nuevo</option>
								<option value="preparado">Preparado</option>
								<option value="enviado">Enviado</option>
								<option value="entregado">Entregado</option>
								<option value="asignado">Asignado</option>
								<option value="devuelto">Devuelto</option>
								<option value="inactivo">Inactivo</option>
							</select>
						</div>

						<div class="col-span-2 md:col-span-1">
							<p class="block text-sm font-medium text-slate-700 mb-1">Cliente Asignado</p>
							<div class="p-2 bg-slate-50 rounded text-slate-900 h-10 flex items-center">
								{clientId || 'Sin asignar'}
							</div>
						</div>

						<Input id="brand" label="Marca" placeholder="Suntech" bind:value={brand} required />

						<Input id="model" label="Modelo" placeholder="ST4330" bind:value={model} required />

						<div class="col-span-2">
							<Input
								id="firmware"
								label="Versión de Firmware"
								placeholder="1.0.0"
								bind:value={firmwareVersion}
							/>
						</div>

						<div class="col-span-2">
							<Input id="iccid" label="ICCID (SIM)" placeholder="89340..." bind:value={iccid} />
						</div>

						<div class="col-span-2 pt-4 border-t border-slate-200">
							<h3 class="text-lg font-medium text-slate-800 mb-4">Carrier Profile</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="col-span-2 md:col-span-1">
									<label for="carrier" class="block text-sm font-medium text-slate-700 mb-1">
										Carrier
									</label>
									<select
										id="carrier"
										bind:value={carrier}
										class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200"
									>
										<option value="KORE">Kore</option>
										<option value="other">Other</option>
									</select>
								</div>

								{#if carrier === 'KORE'}
									<div class="col-span-2 md:col-span-1">
										<Input
											id="kore_sim_id"
											label="Kore SIM ID"
											placeholder="HS0ad..."
											bind:value={koreSimId}
										/>
									</div>
									<div class="col-span-2 md:col-span-1">
										<Input
											id="kore_account_id"
											label="Kore Account ID"
											placeholder="CO17..."
											bind:value={koreAccountId}
										/>
									</div>
								{/if}
							</div>
						</div>

						<div class="col-span-2 space-y-2">
							<label for="notes" class="text-sm font-medium text-slate-700">Notas</label>
							<textarea
								id="notes"
								bind:value={notes}
								rows="3"
								class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
							></textarea>
						</div>
					</div>

					<div class="flex justify-end space-x-4 pt-4">
						<Button
							variant="ghost"
							type="button"
							onclick={async () => await goto('/products/nexus/devices')}
						>
							Volver
						</Button>
						<Button variant="primary" type="submit" disabled={isSaving}>
							{isSaving ? 'Guardando...' : 'Guardar Cambios'}
						</Button>
					</div>
				</form>
			{/if}
		</Card>
	</div>
</div>
