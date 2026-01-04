<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import PlanDetail from '$lib/components/nexus/PlanDetail.svelte';
	import { PlansService } from '$lib/services/plans';
	import { onMount } from 'svelte';

	/** @type {import('$lib/services/plans').Plan[]} */
	let plans = $state([]);
	let isLoading = $state(true);
	let searchTerm = $state('');
	/** @type {string | null} */
	let selectedPlanId = $state(null);

	let filteredPlans = $derived(
		plans.filter((p) => {
			const term = searchTerm.toLowerCase();
			return p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term);
		})
	);

	let selectedPlan = $derived(plans.find((p) => p.id === selectedPlanId));

	onMount(async () => {
		await loadPlans();
	});

	async function loadPlans() {
		isLoading = true;
		try {
			const response = await PlansService.getAll();
			/** @type {any} */
			const data = response;
			plans = Array.isArray(data) ? data : data.plans || [];
		} catch (error) {
			console.error('Error loading plans:', error);
		} finally {
			isLoading = false;
		}
	}

	/** @param {string} id */
	function handleRowClick(id) {
		selectedPlanId = id;
	}
</script>

<div class="flex flex-col h-screen overflow-hidden bg-slate-50">
	<Topbar title="Planes" backUrl="/">
		<a href="/products/plans/new">
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
				Nuevo Plan
			</Button>
		</a>
	</Topbar>

	<div class="flex flex-col flex-1 overflow-hidden">
		<!-- Top Panel: Plans Table (40%) -->
		<div class="h-[40%] flex flex-col border-b border-slate-200 bg-white">
			<div class="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
				<div class="w-full md:w-1/2">
					<Input
						placeholder="Filtrar por nombre o código..."
						bind:value={searchTerm}
						class="w-full"
					/>
				</div>
				<Button variant="ghost" size="sm" onclick={loadPlans} disabled={isLoading} class="ml-2">
					Actualizar
				</Button>
			</div>

			<div class="flex-1 overflow-y-auto">
				<table class="w-full text-sm text-left">
					<thead
						class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0"
					>
						<tr>
							<th class="px-6 py-3">Nombre</th>
							<th class="px-6 py-3">Código</th>
							<th class="px-6 py-3">Precio Mensual</th>
							<th class="px-6 py-3">Precio Anual</th>
							<th class="px-6 py-3">Estado</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if isLoading}
							<tr>
								<td colspan="5" class="px-6 py-8 text-center text-slate-500">
									Cargando planes...
								</td>
							</tr>
						{:else if filteredPlans.length === 0}
							<tr>
								<td colspan="5" class="px-6 py-8 text-center text-slate-500">
									No se encontraron planes.
								</td>
							</tr>
						{:else}
							{#each filteredPlans as plan (plan.id)}
								<tr
									class="transition-colors cursor-pointer {selectedPlanId === plan.id
										? 'bg-blue-50/50'
										: 'hover:bg-slate-50'}"
									onclick={() => handleRowClick(plan.id)}
								>
									<td class="px-6 py-3 font-medium text-slate-900">
										{plan.name}
									</td>
									<td class="px-6 py-3 text-slate-600 font-mono text-xs uppercase">
										{plan.code}
									</td>
									<td class="px-6 py-3 text-slate-600">
										${plan.price_monthly}
									</td>
									<td class="px-6 py-3 text-slate-600">
										${plan.price_yearly}
									</td>
									<td class="px-6 py-3">
										<span
											class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {plan.is_active
												? 'bg-green-100 text-green-800'
												: 'bg-slate-100 text-slate-800'}"
										>
											{plan.is_active ? 'Activo' : 'Inactivo'}
										</span>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Bottom Panel: Plan Detail (60%) -->
		<div class="h-[60%] bg-slate-50 overflow-hidden">
			{#if selectedPlan}
				<PlanDetail plan={selectedPlan} onSave={loadPlans} />
			{:else}
				<div class="flex flex-col items-center justify-center h-full text-slate-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="mb-4 text-slate-300"
					>
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
						<line x1="3" y1="10" x2="21" y2="10" />
						<line x1="9" y1="22" x2="9" y2="10" />
					</svg>
					<p class="text-lg font-medium">Seleccione un plan</p>
					<p class="text-sm">
						Seleccione un plan de la tabla superior para ver y editar sus detalles.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
