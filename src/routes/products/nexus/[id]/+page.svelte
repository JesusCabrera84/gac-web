<script>
	import { page } from '$app/stores';
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	import { onMount } from 'svelte';

	let deviceId = $derived($page.params.id);
	/** @type {any} */
	let device = $state(null);
	/** @type {any[]} */
	let history = $state([]);
	let isLoading = $state(true);
	let showAssignModal = $state(false);
	let selectedClient = $state('');
	let assignLoading = $state(false);

	// Mock data
	const MOCK_DEVICE = {
		device_id: 'NEX-001',
		model: 'Nexus X1',
		provider: 'Telcel',
		batch: 'B-2023-01',
		status: 'active',
		notes: 'Dispositivo de prueba inicial.',
		client: null
	};

	const MOCK_HISTORY = [
		{
			date: '2023-11-20 10:00',
			status: 'created',
			user: 'admin@geminislabs.com',
			notes: 'Dispositivo registrado'
		},
		{
			date: '2023-11-21 14:30',
			status: 'inventory',
			user: 'admin@geminislabs.com',
			notes: 'Ingreso a almacén'
		},
		{
			date: '2023-11-25 09:15',
			status: 'active',
			user: 'admin@geminislabs.com',
			notes: 'Activación remota'
		}
	];

	const MOCK_CLIENTS = [
		{ id: 'CLI-001', name: 'Transportes del Norte' },
		{ id: 'CLI-002', name: 'Logística Express' },
		{ id: 'CLI-003', name: 'Seguridad Privada SA' }
	];

	async function loadDeviceDetails() {
		isLoading = true;
		try {
			// Simulate API fetch
			await new Promise((resolve) => setTimeout(resolve, 600));
			device = { ...MOCK_DEVICE, device_id: deviceId };
			history = MOCK_HISTORY;
		} catch (error) {
			console.error('Error loading device:', error);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadDeviceDetails();
	});

	async function handleAssignClient() {
		assignLoading = true;
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 800));

			const clientName = MOCK_CLIENTS.find((c) => c.id === selectedClient)?.name;
			device.client = { id: selectedClient, name: clientName };

			// Add to history
			history = [
				{
					date: new Date().toISOString().replace('T', ' ').substring(0, 16),
					status: device.status,
					user: 'admin@geminislabs.com',
					notes: `Asignado a cliente: ${clientName}`
				},
				...history
			];

			showAssignModal = false;
		} catch (error) {
			console.error('Error assigning client:', error);
		} finally {
			assignLoading = false;
		}
	}

	/** @param {string} status */
	function getStatusColor(status) {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-700';
			case 'inventory':
				return 'bg-blue-100 text-blue-700';
			case 'maintenance':
				return 'bg-orange-100 text-orange-700';
			default:
				return 'bg-slate-100 text-slate-700';
		}
	}
</script>

<div class="flex flex-col min-h-screen relative">
	<Topbar title={`Nexus / ${deviceId}`}>
		<a href="/products/nexus">
			<Button variant="secondary" size="sm">Volver</Button>
		</a>
	</Topbar>

	<div class="p-8 max-w-5xl mx-auto w-full">
		{#if isLoading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
			</div>
		{:else if device}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Main Info -->
				<div class="lg:col-span-2 space-y-6">
					<Card class="p-6">
						<div class="flex justify-between items-start mb-6">
							<div>
								<h2 class="text-xl font-bold text-slate-900">
									{device.model}
								</h2>
								<p class="text-slate-500 text-sm">
									{device.device_id}
								</p>
							</div>
							<span
								class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(device.status)}"
							>
								{device.status.toUpperCase()}
							</span>
						</div>

						<div class="grid grid-cols-2 gap-6 mb-6">
							<div>
								<p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Proveedor</p>
								<p class="text-slate-900 mt-1">
									{device.provider}
								</p>
							</div>
							<div>
								<p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Lote</p>
								<p class="text-slate-900 mt-1">
									{device.batch}
								</p>
							</div>
						</div>

						<div>
							<p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Notas</p>
							<p class="text-slate-700 bg-slate-50 p-3 rounded-md text-sm">
								{device.notes}
							</p>
						</div>
					</Card>

					<Card class="p-6">
						<h3 class="text-lg font-semibold text-slate-900 mb-4">Historial de Estados</h3>
						<div class="flow-root">
							<ul role="list" class="-mb-8">
								{#each history as event, i (i)}
									<li>
										<div class="relative pb-8">
											{#if i !== history.length - 1}
												<span
													class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
													aria-hidden="true"
												></span>
											{/if}
											<div class="relative flex space-x-3">
												<div>
													<span
														class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white"
													>
														<svg
															class="h-4 w-4 text-slate-500"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
													</span>
												</div>
												<div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
													<div>
														<p class="text-sm text-slate-900 font-medium">
															{event.status.toUpperCase()}
															<span class="font-normal text-slate-500">by {event.user}</span>
														</p>
														<p class="text-sm text-slate-500 mt-1">
															{event.notes}
														</p>
													</div>
													<div class="text-right text-sm whitespace-nowrap text-slate-500">
														<time datetime={event.date}>{event.date}</time>
													</div>
												</div>
											</div>
										</div>
									</li>
								{/each}
							</ul>
						</div>
					</Card>
				</div>

				<!-- Sidebar Actions -->
				<div class="space-y-6">
					<Card class="p-6">
						<h3 class="text-sm font-medium text-slate-900 uppercase tracking-wider mb-4">
							Cliente Asignado
						</h3>
						{#if device.client}
							<div class="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
								<p class="font-semibold text-blue-900">
									{device.client.name}
								</p>
								<p class="text-xs text-blue-600 mt-1">
									ID: {device.client.id}
								</p>
							</div>
							<Button
								variant="secondary"
								class="w-full text-sm"
								onclick={() => (showAssignModal = true)}
							>
								Cambiar Asignación
							</Button>
						{:else}
							<div
								class="text-center py-6 bg-slate-50 rounded-md mb-4 border border-slate-100 border-dashed"
							>
								<p class="text-slate-500 text-sm">Sin cliente asignado</p>
							</div>
							<Button variant="primary" class="w-full" onclick={() => (showAssignModal = true)}>
								Asignar a Cliente
							</Button>
						{/if}
					</Card>

					<Card class="p-6">
						<h3 class="text-sm font-medium text-slate-900 uppercase tracking-wider mb-4">
							Acciones
						</h3>
						<div class="space-y-3">
							<Button variant="secondary" class="w-full justify-start">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="mr-2"
									><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
										points="7 10 12 15 17 10"
									/><line x1="12" x2="12" y1="15" y2="3" /></svg
								>
								Descargar Reporte
							</Button>
							<Button variant="danger" class="w-full justify-start">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="mr-2"
									><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
										d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
									/></svg
								>
								Eliminar Dispositivo
							</Button>
						</div>
					</Card>
				</div>
			</div>
		{:else}
			<div class="text-center py-12">
				<p class="text-slate-500">Dispositivo no encontrado.</p>
			</div>
		{/if}
	</div>

	<!-- Assign Modal -->
	{#if showAssignModal}
		<div
			class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
		>
			<div
				class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
			>
				<h3 class="text-lg font-bold text-slate-900 mb-4">Asignar a Cliente</h3>
				<p class="text-sm text-slate-500 mb-6">
					Selecciona un cliente para asignar el dispositivo <strong>{device.device_id}</strong>.
				</p>

				<div class="mb-6">
					<label for="client-select" class="block text-sm font-medium text-slate-700 mb-1"
						>Cliente</label
					>
					<select
						id="client-select"
						bind:value={selectedClient}
						class="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
					>
						<option value="" disabled selected>Seleccionar cliente...</option>
						{#each MOCK_CLIENTS as client (client.id)}
							<option value={client.id}>{client.name}</option>
						{/each}
					</select>
				</div>

				<div class="flex justify-end space-x-3">
					<Button variant="ghost" onclick={() => (showAssignModal = false)}>Cancelar</Button>
					<Button
						variant="primary"
						disabled={!selectedClient || assignLoading}
						onclick={handleAssignClient}
					>
						{#if assignLoading}
							Asignando...
						{:else}
							Confirmar Asignación
						{/if}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
