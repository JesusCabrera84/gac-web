<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleSubmit(e) {
		e.preventDefault();
		isLoading = true;
		error = '';

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 800));
			goto('/admin/internal-users');
		} catch (err) {
			console.error('Failed to create user:', err);
			error = 'Error al crear usuario.';
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
					label="Contraseña Temporal"
					type="password"
					placeholder="••••••••"
					bind:value={password}
					required
				/>

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
