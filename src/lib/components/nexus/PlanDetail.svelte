<script>
	import { onMount, untrack } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { PlansService } from '$lib/services/plans';
	import { ProductsService } from '$lib/services/products';
	import { toast } from '$lib/stores/toast';

	/** @type {{
	 * 	plan: import('$lib/services/plans').Plan,
	 * 	onSave?: () => void
	 * }} */
	let { plan: initialPlan, onSave } = $props();

	/** @type {import('$lib/services/plans').Plan} */
	let plan = $state(JSON.parse(JSON.stringify(initialPlan)));
	let isSaving = $state(false);

	// Catalogs
	/** @type {any[]} */
	let availableProducts = $state([]);
	/** @type {any[]} */
	let availableCapabilities = $state([]);

	// Local state for easier binding
	/** @type {Object.<string, any>} */
	let capabilityValues = $state({});
	/** @type {string} */
	let selectedProductCode = $state('');

	onMount(async () => {
		try {
			const [productsResponse, caps] = await Promise.all([
				ProductsService.getAll({ is_active: true }),
				PlansService.getAvailableCapabilities()
			]);
			availableProducts = productsResponse.products || [];
			availableCapabilities = caps;
		} catch (err) {
			console.error('Error loading catalogs:', err);
			// @ts-ignore
			toast.error('Error al cargar catálogos: ' + err.message);
		}
	});

	// Update local state when prop changes (only when plan ID changes)
	$effect(() => {
		const planId = initialPlan?.id;
		if (planId) {
			// Use untrack to prevent infinite loops
			untrack(() => {
				plan = JSON.parse(JSON.stringify(initialPlan));
				// Initialize selected product code (single product)
				const products = plan.products || [];
				selectedProductCode = products.length > 0 ? products[0].code : '';
				// Initialize capability values
				const vals = {};
				(plan.capabilities || []).forEach((c) => {
					// Use 'value' if present (from GET), otherwise fall back to value_int/bool
					vals[c.capability_code] = c.value !== undefined ? c.value : (c.value_int ?? c.value_bool);
				});
				capabilityValues = vals;
			});
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();

		// Validate product selection
		if (!selectedProductCode) {
			toast.error('Debe seleccionar un producto antes de guardar');
			return;
		}

		isSaving = true;

		try {
			// Prepare data for PATCH
			const updateData = {
				name: plan.name,
				code: plan.code,
				description: plan.description,
				price_monthly: plan.price_monthly,
				price_yearly: plan.price_yearly,
				is_active: plan.is_active,
				product_codes: [selectedProductCode],
				capabilities: Object.entries(capabilityValues).map(([code, value]) => {
					const def = availableCapabilities.find((d) => d.code === code);
					/** @type {any} */
					const item = { capability_code: code };
					if (def?.value_type === 'int') item.value_int = parseInt(value);
					else if (def?.value_type === 'bool') item.value_bool = !!value;
					else item.value = value;
					return item;
				})
			};

			await PlansService.update(plan.id, updateData);
			toast.success('Plan actualizado exitosamente');
			if (onSave) onSave();
		} catch (err) {
			console.error('Error updating plan:', err);
			// @ts-ignore
			toast.error('Error al guardar el plan: ' + err.message);
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="h-full flex flex-col bg-white">
	<form onsubmit={handleSubmit} class="flex flex-col h-full">
		<div class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
			<div>
				<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
					Detalle del Plan: {plan.name}
				</h3>
				<p class="text-xs text-slate-500">ID: {plan.id}</p>
			</div>
			<div class="flex gap-2">
				<Button type="submit" variant="primary" size="sm" disabled={isSaving}>
					{isSaving ? 'Guardando...' : 'Guardar Cambios'}
				</Button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-6 space-y-8">
			<!-- Basic Info -->
			<section class="space-y-4">
				<div class="flex items-center justify-between border-b pb-2">
					<h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">
						Información General
					</h4>
					<label class="flex items-center gap-2 cursor-pointer">
						<span class="text-xs font-medium text-slate-500">Activo</span>
						<div class="relative inline-flex items-center">
							<input type="checkbox" bind:checked={plan.is_active} class="sr-only peer" />
							<div
								class="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"
							></div>
						</div>
					</label>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input label="Nombre del Plan" bind:value={plan.name} required />
					<Input label="Código" bind:value={plan.code} required />
					<div class="md:col-span-2">
						<Input label="Descripción" bind:value={plan.description} />
					</div>
				</div>
			</section>

			<!-- Pricing -->
			<section class="space-y-4">
				<h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
					Precios (MXN)
				</h4>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input label="Precio Mensual" type="number" bind:value={plan.price_monthly} required />
					<Input label="Precio Anual" type="number" bind:value={plan.price_yearly} required />
				</div>
			</section>

			<!-- Products -->
			<section class="space-y-4">
				<h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
					Producto Asociado <span class="text-red-500">*</span>
				</h4>
				{#if !selectedProductCode}
					<p class="text-sm text-red-600">Debe seleccionar un producto antes de guardar el plan</p>
				{/if}
				<div class="space-y-3">
					{#each availableProducts as product (product.code)}
						<label
							class="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors {selectedProductCode ===
							product.code
								? 'bg-blue-50 border-blue-200'
								: ''}"
						>
							<input
								type="radio"
								name="product"
								value={product.code}
								bind:group={selectedProductCode}
								class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
								required
							/>
							<div class="ml-3">
								<p class="text-sm font-medium text-slate-900">{product.name}</p>
								<p class="text-xs text-slate-500">{product.code}</p>
								{#if product.description}
									<p class="text-xs text-slate-400 mt-1">{product.description}</p>
								{/if}
							</div>
						</label>
					{/each}
				</div>
			</section>

			<!-- Capabilities -->
			<section class="space-y-4">
				<h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
					Capabilities & Límites
				</h4>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each availableCapabilities as cap (cap.code)}
						<div class="flex flex-col space-y-1">
							<span class="text-xs font-medium text-slate-500" title={cap.description}>
								{cap.code}
							</span>
							{#if cap.value_type === 'bool'}
								<label class="relative inline-flex items-center cursor-pointer mt-1">
									<input
										type="checkbox"
										bind:checked={capabilityValues[cap.code]}
										class="sr-only peer"
									/>
									<div
										class="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
									></div>
									<span class="ml-3 text-sm font-medium text-slate-700">
										{capabilityValues[cap.code] ? 'Habilitado' : 'Deshabilitado'}
									</span>
								</label>
							{:else}
								<input
									type="number"
									bind:value={capabilityValues[cap.code]}
									class="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
								/>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		</div>
	</form>
</div>
