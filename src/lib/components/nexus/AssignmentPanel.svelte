<script>
	import { ClientsService } from '$lib/services/clients';
	import { DevicesService } from '$lib/services/devices';
	import Button from '$lib/components/ui/Button.svelte';

	/** @type {{ selectedDevices: string[], onClose: () => void, onSuccess: () => void }} */
	let { selectedDevices = [], onClose, onSuccess } = $props();

	/** @type {any[]} */
	let accounts = $state([]);
	/** @type {any[]} */
	let organizations = $state([]);
	let accountSearch = $state('');

	let loadingAccounts = $state(false);
	let loadingOrgs = $state(false);
	let assigning = $state(false);

	/** @type {string | null} */
	let selectedAccount = $state(null);
	/** @type {string | null} */
	let selectedOrg = $state(null);

	let progress = $state(0);
	let total = $derived(selectedDevices.length);
	let successCount = $state(0);
	let failCount = $state(0);

	// Derived filtered accounts
	let filteredAccounts = $derived(
		accounts.filter((account) => {
			const term = accountSearch.toLowerCase();
			const name = (account.account_name || '').toLowerCase();
			const email = (account.billing_email || '').toLowerCase();
			return name.includes(term) || email.includes(term);
		})
	);

	$effect(() => {
		loadAccounts();
	});

	$effect(() => {
		if (selectedAccount) {
			loadOrganizations(selectedAccount);
			selectedOrg = null;
		} else {
			organizations = [];
			selectedOrg = null;
		}
	});

	async function loadAccounts() {
		loadingAccounts = true;
		try {
			const response = await ClientsService.getAll({ limit: 100 });
			// API returns array directly based on user feedback
			// @ts-ignore
			accounts = Array.isArray(response) ? response : response.accounts || [];
		} catch (e) {
			console.error('Error loading accounts:', e);
		} finally {
			loadingAccounts = false;
		}
	}

	/** @param {string} accountId */
	async function loadOrganizations(accountId) {
		loadingOrgs = true;
		try {
			organizations = await ClientsService.getOrganizations(accountId);
		} catch (e) {
			console.error('Error loading organizations:', e);
		} finally {
			loadingOrgs = false;
		}
	}

	async function handleAssign() {
		if (!selectedOrg || selectedDevices.length === 0) return;

		assigning = true;
		progress = 0;
		successCount = 0;
		failCount = 0;

		for (const deviceId of selectedDevices) {
			try {
				// User requested 'asignado' or similar status update.
				// Based on standard flow: organization assignment -> 'preparado'
				await DevicesService.assignOrganization(deviceId, selectedOrg, 'preparado');
				successCount++;
			} catch (e) {
				console.error(`Failed to assign device ${deviceId}:`, e);
				failCount++;
			}
			progress++;
		}

		assigning = false;
		if (onSuccess) onSuccess();
	}
</script>

<div class="h-full flex flex-col bg-slate-50 border-t border-slate-200 font-sans">
	<div
		class="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10"
	>
		<div>
			<h3 class="font-bold text-slate-800 text-lg">Asignar Dispositivos</h3>
			<p class="text-sm text-slate-500">
				{selectedDevices.length} dispositivos seleccionados para asignación
			</p>
		</div>
		<Button variant="ghost" size="sm" onclick={onClose}>Cancelar</Button>
	</div>

	<div class="p-6 flex-1 overflow-y-auto">
		{#if assigning || (progress > 0 && progress === total)}
			<div
				class="max-w-md mx-auto text-center space-y-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
			>
				<div class="relative w-16 h-16 mx-auto">
					{#if assigning}
						<div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
						<div
							class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
						></div>
					{:else if failCount === 0}
						<div
							class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg
							>
						</div>
					{:else}
						<div
							class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
								/><line x1="12" y1="9" x2="12" y2="13" /><line
									x1="12"
									y1="17"
									x2="12.01"
									y2="17"
								/></svg
							>
						</div>
					{/if}
				</div>

				<h4 class="text-xl font-semibold text-slate-800">
					{assigning ? 'Asignando dispositivos...' : 'Proceso finalizado'}
				</h4>

				<div class="space-y-2">
					<div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
						<div
							class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
							style="width: {(progress / total) * 100}%"
						></div>
					</div>
					<div class="flex justify-between text-xs text-slate-500 font-medium font-mono">
						<span>0%</span>
						<span>{((progress / total) * 100).toFixed(0)}%</span>
						<span>100%</span>
					</div>
				</div>

				{#if !assigning}
					<div class="flex justify-center gap-6 mt-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-green-600">{successCount}</div>
							<div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">
								Exitosos
							</div>
						</div>
						{#if failCount > 0}
							<div class="text-center">
								<div class="text-2xl font-bold text-red-600">{failCount}</div>
								<div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">
									Fallidos
								</div>
							</div>
						{/if}
					</div>
					<div class="pt-8">
						<Button variant="primary" class="min-w-[120px]" onclick={onClose}>Hecho</Button>
					</div>
				{/if}
			</div>
		{:else}
			<div class="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
				<!-- Column 1: Account Selection -->
				<div
					class="flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-full"
				>
					<div class="p-4 border-b border-slate-100 bg-slate-50/50">
						<label
							for="account-search"
							class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block"
							>1. Seleccionar Cliente</label
						>
						<div class="relative">
							<input
								id="account-search"
								type="text"
								bind:value={accountSearch}
								placeholder="Buscar por nombre, email..."
								class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
							/>
							<svg
								class="absolute left-3 top-2.5 text-slate-400"
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
							>
						</div>
					</div>

					<div
						class="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300"
					>
						{#if loadingAccounts}
							<div class="flex flex-col items-center justify-center h-40 space-y-3">
								<div
									class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
								></div>
								<span class="text-xs text-slate-400 font-medium">Cargando clientes...</span>
							</div>
						{:else if filteredAccounts.length === 0}
							<div class="text-center py-10 px-4">
								<p class="text-sm text-slate-500">
									No se encontraron cuentas que coincidan con "{accountSearch}".
								</p>
							</div>
						{:else}
							<div class="space-y-1">
								{#each filteredAccounts as account (account.id)}
									<button
										class="w-full text-left p-3 rounded-lg border transition-all duration-200 group relative
                                        {selectedAccount === account.id
											? 'bg-blue-50 border-blue-200 shadow-sm z-10 ring-1 ring-blue-200'
											: 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}"
										onclick={() => (selectedAccount = account.id)}
									>
										<div class="flex justify-between items-start">
											<div>
												<div
													class="font-medium text-slate-900 text-sm group-hover:text-blue-700 transition-colors"
												>
													{account.account_name}
												</div>
												<div class="text-xs text-slate-500 mt-0.5 font-mono">
													{account.billing_email}
												</div>
											</div>
											{#if selectedAccount === account.id}
												<div class="text-blue-600 animate-in zoom-in duration-200">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="3"
														stroke-linecap="round"
														stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
													>
												</div>
											{/if}
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<!-- Column 2: Organization Selection -->
				<div class="flex flex-col h-full space-y-4">
					<div
						class="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden opacity-100 transition-opacity duration-300 {selectedAccount
							? 'opacity-100'
							: 'opacity-50 pointer-events-none grayscale'}"
					>
						<div class="p-4 border-b border-slate-100 bg-slate-50/50">
							<label class="text-xs font-semibold text-slate-500 uppercase tracking-wider block"
								>2. Seleccionar Organización</label
							>
						</div>

						<div class="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
							{#if loadingOrgs}
								<div class="flex flex-col items-center justify-center h-40 space-y-3">
									<div
										class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
									></div>
									<span class="text-xs text-slate-400 font-medium">Buscando organizaciones...</span>
								</div>
							{:else if !selectedAccount}
								<div
									class="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400"
								>
									<svg
										class="mb-3 opacity-20"
										xmlns="http://www.w3.org/2000/svg"
										width="48"
										height="48"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line
											x1="16"
											y1="2"
											x2="16"
											y2="6"
										/><line x1="8" y1="2" x2="8" y2="6" /><line
											x1="3"
											y1="10"
											x2="21"
											y2="10"
										/></svg
									>
									<p class="text-sm">Seleccione un cliente primero</p>
								</div>
							{:else if organizations.length === 0}
								<div
									class="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 bg-slate-50/50 rounded-lg m-2 border border-dashed border-slate-200"
								>
									<p class="font-medium text-sm">Sin organizaciones</p>
									<p class="text-xs mt-1">Este cliente no tiene organizaciones activas.</p>
								</div>
							{:else}
								<div class="space-y-2">
									{#each organizations as org (org.id)}
										<button
											class="w-full text-left p-4 rounded-lg border transition-all duration-200 relative group
                                            {selectedOrg === org.id
												? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-200'
												: 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}"
											onclick={() => (selectedOrg = org.id)}
										>
											<div class="flex items-center gap-3">
												<div
													class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                                    {selectedOrg === org.id
														? 'bg-blue-100 text-blue-600'
														: 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'}"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="20"
														height="20"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
														><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path
															d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
														/></svg
													>
												</div>
												<div class="flex-1 min-w-0">
													<div class="font-semibold text-slate-800 text-sm truncate">
														{org.name}
													</div>
													{#if org.billing_email}
														<div class="text-xs text-slate-500 truncate">
															{org.billing_email}
														</div>
													{/if}
												</div>
												{#if selectedOrg === org.id}
													<div class="absolute top-2 right-2 flex h-2 w-2">
														<span
															class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
														></span>
														<span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"
														></span>
													</div>
												{/if}
											</div>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Action Button -->
					<div class="pt-2">
						<Button
							variant="primary"
							class="w-full h-12 shadow-lg shadow-blue-500/20 text-base font-medium disabled:opacity-50 disabled:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0"
							disabled={!selectedOrg || selectedDevices.length === 0}
							onclick={handleAssign}
						>
							{#if !selectedOrg}
								<span>Complete la selección</span>
							{:else}
								<span class="flex items-center justify-center gap-2">
									Asignar {selectedDevices.length} Dispositivos a {organizations.find(
										(o) => o.id === selectedOrg
									)?.name}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
									>
								</span>
							{/if}
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
