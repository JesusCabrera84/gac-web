<script>
	import Topbar from '$lib/components/layout/Topbar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { onMount } from 'svelte';
	import { userService } from '$lib/services/users';

	let allUsers = $state([]);
	let displayedUsers = $state([]);
	let isLoading = $state(true);
	let searchQuery = $state('');

	// Pagination
	let currentPage = $state(1);
	let itemsPerPage = 10;

	// Since API doesn't return total count, we'll implement client-side pagination
	// based on the fetched list if we fetch all, OR server-side if we decide to fetch in chunks.
	// The implementation plan mentioned client-side filtering for search,
	// which implies fetching a larger set or handling it locally.
	// Given the API specs: GET /users?skip=0&limit=100
	// If the user base is small (internal users), fetching 100 might be enough.
	// We'll stick to a limit of 100 for now to support client-side search comfortably.

	async function loadUsers() {
		isLoading = true;
		try {
			// Fetch up to 100 users. If we need more, we'd need a more complex pagination/search strategy
			// since the API doesn't support server-side search.
			const response = await userService.getUsers(0, 100);

			// Handle response structure: { message: "...", data: [...] }
			if (response && response.data && Array.isArray(response.data)) {
				allUsers = response.data;
			} else {
				console.warn('Unexpected response structure', response);
				allUsers = [];
			}
			filterUsers();
		} catch (error) {
			console.error('Error loading users:', error);
			allUsers = [];
			displayedUsers = [];
		} finally {
			isLoading = false;
		}
	}

	function filterUsers() {
		let filtered = allUsers;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = allUsers.filter(
				(user) =>
					(user.full_name && user.full_name.toLowerCase().includes(query)) ||
					(user.email && user.email.toLowerCase().includes(query))
			);
		}

		// Reset to first page on filter change
		if (Math.ceil(filtered.length / itemsPerPage) < currentPage) {
			currentPage = 1;
		}

		displayedUsers = filtered;
	}

	// Reactive statement to re-filter when search changes
	// In Svelte 5 runes, we can just call filterUsers() or use $effect
	// But simple function call in oninput is fine too.
	$effect(() => {
		// Just to be safe, if we want auto-filtering on variable change:
		// However, explicit calls are often clearer.
		// Let's use the searchQuery in the filter logic called by the input
	});

	function handleSearch(e) {
		searchQuery = e.target.value;
		currentPage = 1; // Reset to page 1
		filterUsers();
	}

	async function deleteUser(userId) {
		if (!confirm('¿Estás seguro de que deseas desactivar este usuario? start')) return;

		try {
			await userService.deleteUser(userId);
			// Refresh list
			await loadUsers();
		} catch (error) {
			console.error('Error deleting user:', error);
			alert('Error al desactivar usuario');
		}
	}

	function getPaginatedUsers() {
		const start = (currentPage - 1) * itemsPerPage;
		return displayedUsers.slice(start, start + itemsPerPage);
	}

	function totalPages() {
		return Math.ceil(displayedUsers.length / itemsPerPage) || 1;
	}

	function nextPage() {
		if (currentPage < totalPages()) currentPage++;
	}

	function prevPage() {
		if (currentPage > 1) currentPage--;
	}

	onMount(() => {
		loadUsers();
	});
</script>

<div class="flex flex-col min-h-screen">
	<Topbar title="Administración / Usuarios Internos">
		<a href="/admin/internal-users/create">
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
					class="mr-2"
					><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line
						x1="20"
						x2="20"
						y1="8"
						y2="14"
					/><line x1="23" x2="17" y1="11" y2="11" /></svg
				>
				Nuevo Usuario
			</Button>
		</a>
	</Topbar>

	<div class="p-8">
		<Card class="overflow-hidden">
			<div class="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
				<div class="w-72">
					<Input
						placeholder="Buscar por nombre o email..."
						value={searchQuery}
						oninput={handleSearch}
					/>
				</div>
				<div class="text-sm text-slate-500">
					Mostrando {displayedUsers.length} usuarios
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
						<tr>
							<th class="px-6 py-4">Nombre</th>
							<th class="px-6 py-4">Email</th>
							<th class="px-6 py-4">Roles</th>
							<th class="px-6 py-4">Estado</th>
							<th class="px-6 py-4 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if isLoading}
							<tr>
								<td colspan="5" class="px-6 py-8 text-center text-slate-500">
									<div class="flex justify-center items-center">
										<svg
											class="animate-spin h-5 w-5 mr-3 text-slate-500"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Cargando usuarios...
									</div>
								</td>
							</tr>
						{:else if displayedUsers.length === 0}
							<tr>
								<td colspan="5" class="px-6 py-8 text-center text-slate-500">
									No se encontraron usuarios
								</td>
							</tr>
						{:else}
							{#each getPaginatedUsers() as user (user.user_id || user.email)}
								<tr class="hover:bg-slate-50 transition-colors">
									<td class="px-6 py-4 font-medium text-slate-900">
										<div class="flex items-center">
											<div
												class="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3"
											>
												{user.full_name
													? user.full_name.charAt(0).toUpperCase()
													: user.email.charAt(0).toUpperCase()}
											</div>
											{user.full_name || user.email}
										</div>
									</td>
									<td class="px-6 py-4 text-slate-600">{user.email}</td>
									<td class="px-6 py-4 text-slate-600"
										>{user.roles && Array.isArray(user.roles)
											? user.roles.join(', ')
											: 'No roles'}</td
									>
									<td class="px-6 py-4">
										{#if user.is_active}
											<span
												class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
											>
												Activo
											</span>
										{:else}
											<span
												class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500"
											>
												Inactivo
											</span>
										{/if}
									</td>
									<td class="px-6 py-4 text-right space-x-2">
										<a href="/admin/internal-users/{user.user_id}">
											<Button variant="ghost" size="sm" class="text-blue-600 hover:text-blue-700"
												>Editar</Button
											>
										</a>
										<Button
											variant="ghost"
											size="sm"
											class="text-red-600 hover:text-red-700 hover:bg-red-50"
											onclick={() => deleteUser(user.user_id)}
										>
											Desactivar
										</Button>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if !isLoading && displayedUsers.length > 0}
				<div
					class="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50"
				>
					<div class="text-sm text-slate-500">
						Página {currentPage} de {totalPages()}
					</div>
					<div class="flex space-x-2">
						<Button variant="outline" size="sm" disabled={currentPage === 1} onclick={prevPage}>
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === totalPages()}
							onclick={nextPage}
						>
							Siguiente
						</Button>
					</div>
				</div>
			{/if}
		</Card>
	</div>
</div>
