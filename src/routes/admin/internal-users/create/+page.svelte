<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { goto } from '$app/navigation';
	import { userService } from '$lib/services/users';
	import { onMount } from 'svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	/** @type {any[]} */
	let selectedRoles = $state([]);
	/** @type {any[]} */
	let availableRoles = $state([]);
	let isLoading = $state(false);
	let error = $state('');

	async function loadRoles() {
		try {
			const res = await userService.getRoles();
			// Handle different potential response structures
			if (Array.isArray(res)) {
				availableRoles = res;
			} else if (res && res.data && Array.isArray(res.data)) {
				availableRoles = res.data;
			} else {
				// Fallback if no roles found or different structure
				console.warn('Could not load roles or unexpected format', res);
				availableRoles = [];
			}
		} catch (e) {
			console.error('Error loading roles', e);
			// Fallback roles if API fails (common ones)
			availableRoles = [{ name: 'admin' }, { name: 'user' }, { name: 'viewer' }];
		}
	}

	onMount(() => {
		loadRoles();
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
		isLoading = true;
		error = '';

		try {
			await userService.createUser({
				full_name: name,
				email,
				password,
				roles: selectedRoles
			});
			goto('/admin/internal-users');
		} catch (err) {
			console.error('Failed to create user:', err);
			error = /** @type {any} */ (err).message || 'Error al crear usuario.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title="Usuarios / Nuevo">
		<a href="/admin/internal-users">
			<Button variant="secondary" size="sm">Cancelar</Button>
		</a>
	</Topbar>

	<div class="p-8 max-w-2xl mx-auto w-full">
		<Card class="p-8">
			<h2 class="text-xl font-semibold mb-6 text-slate-900">Registrar Usuario Interno</h2>

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
					label="Contraseña"
					type="password"
					placeholder="••••••••"
					bind:value={password}
					required
				/>

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
						<p class="text-xs text-slate-500 mt-1">Selecciona los roles asignados al usuario.</p>
					{:else}
						<p class="text-sm text-slate-500 italic">No hay roles disponibles para seleccionar.</p>
					{/if}
				</div>

				{#if error}
					<div class="p-3 rounded-md bg-red-50 text-red-600 text-sm">
						{error}
					</div>
				{/if}

				<div class="flex justify-end pt-4">
					<Button type="submit" variant="primary" disabled={isLoading}>
						{#if isLoading}
							Guardando...
						{:else}
							Crear Usuario
						{/if}
					</Button>
				</div>
			</form>
		</Card>
	</div>
</div>
