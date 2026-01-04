<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { ProductsService } from '$lib/services/products';
	import { onMount } from 'svelte';

	/** @type {any[]} */
	let products = $state([]);
	let isLoading = $state(true);

	async function loadProducts() {
		isLoading = true;
		try {
			const apiProducts = await ProductsService.getAll();

			// ProductsService.getAll() returns { products: [...] }

			const list = apiProducts.products || [];

			if (list && list.length > 0) {
				products = list.map((/** @type {any} */ p) => ({
					...p,
					// Default icon if not specified
					icon: p.icon || 'Box',
					// Default status if not specified
					status: p.status || 'active',
					href: p.href || '#'
				}));
			} else {
				products = [];
			}
		} catch (error) {
			console.error('Error loading products:', error);
			products = [];
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadProducts();
	});
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title="Productos" />

	<div class="p-8">
		{#if isLoading}
			<div class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each products as product (product.name)}
					<Card
						class="flex flex-col h-full transition-all duration-200 hover:shadow-md {product.status ===
						'coming_soon'
							? 'opacity-75'
							: ''}"
					>
						<div class="p-6 flex-1 flex flex-col">
							<div class="flex items-center justify-between mb-4">
								<div
									class="p-3 rounded-lg {product.status === 'active'
										? 'bg-blue-50 text-blue-600'
										: 'bg-slate-100 text-slate-500'}"
								>
									{#if product.icon === 'Smartphone'}
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
											><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path
												d="M12 18h.01"
											/></svg
										>
									{:else if product.icon === 'Radio'}
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
											><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path
												d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"
											/><circle cx="12" cy="12" r="2" /><path
												d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"
											/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" /></svg
										>
									{:else if product.icon === 'Wifi'}
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
											><path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0" /><path
												d="M5 12.859a10 10 0 0 1 14 0"
											/><path d="M8.5 16.429a5 5 0 0 1 7 0" /></svg
										>
									{:else if product.icon === 'SimCard'}
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
											><path
												d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
											/><path d="M10 11v6" /><path d="M14 11v6" /><path d="M10 14h4" /></svg
										>
									{/if}
								</div>
								{#if product.status === 'coming_soon'}
									<span
										class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800"
									>
										Próximamente
									</span>
								{/if}
							</div>

							<h3 class="text-lg font-semibold text-slate-900 mb-2">
								{product.name}
							</h3>
							<p class="text-sm text-slate-500 mb-6 flex-1">
								{product.description}
							</p>

							{#if product.status === 'active'}
								<a href={product.href} class="w-full">
									<Button variant="secondary" class="w-full justify-between group">
										Entrar al módulo
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
											class="transition-transform group-hover:translate-x-1"
											><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
										>
									</Button>
								</a>
							{:else}
								<Button variant="ghost" disabled class="w-full justify-start cursor-not-allowed">
									No disponible
								</Button>
							{/if}
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
</div>
