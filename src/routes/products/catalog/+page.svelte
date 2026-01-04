<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import { ProductsService } from '$lib/services/products';
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';

	/** @type {any[]} */
	let products = $state([]);
	let isLoading = $state(false);
	let searchTerm = $state('');
	let activeFilter = $state('active'); // 'active', 'inactive', 'all'

	// Confirmation dialog state
	let confirmDialog = $state({
		isOpen: false,
		productId: '',
		productName: ''
	});

	// Filtered products
	let filteredProducts = $derived(
		products.filter((product) => {
			const matchesSearch =
				product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.name.toLowerCase().includes(searchTerm.toLowerCase());

			if (activeFilter === 'active') return matchesSearch && product.is_active;
			if (activeFilter === 'inactive') return matchesSearch && !product.is_active;
			return matchesSearch;
		})
	);

	async function loadProducts() {
		isLoading = true;
		try {
			const filters = {};
			if (activeFilter === 'active') filters.is_active = true;
			if (activeFilter === 'inactive') filters.is_active = false;

			const response = await ProductsService.getAll(filters);
			products = response.products || [];
		} catch (error) {
			console.error('Error loading products:', error);
			// @ts-ignore
			toast.error('Error al cargar productos: ' + error.message);
		} finally {
			isLoading = false;
		}
	}

	function openDeleteConfirm(productId, productName) {
		confirmDialog = {
			isOpen: true,
			productId,
			productName
		};
	}

	async function handleDelete() {
		try {
			await ProductsService.delete(confirmDialog.productId);
			await loadProducts(); // Reload products
			toast.success('Producto desactivado exitosamente');
		} catch (error) {
			console.error('Error deleting product:', error);
			// @ts-ignore
			toast.error('Error al desactivar producto: ' + error.message);
		}
	}

	onMount(() => {
		loadProducts();
	});

	// Reload when filter changes
	$effect(() => {
		if (activeFilter) {
			loadProducts();
		}
	});
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title="Catálogo de Productos">
		<a href="/products/catalog/create">
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
				Nuevo Producto
			</Button>
		</a>
	</Topbar>

	<div class="p-8 space-y-6">
		<!-- Filters and Search -->
		<Card class="p-4">
			<div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
				<div class="w-full md:w-96">
					<Input
						placeholder="Buscar por código o nombre..."
						bind:value={searchTerm}
						class="w-full"
					/>
				</div>
				<div class="flex gap-2">
					<button
						onclick={() => (activeFilter = 'active')}
						class="px-4 py-2 text-sm font-medium rounded-md transition-colors
							{activeFilter === 'active'
							? 'bg-blue-600 text-white'
							: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
					>
						Activos
					</button>
					<button
						onclick={() => (activeFilter = 'inactive')}
						class="px-4 py-2 text-sm font-medium rounded-md transition-colors
							{activeFilter === 'inactive'
							? 'bg-blue-600 text-white'
							: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
					>
						Inactivos
					</button>
					<button
						onclick={() => (activeFilter = 'all')}
						class="px-4 py-2 text-sm font-medium rounded-md transition-colors
							{activeFilter === 'all'
							? 'bg-blue-600 text-white'
							: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
					>
						Todos
					</button>
				</div>
			</div>
		</Card>

		<!-- Products Table -->
		<Card class="overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
						<tr>
							<th class="px-6 py-4">Código</th>
							<th class="px-6 py-4">Nombre</th>
							<th class="px-6 py-4">Descripción</th>
							<th class="px-6 py-4">Estado</th>
							<th class="px-6 py-4">Creado</th>
							<th class="px-6 py-4 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if isLoading}
							<tr>
								<td colspan="6" class="px-6 py-8 text-center text-slate-500">
									Cargando productos...
								</td>
							</tr>
						{:else if filteredProducts.length === 0}
							<tr>
								<td colspan="6" class="px-6 py-8 text-center text-slate-500">
									No se encontraron productos.
								</td>
							</tr>
						{:else}
							{#each filteredProducts as product (product.id)}
								<tr class="hover:bg-slate-50 transition-colors">
									<td class="px-6 py-4">
										<code class="text-xs bg-slate-100 px-2 py-1 rounded font-mono"
											>{product.code}</code
										>
									</td>
									<td class="px-6 py-4">
										<div class="font-medium text-slate-900">{product.name}</div>
									</td>
									<td class="px-6 py-4 text-slate-600 max-w-xs">
										<div class="truncate">{product.description || '-'}</div>
									</td>
									<td class="px-6 py-4">
										<span
											class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
												${product.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}
										>
											{product.is_active ? 'Activo' : 'Inactivo'}
										</span>
									</td>
									<td class="px-6 py-4 text-slate-600">
										{new Date(product.created_at).toLocaleDateString()}
									</td>
									<td class="px-6 py-4 text-right space-x-2">
										<a href="/products/catalog/{product.id}/edit">
											<Button variant="ghost" size="sm">Editar</Button>
										</a>
										{#if product.is_active}
											<Button
												variant="ghost"
												size="sm"
												onclick={() => openDeleteConfirm(product.id, product.name)}
											>
												Eliminar
											</Button>
										{/if}
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

<ConfirmDialog
	bind:isOpen={confirmDialog.isOpen}
	title="Desactivar Producto"
	message="¿Estás seguro de que deseas desactivar el producto '{confirmDialog.productName}'? Esta acción marcará el producto como inactivo."
	confirmLabel="Desactivar"
	cancelLabel="Cancelar"
	variant="danger"
	onConfirm={handleDelete}
/>
