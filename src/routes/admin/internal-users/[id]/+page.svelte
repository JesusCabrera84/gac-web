<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { goto } from '$app/navigation';
	import { userService } from '$lib/services/users';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let userId = $state('');
	let name = $state('');
	let email = $state('');
	let password = $state('');
	/** @type {any[]} */
	let selectedRoles = $state([]);
	/** @type {any[]} */
	let availableRoles = $state([]);
	let isActive = $state(true);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let error = $state('');

	async function loadRoles() {
		try {
			const res = await userService.getRoles();
			if (Array.isArray(res)) {
				availableRoles = res;
			} else if (res && res.data && Array.isArray(res.data)) {
				availableRoles = res.data;
			} else {
				availableRoles = [];
			}
		} catch (e) {
			console.error('Error loading roles', e);
			availableRoles = [{ name: 'admin' }, { name: 'user' }, { name: 'viewer' }];
		}
	}

	async function loadUser() {
		try {
			const res = await userService.getUser(userId);
			const userData = res.data || res;

			name = userData.full_name || '';
			email = userData.email || '';
			isActive = userData.is_active !== undefined ? userData.is_active : true;
			selectedRoles = userData.roles || [];
		} catch (e) {
			console.error('Error loading user:', e);
			error = 'Error al cargar usuario.';
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		userId = $page.params.id || '';
		if (userId) {
			await Promise.all([loadRoles(), loadUser()]);
		}
	});

	/** @param {string} roleName */
	function toggleRole(roleName) {
		if (selectedRoles.includes(roleName)) {
			selectedRoles = selectedRoles.filter((r) => r !== roleName);
		} else {
			selectedRoles = [...selectedRoles, roleName];
		}
	}

	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();
		isSaving = true;
		error = '';

		/** @type {{full_name: string, email: string, is_active: boolean, roles: any[], password?: string}} */
		const payload = {
			full_name: name,
			email,
			is_active: isActive,
			roles: selectedRoles
		};

		if (password) {
			payload.password = password;
		}

		try {
			await userService.updateUser(userId, payload);
			goto('/admin/internal-users');
		} catch (err) {
			console.error('Failed to update user:', err);
			error = /** @type {any} */ (err).message || 'Error al actualizar usuario.';
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title="Usuarios / Editar">
		<a href="/admin/internal-users">
			<Button variant="secondary" size="sm">Cancelar</Button>
		</a>
	</Topbar>

	<div class="p-8 max-w-2xl mx-auto w-full">
		<Card class="p-8">
			<h2 class="text-xl font-semibold mb-6 text-slate-900">Editar Usuario</h2>

			{#if isLoading}
				<div class="py-12 flex justify-center">
					<div
						class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"
					></div>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-6">
					<Input
						id="name"
						label="Nombre Completo"
						placeholder="Ej: Juan Pérez"
						bind:value={name}
						required
					/>

					<Input
						id="email"
						label="Correo Electrónico"
						type="email"
						placeholder="usuario@geminislabs.com"
						bind:value={email}
						required
					/>

					<Input
						id="password"
						label="Nueva Contraseña (Opcional)"
						type="password"
						placeholder="Dejar vacía para mantener la actual"
						bind:value={password}
					/>

					<!-- Active Status Toggle -->
					<div class="flex items-center space-x-3">
						<span class="text-sm font-medium text-slate-700" id="status-label">Estado:</span>
						<button
							type="button"
							class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {isActive
								? 'bg-blue-600'
								: 'bg-slate-200'}"
							role="switch"
							aria-checked={isActive}
							aria-labelledby="status-label"
							onclick={() => (isActive = !isActive)}
						>
							<span
								aria-hidden="true"
								class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {isActive
									? 'translate-x-5'
									: 'translate-x-0'}"
							></span>
						</button>
						<span class="text-sm text-slate-600">{isActive ? 'Activo' : 'Inactivo'}</span>
					</div>

					<div class="space-y-2">
						<span class="block text-sm font-medium text-slate-700" id="roles-label">Roles</span>
						{#if availableRoles.length > 0}
							<div class="flex flex-wrap gap-2" role="group" aria-labelledby="roles-label">
								{#each availableRoles as role (typeof role === 'string' ? role : role.role_id || role.name)}
									{@const roleName = typeof role === 'string' ? role : role.name}
									<button
										type="button"
										class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors border {selectedRoles.includes(
											roleName
										)
											? 'bg-blue-100 text-blue-700 border-blue-200'
											: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}"
										onclick={() => toggleRole(roleName)}
									>
										{roleName}
									</button>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-slate-500 italic">
								No hay roles disponibles para seleccionar.
							</p>
						{/if}
					</div>

					{#if error}
						<div class="p-3 rounded-md bg-red-50 text-red-600 text-sm">
							{error}
						</div>
					{/if}

					<div class="flex justify-end pt-4">
						<Button type="submit" variant="primary" disabled={isSaving}>
							{#if isSaving}
								Guardando...
							{:else}
								Guardar Cambios
							{/if}
						</Button>
					</div>
				</form>
			{/if}
		</Card>
	</div>
</div>
