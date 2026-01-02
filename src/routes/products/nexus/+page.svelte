<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { ClientsService } from '$lib/services/clients';
	import { onMount } from 'svelte';

	/** @type {any[]} */
	let clients = $state([]);
	let isLoading = $state(false);
	let searchTerm = $state('');

	// Counters
	let deviceCount = $state(0);
	let clientCount = $state(0);

	// Filtered clients (empty for now)
	let filteredClients = $derived(
		clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	onMount(async () => {
		try {
			// Fetch clients (accounts) and stats in parallel
			const [accountsData, statsData] = await Promise.all([
				// @ts-ignore
				ClientsService.getAll({ limit: 50 }),
				ClientsService.getStats()
			]);

			// @ts-ignore
			const fetchedAccounts = accountsData || [];
			// @ts-ignore
			const stats = statsData || { accounts: { total: 0 }, devices: { total: 0 } };

			// Update counters from stats
			deviceCount = stats.devices?.total || 0;
			clientCount = stats.accounts?.total || 0;

			// Format accounts for display
			clients = fetchedAccounts.map((/** @type {any} */ account) => ({
				id: account.id,
				name: account.account_name,
				billingEmail: account.billing_email,
				ownerEmail: account.owner_email,
				status: account.status,
				totalUsers: account.total_users || 0,
				totalOrganizations: account.total_organizations || 0,
				formattedCreated: new Date(account.created_at).toLocaleDateString(),
				formattedUpdated: new Date(account.updated_at).toLocaleDateString()
			}));
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		}
	});
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title="Nexus / Dashboard">
		<a href="/products/nexus/devices/create">
			<Button variant="primary" size="sm">
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
					class="mr-2"><path d="M5 12h14" /><path d="M12 5v14" /></svg
				>
				Nuevo Dispositivo
			</Button>
		</a>
	</Topbar>

	<div class="p-8 space-y-6">
		<!-- Counters -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<a href="/products/nexus/devices" class="block transition-transform hover:scale-[1.02]">
				<Card
					class="p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
				>
					<div>
						<p class="text-sm font-medium text-slate-500">Total Equipos</p>
						<p class="text-3xl font-bold text-slate-900">
							{deviceCount}
						</p>
					</div>
					<div class="p-3 bg-blue-50 rounded-full text-blue-600">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg
						>
					</div>
				</Card>
			</a>
			<Card class="p-6 flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-slate-500">Total Clientes</p>
					<p class="text-3xl font-bold text-slate-900">
						{clientCount}
					</p>
				</div>
				<div class="p-3 bg-green-50 rounded-full text-green-600">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle
							cx="9"
							cy="7"
							r="4"
						/><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg
					>
				</div>
			</Card>
		</div>

		<!-- Client Search & List -->
		<Card class="overflow-hidden">
			<div class="p-4 border-b border-slate-100">
				<div class="w-full md:w-96">
					<Input placeholder="Buscar cliente..." bind:value={searchTerm} class="w-full" />
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
						<tr>
							<th class="px-6 py-4">Nombre</th>
							<th class="px-6 py-4">Billing Email</th>
							<th class="px-6 py-4">Estatus</th>
							<th class="px-6 py-4">Creado</th>
							<th class="px-6 py-4">Actualizado</th>
							<th class="px-6 py-4 text-center">Usuarios</th>
							<th class="px-6 py-4 text-center">Organizaciones</th>
							<th class="px-6 py-4 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if isLoading}
							<tr>
								<td colspan="7" class="px-6 py-8 text-center text-slate-500">
									Cargando clientes...
								</td>
							</tr>
						{:else if filteredClients.length === 0}
							<tr>
								<td colspan="7" class="px-6 py-8 text-center text-slate-500">
									No se encontraron clientes.
								</td>
							</tr>
						{:else}
							{#each filteredClients as client (client.id)}
								<tr
									class="hover:bg-slate-50 transition-colors cursor-pointer"
									onclick={() => (window.location.href = `/products/nexus/accounts/${client.id}`)}
								>
									<td class="px-6 py-4">
										<div class="font-medium text-slate-900">{client.name}</div>
										<div class="text-xs text-slate-500">{client.ownerEmail || ''}</div>
									</td>
									<td class="px-6 py-4 text-sm text-slate-600">
										{client.billingEmail || '-'}
									</td>
									<td class="px-6 py-4">
										<span
											class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
												${
													client.status === 'ACTIVE'
														? 'bg-green-100 text-green-800'
														: client.status === 'PENDING'
															? 'bg-yellow-100 text-yellow-800'
															: client.status === 'SUSPENDED'
																? 'bg-red-100 text-red-800'
																: 'bg-slate-100 text-slate-800'
												}`}
										>
											{client.status}
										</span>
									</td>
									<td class="px-6 py-4 text-slate-600">{client.formattedCreated}</td>
									<td class="px-6 py-4 text-slate-600">{client.formattedUpdated}</td>
									<td class="px-6 py-4 text-center text-slate-600">
										{client.totalUsers}
									</td>
									<td class="px-6 py-4 text-center text-slate-600">
										{client.totalOrganizations}
									</td>
									<td class="px-6 py-4 text-right">
										<Button variant="ghost" size="sm">Ver Detalle</Button>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</Card>
	</div>
</div>
