<script>
	import { onMount } from 'svelte';
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { PlansService } from '$lib/services/plans';
	import { goto } from '$app/navigation';

	/** @type {Partial<import('$lib/services/plans').Plan>} */
	let plan = $state({
		name: '',
		code: '',
		description: '',
		price_monthly: '0.00',
		price_yearly: '0.00',
		is_active: true
	});

	let isSaving = $state(false);
	let error = $state(null);

	// Catalogs
	/** @type {any[]} */
	let availableProducts = $state([]);
	/** @type {any[]} */
	let availableCapabilities = $state([]);

	// Local state for easier binding
	/** @type {Object.<string, any>} */
	let capabilityValues = $state({});
	/** @type {string[]} */
	let productCodes = $state([]);

	onMount(async () => {
		try {
			const [products, caps] = await Promise.all([
				PlansService.getAvailableProducts(),
				PlansService.getAvailableCapabilities()
			]);
			availableProducts = products;
			availableCapabilities = caps;

			// Initialize default capability values
			const defaults = {};
			caps.forEach((cap) => {
				defaults[cap.code] = cap.value_type === 'bool' ? false : 0;
			});
			capabilityValues = defaults;
		} catch (err) {
			console.error('Error loading catalogs:', err);
		}
	});

	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();
		isSaving = true;
		error = null;

		try {
			const creationData = {
				...plan,
				product_codes: productCodes,
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

			await PlansService.create(creationData);
			await goto('/products/plans');
		} catch (err) {
			console.error('Error creating plan:', err);
			// @ts-ignore
			error = err.message || 'Error al crear el plan';
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex flex-col min-h-screen bg-slate-50">
	<Topbar title="Nuevo Plan" backUrl="/products/plans" />

	<div class="flex-1 p-8">
		<div class="max-w-4xl mx-auto">
			<form onsubmit={handleSubmit} class="space-y-6">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-2xl font-bold text-slate-900">Crear Nuevo Plan</h2>
					<div class="flex gap-3">
						<a href="/products/plans">
							<Button variant="outline" type="button">Cancelar</Button>
						</a>
						<Button type="submit" variant="primary" disabled={isSaving}>
							{isSaving ? 'Creando...' : 'Crear Plan'}
						</Button>
					</div>
				</div>

				{#if error}
					<div
						class="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 shadow-sm"
					>
						{error}
					</div>
				{/if}

				<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<!-- Main Info -->
					<div class="lg:col-span-2 space-y-6">
						<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
							<h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
								Información Básica
							</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Input
									label="Nombre del Plan"
									bind:value={plan.name}
									required
									placeholder="Ej: Plan Pro"
								/>
								<Input label="Código" bind:value={plan.code} required placeholder="Ej: pro" />
								<div class="md:col-span-2">
									<Input
										label="Descripción"
										bind:value={plan.description}
										placeholder="Descripción breve del plan"
									/>
								</div>
							</div>
						</div>

						<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
							<h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
								Precios (MXN)
							</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Input
									label="Precio Mensual"
									type="number"
									bind:value={plan.price_monthly}
									required
								/>
								<Input label="Precio Anual" type="number" bind:value={plan.price_yearly} required />
							</div>
						</div>

						<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
							<h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
								Productos Asociados
							</h3>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{#each availableProducts as product (product.code)}
									<label
										class="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors {productCodes.includes(
											product.code
										)
											? 'bg-blue-50 border-blue-200'
											: ''}"
									>
										<input
											type="checkbox"
											value={product.code}
											bind:group={productCodes}
											class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
										/>
										<div class="ml-3">
											<p class="text-sm font-medium text-slate-900">{product.name}</p>
											<p class="text-xs text-slate-500">{product.code}</p>
										</div>
									</label>
								{/each}
							</div>
						</div>

						<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
							<h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
								Capabilities & Límites
							</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
												class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
											/>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- Sidebar Info -->
					<div class="space-y-6">
						<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
							<h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
								Estado
							</h3>
							<label class="flex items-center space-x-3 cursor-pointer">
								<input
									type="checkbox"
									bind:checked={plan.is_active}
									class="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
								/>
								<span class="text-sm font-medium text-slate-700">Plan Activo</span>
							</label>
							<p class="text-xs text-slate-500 italic">
								Los planes inactivos no aparecerán para nuevas suscripciones.
							</p>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>
