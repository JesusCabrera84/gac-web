<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { ProductsService } from '$lib/services/products';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';

	let formData = $state({
		code: '',
		name: '',
		description: '',
		is_active: true
	});

	let errors = $state({
		code: '',
		name: ''
	});

	let isSubmitting = $state(false);

	function validateCode(code) {
		const codePattern = /^[a-z0-9_]+$/;
		if (!code) {
			return 'El código es requerido';
		}
		if (code.length < 3 || code.length > 50) {
			return 'El código debe tener entre 3 y 50 caracteres';
		}
		if (!codePattern.test(code)) {
			return 'El código solo puede contener letras minúsculas, números y guiones bajos';
		}
		return '';
	}

	function validateName(name) {
		if (!name) {
			return 'El nombre es requerido';
		}
		if (name.length > 255) {
			return 'El nombre no puede exceder 255 caracteres';
		}
		return '';
	}

	function handleCodeInput(e) {
		formData.code = e.target.value;
		errors.code = validateCode(formData.code);
	}

	function handleNameInput(e) {
		formData.name = e.target.value;
		errors.name = validateName(formData.name);
	}

	async function handleSubmit(e) {
		e.preventDefault();

		// Validate all fields
		errors.code = validateCode(formData.code);
		errors.name = validateName(formData.name);

		// Check if there are any errors
		if (errors.code || errors.name) {
			return;
		}

		isSubmitting = true;
		try {
			await ProductsService.create(formData);
			toast.success('Producto creado exitosamente');
			goto('/products/catalog');
		} catch (error) {
			console.error('Error creating product:', error);
			// @ts-ignore
			toast.error('Error al crear producto: ' + error.message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title="Nuevo Producto">
		<a href="/products/catalog">
			<Button variant="ghost" size="sm">Cancelar</Button>
		</a>
	</Topbar>

	<div class="p-8">
		<div class="max-w-2xl mx-auto">
			<Card class="p-6">
				<form onsubmit={handleSubmit} class="space-y-6">
					<!-- Code -->
					<div>
						<label for="code" class="block text-sm font-medium text-slate-700 mb-2">
							Código <span class="text-red-500">*</span>
						</label>
						<Input
							id="code"
							type="text"
							placeholder="ej: gps_tracker"
							value={formData.code}
							oninput={handleCodeInput}
							class="w-full {errors.code ? 'border-red-500' : ''}"
							required
						/>
						{#if errors.code}
							<p class="mt-1 text-sm text-red-600">{errors.code}</p>
						{:else}
							<p class="mt-1 text-xs text-slate-500">
								Solo letras minúsculas, números y guiones bajos (3-50 caracteres)
							</p>
						{/if}
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
							{isSubmitting ? 'Creando...' : 'Crear Producto'}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	</div>
</div>
