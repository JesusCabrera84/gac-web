<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { ProductsService } from '$lib/services/products';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';

	const productId = $derived($page.params.id);

	let formData = $state({
		code: '',
		name: '',
		description: '',
		is_active: true
	});

	let errors = $state({
		name: ''
	});

	let isLoading = $state(true);
	let isSubmitting = $state(false);

	function validateName(name) {
		if (!name) {
			return 'El nombre es requerido';
		}
		if (name.length > 255) {
			return 'El nombre no puede exceder 255 caracteres';
		}
		return '';
	}

	function handleNameInput(e) {
		formData.name = e.target.value;
		errors.name = validateName(formData.name);
	}

	async function loadProduct() {
		isLoading = true;
		try {
			const product = await ProductsService.getById(productId);
			formData = {
				code: product.code,
				name: product.name,
				description: product.description || '',
				is_active: product.is_active
			};
		} catch (error) {
			console.error('Error loading product:', error);
			// @ts-ignore
			toast.error('Error al cargar producto: ' + error.message);
			goto('/products/catalog');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();

		// Validate
		errors.name = validateName(formData.name);

		if (errors.name) {
			return;
		}

		isSubmitting = true;
		try {
			// Only send fields that can be updated (not code)
			const updateData = {
				name: formData.name,
				description: formData.description,
				is_active: formData.is_active
			};

			await ProductsService.update(productId, updateData);
			toast.success('Producto actualizado exitosamente');
			goto('/products/catalog');
		} catch (error) {
			console.error('Error updating product:', error);
			// @ts-ignore
			toast.error('Error al actualizar producto: ' + error.message);
		} finally {
			isSubmitting = false;
		}
	}

	onMount(() => {
		loadProduct();
	});
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title="Editar Producto">
		<a href="/products/catalog">
			<Button variant="ghost" size="sm">Cancelar</Button>
		</a>
	</Topbar>

	<div class="p-8">
		<div class="max-w-2xl mx-auto">
			{#if isLoading}
				<Card class="p-6">
					<div class="flex justify-center items-center h-64">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
					</div>
				</Card>
			{:else}
				<Card class="p-6">
					<form onsubmit={handleSubmit} class="space-y-6">
						<!-- Code (Read-only) -->
						<div>
							<label for="code" class="block text-sm font-medium text-slate-700 mb-2">
								Código
							</label>
							<Input
								id="code"
								type="text"
								value={formData.code}
								class="w-full bg-slate-50"
								disabled
							/>
							<p class="mt-1 text-xs text-slate-500">El código no puede ser modificado</p>
						</div>

						<!-- Name -->
						<div>
							<label for="name" class="block text-sm font-medium text-slate-700 mb-2">
								Nombre <span class="text-red-500">*</span>
							</label>
							<Input
								id="name"
								type="text"
								placeholder="ej: GPS Tracker Premium"
								value={formData.name}
								oninput={handleNameInput}
								class="w-full {errors.name ? 'border-red-500' : ''}"
								required
							/>
							{#if errors.name}
								<p class="mt-1 text-sm text-red-600">{errors.name}</p>
							{:else}
								<p class="mt-1 text-xs text-slate-500">Máximo 255 caracteres</p>
							{/if}
						</div>

						<!-- Description -->
						<div>
							<label for="description" class="block text-sm font-medium text-slate-700 mb-2">
								Descripción
							</label>
							<textarea
								id="description"
								bind:value={formData.description}
								placeholder="Descripción detallada del producto..."
								rows="4"
								class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
							></textarea>
							<p class="mt-1 text-xs text-slate-500">Opcional</p>
						</div>

						<!-- Is Active -->
						<div class="flex items-center space-x-3">
							<input
								id="is_active"
								type="checkbox"
								bind:checked={formData.is_active}
								class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
							/>
							<label for="is_active" class="text-sm font-medium text-slate-700">
								Producto activo
							</label>
						</div>

						<!-- Submit Button -->
						<div class="flex justify-end space-x-3 pt-4 border-t border-slate-200">
							<a href="/products/catalog">
								<Button variant="ghost" type="button">Cancelar</Button>
							</a>
							<Button variant="primary" type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
							</Button>
						</div>
					</form>
				</Card>
			{/if}
		</div>
	</div>
</div>
