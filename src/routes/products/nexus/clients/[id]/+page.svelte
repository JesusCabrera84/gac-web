<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	// let clientId = $page.params.id;

	// Placeholder data
	let client = {
		name: 'Cliente Ejemplo',
		status: 'Activo',
		created_at: '2023-01-01',
		subscription: 'Premium'
	};

	let devices = []; // device_id, brand, model
	let units = []; // name, plate, brand, model, device

	// Placeholder function to add device
	function handleAddDevice() {
		console.log('Add device to client');
	}
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title={`Nexus / Clientes / ${client.name}`} />

	<div class="p-8 space-y-6">
		<!-- Client Info -->
		<Card class="p-6">
			<h2 class="text-lg font-semibold text-slate-900 mb-4">Información del Cliente</h2>
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div>
					<p class="text-sm text-slate-500">Nombre</p>
					<p class="font-medium">{client.name}</p>
				</div>
				<div>
					<p class="text-sm text-slate-500">Estatus</p>
					<p class="font-medium">{client.status}</p>
				</div>
				<div>
					<p class="text-sm text-slate-500">Creado</p>
					<p class="font-medium">{client.created_at}</p>
				</div>
				<div>
					<p class="text-sm text-slate-500">Suscripción</p>
					<p class="font-medium">{client.subscription}</p>
				</div>
			</div>
		</Card>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Devices List -->
			<Card class="overflow-hidden h-full">
				<div class="p-4 border-b border-slate-100 flex justify-between items-center">
					<h3 class="font-semibold text-slate-900">Dispositivos Asignados</h3>
					<Button variant="outline" size="sm" onclick={handleAddDevice}>Asignar Dispositivo</Button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm text-left">
						<thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
							<tr>
								<th class="px-4 py-3">Device ID</th>
								<th class="px-4 py-3">Marca</th>
								<th class="px-4 py-3">Modelo</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#if devices.length === 0}
								<tr>
									<td colspan="3" class="px-4 py-6 text-center text-slate-500">
										Sin dispositivos asignados.
									</td>
								</tr>
							{:else}
								{#each devices as device (device.device_id)}
									<tr>
										<td class="px-4 py-3 font-medium">{device.device_id}</td>
										<td class="px-4 py-3">{device.brand}</td>
										<td class="px-4 py-3">{device.model}</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</Card>

			<!-- Units List -->
			<Card class="overflow-hidden h-full">
				<div class="p-4 border-b border-slate-100">
					<h3 class="font-semibold text-slate-900">Unidades</h3>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm text-left">
						<thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
							<tr>
								<th class="px-4 py-3">Nombre</th>
								<th class="px-4 py-3">Placas</th>
								<th class="px-4 py-3">Vehículo</th>
								<th class="px-4 py-3">Dispositivo</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#if units.length === 0}
								<tr>
									<td colspan="4" class="px-4 py-6 text-center text-slate-500">
										Sin unidades registradas.
									</td>
								</tr>
							{:else}
								{#each units as unit (unit.name)}
									<tr>
										<td class="px-4 py-3 font-medium">{unit.name}</td>
										<td class="px-4 py-3">{unit.plate}</td>
										<td class="px-4 py-3">{unit.brand} {unit.model}</td>
										<td class="px-4 py-3 text-slate-500">{unit.device}</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	</div>
</div>
